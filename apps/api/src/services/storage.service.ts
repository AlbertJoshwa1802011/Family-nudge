import fs from 'fs/promises';
import path from 'path';
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { EncryptedPayload } from '@family-nudge/crypto';
import { HashService } from '@family-nudge/crypto';
import { AppError } from '../middleware/error-handler';

type StoredDocument = {
  storageProvider: 'local' | 's3';
  storageKey: string;
  encryptedPath: string;
};

function parseBool(value: string | undefined): boolean {
  return value === 'true' || value === '1';
}

function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    stream.on('data', (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

export class StorageService {
  private readonly uploadDir = process.env.UPLOAD_DIR ?? './uploads';
  private readonly bucketName = process.env.STORAGE_BUCKET_NAME;
  private readonly endpoint = process.env.STORAGE_ENDPOINT;
  private readonly region = process.env.STORAGE_REGION ?? 'auto';
  private readonly forcePathStyle = parseBool(process.env.STORAGE_FORCE_PATH_STYLE);

  private readonly client =
    this.bucketName && this.endpoint && process.env.STORAGE_ACCESS_KEY_ID && process.env.STORAGE_SECRET_ACCESS_KEY
      ? new S3Client({
          region: this.region,
          endpoint: this.endpoint,
          forcePathStyle: this.forcePathStyle,
          credentials: {
            accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
            secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
          },
        })
      : null;

  private get useBucketStorage(): boolean {
    return Boolean(this.client && this.bucketName);
  }

  private isBucketKey(documentPath: string): boolean {
    return documentPath.startsWith('families/');
  }

  async saveEncryptedDocument(
    familyId: string,
    documentName: string,
    encrypted: EncryptedPayload,
  ): Promise<StoredDocument> {
    const objectKey = this.buildObjectKey(familyId, documentName);
    const payload = JSON.stringify(encrypted);

    if (this.useBucketStorage) {
      await this.client!.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: objectKey,
          Body: payload,
          ContentType: 'application/json',
          Metadata: {
            app: 'family-nudge',
            familyId,
          },
        }),
      );

      return {
        storageProvider: 's3',
        storageKey: objectKey,
        encryptedPath: objectKey,
      };
    }

    await fs.mkdir(this.uploadDir, { recursive: true });
    const filePath = path.join(this.uploadDir, objectKey.replaceAll('/', '_'));
    await fs.writeFile(filePath, payload);

    return {
      storageProvider: 'local',
      storageKey: objectKey,
      encryptedPath: filePath,
    };
  }

  async readEncryptedDocument(documentPath: string): Promise<EncryptedPayload> {
    if (this.useBucketStorage && this.isBucketKey(documentPath)) {
      const object = await this.client!.send(
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: documentPath,
        }),
      );

      if (!object.Body) {
        throw new AppError(404, 'Stored document payload is empty');
      }

      const body =
        typeof object.Body === 'string'
          ? Buffer.from(object.Body)
          : Buffer.isBuffer(object.Body)
            ? object.Body
            : await streamToBuffer(object.Body as NodeJS.ReadableStream);

      return JSON.parse(body.toString('utf-8')) as EncryptedPayload;
    }

    const encryptedData = await fs.readFile(documentPath, 'utf-8');
    return JSON.parse(encryptedData) as EncryptedPayload;
  }

  async deleteEncryptedDocument(documentPath: string): Promise<void> {
    if (this.useBucketStorage && this.isBucketKey(documentPath)) {
      await this.client!.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: documentPath,
        }),
      );
      return;
    }

    await fs.unlink(documentPath);
  }

  private buildObjectKey(familyId: string, documentName: string): string {
    const extension = path.extname(documentName);
    const baseName = path.basename(documentName, extension).replace(/[^a-zA-Z0-9-_]+/g, '-').toLowerCase();
    const nonce = HashService.generateToken(10).toLowerCase();
    return `families/${familyId}/${Date.now()}-${baseName || 'document'}-${nonce}${extension}.enc`;
  }
}

export const storageService = new StorageService();
