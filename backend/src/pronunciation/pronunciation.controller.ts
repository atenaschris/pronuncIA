import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PronunciationService } from './pronunciation.service';
import { AnalyzeDto } from './dto/analyze.dto';

@Controller('pronunciation')
export class PronunciationController {
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

    return this.service.assess(file, body.targetWord, body.locale);
  }
}