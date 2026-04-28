import { pino } from 'pino';

const logger = pino({ name: 'email-connector' });

export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

let transporter: any = null;
let config: EmailConfig | null = null;

export function getEmailConfig(): EmailConfig | null {
  if (config) return config;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  if (!host || !user || !pass || !from) {
    return null;
  }

  config = { host, port, user, pass, from };
  return config;
}

async function getTransporter() {
  if (transporter) return transporter;

  const cfg = getEmailConfig();
  if (!cfg) {
    throw new Error('SMTP is not configured — set SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM');
  }

  try {
    const nodemailer = await import('nodemailer');
    transporter = nodemailer.default.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.port === 465,
      auth: { user: cfg.user, pass: cfg.pass },
    });
    await transporter.verify();
    logger.info('SMTP transport verified');
    return transporter;
  } catch (err) {
    logger.error({ err }, 'Failed to initialize SMTP transport — is "nodemailer" installed?');
    throw err;
  }
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string,
): Promise<string> {
  const cfg = getEmailConfig();
  if (!cfg) {
    logger.warn('SMTP not configured — email not sent');
    return 'skipped:not_configured';
  }

  const transport = await getTransporter();
  const info = await transport.sendMail({
    from: cfg.from,
    to,
    subject,
    html,
    text: text ?? html.replace(/<[^>]*>/g, ''),
  });

  logger.info({ messageId: info.messageId, to }, 'Email sent');
  return info.messageId;
}

export function isConfigured(): boolean {
  return getEmailConfig() !== null;
}
