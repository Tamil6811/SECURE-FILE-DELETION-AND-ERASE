import { CarvedFile, FileCategory, CarvingScanMetrics } from '../types/carver';
import { calculateSha256, calculateMd5 } from './hashService';
import { calculateShannonEntropy } from './entropyCalculator';

interface MagicSignature {
  id: string;
  name: string;
  extension: string;
  mimeType: string;
  category: FileCategory;
  headerBytes: number[];
  headerOffset?: number;
  footerBytes?: number[];
  maxScanSize?: number;
  minSize?: number;
  customParser?: (data: Uint8Array, offset: number) => { length: number; confidence: number; metadata?: any } | null;
}

export const SIGNATURE_DATABASE: MagicSignature[] = [
  {
    id: 'jpeg',
    name: 'JPEG Image',
    extension: 'jpg',
    mimeType: 'image/jpeg',
    category: 'IMAGE',
    headerBytes: [0xFF, 0xD8, 0xFF],
    footerBytes: [0xFF, 0xD9],
    maxScanSize: 25 * 1024 * 1024,
    minSize: 128,
    customParser: parseJpegStructure
  },
  {
    id: 'png',
    name: 'PNG Image',
    extension: 'png',
    mimeType: 'image/png',
    category: 'IMAGE',
    headerBytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    footerBytes: [0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82],
    maxScanSize: 30 * 1024 * 1024,
    minSize: 64,
    customParser: parsePngStructure
  },
  {
    id: 'gif89a',
    name: 'GIF Animation',
    extension: 'gif',
    mimeType: 'image/gif',
    category: 'IMAGE',
    headerBytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
    footerBytes: [0x00, 0x3B],
    maxScanSize: 20 * 1024 * 1024,
    minSize: 64
  },
  {
    id: 'gif87a',
    name: 'GIF Image',
    extension: 'gif',
    mimeType: 'image/gif',
    category: 'IMAGE',
    headerBytes: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
    footerBytes: [0x00, 0x3B],
    maxScanSize: 20 * 1024 * 1024,
    minSize: 64
  },
  {
    id: 'pdf',
    name: 'PDF Document',
    extension: 'pdf',
    mimeType: 'application/pdf',
    category: 'DOCUMENT',
    headerBytes: [0x25, 0x50, 0x44, 0x46], // %PDF
    footerBytes: [0x25, 0x25, 0x45, 0x4F, 0x46], // %%EOF
    maxScanSize: 50 * 1024 * 1024,
    minSize: 256,
    customParser: parsePdfStructure
  },
  {
    id: 'zip',
    name: 'ZIP / MS Office Archive',
    extension: 'zip',
    mimeType: 'application/zip',
    category: 'ARCHIVE',
    headerBytes: [0x50, 0x4B, 0x03, 0x04],
    footerBytes: [0x50, 0x4B, 0x05, 0x06], // Central Directory End
    maxScanSize: 100 * 1024 * 1024,
    minSize: 128,
    customParser: parseZipStructure
  },
  {
    id: 'sqlite',
    name: 'SQLite Database',
    extension: 'sqlite',
    mimeType: 'application/x-sqlite3',
    category: 'DATABASE',
    headerBytes: [0x53, 0x51, 0x4C, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6F, 0x72, 0x6D, 0x61, 0x74, 0x20, 0x33, 0x00],
    maxScanSize: 50 * 1024 * 1024,
    minSize: 512,
    customParser: parseSqliteStructure
  },
  {
    id: 'mp3_id3',
    name: 'MP3 Audio (ID3v2)',
    extension: 'mp3',
    mimeType: 'audio/mpeg',
    category: 'AUDIO_VIDEO',
    headerBytes: [0x49, 0x44, 0x33], // ID3
    maxScanSize: 30 * 1024 * 1024,
    minSize: 512
  },
  {
    id: 'mp4_ftyp',
    name: 'MP4 Video Container',
    extension: 'mp4',
    mimeType: 'video/mp4',
    category: 'AUDIO_VIDEO',
    headerBytes: [0x66, 0x74, 0x79, 0x70], // ftyp
    headerOffset: 4,
    maxScanSize: 150 * 1024 * 1024,
    minSize: 512,
    customParser: parseMp4Structure
  },
  {
    id: 'pcap',
    name: 'PCAP Network Capture',
    extension: 'pcap',
    mimeType: 'application/vnd.tcpdump.pcap',
    category: 'DOCUMENT',
    headerBytes: [0xD4, 0xC3, 0xB2, 0xA1],
    maxScanSize: 50 * 1024 * 1024,
    minSize: 24
  },
  {
    id: 'elf',
    name: 'ELF Binary Executable',
    extension: 'elf',
    mimeType: 'application/x-executable',
    category: 'EXECUTABLE',
    headerBytes: [0x7F, 0x45, 0x4C, 0x46],
    maxScanSize: 40 * 1024 * 1024,
    minSize: 128
  },
  {
    id: 'win_exe',
    name: 'Windows PE Executable / DLL',
    extension: 'exe',
    mimeType: 'application/x-msdownload',
    category: 'EXECUTABLE',
    headerBytes: [0x4D, 0x5A], // MZ
    maxScanSize: 50 * 1024 * 1024,
    minSize: 256
  }
];

