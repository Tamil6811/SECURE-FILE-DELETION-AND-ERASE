import React, { useState } from 'react';
import { CyberCard } from '../common/CyberCard';
import { Badge } from '../common/Badge';
import { 
  BookOpen, 
  ShieldCheck, 
  Disc, 
  Trash2, 
  Binary, 
  Code2, 
  Award, 
  FileText, 
  HelpCircle,
  ChevronRight
} from 'lucide-react';

export const DocumentationModule: React.FC = () => {
  const [selectedDoc, setSelectedDoc] = useState<'OVERVIEW' | 'DRIVE_ERASER' | 'FILE_ERASER' | 'CARVER_SPEC' | 'STANDARDS' | 'FAQ'>('OVERVIEW');

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-slate-100 uppercase tracking-wide">
            Technical Documentation & Standards Reference Manual
          </h1>
          <Badge variant="cyan">OFFICIAL SPECIFICATION</Badge>
        </div>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Architectural blueprints, mathematical formulas, statutory destruction standards, and forensic carving methodology.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Index */}
        <div className="lg:col-span-1 space-y-1.5 font-mono text-xs">
          {[
            { id: 'OVERVIEW', label: 'Platform Architecture' },
            { id: 'DRIVE_ERASER', label: 'Module 1: Drive Eraser' },
            { id: 'FILE_ERASER', label: 'Module 2: File & Slack Eraser' },
            { id: 'CARVER_SPEC', label: 'Module 3: Carving Engine' },
            { id: 'STANDARDS', label: 'Destruction Standards' },
            { id: 'FAQ', label: 'Forensic FAQ & Compliance' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedDoc(item.id as any)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition ${
                selectedDoc === item.id
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <span>{item.label}</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          ))}
        </div>

        {/* Content View */}
        <div className="lg:col-span-3 space-y-4">
          {selectedDoc === 'OVERVIEW' && (
            <CyberCard variant="cyan" className="space-y-4 leading-relaxed font-mono text-xs text-slate-300">
              <h2 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2">
                1. Unified Forensic Sanitization & Recovery Architecture
              </h2>
              <p>
                Organizations, law enforcement agencies, and cybersecurity investigators face a dual challenge:
                <strong> permanent, verifiable destruction of sensitive data</strong> to prevent unauthorized recovery, alongside
                <strong> robust digital evidence reconstruction</strong> from damaged or formatted storage.
              </p>
              <p>
                Historically, these two functions existed in disconnected tools, creating high operational overhead.
                <strong> AegisForensics</strong> bridges this divide by delivering an integrated suite with zero reliance on volatile host OS caching:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <strong className="text-cyan-400 block mb-1">1. Drive Sanitization</strong>
                  Overwrites 100% of LBA space with NIST 800-88, DoD, and IEEE 2883 protocols, verifying that entropy drops to $H=0.0000$.
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <strong className="text-emerald-400 block mb-1">2. Deep Metadata Erasure</strong>
                  Destroys MACB timestamps, NTFS ADS streams, cluster slack space, and obscures directory entries prior to unlinking.
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <strong className="text-purple-400 block mb-1">3. Structure Carving</strong>
                  Carves JPEGs, PNGs, PDFs, SQLite DBs, and fragmented media without relying on damaged file system metadata.
                </div>
              </div>
            </CyberCard>
          )}

          {selectedDoc === 'DRIVE_ERASER' && (
            <CyberCard variant="cyan" className="space-y-4 font-mono text-xs text-slate-300 leading-relaxed">
              <h2 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2">
                2. Module 1: Secure Drive Eraser Technical Specification
              </h2>
              <p>
                The Secure Drive Eraser interacts directly with storage block layers (NVMe namespaces, SATA LBA ranges, USB SCSI translation) to perform permanent overwrites:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><strong>Multi-Standard Execution:</strong> Configurable passes ranging from 1-pass zeroing to 35-pass Gutmann algorithms.</li>
                <li><strong>Bad Block & Reallocated Sector Handling:</strong> Traverses wear-level spare blocks on flash media via IEEE 2883 commands.</li>
                <li><strong>Entropy Nullification:</strong> Measures residual Shannon entropy across sample sectors ($H = -\sum p_i \log_2 p_i$) to mathematically certify that data cannot be reconstructed.</li>
                <li><strong>Cryptographic PDF Certificates:</strong> Embeds device serial number, SHA-256 digest, technician ID, and QR verification payload.</li>
              </ul>
            </CyberCard>
          )}

          {selectedDoc === 'FILE_ERASER' && (
            <CyberCard variant="emerald" className="space-y-4 font-mono text-xs text-slate-300 leading-relaxed">
              <h2 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2">
                3. Module 2: Secure File & Folder Eraser with Slack Cleaning
              </h2>
              <p>
                Standard file system deletion only marks clusters as "unallocated" without erasing payload or metadata. The Secure File Eraser executes a 6-stage scrubbing process:
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-slate-300">
                <li><strong>Payload Shredding:</strong> Multi-pass overwriting with uniform or PRNG bit patterns.</li>
                <li><strong>MACB Timestamp Zeroing:</strong> Modified, Accessed, Created, and Birth timestamps wiped to prevent temporal timeline analysis.</li>
                <li><strong>NTFS Alternate Data Streams (ADS):</strong> Secondary streams (:Zone.Identifier, security descriptors) purged.</li>
                <li><strong>Cluster Slack Space Sanitization:</strong> Overwrites residual slack bytes between logical EOF and sector end.</li>
                <li><strong>Filename Obfuscation:</strong> Renames the file 26 times with 256-character randomized ASCII strings before deletion.</li>
                <li><strong>Directory Entry Nullification:</strong> Cleanses $MFT record attributes and Inode pointers.</li>
              </ol>
            </CyberCard>
          )}

          {selectedDoc === 'CARVER_SPEC' && (
            <CyberCard variant="purple" className="space-y-4 font-mono text-xs text-slate-300 leading-relaxed">
              <h2 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2">
                4. Module 3: Advanced Forensic Carving Engine
              </h2>
              <p>
                When a file system is damaged, formatted, or corrupted, metadata tables ($MFT, FAT, Inodes) are unavailable. AegisForensics utilizes signature and structure parsing:
              </p>
              <div className="space-y-3">
                <div className="p-3 rounded bg-slate-900 border border-slate-800">
                  <strong className="text-cyan-400 block mb-1">A. Magic Signature Byte Matching:</strong>
                  Identifies start-of-file (SOF) and end-of-file (EOF) markers across 20+ file formats (JPEG: <code className="text-emerald-300">FF D8 FF ... FF D9</code>, PDF: <code className="text-emerald-300">%PDF ... %%EOF</code>, PNG: <code className="text-emerald-300">89 50 4E 47 ... IEND</code>).
                </div>
                <div className="p-3 rounded bg-slate-900 border border-slate-800">
                  <strong className="text-cyan-400 block mb-1">B. Structure-Aware Chunk Parsing:</strong>
                  Traverses inner binary containers (PNG IHDR/IDAT chunks, JPEG markers, SQLite page allocations, ZIP Central Directory) to extract valid byte lengths even when footers are missing.
                </div>
                <div className="p-3 rounded bg-slate-900 border border-slate-800">
                  <strong className="text-cyan-400 block mb-1">C. Fragmented Reassembly (Bifragment Gap Analysis):</strong>
                  Heuristically detects split clusters separated by unallocated zeroes or unrelated blocks, reconstructing fragmented images and video streams.
                </div>
              </div>
            </CyberCard>
          )}

          {selectedDoc === 'STANDARDS' && (
            <CyberCard variant="cyan" className="space-y-4 font-mono text-xs text-slate-300 leading-relaxed">
              <h2 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2">
                5. Statutory Sanitization & Compliance Reference
              </h2>
              <div className="space-y-2">
                <p><strong>• NIST SP 800-88 Rev. 1:</strong> Guidelines for Media Sanitization (Clear, Purge, Destroy categories).</p>
                <p><strong>• DoD 5220.22-M:</strong> National Industrial Security Program Operating Manual (NISPOM 3-pass & 7-pass).</p>
                <p><strong>• IEEE 2883-2022:</strong> Standard for Sanitizing Storage across flash and NVMe devices.</p>
                <p><strong>• HIPAA § 164.310(d)(2)(i):</strong> Electronic media disposal compliance for ePHI data protection.</p>
                <p><strong>• GDPR Article 17:</strong> Right to Erasure / Right to be Forgotten technical fulfillment.</p>
              </div>
            </CyberCard>
          )}

          {selectedDoc === 'FAQ' && (
            <CyberCard variant="amber" className="space-y-4 font-mono text-xs text-slate-300 leading-relaxed">
              <h2 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2">
                6. Frequently Asked Forensic & Sanitization Questions
              </h2>
              <div className="space-y-3">
                <div>
                  <strong className="text-slate-100 block">Q: Can quick-formatted drives be recovered by the carver?</strong>
                  <p className="text-slate-400">Yes! Quick formatting only reinitializes partition headers; 100% of unallocated cluster data remains intact until overwritten by the Drive Eraser.</p>
                </div>
                <div>
                  <strong className="text-slate-100 block">Q: How does the platform prove evidence has not been tampered with?</strong>
                  <p className="text-slate-400">Every carved item immediately generates SHA-256 and MD5 cryptographic hashes upon ingestion, stored in a Merkle blockchain ledger with timestamp signatures.</p>
                </div>
                <div>
                  <strong className="text-slate-100 block">Q: Is 1-pass zero overwrite sufficient for SSDs under NIST 800-88?</strong>
                  <p className="text-slate-400">NIST SP 800-88 Clear confirms that a single-pass logical overwrite prevents all software recovery. For Purge level, cryptographic erase and wear-level flushing are applied.</p>
                </div>
              </div>
            </CyberCard>
          )}
        </div>
      </div>
    </div>
  );
};
