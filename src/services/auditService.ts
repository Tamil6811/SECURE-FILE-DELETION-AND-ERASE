import { AuditLogRecord, AuditActionType, ComplianceStandardRequirement } from '../types/audit';
import { calculateSha256 } from './hashService';

const AUDIT_STORAGE_KEY = 'aegis_forensics_audit_trail_v1';
const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

export class AuditService {
  private static instance: AuditService;
  private records: AuditLogRecord[] = [];

  private constructor() {
    this.loadFromStorage();
    if (this.records.length === 0) {
      this.initGenesisRecord();
    }
  }

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  private loadFromStorage() {
    try {
      const data = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (data) {
        this.records = JSON.parse(data);
      }
    } catch (e) {
      console.warn('Could not load audit log from localStorage:', e);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(this.records));
    } catch (e) {
      console.warn('Could not save audit log to localStorage:', e);
    }
  }

  private async initGenesisRecord() {
    const timestamp = new Date().toISOString();
    const payload = `GENESIS|SYSTEM|SYSTEM_BOOT|${timestamp}|${GENESIS_HASH}`;
    const hash = await calculateSha256(payload);

    this.records.push({
      id: 'AUD-000001',
      timestamp,
      action: 'TAMPER_CHECK_EXECUTED',
      module: 'SYSTEM',
      operator: 'ROOT_SECURITY_KERNEL',
      targetIdentifier: 'FORENSIC_KERNEL_GENESIS',
      details: 'Audit ledger initialized with cryptographic Merkle blockchain chaining.',
      status: 'VERIFIED',
      previousRecordHash: GENESIS_HASH,
      currentRecordHash: hash,
      tamperVerified: true
    });
    this.saveToStorage();
  }

  public getRecords(): AuditLogRecord[] {
    return [...this.records];
  }

  public async logEvent(
    action: AuditActionType,
    module: AuditLogRecord['module'],
    operator: string,
    targetIdentifier: string,
    details: string,
    status: AuditLogRecord['status'] = 'SUCCESS'
  ): Promise<AuditLogRecord> {
    const previousRecord = this.records[this.records.length - 1];
    const prevHash = previousRecord ? previousRecord.currentRecordHash : GENESIS_HASH;
    
    const id = `AUD-${String(this.records.length + 1).padStart(6, '0')}`;
    const timestamp = new Date().toISOString();
    
    const recordPayload = `${id}|${timestamp}|${action}|${module}|${operator}|${targetIdentifier}|${details}|${status}|${prevHash}`;
    const currentHash = await calculateSha256(recordPayload);

    const newRecord: AuditLogRecord = {
      id,
      timestamp,
      action,
      module,
      operator,
      targetIdentifier,
      details,
      status,
      previousRecordHash: prevHash,
      currentRecordHash: currentHash,
      tamperVerified: true
    };

    this.records.push(newRecord);
    this.saveToStorage();
    return newRecord;
  }

  /**
   * Admin-Only: Edit and annotate an existing audit log entry with case reference, remarks, or correction.
   * Recalculates the Merkle hash chain from this record forward and logs the edit event for chain of custody.
   */
  public async editLogRecord(
    recordId: string,
    updates: {
      details?: string;
      targetIdentifier?: string;
      status?: AuditLogRecord['status'];
      caseReference?: string;
      forensicNotes?: string;
    },
    adminName: string
  ): Promise<AuditLogRecord | null> {
    const index = this.records.findIndex(r => r.id === recordId);
    if (index === -1) return null;

    const original = this.records[index];
    const now = new Date().toISOString();

    const updatedRecord: AuditLogRecord = {
      ...original,
      details: updates.details !== undefined ? updates.details : original.details,
      targetIdentifier: updates.targetIdentifier !== undefined ? updates.targetIdentifier : original.targetIdentifier,
      status: updates.status !== undefined ? updates.status : original.status,
      caseReference: updates.caseReference !== undefined ? updates.caseReference : original.caseReference,
      forensicNotes: updates.forensicNotes !== undefined ? updates.forensicNotes : original.forensicNotes,
      originalDetails: original.originalDetails || original.details,
      editedBy: adminName,
      editedAt: now
    };

    this.records[index] = updatedRecord;

    // Recalculate hash chain from modified index to the end
    await this.recalculateHashChain(index);

    this.saveToStorage();

    // Log the administrative edit event
    await this.logEvent(
      'LOG_ENTRY_EDITED_BY_ADMIN',
      'COMPLIANCE',
      adminName,
      recordId,
      `Audit record ${recordId} annotated and re-certified by Administrator ${adminName}. Case Ref: ${updates.caseReference || 'N/A'}`
    );

    return this.records[index];
  }

  private async recalculateHashChain(startIndex: number) {
    for (let i = Math.max(0, startIndex); i < this.records.length; i++) {
      const rec = this.records[i];
      const prevHash = i === 0 ? GENESIS_HASH : this.records[i - 1].currentRecordHash;
      rec.previousRecordHash = prevHash;

      const expectedPayload = i === 0 
        ? `GENESIS|SYSTEM|SYSTEM_BOOT|${rec.timestamp}|${GENESIS_HASH}`
        : `${rec.id}|${rec.timestamp}|${rec.action}|${rec.module}|${rec.operator}|${rec.targetIdentifier}|${rec.details}|${rec.status}|${prevHash}`;
        
      rec.currentRecordHash = await calculateSha256(expectedPayload);
      rec.tamperVerified = true;
    }
  }

  public async verifyLedgerIntegrity(): Promise<{ isValid: boolean; checkedCount: number; errorIndex?: number }> {
    if (this.records.length === 0) return { isValid: true, checkedCount: 0 };

    for (let i = 0; i < this.records.length; i++) {
      const rec = this.records[i];
      const prevHash = i === 0 ? GENESIS_HASH : this.records[i - 1].currentRecordHash;

      if (rec.previousRecordHash !== prevHash) {
        return { isValid: false, checkedCount: i, errorIndex: i };
      }

      // Re-hash record payload
      const expectedPayload = i === 0 
        ? `GENESIS|SYSTEM|SYSTEM_BOOT|${rec.timestamp}|${GENESIS_HASH}`
        : `${rec.id}|${rec.timestamp}|${rec.action}|${rec.module}|${rec.operator}|${rec.targetIdentifier}|${rec.details}|${rec.status}|${prevHash}`;
        
      const computedHash = await calculateSha256(expectedPayload);
      if (computedHash !== rec.currentRecordHash) {
        return { isValid: false, checkedCount: i, errorIndex: i };
      }
    }

    return { isValid: true, checkedCount: this.records.length };
  }

  public clearLogs() {
    this.records = [];
    localStorage.removeItem(AUDIT_STORAGE_KEY);
    this.initGenesisRecord();
  }
}

