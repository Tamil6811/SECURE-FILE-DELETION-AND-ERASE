export interface SystemDeletedFileResult {
  id: string;
  evidenceId: string;
  name: string;
  extension: string;
  originalPath: string;
  sizeBytes: number;
  category: 'IMAGE' | 'DOCUMENT' | 'VIDEO' | 'DATABASE' | 'ARCHIVE' | 'BINARY';
  mimeType: string;
  modifyDate: string;
  confidenceScore: number;
  integrityStatus: 'VALID_STRUCTURE' | 'PARTIAL_FOOTER_MISSING' | 'FRAGMENTED_RECOVERED' | 'CORRUPTED';
  isFragmented: boolean;
  source: 'RECYCLE_BIN' | 'LOCAL_DISK_FOLDER' | 'USB_PENDRIVE';
  originalLocation?: string;
  dateDeleted?: string;
  carvingTechnique: string;
  canRestore: boolean;
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
    metadataFile: string;
    dataFile: string;
    dataPresentOnDisk: boolean;
    canRestoreToOriginal: boolean;
  };
  recoveryState?: 'METADATA_ONLY' | 'CONTENT_RECOVERED';
}

export class RecoveryService {
  /**
   * Scans real deleted files from the Windows system (Recycle Bin or target folder)
   */
  static async scanDeletedFiles(options: {
    source?: 'RECYCLE_BIN' | 'ALL' | 'FOLDER';
    folderPath?: string;
  }): Promise<{ success: boolean; count: number; totalBytes: number; files: SystemDeletedFileResult[] }> {
    try {
      const params = new URLSearchParams();
      if (options.source) params.append('source', options.source);
      if (options.folderPath) params.append('folderPath', options.folderPath);

      const res = await fetch(`/api/recovery/scan-system-deleted?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err: any) {
      console.warn('System deleted files scan warning:', err);
      return {
        success: false,
        count: 0,
        totalBytes: 0,
        files: []
      };
    }
  }

  /**
   * Extracts raw bytes / base64 of a deleted file for live browser preview and hex inspection
   */
  static async extractFileContent(name: string, originalPath?: string): Promise<{
    success: boolean;
    name: string;
    sizeBytes: number;
    base64: string;
    hexPreview: string;
  }> {
    const res = await fetch('/api/recovery/extract-deleted-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, originalPath })
    });

    if (!res.ok) {
      throw new Error(`Failed to extract deleted file content: HTTP ${res.status}`);
    }
    return await res.json();
  }

  /**
   * Restores a deleted file back to computer storage (destination folder or TestCase)
   */
  static async restoreFile(name: string, destinationFolder?: string): Promise<{
    success: boolean;
    restoredPath: string;
    folder: string;
    message: string;
  }> {
    const res = await fetch('/api/recovery/restore-system-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, destinationFolder })
    });

    if (!res.ok) {
      throw new Error(`Restore failed: HTTP ${res.status}`);
    }
    return await res.json();
  }
}
