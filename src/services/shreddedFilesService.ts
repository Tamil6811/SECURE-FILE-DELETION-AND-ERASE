import { ShreddedFileRecord } from '../types/auth';

const STORAGE_KEY = 'aegis_shredded_files_manifest_v1';

export const INITIAL_SHREDDED_FILES: ShreddedFileRecord[] = [
  {
    id: 'SHRED-2026-001',
    fileName: 'photo.jpg',
    originalPath: 'C:\\Evidence\\TestCase\\photo.jpg',
    fileExtension: 'jpg',
    sizeBytes: 2458120,
    shredTimestamp: '2026-09-10T09:51:20Z',
    passes: 3,
    patternType: 'DoD 5220.22-M',
    slackSpacePurgedBytes: 1896,
    residualEntropy: 0.0000,
    erasureHash: 'a8b7c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
    operator: 'Dr. Elena Rostova',
    operatorBadge: 'DIR-8942',
    isRealDiskErasure: true,
    caseReference: 'CASE-2026-NY-891',
    notes: 'Exif GPS metadata and raw image bytes overwritten with 3-pass DoD standard and slack purged.',
    category: 'IMAGE'
  },
  {
    id: 'SHRED-2026-002',
    fileName: 'report.pdf',
    originalPath: 'C:\\Evidence\\TestCase\\report.pdf',
    fileExtension: 'pdf',
    sizeBytes: 1048576,
    shredTimestamp: '2026-09-10T09:51:22Z',
    passes: 3,
    patternType: 'DoD 5220.22-M',
    slackSpacePurgedBytes: 3072,
    residualEntropy: 0.0000,
    erasureHash: 'f1e2d3c4b5a697887766554433221100ffeeddccbbaa99887766554433221100',
    operator: 'Dr. Elena Rostova',
    operatorBadge: 'DIR-8942',
    isRealDiskErasure: true,
    caseReference: 'CASE-2026-NY-891',
    notes: 'Confidential investigation report document sanitized and removed from NTFS master file table.',
    category: 'DOCUMENT'
  },
  {
    id: 'SHRED-2026-003',
    fileName: 'video.mp4',
    originalPath: 'C:\\Evidence\\TestCase\\video.mp4',
    fileExtension: 'mp4',
    sizeBytes: 1048576,
    shredTimestamp: '2026-09-10T09:51:24Z',
    passes: 1,
    patternType: 'NIST SP 800-88 Zero',
    slackSpacePurgedBytes: 2048,
    residualEntropy: 0.0000,
    erasureHash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    operator: 'Dr. Elena Rostova',
    operatorBadge: 'DIR-8942',
    isRealDiskErasure: true,
    caseReference: 'CASE-2026-NY-891',
    notes: 'CCTV surveillance video recording purged and cluster slack wiped.',
    category: 'MEDIA'
  },
  {
    id: 'SHRED-2026-004',
    fileName: 'database.db',
    originalPath: 'C:\\Evidence\\TestCase\\database.db',
    fileExtension: 'db',
    sizeBytes: 65536,
    shredTimestamp: '2026-09-10T09:51:25Z',
    passes: 7,
    patternType: 'BSI VSITR (7-Pass)',
    slackSpacePurgedBytes: 0,
    residualEntropy: 0.0000,
    erasureHash: 'bbccddeeff00112233445566778899aabbccddeeff00112233445566778899aa',
    operator: 'Dr. Elena Rostova',
    operatorBadge: 'DIR-8942',
    isRealDiskErasure: true,
    caseReference: 'CASE-2026-NY-891',
    notes: 'SQLite database pages and WAL journals zeroed and unlinked from directory index.',
    category: 'DATABASE'
  },
  {
    id: 'SHRED-2026-005',
    fileName: 'unknown.bin',
    originalPath: 'C:\\Evidence\\TestCase\\unknown.bin',
    fileExtension: 'bin',
    sizeBytes: 131072,
    shredTimestamp: '2026-09-10T09:51:26Z',
    passes: 3,
    patternType: 'DoD 5220.22-M',
    slackSpacePurgedBytes: 1536,
    residualEntropy: 0.0000,
    erasureHash: '99887766554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa',
    operator: 'Dr. Elena Rostova',
    operatorBadge: 'DIR-8942',
    isRealDiskErasure: true,
    caseReference: 'CASE-2026-NY-891',
    notes: 'Raw proprietary evidence stream sanitized and cluster slack purged.',
    category: 'BINARY'
  },
  {
    id: 'SHRED-2026-006',
    fileName: 'financial_ledger_q2.xlsx',
    originalPath: 'C:\\Corporate\\Finance\\financial_ledger_q2.xlsx',
    fileExtension: 'xlsx',
    sizeBytes: 5242880,
    shredTimestamp: '2026-09-08T14:20:10Z',
    passes: 3,
    patternType: 'DoD 5220.22-M',
    slackSpacePurgedBytes: 2560,
    residualEntropy: 0.0000,
    erasureHash: '33445566778899aabbccddeeff00112233445566778899aabbccddeeff001122',
    operator: 'Senior Investigator J. Miller',
    operatorBadge: 'INV-5104',
    isRealDiskErasure: false,
    caseReference: 'AUDIT-SEC-4402',
    notes: 'Quarterly financial records shredded per GDPR Article 17 Right to Erasure mandate.',
    category: 'DOCUMENT'
  }
];

export class ShreddedFilesService {
  private static instance: ShreddedFilesService;
  private records: ShreddedFileRecord[] = [];

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): ShreddedFilesService {
    if (!ShreddedFilesService.instance) {
      ShreddedFilesService.instance = new ShreddedFilesService();
    }
    return ShreddedFilesService.instance;
  }

  private loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        this.records = JSON.parse(data);
      } else {
        this.records = [...INITIAL_SHREDDED_FILES];
        this.saveToStorage();
      }
    } catch (e) {
      this.records = [...INITIAL_SHREDDED_FILES];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.records));
    } catch (e) {
      console.warn('Failed to save shredded files to storage:', e);
    }
  }

  public getAll(): ShreddedFileRecord[] {
    return [...this.records];
  }

  public addRecords(newRecords: ShreddedFileRecord[]) {
    this.records = [...newRecords, ...this.records];
    this.saveToStorage();
  }

  public addSingle(rec: ShreddedFileRecord) {
    this.records = [rec, ...this.records];
    this.saveToStorage();
  }

  public clearAll() {
    this.records = [];
    localStorage.removeItem(STORAGE_KEY);
  }
}
