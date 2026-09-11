/**
 * NTFS File System & Recycle Bin Forensic Architecture
 * Models MFT records, attributes ($STANDARD_INFORMATION, $FILE_NAME, $DATA),
 * data runs, cluster offsets, and $Recycle.Bin ($I / $R) forensic artifacts.
 */

export type MftRecordStatus = 
  | 'RECOVERABLE'
  | 'PARTIALLY_OVERWRITTEN'
  | 'METADATA_ONLY'
  | 'CORRUPTED';

export interface NtfsDataRun {
  clusterCount: number;
  startClusterLCN: number;
  offsetBytes: number;
  lengthBytes: number;
  isSparse: boolean;
  allocatedStatus: 'ALLOCATED' | 'UNALLOCATED_FREE_CLUSTER' | 'OVERWRITTEN';
}

export interface NtfsTimestamps {
  created?: string;
  modified?: string;
  mftModified?: string;
  accessed?: string;
}

export interface NtfsMftRecord {
  recordNumber: number;
  sequenceNumber: number;
  isAllocatedInMft: boolean; // false if deleted/unallocated in MFT bitmap
  filename: string;
  extension: string;
  sizeBytes: number;
  parentDirectoryRecord: number;
  timestamps: NtfsTimestamps;
  flags: {
    inUse: boolean;
    isDirectory: boolean;
  };
  attributes: {
    standardInformation?: boolean;
    fileName?: boolean;
    data?: boolean;
    isResidentData?: boolean;
    alternateDataStreams?: string[];
  };
  dataRuns: NtfsDataRun[];
  clusterInformation: {
    clusterSize: number;
    sectorsPerCluster: number;
    startLCN: number;
    totalClusters: number;
  };
  status: MftRecordStatus;
  recoveryFeasibilityScore: number; // 0 - 100%
  forensicNotes?: string;
}

export interface RecycleBinArtifact {
  id: string;
  originalFilename: string;
  extension: string;
  fileSizeBytes: number;
  deletedTimestamp: string;
  originalLocation: string;
  mftRecordNumber?: number;
  metadataFile: string; // e.g. "$I123456.ext"
  dataFile: string;     // e.g. "$R123456.ext"
  recoveryState: 'METADATA_ONLY' | 'CONTENT_RECOVERED';
  contentHash?: string;
  dataPresentOnDisk: boolean;
  canRestoreToOriginal: boolean;
}
