import { prisma } from '../lib/prisma';
import { pino } from 'pino';
import * as twilioConnector from '../connectors/twilio.connector';
import * as emailConnector from '../connectors/email.connector';
import * as firebaseConnector from '../connectors/firebase.connector';

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
  async send(options: SendOptions): Promise<void> {
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

  private async sendPushNotification(options: SendOptions): Promise<void> {
    if (!firebaseConnector.isConfigured()) {
      logger.info({ userId: options.userId }, 'Push notification skipped — Firebase not configured');
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: options.userId } });
    const fcmToken = (user as any)?.fcmToken;
    if (!fcmToken) {
      logger.warn({ userId: options.userId }, 'User has no FCM token — push not sent');
      return;
    }

    await firebaseConnector.sendPushNotification(fcmToken, options.title, options.body, {
      reminderId: options.reminderId ?? '',
    });
  }

  private async sendSMS(options: SendOptions): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: options.userId } });
    if (!user?.phone) {
      throw new Error('User has no phone number configured');
    }

    if (!twilioConnector.isConfigured()) {
      logger.warn('Twilio not configured — SMS not sent');
      return;
    }

    await twilioConnector.sendSMS(user.phone, `${options.title}\n\n${options.body}`);
  }

  private async sendWhatsApp(options: SendOptions): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: options.userId } });
    if (!user?.phone) {
      throw new Error('User has no phone number configured');
    }

    if (!twilioConnector.isConfigured()) {
      logger.warn('Twilio not configured — WhatsApp not sent');
      return;
    }

    await twilioConnector.sendWhatsApp(user.phone, `*${options.title}*\n\n${options.body}`);
  }

  private async makeCall(options: SendOptions): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: options.userId } });
    if (!user?.phone) {
      throw new Error('User has no phone number configured');
    }

    if (!twilioConnector.isConfigured()) {
      logger.warn('Twilio not configured — call not placed');
      return;
    }

    const twiml = `<Response><Say>${options.title}. ${options.body}</Say></Response>`;
    await twilioConnector.makeVoiceCall(user.phone, twiml);
  }

  private async sendEmail(options: SendOptions): Promise<void> {
    if (!emailConnector.isConfigured()) {
      logger.warn('SMTP not configured — email not sent');
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: options.userId } });
    if (!user?.email) {
      throw new Error('User has no email configured');
    }

    const html = `<h2>${options.title}</h2><p>${options.body}</p>`;
    await emailConnector.sendEmail(user.email, options.title, html);
  }
}

export const notificationService = new NotificationService();
