import React from 'react';
import { CertificateOfDestruction } from '../../types/sanitization';
import { generateDestructionCertificatePdf } from '../../services/pdfReportService';
import { Award, Download, CheckCircle2, ShieldCheck, X, FileText, QrCode } from 'lucide-react';
import { Badge } from '../common/Badge';

interface DestructionCertificateModalProps {
  certificate: CertificateOfDestruction;
  onClose: () => void;
}

export const DestructionCertificateModal: React.FC<DestructionCertificateModalProps> = ({
  certificate,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0b1019] border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/80 p-6 md:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Header */}
        <div className="text-center space-y-2 border-b border-slate-800 pb-6">
          <div className="inline-flex p-3 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 mb-1">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-wide text-slate-100 uppercase">
            Certificate of Sanitization
          </h2>
          <p className="text-xs font-mono text-cyan-400">
            NIST SP 800-88 & DoD 5220.22-M COMPLIANT DESTRUCTION
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <Badge variant="emerald">VERIFIED SANITIZED</Badge>
            <Badge variant="cyan">PASS 100%</Badge>
          </div>
        </div>

        {/* Certificate Body Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">
              1. Sanitized Storage Device
            </span>
            <div className="flex justify-between">
              <span className="text-slate-400">Device Model:</span>
              <span className="text-slate-100 font-semibold">{certificate.device.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Serial Number:</span>
              <span className="text-cyan-300 font-semibold">{certificate.device.serialNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Capacity:</span>
              <span className="text-slate-100">{certificate.device.capacityGB} GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Interface:</span>
              <span className="text-slate-100">{certificate.device.type}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">
              2. Sanitization Standard & Audit
            </span>
            <div className="flex justify-between">
              <span className="text-slate-400">Standard:</span>
              <span className="text-slate-100 font-semibold truncate max-w-[150px]">{certificate.sanitization.standardName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Passes Executed:</span>
              <span className="text-emerald-400 font-bold">{certificate.sanitization.passesCompleted} Overwrites</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Residual Entropy:</span>
              <span className="text-slate-100">{certificate.sanitization.postErasureEntropy.toFixed(4)} bits/byte</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Technician ID:</span>
              <span className="text-slate-100">{certificate.sanitization.technicianId}</span>
            </div>
          </div>
        </div>

        {/* Cryptographic Hash Manifest Box */}
        <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Cryptographic LBA SHA-256 Verification Digest:
            </span>
            <span className="text-[10px] text-emerald-400">Immutable Hash</span>
          </div>
          <div className="p-2.5 rounded bg-slate-900 text-cyan-300 break-all text-[11px] font-mono border border-slate-800">
            {certificate.sanitization.sha256VerificationHash}
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span>Signature: {certificate.cryptographicSignature.slice(0, 32)}...</span>
            <span>Cert ID: {certificate.certificateId}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Ready for Statutory Archival</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold transition"
            >
              Close
            </button>
            <button
              onClick={() => generateDestructionCertificatePdf(certificate)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono text-xs font-bold shadow-lg shadow-cyan-500/20 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download Official PDF
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
