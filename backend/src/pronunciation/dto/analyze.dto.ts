import { IsString } from 'class-validator';

export class AnalyzeDto {
  @IsString()
  targetWord: string;

  @IsString()
  locale: string;
}