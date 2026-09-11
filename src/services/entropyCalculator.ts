// Shannon Entropy and Data Distribution Analyzer

export function calculateShannonEntropy(data: Uint8Array): number {
  if (!data || data.length === 0) return 0;
  
  const freq = new Array(256).fill(0);
  for (let i = 0; i < data.length; i++) {
    freq[data[i]]++;
  }
  
  let entropy = 0;
  const len = data.length;
  
  for (let i = 0; i < 256; i++) {
    if (freq[i] > 0) {
      const p = freq[i] / len;
      entropy -= p * (Math.log(p) / Math.log(2));
    }
  }
  
  return Number(entropy.toFixed(4));
}

export interface EntropyBlock {
  blockIndex: number;
  offsetStart: number;
  offsetEnd: number;
  entropy: number;
  entropyCategory: 'ZERO_WIPED' | 'LOW_STRUCTURED' | 'MEDIUM_CODE' | 'HIGH_COMPRESSED' | 'RANDOM_ENCRYPTED';
  colorHex: string;
  previewBytesHex: string;
}

export function computeEntropyMap(data: Uint8Array, blockCount: number = 64): EntropyBlock[] {
  if (!data || data.length === 0) return [];
  
  const totalBytes = data.length;
  const actualBlocks = Math.min(blockCount, Math.max(1, Math.floor(totalBytes / 64)));
  const blockSize = Math.max(1, Math.floor(totalBytes / actualBlocks));
  
  const result: EntropyBlock[] = [];
  
  for (let b = 0; b < actualBlocks; b++) {
    const start = b * blockSize;
    const end = (b === actualBlocks - 1) ? totalBytes : Math.min(totalBytes, (b + 1) * blockSize);
    const slice = data.subarray(start, end);
    const entropy = calculateShannonEntropy(slice);
    
    let category: EntropyBlock['entropyCategory'] = 'LOW_STRUCTURED';
    let color = '#38bdf8'; // Sky blue
    
    if (entropy < 0.05) {
      category = 'ZERO_WIPED';
      color = '#10b981'; // Emerald (Safe/Zeroed)
    } else if (entropy < 3.5) {
      category = 'LOW_STRUCTURED';
      color = '#06b6d4'; // Cyan
    } else if (entropy < 6.5) {
      category = 'MEDIUM_CODE';
      color = '#f59e0b'; // Amber
    } else if (entropy < 7.85) {
      category = 'HIGH_COMPRESSED';
      color = '#a855f7'; // Purple
    } else {
      category = 'RANDOM_ENCRYPTED';
      color = '#f43f5e'; // Rose
    }
    
    // Preview first 8 bytes in hex
    const previewLen = Math.min(8, slice.length);
    const previewHex = Array.from(slice.subarray(0, previewLen))
      .map(x => x.toString(16).padStart(2, '0').toUpperCase())
      .join(' ');
      
    result.push({
      blockIndex: b,
      offsetStart: start,
      offsetEnd: end,
      entropy,
      entropyCategory: category,
      colorHex: color,
      previewBytesHex: previewHex
    });
  }
  
  return result;
}

export function analyzeByteHistogram(data: Uint8Array): { byte: number; count: number; percentage: number }[] {
  const counts = new Array(256).fill(0);
  for (let i = 0; i < data.length; i++) {
    counts[data[i]]++;
  }
  
  const total = Math.max(1, data.length);
  return counts.map((count, byte) => ({
    byte,
    count,
    percentage: Number(((count / total) * 100).toFixed(2))
  }));
}
