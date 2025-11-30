import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { getRequiredEnv } from '../common/utils/config.utils';

@Injectable()
export class OpenaiService {
  /**
   * Open AI Client.
   *
   * @protected
   */
  protected client: OpenAI | undefined = undefined;

  /**
   * Get Open AI Client.
   *
   * @returns OpenAI
   */
  public getClient(): OpenAI {
    if (this.client === undefined) {
      this.client = new OpenAI({
        apiKey: getRequiredEnv('OPEN_AI_API_KEY'),
      });
    }

    return this.client;
  }

  /**
   * Create a Response.
   *
   * @param input
   * @param temperature
   * @returns Promise<string>
   */
  public async responseCreate(
    input: string,
    temperature: number | null = null,
  ): Promise<string> {
    const response = await this.getClient().responses.create({
      model: getRequiredEnv('OPEN_AI_MODEL'),
      instructions: `Use ${getRequiredEnv('OPEN_AI_LANGUAGE')} language`,
      input: input,
      temperature: temperature,
    });

    return response.output_text;
  }
}
