import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

interface OpenAIChatRequestBody {
  model: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  max_tokens?: number;
  temperature?: number;
  response_format?: Record<string, any>;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private getApiKey(): string {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new InternalServerErrorException('OPENAI_API_KEY missing');
    return key;
  }

  async chat(body: OpenAIChatRequestBody): Promise<any> {
    const apiKey = this.getApiKey();
    const reqId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const startTs = Date.now();

    const payload: OpenAIChatRequestBody = {
      model: body.model || 'gpt-4-turbo-preview',
      messages: body.messages,
      max_tokens: body.max_tokens,
      temperature: body.temperature,
      response_format: body.response_format,
    };

    const msgCount = payload.messages?.length ?? 0;
    const contentChars = (payload.messages || []).reduce((sum, m) => sum + (m.content?.length || 0), 0);
    this.logger.log(`[${reqId}] OpenAI chat start: model=${payload.model} messages=${msgCount} contentChars=${contentChars} max_tokens=${payload.max_tokens ?? 'n/a'} temperature=${payload.temperature ?? 'n/a'}`);

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
      this.logger.error(`[${reqId}] OpenAI error ${res.status}: ${errorDetail?.error?.message || 'Unknown error'}`);
      throw new InternalServerErrorException(
        `OpenAI error ${res.status}: ${errorDetail?.error?.message || 'Unknown error'}`,
      );
    }
    const json = await res.json();
    const latency = Date.now() - startTs;
    try {
      const usage = json?.usage || json?.choices?.[0]?.usage;
      const promptTokens = usage?.prompt_tokens;
      const completionTokens = usage?.completion_tokens;
      const totalTokens = usage?.total_tokens;
      this.logger.debug(`[${reqId}] OpenAI chat ok in ${latency}ms usage: prompt=${promptTokens ?? 'n/a'} completion=${completionTokens ?? 'n/a'} total=${totalTokens ?? 'n/a'}`);
    } catch {}
    return json;
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