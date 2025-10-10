import { Body, Controller, Get, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly service: AiService) {}

  @Post('chat')
  async chat(@Body() body: ChatDto) {
    return this.service.chat({
      model: body.model || 'gpt-4-turbo-preview',
      messages: body.messages,
      max_tokens: body.max_tokens,
      temperature: body.temperature,
      response_format: body.response_format,
    });
  }

  @Get('models')
  async models() {
    return this.service.listModels();
  }
}