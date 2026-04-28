type FamilyMembership = {
  id: string;
  userId: string;
  familyId: string;
  role: string;
  isActive: boolean;
};

type DocumentAccessRecord = {
  id: string;
  familyId: string;
  uploadedById: string;
  memberId?: string | null;
};

const FAMILY_MANAGERS = new Set(['ADMIN', 'PARENT']);
const CONTRIBUTOR_ROLES = new Set(['ADMIN', 'PARENT', 'MEMBER', 'CHILD']);

export function isFamilyManager(role: string): boolean {
  return FAMILY_MANAGERS.has(role);
}

export function getDocumentScope(memberId?: string | null): 'FAMILY' | 'MEMBER' {
  return memberId ? 'MEMBER' : 'FAMILY';
}

export function canUploadDocument(
  actor: FamilyMembership,
  targetMember?: FamilyMembership | null,
): boolean {
  if (!actor.isActive) {
    return false;
  }

  if (!CONTRIBUTOR_ROLES.has(actor.role)) {
    return false;
  }

  if (!targetMember) {
    return actor.role !== 'CHILD';
  }

  if (!targetMember.isActive || targetMember.familyId !== actor.familyId) {
    return false;
  }

  if (isFamilyManager(actor.role)) {
    return true;
  }

  return targetMember.id === actor.id;
}

export function canReadDocument(actor: FamilyMembership, document: DocumentAccessRecord): boolean {
  if (!actor.isActive || actor.familyId !== document.familyId) {
    return false;
  }

  if (isFamilyManager(actor.role)) {
    return true;
  }

  if (!document.memberId) {
    return true;
  }

  return document.memberId === actor.id || document.uploadedById === actor.userId;
}

export function canViewAuditLog(
  actor: FamilyMembership,
  document: DocumentAccessRecord,
): boolean {
  if (!canReadDocument(actor, document)) {
    return false;
  }

  return isFamilyManager(actor.role) || document.memberId === actor.id || document.uploadedById === actor.userId;
}

export function canDeleteDocument(
  actor: FamilyMembership,
  document: DocumentAccessRecord,
): boolean {
  if (!actor.isActive || actor.familyId !== document.familyId) {
    return false;
  }

  if (actor.role === 'CHILD' || actor.role === 'VIEWER') {
    return false;
  }

  return isFamilyManager(actor.role) || document.uploadedById === actor.userId;
}

export function buildDocumentVisibilityWhere(actor: FamilyMembership) {
  if (isFamilyManager(actor.role)) {
    return {
      familyId: actor.familyId,
      isArchived: false,
    };
  }

  return {
    familyId: actor.familyId,
    isArchived: false,
    OR: [{ memberId: null }, { memberId: actor.id }, { uploadedById: actor.userId }],
  };
}

export type { DocumentAccessRecord, FamilyMembership };
