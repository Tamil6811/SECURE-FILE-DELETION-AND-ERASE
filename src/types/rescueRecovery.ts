/**
 * Universal Multi-Brand Storage & Rescue Recovery Engine
 * Inspired by SanDisk RescuePRO & Commercial Forensic Recovery Workflows.
 * 
 * Implements:
 * 1. Multi-Brand Hardware & Controller Detection (SanDisk, Samsung, Kingston, WD, Seagate, Crucial, Kioxia, Lexar, Transcend).
 * 2. Multi-Media Formats: NVMe SSD, SATA SSD, USB Pen Drive, External HDD, SD/microSD, CFast/CFexpress.
 * 3. 4-Stage Recovery Pipeline:
 *    - STAGE 1: Media & Controller Architecture Identification
 *    - STAGE 2: Quick File System & Metadata Scan (MFT / FAT / Directory Tables / Recycle Bin)
 *    - STAGE 3: Deep Raw Signature Carving (Sector-by-Sector Magic Byte Sweep)
 *    - STAGE 4: File Integrity & Cluster Verification (Validating Payload Intactness)
 */

export type StorageBrand = 
  | 'SANDISK'
  | 'SAMSUNG'
  | 'KINGSTON'
  | 'WESTERN_DIGITAL'
  | 'SEAGATE'
  | 'CRUCIAL'
  | 'KIOXIA_TOSHIBA'
  | 'LEXAR'
  | 'TRANSCEND'
  | 'GENERIC';

export type StorageDeviceClass = 
  | 'USB_PENDRIVE'
  | 'NVME_SSD'
  | 'SATA_SSD'
  | 'EXTERNAL_HDD'
  | 'SD_MICROSD'
  | 'CF_EXPRESS';

export interface StorageDeviceProfile {
  id: string;
  name: string;
  brand: StorageBrand;
  brandLabel: string;
  deviceClass: StorageDeviceClass;
  classLabel: string;
  capacityGB: number;
  serialNumber: string;
  controller: string;
  nandType: '3D TLC' | '3D QLC' | 'BiCS FLASH' | 'V-NAND' | 'PMR/SMR Platters' | 'Planar MLC';
  sectorSize: 512 | 4096;
  totalSectors: number;
  fileSystem: 'NTFS' | 'FAT32' | 'exFAT';
  mountPoint: string;
  healthPct: number;
  iconType: 'usb' | 'ssd' | 'nvme' | 'hdd' | 'sd';
  isPhysicalHostDevice?: boolean;
}

