import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'crypto';

export class HashService {
  static sha256(data: string | Buffer): string {
    return createHash('sha256').update(data).digest('hex');
  }

  static hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  static verifyPassword(password: string, stored: string): boolean {
    const [salt, hash] = stored.split(':');
    const hashBuffer = Buffer.from(hash, 'hex');
    const derivedKey = scryptSync(password, salt, 64);
    return timingSafeEqual(hashBuffer, derivedKey);
  }

  static generateToken(length = 32): string {
    return randomBytes(length).toString('hex');
  }
}
