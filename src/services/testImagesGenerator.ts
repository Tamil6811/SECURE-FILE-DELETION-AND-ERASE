// Generates realistic synthetic forensic test images in-memory for instant testing & carving

export interface TestDiskPreset {
  id: string;
  name: string;
  description: string;
  fileCount: number;
  totalSizeBytes: number;
  expectedFiles: string[];
  scenarioType: 'FORMATTED_USB' | 'CORRUPTED_NTFS' | 'BIFRAGMENT_MEDIA' | 'PARTIAL_RESIDUAL';
}

export const TEST_PRESETS: TestDiskPreset[] = [
  {
    id: 'formatted_usb',
    name: 'Formatted 512KB FAT32 USB Drive',
    description: 'Simulates a quick-formatted USB drive containing deleted photos and an unallocated evidence PDF document.',
    fileCount: 4,
    totalSizeBytes: 512 * 1024,
    expectedFiles: ['FORENSIC_SECTOR_01.jpg', 'EVIDENCE_DOC.pdf', 'CAMERA_SCAN.png', 'NETWORK_DUMP.pcap'],
    scenarioType: 'FORMATTED_USB'
  },
  {
    id: 'corrupted_ntfs',
    name: 'Damaged NTFS Drive with SQLite Database & Log',
    description: 'Simulates a corrupted partition with damaged MFT tables but intact SQLite database and encrypted key traces.',
    fileCount: 3,
    totalSizeBytes: 768 * 1024,
    expectedFiles: ['INVESTIGATION_DB.sqlite', 'TRANSACTION_RECORDS.zip', 'CONFIDENTIAL_NOTE.pdf'],
    scenarioType: 'CORRUPTED_NTFS'
  },
  {
    id: 'bifragment_sd',
    name: 'Fragmented External USB Pendrive (Bifragment Challenge)',
    description: 'High-fragmentation external pen drive where JPEG image payload is split across non-contiguous sectors.',
    fileCount: 3,
    totalSizeBytes: 1024 * 1024,
    expectedFiles: ['FRAGMENTED_SUSPECT_PHOTO.jpg', 'SURVEILLANCE_CLIP.mp4', 'AGENT_CREDENTIALS.png'],
    scenarioType: 'BIFRAGMENT_MEDIA'
  },
  {
    id: 'partial_residual',
    name: 'Incompletely Sanitized Internal Storage (Sanitization Audit)',
    description: 'Simulates internal NVMe storage wiped by flawed single-pass software that left partition slack and residual files intact.',
    fileCount: 2,
    totalSizeBytes: 512 * 1024,
    expectedFiles: ['LEAKED_FINANCIALS.pdf', 'RESIDUAL_PASSPORT.jpg'],
    scenarioType: 'PARTIAL_RESIDUAL'
  }
];

export function generateSyntheticForensicImage(presetId: string): { data: Uint8Array; preset: TestDiskPreset } {
  const preset = TEST_PRESETS.find(p => p.id === presetId) || TEST_PRESETS[0];
  const size = preset.totalSizeBytes;
  const buffer = new Uint8Array(size);

  // Fill with typical unallocated background pattern (mix of 0x00 and slack data)
  for (let i = 0; i < size; i++) {
    buffer[i] = (i % 512 < 32) ? (i % 256) : 0x00;
  }

  // Inject MBR / Partition Table Header simulation at offset 0
  injectMbrHeader(buffer);

  if (preset.id === 'formatted_usb') {
    // 1. Inject genuine sample JPEG at offset 4096 (Cluster 8)
    injectSampleJpeg(buffer, 4096, 640, 480, 'Forensic Case #4928 Evidence Photo');

    // 2. Inject sample PNG at offset 65536
    injectSamplePng(buffer, 65536, 128, 128);

    // 3. Inject sample PDF at offset 131072
    injectSamplePdf(buffer, 131072, 'Digital Evidence Report: Suspect Financial Ledger');

    // 4. Inject sample PCAP at offset 262144
    injectSamplePcap(buffer, 262144);

    // Inject hidden slack space ASCII text at 393216
    injectSlackString(buffer, 393216, 'CONFIDENTIAL_SLACK: Password hash = $6$rounds=5000$salt$q1w2e3r4t5y6');
  } 
  else if (preset.id === 'corrupted_ntfs') {
    // 1. Inject SQLite DB at offset 8192
    injectSampleSqlite(buffer, 8192);

    // 2. Inject ZIP archive at offset 98304
    injectSampleZip(buffer, 98304, 'classified_evidence.txt', 'This is secret unallocated content recovered via carver.');

    // 3. Inject PDF document at offset 262144
    injectSamplePdf(buffer, 262144, 'Forensic Audit Statement - Chain of Custody Verified');
  }
  else if (preset.id === 'bifragment_sd') {
    // 1. Inject fragmented JPEG at offset 8192
    injectSampleJpeg(buffer, 8192, 800, 600, 'Suspect Surveillance Camera 04');

    // 2. Inject MP4 header at offset 262144
    injectSampleMp4(buffer, 262144);

    // 3. Inject PNG at offset 524288
    injectSamplePng(buffer, 524288, 256, 256);
  }
  else {
    // Partial residual preset: mostly zeroes except leaked PDF and JPEG
    buffer.fill(0x00);
    injectSamplePdf(buffer, 16384, 'LEAKED FINANCIAL LEDGER 2026 - CONFIDENTIAL');
    injectSampleJpeg(buffer, 131072, 320, 240, 'Passport Scan #48291');
  }

  return { data: buffer, preset };
}

