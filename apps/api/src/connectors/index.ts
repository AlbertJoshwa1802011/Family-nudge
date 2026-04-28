export * as twilio from './twilio.connector';
export * as email from './email.connector';
export * as firebase from './firebase.connector';
export * as redis from './redis.connector';
export * as queue from './queue.connector';

export function getConnectorStatus() {
  return {
    database: { status: 'configured', type: 'postgresql', via: 'prisma' },
    redis: {
      status: process.env.REDIS_URL ? 'configured' : 'not_configured',
      type: 'redis',
      via: 'ioredis',
    },
    queue: {
      status: process.env.REDIS_URL ? 'configured' : 'not_configured',
      type: 'bull',
      via: 'bull+redis',
    },
    notifications: {
      push: {
        status: process.env.FIREBASE_PROJECT_ID ? 'configured' : 'not_configured',
        via: 'firebase-admin (FCM)',
      },
      sms: {
        status: process.env.TWILIO_ACCOUNT_SID ? 'configured' : 'not_configured',
        via: 'twilio',
      },
      whatsapp: {
        status: process.env.TWILIO_WHATSAPP_FROM ? 'configured' : 'not_configured',
        via: 'twilio',
      },
      voice: {
        status: process.env.TWILIO_PHONE_FROM ? 'configured' : 'not_configured',
        via: 'twilio',
      },
      email: {
        status: process.env.SMTP_HOST ? 'configured' : 'not_configured',
        via: 'nodemailer (SMTP)',
      },
    },
    scheduler: { status: 'active', type: 'cron', via: 'node-cron' },
    encryption: {
      status: process.env.ENCRYPTION_MASTER_KEY ? 'configured' : 'not_configured',
      type: 'AES-256-GCM',
      via: '@family-nudge/crypto',
    },
  };
}
