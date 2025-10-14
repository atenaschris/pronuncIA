import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AnalyzeDto } from './dto/analyze.dto';
import { PronunciationService } from './pronunciation.service';

@Controller('pronunciation')
export class PronunciationController {
  private readonly logger = new Logger(PronunciationController.name);
  constructor(private readonly service: PronunciationService) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('audio'))
  async analyze(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: AnalyzeDto,
  ) {
    if (!file) {
      throw new BadRequestException('Missing audio file');
    }
    if (!body?.targetWord || !body?.locale) {
      throw new BadRequestException('Missing targetWord or locale');
    }
    this.logger.log(`Analyze request: file=${file.originalname} size=${file.size}B targetWord="${body.targetWord}" locale=${body.locale}`);
    const res = await this.service.assess(file, body.targetWord, body.locale);
    this.logger.debug(`Analyze response: ok=${res.ok} reason=${res.reason} text="${res.text}"`);
    return res;
  }
}