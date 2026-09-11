export type UserRole = 'USER' | 'ADMIN';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  badgeId: string;
  email: string;
  title: string;
  department: string;
  clearanceLevel: 'LEVEL_3_CONFIDENTIAL' | 'LEVEL_4_SECRET' | 'LEVEL_5_TOP_SECRET';
  lastLogin: string;
  avatarColor: string;
}

export interface ShreddedFileRecord {
  id: string;
  fileName: string;
  originalPath: string;
  fileExtension: string;
  sizeBytes: number;
  shredTimestamp: string;
  passes: number;
  patternType: string;
  slackSpacePurgedBytes: number;
  residualEntropy: number;
  erasureHash: string;
  operator: string;
  operatorBadge: string;
  isRealDiskErasure: boolean;
  caseReference?: string;
  notes?: string;
  category: 'IMAGE' | 'DOCUMENT' | 'MEDIA' | 'DATABASE' | 'BINARY' | 'OTHER';
}
