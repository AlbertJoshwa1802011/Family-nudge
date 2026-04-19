import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import type { EncryptedPayload, EncryptionOptions } from './types';

const DEFAULT_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

export class EncryptionService {
  private masterKey: Buffer;
  private keyId: string;

  constructor(masterKeyHex: string, keyId = 'default') {
    if (!masterKeyHex || masterKeyHex.length !== 64) {
      throw new Error('Master key must be a 64-character hex string (256 bits)');
    }
    this.masterKey = Buffer.from(masterKeyHex, 'hex');
    this.keyId = keyId;
  }

  encrypt(plaintext: string | Buffer, options?: EncryptionOptions): EncryptedPayload {
    const algorithm = options?.algorithm ?? DEFAULT_ALGORITHM;
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(algorithm, this.masterKey, iv);

    const data = typeof plaintext === 'string' ? Buffer.from(plaintext, 'utf-8') : plaintext;

    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const result: EncryptedPayload = {
      ciphertext: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      tag: '',
      algorithm,
      keyId: options?.keyId ?? this.keyId,
    };

    if (algorithm === 'aes-256-gcm') {
      result.tag = (cipher as ReturnType<typeof createCipheriv>).getAuthTag().toString('base64');
    }

    return result;
  }

  decrypt(payload: EncryptedPayload): Buffer {
    const iv = Buffer.from(payload.iv, 'base64');
    const decipher = createDecipheriv(payload.algorithm, this.masterKey, iv);

    if (payload.algorithm === 'aes-256-gcm' && payload.tag) {
      (decipher as ReturnType<typeof createDecipheriv>).setAuthTag(
        Buffer.from(payload.tag, 'base64'),
      );
    }

    const ciphertext = Buffer.from(payload.ciphertext, 'base64');
    let decrypted = decipher.update(ciphertext);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted;
  }

  decryptToString(payload: EncryptedPayload): string {
    return this.decrypt(payload).toString('utf-8');
  }

  encryptFile(fileBuffer: Buffer, options?: EncryptionOptions): EncryptedPayload {
    return this.encrypt(fileBuffer, options);
  }

  decryptFile(payload: EncryptedPayload): Buffer {
    return this.decrypt(payload);
  }

  static generateKey(): string {
    return randomBytes(32).toString('hex');
  }
}
