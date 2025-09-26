/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
import { OpenAI } from 'openai';
import configUtil from '../utils/configUtil';

/**
 * Open AI Provider.
 */
export class OpenAiProvider {
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
        apiKey: configUtil.getRequiredEnv('OPEN_AI_API_KEY'),
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
  public async responseCreate(input: string, temperature: number | null = null): Promise<string> {
    const response = await this.getClient().responses.create({
      model: configUtil.getRequiredEnv('OPEN_AI_MODEL'),
      instructions: `Use ${configUtil.getRequiredEnv('OPEN_AI_LANGUAGE')} language`,
      input: input,
      temperature: temperature,
    });

    return response.output_text;
  }
}

export default new OpenAiProvider();
