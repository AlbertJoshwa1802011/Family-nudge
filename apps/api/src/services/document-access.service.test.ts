import { describe, expect, it } from 'vitest';
import {
  buildDocumentVisibilityWhere,
  canDeleteDocument,
  canReadDocument,
  canUploadDocument,
  canViewAuditLog,
  getDocumentScope,
} from './document-access.service';

const adminMember = {
  id: 'member-admin',
  userId: 'user-admin',
  familyId: 'family-1',
  role: 'ADMIN',
  isActive: true,
};

const parentMember = {
  id: 'member-parent',
  userId: 'user-parent',
  familyId: 'family-1',
  role: 'PARENT',
  isActive: true,
};

const regularMember = {
  id: 'member-regular',
  userId: 'user-regular',
  familyId: 'family-1',
  role: 'MEMBER',
  isActive: true,
};

const childMember = {
  id: 'member-child',
  userId: 'user-child',
  familyId: 'family-1',
  role: 'CHILD',
  isActive: true,
};

const viewerMember = {
  id: 'member-viewer',
  userId: 'user-viewer',
  familyId: 'family-1',
  role: 'VIEWER',
  isActive: true,
};

describe('document access service', () => {
  it('labels family and member scoped documents correctly', () => {
    expect(getDocumentScope()).toBe('FAMILY');
    expect(getDocumentScope(null)).toBe('FAMILY');
    expect(getDocumentScope('member-123')).toBe('MEMBER');
  });

  it('lets managers upload for any member but blocks child family-wide uploads', () => {
    expect(canUploadDocument(adminMember, regularMember)).toBe(true);
    expect(canUploadDocument(parentMember, childMember)).toBe(true);
    expect(canUploadDocument(regularMember, regularMember)).toBe(true);
    expect(canUploadDocument(regularMember, childMember)).toBe(false);
    expect(canUploadDocument(childMember, undefined)).toBe(false);
  });

  it('allows family-wide reads for active family members but keeps member docs private', () => {
    const familyDocument = {
      id: 'doc-1',
      familyId: 'family-1',
      uploadedById: 'user-parent',
      memberId: null,
    };
    const memberDocument = {
      id: 'doc-2',
      familyId: 'family-1',
      uploadedById: 'user-parent',
      memberId: 'member-child',
    };

    expect(canReadDocument(regularMember, familyDocument)).toBe(true);
    expect(canReadDocument(viewerMember, familyDocument)).toBe(true);
    expect(canReadDocument(regularMember, memberDocument)).toBe(false);
    expect(canReadDocument(childMember, memberDocument)).toBe(true);
    expect(canReadDocument(parentMember, memberDocument)).toBe(true);
  });

  it('limits audit logs and delete rights to owners and managers', () => {
    const memberDocument = {
      id: 'doc-3',
      familyId: 'family-1',
      uploadedById: 'user-regular',
      memberId: 'member-child',
    };

    expect(canViewAuditLog(adminMember, memberDocument)).toBe(true);
    expect(canViewAuditLog(childMember, memberDocument)).toBe(true);
    expect(canViewAuditLog(regularMember, memberDocument)).toBe(true);
    expect(canViewAuditLog(viewerMember, memberDocument)).toBe(false);

    expect(canDeleteDocument(adminMember, memberDocument)).toBe(true);
    expect(canDeleteDocument(regularMember, memberDocument)).toBe(true);
    expect(canDeleteDocument(parentMember, memberDocument)).toBe(true);
    expect(canDeleteDocument(childMember, memberDocument)).toBe(false);
    expect(canDeleteDocument(viewerMember, memberDocument)).toBe(false);
  });

  it('returns the expected visibility query for managers and members', () => {
    expect(buildDocumentVisibilityWhere(adminMember)).toEqual({
      familyId: 'family-1',
      isArchived: false,
    });

    expect(buildDocumentVisibilityWhere(regularMember)).toEqual({
      familyId: 'family-1',
      isArchived: false,
      OR: [{ memberId: null }, { memberId: 'member-regular' }, { uploadedById: 'user-regular' }],
    });
  });
});
