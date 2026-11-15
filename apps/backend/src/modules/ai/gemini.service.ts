import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

/**
 * Google Gemini client.
 *
 * Set GEMINI_API_KEY (free key from https://aistudio.google.com/apikey) to
 * enable LLM features. Optional GEMINI_MODEL overrides the default model.
 * Every caller has a rule-based fallback, so the platform keeps working when
 * the key is missing, the quota runs out, or the API is unreachable.
 */
@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly client?: GoogleGenAI;
  readonly model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.client = new GoogleGenAI({ apiKey });
      this.logger.log(`Gemini enabled (${this.model}).`);
    } else {
      this.logger.warn('GEMINI_API_KEY not set. AI features use rule-based fallbacks.');
    }
  }

  get enabled(): boolean {
    return !!this.client;
  }

  /**
   * Returns the model's text, or null on any failure (caller falls back).
   */
  async generate(
    prompt: string,
    options: { system?: string; json?: boolean; temperature?: number; timeoutMs?: number; maxOutputTokens?: number } = {},
  ): Promise<string | null> {
    if (!this.client) return null;

    const timeoutMs = options.timeoutMs ?? 20_000;
    try {
      const request = this.client.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          systemInstruction: options.system,
          temperature: options.temperature ?? 0.3,
          maxOutputTokens: options.maxOutputTokens ?? 1024,
          ...(options.json ? { responseMimeType: 'application/json' } : {}),
        },
      });

      const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs));
      const response = await Promise.race([request, timeout]);
      if (!response) {
        this.logger.warn('Gemini request timed out.');
        return null;
      }
      const text = response.text?.trim();
      return text || null;
    } catch (err) {
      this.logger.warn(`Gemini request failed: ${(err as Error).message}`);
      return null;
    }
  }

  /** Like generate() but parses JSON; returns null when the output is not valid JSON. */
  async generateJson<T>(prompt: string, system?: string): Promise<T | null> {
    const text = await this.generate(prompt, { system, json: true, temperature: 0.2 });
    if (!text) return null;
    try {
      const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim();
      return JSON.parse(cleaned) as T;
    } catch {
      return null;
    }
  }
}