export const SUPPORTED_DEVICE_PROFILES: StorageDeviceProfile[] = [
  {
    id: 'dev-sandisk-ultra-usb',
    name: 'SanDisk Ultra Dual Drive USB 3.2 Gen 1',
    brand: 'SANDISK',
    brandLabel: 'SanDisk / Western Digital',
    deviceClass: 'USB_PENDRIVE',
    classLabel: 'External USB Pen Drive',
    capacityGB: 64,
    serialNumber: 'SDCZ880-064G-G46',
    controller: 'SanDisk 20-82-00543 Flash Controller',
    nandType: 'BiCS FLASH',
    sectorSize: 512,
    totalSectors: 125034840,
    fileSystem: 'exFAT',
    mountPoint: 'E:\\',
    healthPct: 98,
    iconType: 'usb',
    isPhysicalHostDevice: true
  },
  {
    id: 'dev-micron-nvme-internal',
    name: 'Micron MTFDKCD512QFM PCIe 4.0 NVMe SSD',
    brand: 'GENERIC',
    brandLabel: 'Micron / Crucial',
    deviceClass: 'NVME_SSD',
    classLabel: 'Internal NVMe PCIe M.2 SSD',
    capacityGB: 512,
    serialNumber: '00A0_7501_464C_50E9.',
    controller: 'Micron Silicon Motion SM2264 8-Channel',
    nandType: '3D TLC',
    sectorSize: 4096,
    totalSectors: 125026848,
    fileSystem: 'NTFS',
    mountPoint: 'C:\\ (Windows Host OS)',
    healthPct: 99,
    iconType: 'nvme',
    isPhysicalHostDevice: true
  },
  {
    id: 'dev-samsung-t7-ssd',
    name: 'Samsung Portable SSD T7 Touch USB 3.2',
    brand: 'SAMSUNG',
    brandLabel: 'Samsung Electronics',
    deviceClass: 'SATA_SSD',
    classLabel: 'External High-Speed SSD',
    capacityGB: 1000,
    serialNumber: 'S6X2NS0T104829K',
    controller: 'Samsung Pablo Gen2 PCIe-to-USB Bridge',
    nandType: 'V-NAND',
    sectorSize: 512,
    totalSectors: 1953525168,
    fileSystem: 'exFAT',
    mountPoint: 'F:\\ (Portable SSD)',
    healthPct: 96,
    iconType: 'ssd'
  },
  {
    id: 'dev-kingston-datatraveler',
    name: 'Kingston DataTraveler Max 256GB Type-C',
    brand: 'KINGSTON',
    brandLabel: 'Kingston Technology',
    deviceClass: 'USB_PENDRIVE',
    classLabel: 'External USB Pen Drive',
    capacityGB: 256,
    serialNumber: 'DTMAX-256GB-USB32',
    controller: 'Phison PS2251-17 USB 3.2 Gen 2',
    nandType: '3D TLC',
    sectorSize: 512,
    totalSectors: 500118192,
    fileSystem: 'FAT32',
    mountPoint: 'G:\\ (Pen Drive)',
    healthPct: 94,
    iconType: 'usb'
  },
  {
    id: 'dev-wd-elements-hdd',
    name: 'Western Digital Elements 2TB USB 3.0',
    brand: 'WESTERN_DIGITAL',
    brandLabel: 'Western Digital (WD)',
    deviceClass: 'EXTERNAL_HDD',
    classLabel: 'External Hard Disk Drive (HDD)',
    capacityGB: 2000,
    serialNumber: 'WDC-WD20NMVW-11W68S0',
    controller: 'JMicron JMS578 USB-to-SATA Bridge',
    nandType: 'PMR/SMR Platters',
    sectorSize: 512,
    totalSectors: 3907029168,
    fileSystem: 'NTFS',
    mountPoint: 'H:\\ (Passport HDD)',
    healthPct: 91,
    iconType: 'hdd'
  },
  {
    id: 'dev-sandisk-extreme-sd',
    name: 'SanDisk Extreme PRO SDXC UHS-I V30 128GB',
    brand: 'SANDISK',
    brandLabel: 'SanDisk / Western Digital',
    deviceClass: 'SD_MICROSD',
    classLabel: 'Camera SD / MicroSD Flash Card',
    capacityGB: 128,
    serialNumber: 'SDSDXXY-128G-GN4IN',
    controller: 'SanDisk ASIC High-Speed Card Controller',
    nandType: 'BiCS FLASH',
    sectorSize: 512,
    totalSectors: 250069680,
    fileSystem: 'exFAT',
    mountPoint: 'I:\\ (Camera Card)',
    healthPct: 99,
    iconType: 'sd'
  },
  {
    id: 'dev-seagate-expansion',
    name: 'Seagate Expansion Portable 1TB HDD',
    brand: 'SEAGATE',
    brandLabel: 'Seagate Technology',
    deviceClass: 'EXTERNAL_HDD',
    classLabel: 'External Hard Disk Drive (HDD)',
    capacityGB: 1000,
    serialNumber: 'NA9X2KZB-ST1000LM035',
    controller: 'ASMedia ASM1153E Controller',
    nandType: 'PMR/SMR Platters',
    sectorSize: 512,
    totalSectors: 1953525168,
    fileSystem: 'NTFS',
    mountPoint: 'J:\\ (Expansion)',
    healthPct: 88,
    iconType: 'hdd'
  },
  {
    id: 'dev-crucial-x9-ssd',
    name: 'Crucial X9 Pro 1TB Portable SSD',
    brand: 'CRUCIAL',
    brandLabel: 'Crucial / Micron Technology',
    deviceClass: 'SATA_SSD',
    classLabel: 'External High-Speed SSD',
    capacityGB: 1000,
    serialNumber: 'CT1000X9PROSSD9',
    controller: 'Silicon Motion SM2320 Single-Chip',
    nandType: '3D TLC',
    sectorSize: 4096,
    totalSectors: 244140625,
    fileSystem: 'exFAT',
    mountPoint: 'K:\\ (Crucial X9)',
    healthPct: 97,
    iconType: 'ssd'
  }
];

export type RescueScanMode = 'QUICK_METADATA_SCAN' | 'DEEP_SECTOR_CARVE' | 'COMPREHENSIVE_RESCUE';

export interface RescuePipelineStage {
  stage: 1 | 2 | 3 | 4;
  name: string;
  description: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'SKIPPED';
  progressPct: number;
  details: string;
}

export const INITIAL_RESCUE_STAGES: RescuePipelineStage[] = [
  {
    stage: 1,
    name: 'Media & Controller Identification',
    description: 'Detects NAND/platter architecture, sector size (512/4Kn), and manufacturer firmware layout.',
    status: 'PENDING',
    progressPct: 0,
    details: 'Awaiting device selection...'
  },
  {
    stage: 2,
    name: 'Fast File System & Metadata Scan',
    description: 'Traverses Master File Table (MFT), FAT directory entries, and $Recycle.Bin references.',
    status: 'PENDING',
    progressPct: 0,
    details: 'Locating unlinked directory structures...'
  },
  {
    stage: 3,
    name: 'Deep Raw Signature Carving',
    description: 'Sector-by-sector magic byte sweep for RAW photos (CR2, NEF, ARW, JPG), videos, and documents.',
    status: 'PENDING',
    progressPct: 0,
    details: 'Scanning unallocated cluster space...'
  },
  {
    stage: 4,
    name: 'Integrity Verification & Reassembly',
    description: 'Validates file headers, entropy levels, stitches bifragmented clusters, and isolates corrupted payloads.',
    status: 'PENDING',
    progressPct: 0,
    details: 'Verifying recovered payload integrity...'
  }
];
