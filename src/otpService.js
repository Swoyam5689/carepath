import crypto from "node:crypto";

export class BaseOtpProvider {
  async sendOtp(_mobile, _code) { throw new Error("sendOtp must be implemented by provider"); }
}

export class ConfiguredSmsProvider extends BaseOtpProvider {
  async sendOtp(mobile, code) {
    const url = process.env.SMS_PROVIDER_URL;
    if (!url) throw Object.assign(new Error("SMS provider is not configured"), { code: "PROVIDER_NOT_CONFIGURED" });
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", ...(process.env.SMS_PROVIDER_API_KEY ? { authorization: `Bearer ${process.env.SMS_PROVIDER_API_KEY}` } : {}) },
      body: JSON.stringify({ to: mobile, message: `Your CarePath verification code is ${code}. It expires in 5 minutes.` })
    });
    if (!response.ok) throw Object.assign(new Error("SMS provider rejected the request"), { code: "PROVIDER_FAILED" });
    return { success: true };
  }
}

export function generateSecureOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

export const defaultOtpService = new ConfiguredSmsProvider();
EOF
