import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { prisma } from '../lib/prisma';
import { EncryptionService } from '@family-nudge/crypto';
import { HashService } from '@family-nudge/crypto';
import { AppError } from '../middleware/error-handler';
import { authenticate, requireFamilyRole } from '../middleware/auth';

export const documentRouter = Router();
documentRouter.use(authenticate);

const uploadDir = process.env.UPLOAD_DIR ?? './uploads';
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB ?? '50') || 50) * 1024 * 1024 },
});

function getEncryptionService(): EncryptionService {
  const key = process.env.ENCRYPTION_MASTER_KEY;
  if (!key) throw new AppError(500, 'Encryption not configured');
  return new EncryptionService(key);
}

const uploadDocSchema = z.object({
  name: z.string().min(1),
  category: z.string(),
  description: z.string().optional(),
  tags: z.string().optional(),
  familyId: z.string(),
  memberId: z.string().optional(),
});

documentRouter.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) throw new AppError(400, 'File is required');

    const data = uploadDocSchema.parse(req.body);
    const tags = data.tags ? data.tags.split(',').map((t) => t.trim()) : [];

    const encryption = getEncryptionService();
    const encrypted = encryption.encryptFile(req.file.buffer);
    const checksum = HashService.sha256(req.file.buffer);

    await fs.mkdir(uploadDir, { recursive: true });
    const encryptedFileName = `${Date.now()}_${HashService.generateToken(8)}.enc`;
    const encryptedPath = path.join(uploadDir, encryptedFileName);
    await fs.writeFile(encryptedPath, JSON.stringify(encrypted));

    const document = await prisma.document.create({
      data: {
        name: data.name,
        category: data.category,
        description: data.description,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        tags,
        encryptedPath,
        encryptionKeyId: encrypted.keyId,
        checksum,
        uploadedById: req.user!.userId,
        familyId: data.familyId,
        memberId: data.memberId,
      },
    });

    await prisma.documentAuditLog.create({
      data: {
        documentId: document.id,
        userId: req.user!.userId,
        action: 'UPLOAD',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: { fileName: req.file.originalname, fileSize: req.file.size },
      },
    });

    res.status(201).json({ success: true, data: document });
  } catch (err) {
    next(err);
  }
});

documentRouter.get('/family/:familyId', requireFamilyRole(), async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const where: Record<string, unknown> = {
      familyId: req.params.familyId,
      isArchived: false,
    };
    if (category) where.category = category;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const documents = await prisma.document.findMany({
      where,
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        mimeType: true,
        fileSize: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: documents });
  } catch (err) {
    next(err);
  }
});

documentRouter.get('/:id/download', async (req, res, next) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
    });

    if (!document) throw new AppError(404, 'Document not found');

    const encryptedData = await fs.readFile(document.encryptedPath, 'utf-8');
    const encrypted = JSON.parse(encryptedData);

    const encryption = getEncryptionService();
    const decrypted = encryption.decryptFile(encrypted);

    await prisma.documentAuditLog.create({
      data: {
        documentId: document.id,
        userId: req.user!.userId,
        action: 'DOWNLOAD',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.name}"`);
    res.send(decrypted);
  } catch (err) {
    next(err);
  }
});

documentRouter.get('/:id/audit', async (req, res, next) => {
  try {
    const logs = await prisma.documentAuditLog.findMany({
      where: { documentId: req.params.id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
});

documentRouter.delete('/:id', async (req, res, next) => {
  try {
    const document = await prisma.document.findUnique({ where: { id: req.params.id } });
    if (!document) throw new AppError(404, 'Document not found');

    await prisma.documentAuditLog.create({
      data: {
        documentId: document.id,
        userId: req.user!.userId,
        action: 'DELETE',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    try {
      await fs.unlink(document.encryptedPath);
    } catch {
      // File may already be deleted
    }

    await prisma.document.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) {
    next(err);
  }
});
