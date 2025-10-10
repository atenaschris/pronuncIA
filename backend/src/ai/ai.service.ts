import { Injectable, InternalServerErrorException } from '@nestjs/common';

interface OpenAIChatRequestBody {
  model: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  max_tokens?: number;
  temperature?: number;
  response_format?: Record<string, any>;
}

@Injectable()
export class AiService {
  private getApiKey(): string {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new InternalServerErrorException('OPENAI_API_KEY missing');
    return key;
  }

  async chat(body: OpenAIChatRequestBody): Promise<any> {
    const apiKey = this.getApiKey();

    const payload: OpenAIChatRequestBody = {
      model: body.model || 'gpt-4-turbo-preview',
      messages: body.messages,
      max_tokens: body.max_tokens,
      temperature: body.temperature,
      response_format: body.response_format,
    };

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errorDetail: any = {};
      try { errorDetail = await res.json(); } catch {}
      throw new InternalServerErrorException(
        `OpenAI error ${res.status}: ${errorDetail?.error?.message || 'Unknown error'}`,
      );
    }

    return res.json();
  }

  async listModels(): Promise<any> {
    const apiKey = this.getApiKey();
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (!res.ok) {
      let errorDetail: any = {};
      try { errorDetail = await res.json(); } catch {}
      throw new InternalServerErrorException(
        `OpenAI models error ${res.status}: ${errorDetail?.error?.message || 'Unknown error'}`,
      );
    }
    return res.json();
  }
}