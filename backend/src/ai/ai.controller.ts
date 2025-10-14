import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);
  constructor(private readonly service: AiService) {}

  @Post('chat')
  async chat(@Body() body: ChatDto) {
    const reqId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const startTs = Date.now();
    const msgCount = body.messages?.length ?? 0;
    const contentChars = (body.messages || []).reduce((sum, m) => sum + (m.content?.length || 0), 0);
    this.logger.log(`[${reqId}] AI chat request: model=${body.model || 'gpt-4-turbo-preview'} messages=${msgCount} contentChars=${contentChars} max_tokens=${body.max_tokens ?? 'n/a'} temperature=${body.temperature ?? 'n/a'}`);
    const res = await this.service.chat({
      model: body.model || 'gpt-4-turbo-preview',
      messages: body.messages,
      max_tokens: body.max_tokens,
      temperature: body.temperature,
      response_format: body.response_format,
    });
    this.logger.debug(`[${reqId}] AI chat response in ${Date.now() - startTs}ms`);
    return res;
  }

  @Get('models')
  async models() {
    return this.service.listModels();
  }
}