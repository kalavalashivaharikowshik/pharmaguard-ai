import { SmsService } from './sms.service';

describe('SmsService', () => {
  const sms = new SmsService();

  it('normalises Indian numbers to E.164', () => {
    expect(sms.normalise('90000 00001')).toBe('+919000000001');
    expect(sms.normalise('+91 90000 00001')).toBe('+919000000001');
    expect(sms.normalise('919000000001')).toBe('+919000000001');
  });

  it('rejects invalid numbers', () => {
    expect(sms.normalise('123')).toBeNull();
  });

  it('is disabled without Twilio credentials and does not throw', async () => {
    delete process.env.TWILIO_ACCOUNT_SID;
    expect(sms.enabled).toBe(false);
    await expect(sms.send('9000000001', 'test')).resolves.toBe(false);
  });
});