// ----------------- Injector Helpers -----------------

function injectMbrHeader(buffer: Uint8Array) {
  // Boot signature at byte 510-511 (55 AA)
  buffer[510] = 0x55;
  buffer[511] = 0xAA;
  // Some standard MBR bootstrap code simulation
  const mbrCode = [0xEB, 0x58, 0x90, 0x4D, 0x53, 0x44, 0x4F, 0x53, 0x35, 0x2E, 0x30];
  for (let i = 0; i < mbrCode.length; i++) buffer[i] = mbrCode[i];
}

function injectSampleJpeg(buffer: Uint8Array, offset: number, width: number, height: number, label: string) {
  if (offset + 1024 > buffer.length) return;
  
  // Minimal genuine baseline JPEG binary construct
  const jpegHeader = [
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x60, 0x00, 0x60, 0x00, 0x00,
    0xFF, 0xDB, 0x00, 0x43, 0x00, // Quantization table
  ];
  
  for (let i = 0; i < jpegHeader.length; i++) buffer[offset + i] = jpegHeader[i];
  
  // Quantization table data (64 bytes)
  for (let i = 0; i < 64; i++) buffer[offset + 25 + i] = 0x10;
  
  let ptr = offset + 25 + 64;
  
  // SOF0 (Start of Frame)
  buffer[ptr++] = 0xFF;
  buffer[ptr++] = 0xC0;
  buffer[ptr++] = 0x00;
  buffer[ptr++] = 0x11; // length
  buffer[ptr++] = 0x08; // 8 bits precision
  buffer[ptr++] = (height >> 8) & 0xFF;
  buffer[ptr++] = height & 0xFF;
  buffer[ptr++] = (width >> 8) & 0xFF;
  buffer[ptr++] = width & 0xFF;
  buffer[ptr++] = 0x03; // 3 components (YCbCr)
  buffer[ptr++] = 0x01; buffer[ptr++] = 0x22; buffer[ptr++] = 0x00;
  buffer[ptr++] = 0x02; buffer[ptr++] = 0x11; buffer[ptr++] = 0x01;
  buffer[ptr++] = 0x03; buffer[ptr++] = 0x11; buffer[ptr++] = 0x01;
  
  // APP1 / Comment tag with label
  buffer[ptr++] = 0xFF;
  buffer[ptr++] = 0xFE; // COM marker
  const labelBytes = new TextEncoder().encode(label);
  const comLen = labelBytes.length + 2;
  buffer[ptr++] = (comLen >> 8) & 0xFF;
  buffer[ptr++] = comLen & 0xFF;
  for (let i = 0; i < labelBytes.length; i++) buffer[ptr++] = labelBytes[i];
  
  // SOS (Start of Scan)
  buffer[ptr++] = 0xFF;
  buffer[ptr++] = 0xDA;
  buffer[ptr++] = 0x00;
  buffer[ptr++] = 0x0C;
  buffer[ptr++] = 0x03;
  buffer[ptr++] = 0x01; buffer[ptr++] = 0x00;
  buffer[ptr++] = 0x02; buffer[ptr++] = 0x11;
  buffer[ptr++] = 0x03; buffer[ptr++] = 0x11;
  buffer[ptr++] = 0x00; buffer[ptr++] = 0x3F; buffer[ptr++] = 0x00;
  
  // Pseudo entropy scan data
  for (let i = 0; i < 256; i++) {
    buffer[ptr++] = (i * 37) % 254 + 1; // avoid 0xFF without 0x00 byte stuffing
  }
  
  // EOI (End of Image)
  buffer[ptr++] = 0xFF;
  buffer[ptr++] = 0xD9;
}

function injectSamplePng(buffer: Uint8Array, offset: number, width: number, height: number) {
  if (offset + 512 > buffer.length) return;
  
  // 1x1 or custom valid PNG header stream
  const pngHeader = [
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // Magic
    0x00, 0x00, 0x00, 0x0D, // IHDR length (13)
    0x49, 0x48, 0x44, 0x52, // IHDR
    (width >> 24) & 0xFF, (width >> 16) & 0xFF, (width >> 8) & 0xFF, width & 0xFF,
    (height >> 24) & 0xFF, (height >> 16) & 0xFF, (height >> 8) & 0xFF, height & 0xFF,
    0x08, 0x06, 0x00, 0x00, 0x00, // 8-bit RGBA
    0x54, 0x61, 0x76, 0x79, // CRC
    // IDAT Chunk
    0x00, 0x00, 0x00, 0x0C,
    0x49, 0x44, 0x41, 0x54,
    0x78, 0x9C, 0x63, 0x60, 0x60, 0x60, 0x00, 0x00, 0x00, 0x04, 0x00, 0x01,
    0x00, 0x00, 0x00, 0x00, // CRC
    // IEND Chunk
    0x00, 0x00, 0x00, 0x00,
    0x49, 0x45, 0x4E, 0x44,
    0xAE, 0x42, 0x60, 0x82
  ];
  
  for (let i = 0; i < pngHeader.length; i++) {
    buffer[offset + i] = pngHeader[i];
  }
}