export async function carveStorageImage(
  data: Uint8Array,
  onProgress?: (progressPct: number, currentOffset: number, filesFound: number) => void
): Promise<{ files: CarvedFile[]; metrics: CarvingScanMetrics }> {
  const startTime = performance.now();
  const files: CarvedFile[] = [];
  const totalLength = data.length;
  
  let offset = 0;
  let lastProgressUpdate = 0;
  let evidenceCounter = 1;

  while (offset < totalLength - 16) {
    // Notify progress every 64KB or at start/end
    if (offset - lastProgressUpdate > 65536 || offset === 0) {
      lastProgressUpdate = offset;
      if (onProgress) {
        onProgress(
          Math.min(100, Math.floor((offset / totalLength) * 100)),
          offset,
          files.length
        );
      }
    }

    let matchFound = false;

    for (const sig of SIGNATURE_DATABASE) {
      const checkOffset = offset + (sig.headerOffset || 0);
      if (checkOffset + sig.headerBytes.length > totalLength) continue;

      // Check header match
      let isHeaderMatch = true;
      for (let i = 0; i < sig.headerBytes.length; i++) {
        if (data[checkOffset + i] !== sig.headerBytes[i]) {
          isHeaderMatch = false;
          break;
        }
      }

      if (isHeaderMatch) {
        // Try custom structure parser first if available
        let carvedLength = 0;
        let confidence = 85;
        let integrity: CarvedFile['integrityStatus'] = 'VALID_STRUCTURE';
        let metadata: Record<string, any> = {};
        let isFragmented = false;
        let technique: CarvedFile['carvingTechnique'] = 'MAGIC_SIGNATURE';

        if (sig.customParser) {
          const parseResult = sig.customParser(data, offset);
          if (parseResult) {
            carvedLength = parseResult.length;
            confidence = parseResult.confidence;
            metadata = parseResult.metadata || {};
            technique = 'STRUCTURE_PARSING';
            integrity = confidence >= 85 ? 'VALID_STRUCTURE' : 'PARTIAL_FOOTER_MISSING';
          }
        }

        // If no custom parser or it returned 0, search for footer
        if (carvedLength === 0 && sig.footerBytes) {
          const maxSearch = Math.min(totalLength, offset + (sig.maxScanSize || 10 * 1024 * 1024));
          const footerLen = sig.footerBytes.length;
          
          for (let f = offset + sig.headerBytes.length; f <= maxSearch - footerLen; f++) {
            let footerMatched = true;
            for (let k = 0; k < footerLen; k++) {
              if (data[f + k] !== sig.footerBytes[k]) {
                footerMatched = false;
                break;
              }
            }

            if (footerMatched) {
              carvedLength = (f + footerLen) - offset;
              // For PDF, search backwards or continue to find last %%EOF if nearby
              if (sig.id === 'pdf') {
                const nextEof = findNextPdfEof(data, f + footerLen, maxSearch);
                if (nextEof > 0) {
                  carvedLength = nextEof - offset;
                }
              }
              confidence = 95;
              integrity = 'VALID_STRUCTURE';
              technique = 'MAGIC_SIGNATURE';
              break;
            }
          }
        }

        // Check for Fragmented Gap Bifragment Carving Heuristic
        if (carvedLength === 0 && sig.id === 'jpeg') {
          const fragResult = attemptBifragmentCarving(data, offset, totalLength);
          if (fragResult) {
            carvedLength = fragResult.length;
            confidence = fragResult.confidence;
            integrity = 'FRAGMENTED_RECOVERED';
            isFragmented = true;
            technique = 'BIFRAGMENT_GAP_ANALYSIS';
          }
        }

        // Fallback length if footer was missing but header was genuine
        if (carvedLength === 0) {
          carvedLength = Math.min(totalLength - offset, Math.min(sig.maxScanSize || 204800, 131072));
          confidence = 48;
          integrity = 'PARTIAL_FOOTER_MISSING';
        }

        const rawSlice = data.slice(offset, offset + carvedLength);
        const entropy = calculateShannonEntropy(rawSlice);
        const sha256 = await calculateSha256(rawSlice);
        const md5 = await calculateMd5(rawSlice);

        // Build preview URL for supported types
        let previewUrl: string | undefined;
        let previewText: string | undefined;

        if (sig.category === 'IMAGE') {
          try {
            const blob = new Blob([rawSlice as unknown as BlobPart], { type: sig.mimeType });
            previewUrl = URL.createObjectURL(blob);
          } catch (e) {
            // Blob URL creation skipped if memory restricted
          }
        } else if (sig.id === 'pdf') {
          try {
            const blob = new Blob([rawSlice as unknown as BlobPart], { type: 'application/pdf' });
            previewUrl = URL.createObjectURL(blob);
          } catch (e) {
            // Blob skipped
          }
        } else if (sig.id === 'pcap' || sig.id === 'sqlite' || sig.category === 'DOCUMENT') {
          // Extract readable ASCII strings for preview
          previewText = extractAsciiSnippet(rawSlice, 300);
        }

        const evidenceId = `EVD-${String(evidenceCounter++).padStart(4, '0')}`;
        const autoName = `${sig.id.toUpperCase()}_0x${offset.toString(16).toUpperCase()}.${sig.extension}`;

        files.push({
          id: `carved-${offset}-${Date.now()}`,
          evidenceId,
          name: autoName,
          extension: sig.extension,
          mimeType: sig.mimeType,
          category: sig.category,
          offsetStart: offset,
          offsetEnd: offset + carvedLength,
          sizeBytes: carvedLength,
          confidenceScore: confidence,
          integrityStatus: integrity,
          isFragmented,
          shannonEntropy: entropy,
          md5Hash: md5,
          sha256Hash: sha256,
          metadataExtracted: metadata,
          rawData: rawSlice,
          previewUrl,
          previewText,
          carvingTechnique: technique
        });

        // Advance past the carved file (aligned to 512 sector boundary if appropriate)
        offset += Math.max(512, Math.floor(carvedLength / 512) * 512);
        matchFound = true;
        break;
      }
    }

    if (!matchFound) {
      offset += 1;
    }
  }

  if (onProgress) {
    onProgress(100, totalLength, files.length);
  }

  const duration = Math.round(performance.now() - startTime);

  const categoryBreakdown: Record<FileCategory, number> = {
    IMAGE: 0,
    DOCUMENT: 0,
    ARCHIVE: 0,
    AUDIO_VIDEO: 0,
    VIDEO: 0,
    DATABASE: 0,
    EXECUTABLE: 0,
    TEXT_CODE: 0,
    BINARY: 0,
    UNKNOWN: 0
  };

  let totalConfidence = 0;
  let validIntegrity = 0;
  let fragmentedCount = 0;

  for (const f of files) {
    categoryBreakdown[f.category] = (categoryBreakdown[f.category] || 0) + 1;
    totalConfidence += f.confidenceScore;
    if (f.integrityStatus === 'VALID_STRUCTURE') validIntegrity++;
    if (f.isFragmented) fragmentedCount++;
  }

  const metrics: CarvingScanMetrics = {
    totalBytesScanned: totalLength,
    totalSignaturesMatched: files.length,
    totalFilesRecovered: files.length,
    validIntegrityFiles: validIntegrity,
    fragmentedReconstructed: fragmentedCount,
    carveDurationMs: duration,
    averageConfidence: files.length > 0 ? Math.round(totalConfidence / files.length) : 0,
    categoryBreakdown
  };

  return { files, metrics };
}

