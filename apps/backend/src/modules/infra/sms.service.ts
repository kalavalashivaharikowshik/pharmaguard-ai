import { Injectable, Logger } from '@nestjs/common';

/**
 * Sends SMS through Twilio's REST API when TWILIO_ACCOUNT_SID,
 * TWILIO_AUTH_TOKEN and TWILIO_FROM_NUMBER are set. Without them SMS is
 * disabled and messages are only logged.
 */
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  get enabled(): boolean {
    return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER);
  }

  /** Normalises Indian numbers like "90000 00001" to E.164 (+919000000001). */
  normalise(phone: string): string | null {
    const digits = phone.replace(/[^\d+]/g, '');
    if (digits.startsWith('+')) return digits.length >= 11 ? digits : null;
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
    return null;
  }

  async send(phone: string, body: string): Promise<boolean> {
    const to = this.normalise(phone);
    if (!to) return false;

    if (!this.enabled) {
      this.logger.log(`[SMS disabled] to ${to}: ${body}`);
      return false;
    }

    const sid = process.env.TWILIO_ACCOUNT_SID!;
    const auth = Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');

    try {
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: to, From: process.env.TWILIO_FROM_NUMBER!, Body: body.slice(0, 1500) }),
      });
      if (!res.ok) {
        this.logger.warn(`Twilio responded ${res.status}: ${await res.text()}`);
        return false;
      }
      this.logger.log(`SMS sent to ${to}`);
      return true;
    } catch (err) {
      this.logger.warn(`SMS failed: ${(err as Error).message}`);
      return false;
    }
  }
}
