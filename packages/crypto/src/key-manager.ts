import { randomBytes, createHash } from 'crypto';

interface KeyEntry {
  id: string;
  key: string;
  createdAt: Date;
  rotatedAt?: Date;
  active: boolean;
}

export class KeyManager {
  private keys: Map<string, KeyEntry> = new Map();

  addKey(keyHex: string, id?: string): string {
    const keyId = id ?? createHash('sha256').update(keyHex).digest('hex').substring(0, 12);
    this.keys.set(keyId, {
      id: keyId,
      key: keyHex,
      createdAt: new Date(),
      active: true,
    });
    return keyId;
  }

  getKey(keyId: string): string | undefined {
    return this.keys.get(keyId)?.key;
  }

  getActiveKeyId(): string | undefined {
    for (const [id, entry] of this.keys) {
      if (entry.active) return id;
    }
    return undefined;
  }

  rotateKey(): string {
    for (const entry of this.keys.values()) {
      entry.active = false;
    }
    const newKey = randomBytes(32).toString('hex');
    return this.addKey(newKey);
  }

  deactivateKey(keyId: string): void {
    const entry = this.keys.get(keyId);
    if (entry) {
      entry.active = false;
      entry.rotatedAt = new Date();
    }
  }
}