// ---------------- Special Structure Parsers ----------------

function parsePngStructure(data: Uint8Array, offset: number): { length: number; confidence: number; metadata?: any } | null {
  const total = data.length;
  let ptr = offset + 8; // skip 8-byte PNG signature
  let width = 0;
  let height = 0;
  let foundIHDR = false;
  let foundIEND = false;

  while (ptr < total - 8) {
    const chunkLen = (data[ptr] << 24) | (data[ptr + 1] << 16) | (data[ptr + 2] << 8) | data[ptr + 3];
    const chunkType = String.fromCharCode(data[ptr + 4], data[ptr + 5], data[ptr + 6], data[ptr + 7]);

    if (chunkType === 'IHDR' && ptr + 8 + 8 <= total) {
      foundIHDR = true;
      width = (data[ptr + 8] << 24) | (data[ptr + 9] << 16) | (data[ptr + 10] << 8) | data[ptr + 11];
      height = (data[ptr + 12] << 24) | (data[ptr + 13] << 16) | (data[ptr + 14] << 8) | data[ptr + 15];
    }

    if (chunkType === 'IEND') {
      foundIEND = true;
      const totalLen = (ptr + 12) - offset; // 4 len + 4 type + 4 CRC
      return {
        length: totalLen,
        confidence: 98,
        metadata: {
          dimensions: `${width} x ${height} px`,
          format: 'PNG Standard Raster'
        }
      };
    }

    if (chunkLen < 0 || chunkLen > 50 * 1024 * 1024) {
      break; // Corrupted chunk length
    }

    ptr += 12 + chunkLen; // 4 len + 4 type + data + 4 CRC
  }

  if (foundIHDR) {
    return {
      length: Math.min(total - offset, 2 * 1024 * 1024),
      confidence: 72,
      metadata: { dimensions: `${width} x ${height} px (Incomplete stream)` }
    };
  }

  return null;
}

