export type AuditActionType = 
  | 'DRIVE_ERASURE_INITIATED'
  | 'DRIVE_ERASURE_COMPLETED'
  | 'DRIVE_ERASURE_VERIFIED'
  | 'FILE_SHRED_COMPLETED'
  | 'METADATA_PURGE_SUCCESS'
  | 'SLACK_SPACE_WIPED'
  | 'CARVING_SCAN_STARTED'
  | 'CARVING_EVIDENCE_RECOVERED'
  | 'EVIDENCE_PACKAGE_EXPORTED'
  | 'CERTIFICATE_GENERATED'
  | 'CHAIN_OF_CUSTODY_TRANSFER'
  | 'TAMPER_CHECK_EXECUTED'
  | 'LOG_ENTRY_EDITED_BY_ADMIN'
  | 'SHRED_MANIFEST_CERTIFIED'
  | 'SYSTEM_DELETED_SCAN_INITIATED'
  | 'SYSTEM_DELETED_FILES_FOUND'
  | 'RESCUE_RECOVERY_INITIATED'
  | 'RESCUE_RECOVERY_COMPLETED';

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  action: AuditActionType;
  module: 'DRIVE_ERASER' | 'FILE_ERASER' | 'CARVER_RECOVERY' | 'COMPLIANCE' | 'SYSTEM';
  operator: string;
  targetIdentifier: string; // Serial / File name / Drive ID
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED' | 'VERIFIED';
  currentRecordHash: string;
  previousRecordHash: string; // Blockchain-style tamper-evident chained hash
  tamperVerified?: boolean;
  editedBy?: string;
  editedAt?: string;
  caseReference?: string;
  forensicNotes?: string;
  originalDetails?: string;
}

export interface ComplianceStandardRequirement {
  id: string;
  standardName: string; // e.g. "NIST SP 800-88 Rev. 1"
  section: string;
  title: string;
  requirementText: string;
  implementationInApp: string;
  status: 'COMPLIANT' | 'EXCEEDS_REQUIREMENT' | 'AUDITED';
}
