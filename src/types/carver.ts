export type FileCategory = 
  | 'IMAGE'
  | 'DOCUMENT'
  | 'ARCHIVE'
  | 'AUDIO_VIDEO'
  | 'VIDEO'
  | 'DATABASE'
  | 'EXECUTABLE'
  | 'TEXT_CODE'
  | 'BINARY'
  | 'UNKNOWN';

export interface FileSignature {
  id: string;
  extension: string;
  mimeType: string;
  category: FileCategory;
  name: string;
  headerHex: string[]; // e.g. ["FF", "D8", "FF"]
  footerHex?: string[]; // e.g. ["FF", "D9"]
  maxSizeBytes?: number;
  structureValidator?: string; // name of specialized structure validator
}

export interface CarvedFile {
  id: string;
  evidenceId: string;
  name: string;
  extension: string;
  mimeType: string;
  category: FileCategory;
  offsetStart?: number;
  offsetEnd?: number;
  sizeBytes: number;
  confidenceScore: number; // 0 to 100%
  integrityStatus: 'VALID_STRUCTURE' | 'PARTIAL_FOOTER_MISSING' | 'FRAGMENTED_RECOVERED' | 'CORRUPTED';
  isFragmented: boolean;
  fragmentCount?: number;
  gapOffsets?: [number, number][];
  shannonEntropy?: number;
  md5Hash?: string;
  sha256Hash?: string;
  metadataExtracted?: {
    cameraMakeModel?: string;
    dimensions?: string;
    authorOrTitle?: string;
    creationDate?: string;
    pageCount?: number;
    embeddedFiles?: number;
    exifData?: Record<string, string>;
  };
  rawData: Uint8Array;
  previewUrl?: string;
  previewText?: string;
  carvingTechnique: string;
  source?: 'RECYCLE_BIN' | 'LOCAL_DISK_FOLDER' | 'VIRTUAL_DISK' | 'USB_PENDRIVE';
  originalPath?: string;
  originalLocation?: string;
  dateDeleted?: string;
  modifyDate?: string;
  canRestore?: boolean;
  // NTFS & Recycle Bin Forensic Details
  ntfsRecord?: {
    recordNumber: number;
    sequenceNumber: number;
    isAllocatedInMft: boolean;
    timestamps?: {
      created?: string;
      modified?: string;
      mftModified?: string;
      accessed?: string;
    };
    dataRuns?: {
      clusterCount: number;
      startClusterLCN: number;
      offsetBytes: number;
      lengthBytes: number;
      allocatedStatus: 'ALLOCATED' | 'UNALLOCATED_FREE_CLUSTER' | 'OVERWRITTEN';
    }[];
    clusterInfo?: {
      clusterSize: number;
      startLCN: number;
      totalClusters: number;
    };
    status: 'RECOVERABLE' | 'PARTIALLY_OVERWRITTEN' | 'METADATA_ONLY' | 'CORRUPTED';
  };
  recycleBinArtifact?: {
    metadataFile: string; // $I...
    dataFile: string;     // $R...
    dataPresentOnDisk: boolean;
    canRestoreToOriginal: boolean;
  };
  recoveryState?: 'METADATA_ONLY' | 'CONTENT_RECOVERED';
}

export interface CarvingScanMetrics {
  totalBytesScanned: number;
  totalSignaturesMatched: number;
  totalFilesRecovered: number;
  validIntegrityFiles: number;
  fragmentedReconstructed: number;
  carveDurationMs: number;
  averageConfidence: number;
  categoryBreakdown: Record<FileCategory, number>;
}