function parseJpegStructure(data: Uint8Array, offset: number): { length: number; confidence: number; metadata?: any } | null {
  const total = data.length;
  let ptr = offset + 2; // skip FF D8
  let width = 0;
  let height = 0;
  let camera = '';

  while (ptr < total - 4) {
    if (data[ptr] !== 0xFF) {
      ptr++;
      continue;
    }

    const marker = data[ptr + 1];

    if (marker === 0xD9) {
      // EOI (End of Image)
      const len = (ptr + 2) - offset;
      return {
        length: len,
        confidence: 96,
        metadata: {
          dimensions: width > 0 ? `${width} x ${height} px` : 'Standard JPEG',
          cameraMakeModel: camera || 'Embedded Camera Sensor'
        }
      };
    }

    // SOF0 / SOF2 (Start of Frame) - contains image dimensions
    if (marker === 0xC0 || marker === 0xC2) {
      if (ptr + 9 < total) {
        height = (data[ptr + 5] << 8) | data[ptr + 6];
        width = (data[ptr + 7] << 8) | data[ptr + 8];
      }
    }

    // APP1 (EXIF metadata)
    if (marker === 0xE1 && ptr + 14 < total) {
      const exifTag = String.fromCharCode(data[ptr + 4], data[ptr + 5], data[ptr + 6], data[ptr + 7]);
      if (exifTag === 'Exif') {
        camera = 'Forensic EXIF Metadata Present';
      }
    }

    // Advance
    if (marker === 0xDA) {
      // SOS (Start of Scan) - entropy-coded data follows until next non-stuffed marker
      ptr += 2;
      while (ptr < total - 2) {
        if (data[ptr] === 0xFF && data[ptr + 1] !== 0x00 && (data[ptr + 1] < 0xD0 || data[ptr + 1] > 0xD7)) {
          if (data[ptr + 1] === 0xD9) {
            return {
              length: (ptr + 2) - offset,
              confidence: 96,
              metadata: {
                dimensions: width > 0 ? `${width} x ${height} px` : undefined,
                cameraMakeModel: camera
              }
            };
          }
          break;
        }
        ptr++;
      }
    } else {
      if (ptr + 3 < total) {
        const segLen = (data[ptr + 2] << 8) | data[ptr + 3];
        if (segLen <= 0 || segLen > 65536) break;
        ptr += 2 + segLen;
      } else {
        break;
      }
    }
  }

  return null;
}

function parsePdfStructure(data: Uint8Array, offset: number): { length: number; confidence: number; metadata?: any } | null {
  const total = data.length;
  // Search for %%EOF starting from offset + 32
  let lastEof = -1;
  const maxSearch = Math.min(total, offset + 25 * 1024 * 1024);
  
  for (let i = offset + 10; i < maxSearch - 5; i++) {
    if (data[i] === 0x25 && data[i+1] === 0x25 && data[i+2] === 0x45 && data[i+3] === 0x4F && data[i+4] === 0x46) {
      lastEof = i + 5;
    }
  }

  if (lastEof > offset) {
    // Check for trailing newline/CR
    while (lastEof < total && (data[lastEof] === 0x0A || data[lastEof] === 0x0D)) {
      lastEof++;
    }
    return {
      length: lastEof - offset,
      confidence: 94,
      metadata: {
        format: 'Adobe PDF Standard ISO 32000',
        authorOrTitle: 'Forensic Document Stream'
      }
    };
  }

  return null;
}

