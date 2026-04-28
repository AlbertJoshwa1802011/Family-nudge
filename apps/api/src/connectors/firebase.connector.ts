import { pino } from 'pino';

const logger = pino({ name: 'firebase-connector' });

export interface FirebaseConfig {
  projectId: string;
  privateKey: string;
  clientEmail: string;
}

let firebaseApp: any = null;
let config: FirebaseConfig | null = null;

export function getFirebaseConfig(): FirebaseConfig | null {
  if (config) return config;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    return null;
  }

  config = {
    projectId,
    privateKey: privateKey.replace(/\\n/g, '\n'),
    clientEmail,
  };
  return config;
}

async function getFirebaseApp() {
  if (firebaseApp) return firebaseApp;

  const cfg = getFirebaseConfig();
  if (!cfg) {
    throw new Error(
      'Firebase is not configured — set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL',
    );
  }

  try {
    const admin = await import('firebase-admin');
    firebaseApp = admin.default.initializeApp({
      credential: admin.default.credential.cert({
        projectId: cfg.projectId,
        privateKey: cfg.privateKey,
        clientEmail: cfg.clientEmail,
      }),
    });
    logger.info({ projectId: cfg.projectId }, 'Firebase Admin initialized');
    return firebaseApp;
  } catch (err) {
    logger.error({ err }, 'Failed to initialize Firebase — is "firebase-admin" installed?');
    throw err;
  }
}

export async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<string> {
  const cfg = getFirebaseConfig();
  if (!cfg) {
    logger.warn('Firebase not configured — push notification not sent');
    return 'skipped:not_configured';
  }

  const app = await getFirebaseApp();
  const admin = await import('firebase-admin');
  const messageId = await admin.default.messaging(app).send({
    token,
    notification: { title, body },
    data,
  });
  logger.info({ messageId, token: token.substring(0, 10) + '...' }, 'Push notification sent');
  return messageId;
}

export async function sendToTopic(
  topic: string,
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<string> {
  const cfg = getFirebaseConfig();
  if (!cfg) {
    logger.warn('Firebase not configured — topic notification not sent');
    return 'skipped:not_configured';
  }

  const app = await getFirebaseApp();
  const admin = await import('firebase-admin');
  const messageId = await admin.default.messaging(app).send({
    topic,
    notification: { title, body },
    data,
  });
  logger.info({ messageId, topic }, 'Topic notification sent');
  return messageId;
}

export function isConfigured(): boolean {
  return getFirebaseConfig() !== null;
}
