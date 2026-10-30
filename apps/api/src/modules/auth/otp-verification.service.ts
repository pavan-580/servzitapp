import { Injectable, ServiceUnavailableException } from '@nestjs/common';

@Injectable()
export class OtpVerificationService {
  private configuration() {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } = process.env;
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
      throw new ServiceUnavailableException({ code: 'OTP_NOT_CONFIGURED', message: 'Phone verification is temporarily unavailable.' });
    }
    return { accountSid: TWILIO_ACCOUNT_SID, authToken: TWILIO_AUTH_TOKEN, serviceSid: TWILIO_VERIFY_SERVICE_SID };
  }

  async send(phoneE164: string): Promise<void> {
    const config = this.configuration();
    const form = new URLSearchParams({ To: phoneE164, Channel: 'sms' });
    const response = await fetch(`https://verify.twilio.com/v2/Services/${config.serviceSid}/Verifications`, {
      method: 'POST', headers: this.headers(config.accountSid, config.authToken), body: form, signal: AbortSignal.timeout(8000),
    }).catch(() => null);
    if (!response?.ok) {
      console.error('OTP delivery provider request failed', response?.status ?? 'network error');
      throw new ServiceUnavailableException({ code: 'OTP_DELIVERY_FAILED', message: 'Phone verification is temporarily unavailable.' });
    }
  }

  async verify(phoneE164: string, code: string): Promise<boolean> {
    const config = this.configuration();
    const form = new URLSearchParams({ To: phoneE164, Code: code });
    const response = await fetch(`https://verify.twilio.com/v2/Services/${config.serviceSid}/VerificationCheck`, {
      method: 'POST', headers: this.headers(config.accountSid, config.authToken), body: form, signal: AbortSignal.timeout(8000),
    }).catch(() => null);
    if (!response?.ok) {
      console.error('OTP verification provider request failed', response?.status ?? 'network error');
      if (response && [400, 404].includes(response.status)) return false;
      throw new ServiceUnavailableException({ code: 'OTP_PROVIDER_UNAVAILABLE', message: 'Phone verification is temporarily unavailable.' });
    }
    const payload = await response.json() as { status?: string };
    return payload.status === 'approved';
  }

  private headers(accountSid: string, authToken: string) {
    return { Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' };
  }
}
