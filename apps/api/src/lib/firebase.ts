import { pino } from 'pino';

const logger = pino({ name: 'firebase' });

let firebaseApp: import('firebase-admin').app.App | null = null;
let initialized = false;

export async function getFirebaseApp(): Promise<import('firebase-admin').app.App | null> {
  if (initialized) return firebaseApp;
  initialized = true;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    logger.warn('Firebase credentials not configured — push notifications disabled');
    return null;
  }

  try {
    const admin = await import('firebase-admin');
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey: privateKey.replace(/\\n/g, '\n'),
        clientEmail,
      }),
    });
    logger.info('Firebase Admin initialized');
    return firebaseApp;
  } catch (err) {
    logger.error({ err }, 'Failed to initialize Firebase Admin');
    return null;
  }
}