function parseZipStructure(data: Uint8Array, offset: number): { length: number; confidence: number; metadata?: any } | null {
  const total = data.length;
  const maxSearch = Math.min(total, offset + 30 * 1024 * 1024);
  
  // Look for End of Central Directory signature (50 4B 05 06)
  for (let i = offset + 16; i < maxSearch - 22; i++) {
    if (data[i] === 0x50 && data[i+1] === 0x4B && data[i+2] === 0x05 && data[i+3] === 0x06) {
      const commentLen = (data[i + 20]) | (data[i + 21] << 8);
      const zipEnd = i + 22 + commentLen;
      return {
        length: Math.min(total, zipEnd) - offset,
        confidence: 97,
        metadata: {
          format: 'ZIP Compressed Container / OOXML Doc',
          embeddedFiles: 1
        }
      };
    }
  }

  return null;
}

function parseSqliteStructure(data: Uint8Array, offset: number): { length: number; confidence: number; metadata?: any } | null {
  if (offset + 100 > data.length) return null;
  const pageSize = (data[offset + 16] << 8) | data[offset + 17];
  const actualPageSize = pageSize === 1 ? 65536 : (pageSize || 4096);
  const pageCount = (data[offset + 28] << 24) | (data[offset + 29] << 16) | (data[offset + 30] << 8) | data[offset + 31];
  
  if (pageCount > 0 && pageCount < 100000) {
    const totalSize = Math.min(data.length - offset, pageCount * actualPageSize);
    return {
      length: totalSize,
      confidence: 99,
      metadata: {
        pageSize: `${actualPageSize} bytes`,
        pageCount: `${pageCount} pages`,
        format: 'SQLite 3.x Database'
      }
    };
  }
  
  return {
    length: Math.min(data.length - offset, 65536),
    confidence: 80,
    metadata: { format: 'SQLite 3.x Database' }
  };
}

function parseMp4Structure(data: Uint8Array, offset: number): { length: number; confidence: number; metadata?: any } | null {
  if (offset + 8 > data.length) return null;
  // MP4 box header: [4 bytes length][4 bytes type]
  let ptr = offset;
  const total = data.length;
  let totalLength = 0;

  while (ptr < total - 8) {
    const boxSize = (data[ptr] << 24) | (data[ptr + 1] << 16) | (data[ptr + 2] << 8) | data[ptr + 3];
    if (boxSize <= 0 || boxSize > 500 * 1024 * 1024) break;
    
    totalLength += boxSize;
    ptr += boxSize;
    
    if (totalLength > 100 * 1024 * 1024) break;
  }

  if (totalLength > 1024) {
    return {
      length: Math.min(total - offset, totalLength),
      confidence: 88,
      metadata: { container: 'ISO Base Media File / MP4' }
    };
  }

  return null;
}

function findNextPdfEof(data: Uint8Array, start: number, max: number): number {
  for (let i = start; i < max - 5; i++) {
    if (data[i] === 0x25 && data[i+1] === 0x25 && data[i+2] === 0x45 && data[i+3] === 0x4F && data[i+4] === 0x46) {
      return i + 5;
    }
  }
  return -1;
}

function attemptBifragmentCarving(data: Uint8Array, headerOffset: number, totalLen: number): { length: number; confidence: number } | null {
  // Look for fragmented gap: JPEG header present, but interrupted by zero-padding or corrupted sector, then resumed
  const searchLimit = Math.min(totalLen, headerOffset + 500000);
  for (let gap = headerOffset + 2048; gap < searchLimit - 512; gap += 512) {
    // Check if cluster was skipped or zeroed
    if (data[gap] === 0xFF && data[gap + 1] === 0xD9) {
      return {
        length: (gap + 2) - headerOffset,
        confidence: 68
      };
    }
  }
  return null;
}

function extractAsciiSnippet(data: Uint8Array, maxChars: number): string {
  let result = '';
  for (let i = 0; i < Math.min(data.length, maxChars * 2); i++) {
    const b = data[i];
    if (b >= 32 && b <= 126) {
      result += String.fromCharCode(b);
    } else if (b === 10 || b === 13) {
      result += ' ';
    }
    if (result.length >= maxChars) break;
  }
  return result.trim();
}
