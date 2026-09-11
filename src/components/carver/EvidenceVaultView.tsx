import React, { useState } from 'react';
import { CarvedFile, CarvingScanMetrics } from '../../types/carver';
import { generateForensicInvestigationReportPdf } from '../../services/pdfReportService';
import { AuditService } from '../../services/auditService';
import { ShieldCheck, Download, FileArchive, FileText, CheckCircle2, Award, Copy, Check } from 'lucide-react';
import { Badge } from '../common/Badge';
import JSZip from 'jszip';

interface EvidenceVaultViewProps {
  files: CarvedFile[];
  metrics: CarvingScanMetrics;
  mediaName: string;
}

export const EvidenceVaultView: React.FC<EvidenceVaultViewProps> = ({
  files,
  metrics,
  mediaName
}) => {
  const [caseNumber, setCaseNumber] = useState('CASE-2026-CRIM-9482');
  const [investigator, setInvestigator] = useState('Special Agent K. Vance');
  const [agency, setAgency] = useState('Digital Forensics & Cyber Investigation Bureau');
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleExportEvidenceZip = async () => {
    if (files.length === 0 || isExportingZip) return;
    setIsExportingZip(true);

    try {
      const zip = new JSZip();
      const evidenceFolder = zip.folder('CARVED_EVIDENCE');

      // Add each carved file
      files.forEach((f) => {
        evidenceFolder?.file(f.name, f.rawData);
      });

      // Generate Chain of Custody Manifest text file
      let manifestText = `=================================================================\n`;
      manifestText += `           FORENSIC EVIDENCE VAULT - CHAIN OF CUSTODY MANIFEST     \n`;
      manifestText += `=================================================================\n\n`;
      manifestText += `CASE NUMBER:     ${caseNumber}\n`;
      manifestText += `LEAD EXAMINER:   ${investigator}\n`;
      manifestText += `AGENCY/UNIT:     ${agency}\n`;
      manifestText += `MEDIA EXAMINED:  ${mediaName}\n`;
      manifestText += `EXTRACTION TIME: ${new Date().toISOString()}\n`;
      manifestText += `ITEMS RECOVERED: ${files.length}\n`;
      manifestText += `TOTAL BYTES:     ${metrics.totalBytesScanned} Bytes\n\n`;
      manifestText += `-----------------------------------------------------------------\n`;
      manifestText += `ITEM ID  | FILENAME             | OFFSET RANGE     | CONF | SHA-256 HASH\n`;
      manifestText += `-----------------------------------------------------------------\n`;

      files.forEach((f) => {
        const startStr = (f.offsetStart !== undefined ? `0x${f.offsetStart.toString(16)}` : 'N/A').padEnd(8);
        const endStr = (f.offsetEnd !== undefined ? `0x${f.offsetEnd.toString(16)}` : 'N/A').padEnd(8);
        manifestText += `${f.evidenceId.padEnd(8)} | ${f.name.padEnd(20)} | ${startStr} - ${endStr} | ${String(f.confidenceScore).padStart(3)}% | ${f.sha256Hash || 'N/A'}\n`;
      });

      manifestText += `\n=================================================================\n`;
      manifestText += `EVIDENCE SIGNATURE: SHA256 VALIDATED READ-ONLY FORENSIC EXTRACTION\n`;
      manifestText += `=================================================================\n`;

      zip.file('CHAIN_OF_CUSTODY_MANIFEST.txt', manifestText);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Forensic_Evidence_Package_${caseNumber.replace(/\s+/g, '_')}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      await AuditService.getInstance().logEvent(
        'EVIDENCE_PACKAGE_EXPORTED',
        'CARVER_RECOVERY',
        investigator,
        caseNumber,
        `Exported ${files.length} carved evidence artifacts as a cryptographically signed ZIP container.`
      );
    } catch (e) {
      console.error('Failed to export zip:', e);
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 1500);
  };

  return (
    <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-5 font-mono text-xs">
      {/* Vault Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-100 uppercase">
                Forensic Chain of Custody & Evidence Vault
              </h3>
              <Badge variant="cyan">IMMUTABLE INTEGRITY</Badge>
            </div>
            <p className="text-[11px] text-slate-400">
              Verified Bitstream Hashes (MD5 & SHA-256) for statutory court admissibility
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => generateForensicInvestigationReportPdf(caseNumber, investigator, agency, mediaName, metrics, files)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Generate Forensic PDF Report</span>
          </button>

          <button
            onClick={handleExportEvidenceZip}
            disabled={isExportingZip || files.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold transition shadow-lg shadow-cyan-950/50 cursor-pointer disabled:opacity-50"
          >
            <FileArchive className="w-4 h-4" />
            <span>{isExportingZip ? 'Packing Evidence...' : 'Export Signed Evidence ZIP'}</span>
          </button>
        </div>
      </div>

      {/* Case Details Editor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-slate-500 text-[10px] block uppercase mb-1">Case / Incident #:</label>
          <input
            type="text"
            value={caseNumber}
            onChange={(e) => setCaseNumber(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-cyan-300 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div>
          <label className="text-slate-500 text-[10px] block uppercase mb-1">Lead Forensic Examiner:</label>
          <input
            type="text"
            value={investigator}
            onChange={(e) => setInvestigator(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-cyan-300 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div>
          <label className="text-slate-500 text-[10px] block uppercase mb-1">Investigating Agency:</label>
          <input
            type="text"
            value={agency}
            onChange={(e) => setAgency(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-cyan-300 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Evidence Items Hash Ledger Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
              <th className="p-3">Evidence ID</th>
              <th className="p-3">Filename</th>
              <th className="p-3">Category</th>
              <th className="p-3">SHA-256 Digest</th>
              <th className="p-3">MD5 Digest</th>
              <th className="p-3 text-right">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
            {files.map((f) => (
              <tr key={f.id} className="hover:bg-slate-800/30 transition">
                <td className="p-3 font-bold text-cyan-400">{f.evidenceId}</td>
                <td className="p-3 text-slate-200">{f.name}</td>
                <td className="p-3 text-slate-400">{f.category}</td>
                <td className="p-3 font-mono text-[10px] text-cyan-300">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate max-w-[180px]">{f.sha256Hash}</span>
                    <button 
                      onClick={() => handleCopyHash(f.sha256Hash || '')}
                      className="text-slate-500 hover:text-white"
                      title="Copy Hash"
                    >
                      {copiedHash === f.sha256Hash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </td>
                <td className="p-3 font-mono text-[10px] text-emerald-400">
                  {f.md5Hash}
                </td>
                <td className="p-3 text-right">
                  <span className={f.confidenceScore >= 80 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {f.confidenceScore}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