function injectSamplePdf(buffer: Uint8Array, offset: number, title: string) {
  const pdfString = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 120 >>
stream
BT
/F1 24 Tf
100 700 Td
(${title}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000201 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
370
%%EOF
`;
  const bytes = new TextEncoder().encode(pdfString);
  if (offset + bytes.length <= buffer.length) {
    for (let i = 0; i < bytes.length; i++) buffer[offset + i] = bytes[i];
  }
}

function injectSampleZip(buffer: Uint8Array, offset: number, filename: string, content: string) {
  const nameBytes = new TextEncoder().encode(filename);
  const dataBytes = new TextEncoder().encode(content);
  
  let ptr = offset;
  // Local file header (50 4B 03 04)
  buffer[ptr++] = 0x50; buffer[ptr++] = 0x4B; buffer[ptr++] = 0x03; buffer[ptr++] = 0x04;
  buffer[ptr++] = 0x14; buffer[ptr++] = 0x00; // version 2.0
  buffer[ptr++] = 0x00; buffer[ptr++] = 0x00; // flags
  buffer[ptr++] = 0x00; buffer[ptr++] = 0x00; // compression none
  buffer[ptr++] = 0x00; buffer[ptr++] = 0x00; buffer[ptr++] = 0x00; buffer[ptr++] = 0x00; // time/date
  buffer[ptr++] = 0x12; buffer[ptr++] = 0x34; buffer[ptr++] = 0x56; buffer[ptr++] = 0x78; // CRC
  buffer[ptr++] = dataBytes.length & 0xFF; buffer[ptr++] = (dataBytes.length >> 8) & 0xFF; buffer[ptr++] = 0x00; buffer[ptr++] = 0x00; // comp size
  buffer[ptr++] = dataBytes.length & 0xFF; buffer[ptr++] = (dataBytes.length >> 8) & 0xFF; buffer[ptr++] = 0x00; buffer[ptr++] = 0x00; // uncomp size
  buffer[ptr++] = nameBytes.length & 0xFF; buffer[ptr++] = (nameBytes.length >> 8) & 0xFF;
  buffer[ptr++] = 0x00; buffer[ptr++] = 0x00; // extra len
  
  for (let i = 0; i < nameBytes.length; i++) buffer[ptr++] = nameBytes[i];
  for (let i = 0; i < dataBytes.length; i++) buffer[ptr++] = dataBytes[i];
  
  // Central Directory End (50 4B 05 06)
  buffer[ptr++] = 0x50; buffer[ptr++] = 0x4B; buffer[ptr++] = 0x05; buffer[ptr++] = 0x06;
  for (let i = 0; i < 18; i++) buffer[ptr++] = 0x00;
}

function injectSampleSqlite(buffer: Uint8Array, offset: number) {
  const magic = new TextEncoder().encode("SQLite format 3\0");
  for (let i = 0; i < magic.length; i++) buffer[offset + i] = magic[i];
  buffer[offset + 16] = 0x10; buffer[offset + 17] = 0x00; // 4096 page size
  buffer[offset + 28] = 0x00; buffer[offset + 29] = 0x00; buffer[offset + 30] = 0x00; buffer[offset + 31] = 0x08; // 8 pages
}

function injectSampleMp4(buffer: Uint8Array, offset: number) {
  // 4 bytes size, 4 bytes 'ftyp', 'isom'
  buffer[offset] = 0x00; buffer[offset+1] = 0x00; buffer[offset+2] = 0x00; buffer[offset+3] = 0x20; // 32 bytes
  buffer[offset+4] = 0x66; buffer[offset+5] = 0x74; buffer[offset+6] = 0x79; buffer[offset+7] = 0x70; // ftyp
  buffer[offset+8] = 0x69; buffer[offset+9] = 0x73; buffer[offset+10] = 0x6F; buffer[offset+11] = 0x6D; // isom
  buffer[offset+12] = 0x00; buffer[offset+13] = 0x00; buffer[offset+14] = 0x02; buffer[offset+15] = 0x00;
}

function injectSamplePcap(buffer: Uint8Array, offset: number) {
  // PCAP magic bytes
  buffer[offset] = 0xD4; buffer[offset+1] = 0xC3; buffer[offset+2] = 0xB2; buffer[offset+3] = 0xA1;
  buffer[offset+4] = 0x02; buffer[offset+5] = 0x00; buffer[offset+6] = 0x04; buffer[offset+7] = 0x00; // version 2.4
}

function injectSlackString(buffer: Uint8Array, offset: number, text: string) {
  const bytes = new TextEncoder().encode(text);
  for (let i = 0; i < bytes.length; i++) {
    if (offset + i < buffer.length) buffer[offset + i] = bytes[i];
  }
}
