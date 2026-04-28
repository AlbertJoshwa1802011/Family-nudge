import { pino } from 'pino';

const logger = pino({ name: 'email' });

let transporter: import('nodemailer').Transporter | null = null;
let initialized = false;

export async function getEmailTransporter(): Promise<import('nodemailer').Transporter | null> {
  if (initialized) return transporter;
  initialized = true;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    logger.warn('SMTP not configured — email notifications disabled');
    return null;
  }

  try {
    const nodemailer = await import('nodemailer');
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.verify();
    logger.info({ host, port }, 'SMTP transporter verified');
    return transporter;
  } catch (err) {
    logger.error({ err }, 'Failed to initialize SMTP transporter');
    transporter = null;
    return null;
  }
}
