import { prisma } from '../lib/prisma';
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

  // Push notification via web push or FCM
  private async sendPushNotification(options: SendOptions): Promise<void> {
    logger.info({ userId: options.userId }, 'Push notification sent (stub — integrate FCM/web-push)');
    // TODO: Integrate with Firebase Cloud Messaging or Web Push API
    // import admin from 'firebase-admin';
    // await admin.messaging().send({ token, notification: { title, body } });
  }

  // SMS via Twilio
  private async sendSMS(options: SendOptions): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: options.userId } });
    if (!user?.phone) {
      throw new Error('User has no phone number configured');
    }

    if (!process.env.TWILIO_ACCOUNT_SID) {
      logger.warn('Twilio not configured — SMS not sent');
      return;
    }

    // Twilio integration point
    // const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await twilio.messages.create({
    //   body: `${options.title}\n\n${options.body}`,
    //   from: process.env.TWILIO_PHONE_FROM,
    //   to: user.phone,
    // });

    logger.info({ phone: user.phone }, 'SMS sent (stub — configure Twilio credentials)');
  }

  // WhatsApp message via Twilio WhatsApp API
  private async sendWhatsApp(options: SendOptions): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: options.userId } });
    if (!user?.phone) {
      throw new Error('User has no phone number configured');
    }

    if (!process.env.TWILIO_ACCOUNT_SID) {
      logger.warn('Twilio not configured — WhatsApp not sent');
      return;
    }

    // Twilio WhatsApp integration
    // const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await twilio.messages.create({
    //   body: `*${options.title}*\n\n${options.body}`,
    //   from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
    //   to: `whatsapp:${user.phone}`,
    // });

    logger.info({ phone: user.phone }, 'WhatsApp message sent (stub — configure Twilio)');
  }

  // Automated call via Twilio
  private async makeCall(options: SendOptions): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: options.userId } });
    if (!user?.phone) {
      throw new Error('User has no phone number configured');
    }

    if (!process.env.TWILIO_ACCOUNT_SID) {
      logger.warn('Twilio not configured — call not placed');
      return;
    }

    // Twilio voice call integration
    // const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await twilio.calls.create({
    //   twiml: `<Response><Say>${options.title}. ${options.body}</Say></Response>`,
    //   from: process.env.TWILIO_PHONE_FROM,
    //   to: user.phone,
    // });

    logger.info({ phone: user.phone }, 'Voice call placed (stub — configure Twilio)');
  }

  // Email via SMTP
  private async sendEmail(options: SendOptions): Promise<void> {
    if (!process.env.SMTP_HOST) {
      logger.warn('SMTP not configured — email not sent');
      return;
    }

    // Nodemailer integration
    // const nodemailer = require('nodemailer');
    // const transport = nodemailer.createTransport({ host, port, auth });
    // await transport.sendMail({ from, to: user.email, subject: title, html: body });

    logger.info({ userId: options.userId }, 'Email sent (stub — configure SMTP)');
  }
}

export const notificationService = new NotificationService();
