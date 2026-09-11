export type StorageDeviceType = 'NVME' | 'SSD' | 'HDD' | 'USB' | 'SD_CARD' | 'RAW_IMAGE';

export type StorageDeviceCategory = 'INTERNAL_STORAGE' | 'EXTERNAL_PENDRIVE';

export interface StorageDevice {
  id: string;
  name: string;
  type: StorageDeviceType;
  category?: StorageDeviceCategory;
  capacityGB: number;
  serialNumber: string;
  interface: string;
  firmware: string;
  healthStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  wearLevelPct?: number;
  sectorSize: number; // 512 or 4096 bytes
  totalSectors: number;
  isMounted: boolean;
  mountPoint?: string;
  isCustomImage?: boolean;
  customImageData?: Uint8Array;
}

export type ErasureStandardId = 
  | 'NIST_800_88_CLEAR'
  | 'NIST_800_88_PURGE'
  | 'DOD_5220_22_M'
  | 'DOD_5220_22_M_ECE'
  | 'IEEE_2883_2022'
  | 'GUTMANN_35'
  | 'BSI_VSITR'
  | 'CRYPTO_SCRAMBLE'
  | 'CUSTOM_PASS';

export interface ErasureStandard {
  id: ErasureStandardId;
  name: string;
  authority: string;
  category: 'CLEAR' | 'PURGE' | 'DESTROY';
  passes: number;
  description: string;
  passDetails: string[];
  recommendedFor: string[];
  complianceLevel: 'Standard' | 'Government' | 'Military' | 'Forensic Purge';
  verificationMethod: string;
}

export interface SectorBlock {
  index: number;
  status: 'PENDING' | 'OVERWRITING' | 'WRITTEN' | 'VERIFYING' | 'VERIFIED' | 'BAD_SECTOR';
  currentPass: number;
  entropy: number; // 0.0 to 8.0
  sampleByte: string; // e.g. "0x00", "0xFF", "0x55", "0xAA", "RANDOM"
}

export interface ErasureSessionProgress {
  sessionId: string;
  deviceId: string;
  standardId: ErasureStandardId;
  totalPasses: number;
  currentPass: number;
  passDescription: string;
  sectorsTotal: number;
  sectorsCompleted: number;
  progressPercentage: number;
  throughputMBps: number;
  elapsedSeconds: number;
  estimatedRemainingSeconds: number;
  badSectorsFound: number;
  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'VERIFYING' | 'COMPLETED' | 'FAILED';
  verificationPercentage: number;
  verificationPassed: boolean;
  preSanitizationHash: string;
  postSanitizationHash: string;
}

export interface CertificateOfDestruction {
  certificateId: string;
  timestamp: string;
  device: {
    name: string;
    serialNumber: string;
    type: StorageDeviceType;
    capacityGB: number;
    firmware: string;
  };
  sanitization: {
    standardName: string;
    standardAuthority: string;
    passesCompleted: number;
    verificationStatus: 'PASS' | 'FAIL';
    postErasureEntropy: number;
    sha256VerificationHash: string;
    operatorName: string;
    technicianId: string;
    organization: string;
  };
  cryptographicSignature: string;
  qrVerificationPayload: string;
}