export const COMPLIANCE_REQUIREMENTS: ComplianceStandardRequirement[] = [
  {
    id: 'NIST-800-88-CLEAR',
    standardName: 'NIST SP 800-88 Rev. 1',
    section: 'Section 4.7.1 - Clear',
    title: 'Logical Sanitization Overwrite',
    requirementText: 'Applies logical techniques to sanitize data in all user-addressable storage locations for protection against simple recovery tools.',
    implementationInApp: 'Single-pass overwriting with uniform zeroing/character patterns across 100% of LBA space with post-verification.',
    status: 'COMPLIANT'
  },
  {
    id: 'NIST-800-88-PURGE',
    standardName: 'NIST SP 800-88 Rev. 1',
    section: 'Section 4.7.2 - Purge',
    title: 'Physical/Firmware Sanitization',
    requirementText: 'Applies physical or logical techniques to render target data recovery infeasible using state-of-the-art laboratory techniques.',
    implementationInApp: 'Cryptographic erase simulation and ATA Secure Erase firmware command orchestration with multi-pass random data.',
    status: 'EXCEEDS_REQUIREMENT'
  },
  {
    id: 'DOD-5220-22-M',
    standardName: 'DoD 5220.22-M (NISPOM)',
    section: 'Chapter 8, Sect 301',
    title: 'National Industrial Security Overwrite',
    requirementText: 'Requires 3-pass overwriting: Pass 1 with binary zeroes, Pass 2 with binary ones, Pass 3 with pseudo-random sequence, followed by 100% verification.',
    implementationInApp: 'Fully implemented 3-pass and 7-pass DoD algorithms with sector-level verification and tamper-evident destruction certificates.',
    status: 'COMPLIANT'
  },
  {
    id: 'IEEE-2883-2022',
    standardName: 'IEEE 2883-2022',
    section: 'Standard for Sanitizing Storage',
    title: 'Flash and Solid State Media Sanitization',
    requirementText: 'Defines sanitize operations for NVMe, SAS, SATA solid-state drives taking into account wear-leveling and over-provisioned spare blocks.',
    implementationInApp: 'Simulated wear-level block controller with TRIM and block reallocation table purging.',
    status: 'COMPLIANT'
  },
  {
    id: 'HIPAA-164-310',
    standardName: 'HIPAA Security Rule',
    section: '45 CFR § 164.310(d)(2)(i)',
    title: 'Device & Media Controls: Disposal',
    requirementText: 'Implement policies and procedures to address the final disposition of electronic protected health information (ePHI) and hardware.',
    implementationInApp: 'Detailed audit log with operator credentials, serial numbers, cryptographic signatures, and PDF destruction certificates.',
    status: 'AUDITED'
  },
  {
    id: 'GDPR-ART-17',
    standardName: 'EU GDPR',
    section: 'Article 17',
    title: 'Right to Erasure ("Right to be Forgotten")',
    requirementText: 'The data subject shall have the right to obtain from the controller the erasure of personal data without undue delay.',
    implementationInApp: 'Selective secure file and folder erasure with MACB timestamp wiping, ADS purging, and filename obfuscation.',
    status: 'COMPLIANT'
  }
];
