import { pino } from 'pino';

const logger = pino({ name: 'twilio' });

let twilioClient: import('twilio').Twilio | null = null;
let initialized = false;

export async function getTwilioClient(): Promise<import('twilio').Twilio | null> {
  if (initialized) return twilioClient;
  initialized = true;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    logger.warn('Twilio credentials not configured — SMS/WhatsApp/Voice disabled');
    return null;
  }

  try {
    const twilio = await import('twilio');
    twilioClient = twilio.default(accountSid, authToken);
    logger.info('Twilio client initialized');
    return twilioClient;
  } catch (err) {
    logger.error({ err }, 'Failed to initialize Twilio client');
    return null;
  }
}
