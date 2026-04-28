import { pino } from 'pino';

const logger = pino({ name: 'twilio-connector' });

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneFrom: string;
  whatsappFrom?: string;
}

let twilioClient: any = null;
let config: TwilioConfig | null = null;

export function getTwilioConfig(): TwilioConfig | null {
  if (config) return config;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneFrom = process.env.TWILIO_PHONE_FROM;

  if (!accountSid || !authToken || !phoneFrom) {
    return null;
  }

  config = {
    accountSid,
    authToken,
    phoneFrom,
    whatsappFrom: process.env.TWILIO_WHATSAPP_FROM,
  };
  return config;
}

async function getClient() {
  if (twilioClient) return twilioClient;

  const cfg = getTwilioConfig();
  if (!cfg) {
    throw new Error('Twilio is not configured — set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_FROM');
  }

  try {
    const twilio = await import('twilio');
    twilioClient = twilio.default(cfg.accountSid, cfg.authToken);
    return twilioClient;
  } catch (err) {
    logger.error({ err }, 'Failed to initialize Twilio client — is the "twilio" package installed?');
    throw new Error('Twilio SDK not available. Install with: pnpm add twilio');
  }
}

export async function sendSMS(to: string, body: string): Promise<string> {
  const cfg = getTwilioConfig();
  if (!cfg) {
    logger.warn('Twilio not configured — SMS not sent');
    return 'skipped:not_configured';
  }

  const client = await getClient();
  const message = await client.messages.create({
    body,
    from: cfg.phoneFrom,
    to,
  });
  logger.info({ sid: message.sid, to }, 'SMS sent');
  return message.sid;
}

export async function sendWhatsApp(to: string, body: string): Promise<string> {
  const cfg = getTwilioConfig();
  if (!cfg?.whatsappFrom) {
    logger.warn('Twilio WhatsApp not configured — message not sent');
    return 'skipped:not_configured';
  }

  const client = await getClient();
  const message = await client.messages.create({
    body,
    from: `whatsapp:${cfg.whatsappFrom}`,
    to: `whatsapp:${to}`,
  });
  logger.info({ sid: message.sid, to }, 'WhatsApp message sent');
  return message.sid;
}

export async function makeVoiceCall(to: string, twiml: string): Promise<string> {
  const cfg = getTwilioConfig();
  if (!cfg) {
    logger.warn('Twilio not configured — voice call not placed');
    return 'skipped:not_configured';
  }

  const client = await getClient();
  const call = await client.calls.create({
    twiml,
    from: cfg.phoneFrom,
    to,
  });
  logger.info({ sid: call.sid, to }, 'Voice call initiated');
  return call.sid;
}

export function isConfigured(): boolean {
  return getTwilioConfig() !== null;
}
