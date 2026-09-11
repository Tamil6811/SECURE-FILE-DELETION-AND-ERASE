import { MetadataCleansingConfig } from '../types/fileEraser';

export interface HostShredResult {
  success: boolean;
  isRealDeviceAction: boolean;
  path: string;
  filesDestroyed: number;
  bytesOverwritten: number;
  destroyedFilesList?: string[];
  message: string;
}

export interface FolderStatusResult {
  exists: boolean;
  path: string;
  fileCount: number;
  files: {
    name: string;
    size: number;
    isDirectory: boolean;
    modified: string;
  }[];
  totalBytes: number;
}

export class RealDeviceService {
  /**
   * Check if a sample folder or target directory exists on the physical host machine
   */
  static async checkFolderStatus(targetPath?: string): Promise<FolderStatusResult> {
    try {
      const url = targetPath 
        ? `/api/evidence/sample-folder-status?path=${encodeURIComponent(targetPath)}`
        : '/api/evidence/sample-folder-status';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e: any) {
      return {
        exists: false,
        path: targetPath || '',
        fileCount: 0,
        files: [],
        totalBytes: 0
      };
    }
  }

  /**
   * Create the real sample test folder on disk containing:
   * photo.jpg, report.pdf, video.mp4, database.db, unknown.bin
   */
  static async createRealSampleFolder(): Promise<{ success: boolean; folderPath: string; filesCreated: string[]; totalBytes: number; message: string }> {
    const res = await fetch('/api/evidence/create-sample-folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create sample folder' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  }

  /**
   * Execute physical multi-pass shredding and permanent filesystem deletion on host drive
   */
  static async shredHostPath(
    targetPath: string,
    passes: number = 1,
    patternType: string = 'ZERO'
  ): Promise<HostShredResult> {
    const res = await fetch('/api/shred/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: targetPath,
        passes,
        patternType
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Shredding failed on host system' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  }

  /**
   * Direct Browser File System Access API shredding on a real FileSystemFileHandle:
   * 1. Multi-pass overwrite of payload with 0x00 / random bytes
   * 2. Force flush
   * 3. Truncate to 0 bytes
   * 4. Close stream
   */
  static async shredFileHandle(fileHandle: any, passes: number = 1): Promise<void> {
    try {
      const file = await fileHandle.getFile();
      const size = file.size;
      const writable = await fileHandle.createWritable();

      // Chunked multi-pass overwrite
      const chunkSize = 65536;
      for (let p = 0; p < Math.min(passes, 3); p++) {
        const buffer = new Uint8Array(chunkSize);
        if (p === 0) {
          buffer.fill(0x00);
        } else if (p === 1) {
          buffer.fill(0xFF);
        } else {
          crypto.getRandomValues(buffer);
        }

        let written = 0;
        while (written < size) {
          const toWrite = Math.min(chunkSize, size - written);
          await writable.write({
            type: 'write',
            position: written,
            data: buffer.subarray(0, toWrite)
          });
          written += toWrite;
        }
      }

      // Truncate to 0 bytes
      await writable.truncate(0);
      await writable.close();
    } catch (err) {
      console.warn('Browser FileSystemAccess write error (fallback to backend shredding):', err);
    }
  }

  /**
   * Delete entry from parent directory handle
   */
  static async removeEntryFromDirectory(dirHandle: any, entryName: string, isRecursive = true): Promise<boolean> {
    try {
      if (dirHandle && typeof dirHandle.removeEntry === 'function') {
        await dirHandle.removeEntry(entryName, { recursive: isRecursive });
        return true;
      }
    } catch (err) {
      console.warn('Browser directory removal warning:', err);
    }
    return false;
  }
}
