import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

// Ensure ffmpeg is available
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic as string);
} else if (ffmpegInstaller?.path) {
  ffmpeg.setFfmpegPath(ffmpegInstaller.path);
}

@Injectable()
export class PronunciationService {
  private readonly logger = new Logger(PronunciationService.name);
  async assess(file: Express.Multer.File, targetWord: string, locale: string, mode?: 'word' | 'sentence') {
    const reqId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const startTs = Date.now();
    const useMode: 'word' | 'sentence' = mode === 'sentence' ? 'sentence' : 'word';
    this.logger.log(`[${reqId}] Assess start: file=${file.originalname} size=${file.size}B targetWord="${targetWord}" locale=${locale} mode=${useMode}`);
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pronun-'));
    const inputPath = path.join(tmpDir, file.originalname);
    const wavPath = path.join(tmpDir, `${path.parse(file.originalname).name}.wav`);

    // Write uploaded buffer to disk
    fs.writeFileSync(inputPath, file.buffer);

    // Convert to wav 16k mono
    const convertStart = Date.now();
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-ar 16000',
          '-ac 1',
          '-c:a pcm_s16le',
        ])
        .on('error', (err) => reject(err))
        .on('end', () => resolve())
        .save(wavPath);
    });
    this.logger.debug(`[${reqId}] Audio converted to wav (16k mono) in ${Date.now() - convertStart}ms`);

    const key = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION;
    if (!key || !region) {
      throw new InternalServerErrorException('Azure Speech credentials missing');
    }

    const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
    speechConfig.speechRecognitionLanguage = locale;

    const audioBuffer = fs.readFileSync(wavPath);
    const audioConfig = sdk.AudioConfig.fromWavFileInput(audioBuffer);
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    const granularity = useMode === 'sentence'
      ? sdk.PronunciationAssessmentGranularity.Word
      : sdk.PronunciationAssessmentGranularity.Phoneme;

    const paConfig = new sdk.PronunciationAssessmentConfig(
      targetWord,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      granularity,
      true,
    );
    paConfig.phonemeAlphabet = 'IPA';
    paConfig.applyTo(recognizer);

    try {
      const result: sdk.SpeechRecognitionResult = await new Promise((resolve, reject) => {
        recognizer.recognizeOnceAsync(
          (res) => resolve(res),
          (err) => reject(err),
        );
      });

      const paResult = sdk.PronunciationAssessmentResult.fromResult(result) as any;
      const normalize = (v: number | undefined) => (typeof v === 'number' ? Math.max(0, Math.min(1, v / 100)) : 0);
      const accuracy = normalize(paResult.accuracyScore);
      const pronunciation = normalize(paResult.pronunciationScore);
      const fluency = normalize(paResult.fluencyScore);
      const completeness = normalize(paResult.completenessScore);
      const overallWord = Math.max(0, Math.min(1, (accuracy + pronunciation) / 2));
      const overallSentence = Math.max(0, Math.min(1, (accuracy + pronunciation + fluency + completeness) / 4));
      const overall = useMode === 'sentence' ? overallSentence : overallWord;

      this.logger.log(
        `[${reqId}] Azure result: reason=${sdk.ResultReason[result.reason]} text="${result.text}" ` +
        `mode=${useMode} scores(n): overall=${overall.toFixed(3)} accuracy=${accuracy.toFixed(3)} ` +
        `pronunciation=${pronunciation.toFixed(3)} fluency=${fluency.toFixed(3)} completeness=${completeness.toFixed(3)}`
      );
      if (paResult) {
        const raw = {
          accuracyScore: paResult.accuracyScore,
          pronunciationScore: paResult.pronunciationScore,
          fluencyScore: paResult.fluencyScore,
          completenessScore: paResult.completenessScore,
        };
        this.logger.debug(`[${reqId}] Azure raw PA scores: ${JSON.stringify(raw)}`);
      }

      return {
        ok: true,
        text: result.text,
        reason: sdk.ResultReason[result.reason],
        mode: useMode,
        scores: {
          overall,
          accuracy,
          pronunciation,
          fluency,
          completeness,
        },
      };
    } catch (e: any) {
      this.logger.error(`[${reqId}] Assess error: ${e?.message || 'Unknown error'}`);
      throw new InternalServerErrorException(e?.message || 'Azure assessment failed');
    } finally {
      recognizer.close();
      try {
        fs.unlinkSync(inputPath);
      } catch {}
      try {
        fs.unlinkSync(wavPath);
      } catch {}
      try {
        fs.rmdirSync(tmpDir);
      } catch {}
      this.logger.debug(`[${reqId}] Cleaned up temp files. Total time=${Date.now() - startTs}ms`);
    }
  }
}