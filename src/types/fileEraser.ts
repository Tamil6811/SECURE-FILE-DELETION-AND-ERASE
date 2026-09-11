export type SanitizationTargetType = 'FILE' | 'FOLDER' | 'STORAGE_DEVICE';

export interface MetadataCleansingConfig {
  zeroTimestamps: boolean; // Clears Modified, Accessed, Created, Birth (MACB)
  purgeAlternateDataStreams: boolean; // NTFS ADS (:Zone.Identifier, hidden streams)
  wipeFileSlackSpace: boolean; // Overwrite cluster slack between EOF and cluster end
  obfuscateFileName: boolean; // Rename to random 256-char ASCII before unlinking
  sanitizeMFTRecord: boolean; // Overwrite MFT / Inode pointer entry
  wipeExtendedAttributes: boolean; // POSIX xattr / security ACL descriptors
  passes: number; // 1 (0x00), 3 (DoD), 7 (VSITR), 35 (Gutmann)
  patternType: 'ZERO' | 'RANDOM' | 'DOD_TRIPLE' | 'GUTMANN';
}

export interface ErasableItem {
  id: string;
  name: string;
  originalPath: string;
  relativePath?: string; // e.g. "TestCase/nested/unknown.bin"
  parentFolder?: string; // e.g. "TestCase"
  sizeBytes: number;
  type: 'FILE' | 'FOLDER';
  itemCount?: number; // for folders
  fileSystem: 'NTFS' | 'FAT32' | 'EXT4' | 'APFS' | 'exFAT';
  macbTimestamps: {
    modified: string;
    accessed: string;
    created: string;
    birth: string;
  };
  adsStreamsDetected: string[];
  slackSizeBytes: number;
  status: 'QUEUED' | 'SHREDDING_PAYLOAD' | 'CLEANSING_METADATA' | 'PURGING_SLACK' | 'OBFUSCATING_NAME' | 'DESTROYED' | 'FAILED';
  progressPct: number;
  erasureHash: string;
  residualEntropy: number;
  erasureTimestamp?: string;
  realFile?: File;
  fileHandle?: any;
  dirHandle?: any;
  isRealDiskTarget?: boolean;
  isUnknownBinary?: boolean;
}

export interface FolderHierarchyNode {
  name: string;
  fullPath: string;
  totalFiles: number;
  totalSizeBytes: number;
  children: {
    name: string;
    size: number;
    type: string;
    path: string;
  }[];
}

export interface BatchErasureSummary {
  totalFiles: number;
  totalBytes: number;
  completedFiles: number;
  failedFiles: number;
  slackSpacePurgedBytes: number;
  metadataRecordsCleaned: number;
  overallEntropy: number;
  auditSignature: string;
  targetType: SanitizationTargetType;
  selectedRootPath?: string;
  isRealDeviceAction?: boolean;
  realDiskMessage?: string;
}
