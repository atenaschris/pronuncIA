import { IsString, IsOptional, IsIn } from 'class-validator';

export class AnalyzeDto {
  @IsString()
  targetWord: string;

  @IsString()
  locale: string;

  @IsOptional()
  @IsIn(['word', 'sentence'])
  mode?: 'word' | 'sentence';
}