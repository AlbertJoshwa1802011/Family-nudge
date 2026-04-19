export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  tag: string;
  algorithm: string;
  keyId: string;
}

export interface EncryptionOptions {
  algorithm?: 'aes-256-gcm' | 'aes-256-cbc';
  keyId?: string;
}
