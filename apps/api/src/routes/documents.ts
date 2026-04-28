import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { prisma } from '../lib/prisma';
import { EncryptionService } from '@family-nudge/crypto';
import { HashService } from '@family-nudge/crypto';
import { AppError } from '../middleware/error-handler';
import { authenticate, requireFamilyRole } from '../middleware/auth';
import {
  buildDocumentVisibilityWhere,
  canDeleteDocument,
  canReadDocument,
  canUploadDocument,
  canViewAuditLog,
  getDocumentScope,
  type DocumentAccessRecord,
  type FamilyMembership,
} from '../services/document-access.service';
import { storageService } from '../services/storage.service';

export const documentRouter = Router();
documentRouter.use(authenticate);

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

async function getFamilyMembership(
  userId: string,
  familyId: string,
): Promise<FamilyMembership> {
  const membership = await prisma.familyMember.findUnique({
    where: {
      userId_familyId: {
        userId,
        familyId,
      },
    },
  });

  if (!membership || !membership.isActive) {
    throw new AppError(403, 'You are not an active member of this family');
  }

  return membership;
}

async function getDocumentForAccess(documentId: string): Promise<DocumentAccessRecord> {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      familyId: true,
      uploadedById: true,
      memberId: true,
    },
  });

  if (!document) {
    throw new AppError(404, 'Document not found');
  }

  return document;
}

documentRouter.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) throw new AppError(400, 'File is required');

    const data = uploadDocSchema.parse(req.body);
    const tags = data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    const actorMembership = await getFamilyMembership(req.user!.userId, data.familyId);
    const targetMember = data.memberId
      ? await prisma.familyMember.findUnique({ where: { id: data.memberId } })
      : null;

    if (!canUploadDocument(actorMembership, targetMember)) {
      throw new AppError(
        403,
        'You can only upload family-wide documents or documents assigned to yourself unless you manage the family',
      );
    }

    const encryption = getEncryptionService();
    const encrypted = encryption.encryptFile(req.file.buffer);
    const checksum = HashService.sha256(req.file.buffer);
    const storedDocument = await storageService.saveEncryptedDocument(
      data.familyId,
      req.file.originalname,
      encrypted,
    );

    const document = await prisma.document.create({
      data: {
        name: data.name,
        category: data.category,
        description: data.description,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        tags,
        encryptedPath: storedDocument.encryptedPath,
        encryptionKeyId: encrypted.keyId,
        checksum,
        uploadedById: req.user!.userId,
        familyId: data.familyId,
        memberId: targetMember?.id,
      },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        mimeType: true,
        fileSize: true,
        tags: true,
        encryptedPath: true,
        createdAt: true,
        updatedAt: true,
        memberId: true,
        uploadedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    await prisma.documentAuditLog.create({
      data: {
        documentId: document.id,
        userId: req.user!.userId,
        action: 'UPLOAD',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: {
          fileName: req.file.originalname,
          fileSize: req.file.size,
          scope: getDocumentScope(document.memberId),
          storageProvider: storedDocument.storageProvider,
          storageKey: storedDocument.storageKey,
          assignedMemberId: document.memberId,
        },
      },
    });

    res.status(201).json({
      success: true,
      data: {
        ...document,
        scope: getDocumentScope(document.memberId),
      },
    });
  } catch (err) {
    next(err);
  }
});

documentRouter.get('/family/:familyId', requireFamilyRole(), async (req, res, next) => {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const familyId = Array.isArray(req.params.familyId) ? req.params.familyId[0] : req.params.familyId;
    const actorMembership = await getFamilyMembership(req.user!.userId, familyId);
    const where = buildDocumentVisibilityWhere(actorMembership) as Record<string, unknown>;
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
        memberId: true,
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
        family: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: documents.map((doc: (typeof documents)[number]) => ({
        ...doc,
        scope: getDocumentScope(doc.memberId),
      })),
    });
  } catch (err) {
    next(err);
  }
});

documentRouter.get('/:id/download', async (req, res, next) => {
  try {
    const accessDocument = await getDocumentForAccess(req.params.id);
    const actorMembership = await getFamilyMembership(req.user!.userId, accessDocument.familyId);

    if (!canReadDocument(actorMembership, accessDocument)) {
      throw new AppError(403, 'You do not have access to this document');
    }

    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        mimeType: true,
        encryptedPath: true,
      },
    });

    if (!document) throw new AppError(404, 'Document not found');

    const encrypted = await storageService.readEncryptedDocument(document.encryptedPath);
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
    const accessDocument = await getDocumentForAccess(req.params.id);
    const actorMembership = await getFamilyMembership(req.user!.userId, accessDocument.familyId);

    if (!canViewAuditLog(actorMembership, accessDocument)) {
      throw new AppError(403, 'You do not have access to this audit trail');
    }

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
    const accessDocument = await getDocumentForAccess(req.params.id);
    const actorMembership = await getFamilyMembership(req.user!.userId, accessDocument.familyId);

    if (!canDeleteDocument(actorMembership, accessDocument)) {
      throw new AppError(403, 'You do not have permission to delete this document');
    }

    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
      select: { id: true, encryptedPath: true },
    });
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
      await storageService.deleteEncryptedDocument(document.encryptedPath);
    } catch {
      // File may already be deleted or already absent from bucket storage.
    }

    await prisma.document.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) {
    next(err);
  }
});
