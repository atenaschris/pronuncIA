import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
  async assess(file: Express.Multer.File, targetWord: string, locale: string) {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pronun-'));
    const inputPath = path.join(tmpDir, file.originalname);
    const wavPath = path.join(tmpDir, `${path.parse(file.originalname).name}.wav`);

    // Write uploaded buffer to disk
    fs.writeFileSync(inputPath, file.buffer);

    // Convert to wav 16k mono
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

    const paConfig = new sdk.PronunciationAssessmentConfig(
      targetWord,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Phoneme,
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
      const overall = Math.max(0, Math.min(1, (accuracy + pronunciation + fluency + completeness) / 4));

      return {
        ok: true,
        text: result.text,
        reason: sdk.ResultReason[result.reason],
        scores: {
          overall,
          accuracy,
          pronunciation,
          fluency,
          completeness,
        },
      };
    } catch (e: any) {
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
    }
  }
}