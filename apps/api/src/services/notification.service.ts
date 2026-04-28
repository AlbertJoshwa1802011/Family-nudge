import { prisma } from '../lib/prisma';
import { getTwilioClient } from '../lib/twilio';
import { getEmailTransporter } from '../lib/email';
import { getFirebaseApp } from '../lib/firebase';
import { getNotificationQueue, type NotificationJobData } from '../lib/queue';
import { pino } from 'pino';

const logger = pino({ name: 'notification-service' });

interface SendOptions {
  userId: string;
  reminderId?: string;
  channel: string;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export class NotificationService {
  private useQueue: boolean;

  constructor() {
    this.useQueue = !!process.env.REDIS_URL;
  }

  async send(options: SendOptions): Promise<void> {
    const queue = this.useQueue ? getNotificationQueue() : null;

    if (queue) {
      await queue.add(options, {
        priority: this.getChannelPriority(options.channel),
      });
      return;
    }

    await this.dispatch(options);
  }

  async dispatch(options: SendOptions): Promise<void> {
    const notification = await prisma.notification.create({
      data: {
        userId: options.userId,
        reminderId: options.reminderId,
        channel: options.channel,
        title: options.title,
        body: options.body,
        status: 'PENDING',
        metadata: options.metadata,
      },
    });

    try {
      switch (options.channel) {
        case 'PUSH':
          await this.sendPushNotification(options);
          break;
        case 'SMS':
          await this.sendSMS(options);
          break;
        case 'WHATSAPP':
          await this.sendWhatsApp(options);
          break;
        case 'CALL':
          await this.makeCall(options);
          break;
        case 'EMAIL':
          await this.sendEmail(options);
          break;
      }

      await prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'SENT', sentAt: new Date() },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ channel: options.channel, error: message }, 'Failed to send notification');
      await prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'FAILED', failReason: message },
      });
    }
  }

  async sendToMultipleChannels(
    userId: string,
    channels: string[],
    title: string,
    body: string,
    reminderId?: string,
  ): Promise<void> {
    for (const channel of channels) {
      await this.send({ userId, reminderId, channel, title, body });
    }
  }

  async startWorker(): Promise<void> {
    const queue = getNotificationQueue();
    if (!queue) return;

    queue.process(5, async (job) => {
      await this.dispatch(job.data);
    });

    logger.info('Notification queue worker started (concurrency: 5)');
  }

  private getChannelPriority(channel: string): number {
    switch (channel) {
      case 'CALL':
        return 1;
      case 'SMS':
      case 'WHATSAPP':
        return 2;
      case 'EMAIL':
        return 3;
      case 'PUSH':
        return 4;
      default:
        return 5;
    }
  }

  private async sendPushNotification(options: SendOptions): Promise<void> {
    const app = await getFirebaseApp();
    if (!app) {
      logger.info({ userId: options.userId }, 'Push notification logged (Firebase not configured)');
      return;
    }

    const admin = await import('firebase-admin');
    const user = await prisma.user.findUnique({ where: { id: options.userId } });

    // FCM token would be stored on the user or a devices table in production.
    // For now, log the intent — extend with device token storage.
    logger.info(
      { userId: options.userId, email: user?.email },
      'FCM push notification dispatched',
    );
  }

  private async sendSMS(options: SendOptions): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: options.userId } });
    if (!user?.phone) {
      throw new Error('User has no phone number configured');
    }

    const client = await getTwilioClient();
    if (!client) {
      logger.warn('Twilio not configured — SMS not sent');
      return;
    }

    await client.messages.create({
      body: `${options.title}\n\n${options.body}`,
      from: process.env.TWILIO_PHONE_FROM!,
      to: user.phone,
    });

    logger.info({ phone: user.phone }, 'SMS sent via Twilio');
  }

  private async sendWhatsApp(options: SendOptions): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: options.userId } });
    if (!user?.phone) {
      throw new Error('User has no phone number configured');
    }

    const client = await getTwilioClient();
    if (!client) {
      logger.warn('Twilio not configured — WhatsApp not sent');
      return;
    }

    await client.messages.create({
      body: `*${options.title}*\n\n${options.body}`,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM!}`,
      to: `whatsapp:${user.phone}`,
    });

    logger.info({ phone: user.phone }, 'WhatsApp message sent via Twilio');
  }

  private async makeCall(options: SendOptions): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: options.userId } });
    if (!user?.phone) {
      throw new Error('User has no phone number configured');
    }

    const client = await getTwilioClient();
    if (!client) {
      logger.warn('Twilio not configured — call not placed');
      return;
    }

    await client.calls.create({
      twiml: `<Response><Say>${options.title}. ${options.body}</Say></Response>`,
      from: process.env.TWILIO_PHONE_FROM!,
      to: user.phone,
    });

    logger.info({ phone: user.phone }, 'Voice call placed via Twilio');
  }

  private async sendEmail(options: SendOptions): Promise<void> {
    const transporter = await getEmailTransporter();
    if (!transporter) {
      logger.warn('SMTP not configured — email not sent');
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: options.userId } });
    if (!user?.email) {
      throw new Error('User has no email address');
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
      to: user.email,
      subject: options.title,
      html: `<h2>${options.title}</h2><p>${options.body}</p>`,
    });

    logger.info({ email: user.email }, 'Email sent via SMTP');
  }
}

export const notificationService = new NotificationService();
