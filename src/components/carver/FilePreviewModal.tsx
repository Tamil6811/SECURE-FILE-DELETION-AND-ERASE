import React from 'react';
import { CarvedFile } from '../../types/carver';
import { X, Download, FileText, Image as ImageIcon, Binary, ShieldCheck, Database, Music } from 'lucide-react';
import { Badge } from '../common/Badge';

interface FilePreviewModalProps {
  file: CarvedFile;
  onClose: () => void;
  onOpenHex: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose, onOpenHex }) => {
  const handleDownloadFile = () => {
    const blob = new Blob([file.rawData as unknown as BlobPart], { type: file.mimeType || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#080d18] border border-cyan-500/40 rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              {file.category === 'IMAGE' ? <ImageIcon className="w-5 h-5" /> : file.category === 'DATABASE' ? <Database className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-100">{file.name}</h3>
                <Badge variant={file.confidenceScore >= 80 ? 'emerald' : 'amber'}>
                  {file.confidenceScore}% CONFIDENCE
                </Badge>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Evidence ID: <strong className="text-cyan-400">{file.evidenceId}</strong> • {file.originalPath ? <span className="truncate max-w-xs inline-block align-bottom" title={file.originalPath}>Path: {file.originalPath}</span> : (file.offsetStart !== undefined ? `Offset: 0x${file.offsetStart.toString(16).toUpperCase()} - 0x${(file.offsetEnd || 0).toString(16).toUpperCase()}` : '')} ({(file.sizeBytes / 1024).toFixed(2)} KB)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenHex}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/30 text-xs font-mono transition"
            >
              <Binary className="w-3.5 h-3.5 text-cyan-400" />
              <span>Inspect Hex</span>
            </button>
            <button
              onClick={handleDownloadFile}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Raw File</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Media Preview Container */}
        <div className="rounded-xl bg-slate-950 border border-slate-800/90 p-4 min-h-[260px] flex items-center justify-center overflow-hidden">
          {file.category === 'IMAGE' && file.previewUrl ? (
            <div className="space-y-2 text-center w-full">
              <img
                src={file.previewUrl}
                alt={file.name}
                className="max-h-80 max-w-full rounded-lg mx-auto object-contain border border-slate-800 shadow-lg"
              />
              <p className="text-[10px] font-mono text-slate-400">
                Recovered Image Raster Rendered Live • Integrity: {file.integrityStatus}
              </p>
            </div>
          ) : (file.extension.toLowerCase() === 'pdf' || file.mimeType === 'application/pdf') && file.previewUrl ? (
            <div className="w-full flex flex-col items-center space-y-2">
              <object
                data={file.previewUrl}
                type="application/pdf"
                className="w-full h-96 rounded-lg border border-slate-800 bg-slate-900"
              >
                <div className="p-8 text-center space-y-3">
                  <FileText className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="text-slate-300 font-bold text-xs">PDF Document Recovered ({((file.sizeBytes || 0) / 1024).toFixed(1)} KB)</p>
                  <button
                    onClick={handleDownloadFile}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download / Open PDF</span>
                  </button>
                </div>
              </object>
              <p className="text-[10px] font-mono text-slate-400">
                Live Recovered PDF Document • Integrity: {file.integrityStatus}
              </p>
            </div>
          ) : file.previewText ? (
            <div className="w-full space-y-2 font-mono text-xs">
              <span className="text-[10px] text-slate-500 uppercase block">Decoded Text & Structural Header Preview:</span>
              <pre className="p-4 rounded-lg bg-slate-900 text-cyan-300 overflow-x-auto max-h-72 whitespace-pre-wrap border border-slate-800 font-mono text-[11px] leading-relaxed select-all">
                {file.previewText}
              </pre>
            </div>
          ) : (
            <div className="text-center space-y-3 p-6 font-mono">
              <div className="inline-flex p-3 rounded-full bg-slate-900 border border-slate-800 text-cyan-400">
                <Binary className="w-8 h-8" />
              </div>
              <h4 className="text-xs font-bold text-slate-200">Binary Container Artifact ({file.extension.toUpperCase()})</h4>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Click "Inspect Hex" to view raw byte structure or "Export Raw File" to save.
              </p>
            </div>
          )}
        </div>

        {/* Recovery State Distinction Banner */}
        <div className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs font-mono ${
          file.recoveryState === 'CONTENT_RECOVERED'
            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
            : 'bg-amber-950/60 border-amber-500/50 text-amber-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              file.recoveryState === 'CONTENT_RECOVERED'
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-amber-500 text-slate-950'
            }`}>
              {file.recoveryState === 'CONTENT_RECOVERED' ? 'FILE CONTENT RECOVERED' : 'RECYCLE BIN METADATA FOUND'}
            </span>
            <span className="text-[11px]">
              {file.recoveryState === 'CONTENT_RECOVERED'
                ? 'Cluster payload verified intact. Data runs mapped and ready for export.'
                : 'Metadata record identified. Content payload requires unallocated space carve.'}
            </span>
          </div>
          {file.recycleBinArtifact && (
            <span className="text-[10px] text-slate-400">
              Artifact: <strong className="text-purple-300">{file.recycleBinArtifact.metadataFile}</strong> ➔ <strong className="text-cyan-300">{file.recycleBinArtifact.dataFile}</strong>
            </span>
          )}
        </div>

        {/* Forensic Metadata & Chain of Custody */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">
              1. Carving Methodology & Deleted Source
            </span>
            <div className="flex justify-between">
              <span className="text-slate-400">Source:</span>
              <span className="text-purple-300 font-semibold">
                {file.source === 'RECYCLE_BIN' ? 'Windows Recycle Bin ($Recycle.Bin)' : 'Local Disk Folder'}
              </span>
            </div>
            {file.originalLocation && (
              <div className="flex justify-between truncate">
                <span className="text-slate-400 shrink-0 mr-2">Deleted From:</span>
                <span className="text-slate-200 truncate" title={file.originalLocation}>{file.originalLocation}</span>
              </div>
            )}
            {file.dateDeleted && (
              <div className="flex justify-between">
                <span className="text-slate-400">Date Deleted:</span>
                <span className="text-amber-300 font-semibold">{file.dateDeleted}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Carving Technique:</span>
              <span className="text-cyan-300 font-semibold">{file.carvingTechnique.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Structural Status:</span>
              <span className={file.integrityStatus === 'VALID_STRUCTURE' ? 'text-emerald-400' : 'text-amber-400'}>
                {file.integrityStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Shannon Entropy:</span>
              <span className="text-purple-400">
                {file.shannonEntropy !== undefined ? `${file.shannonEntropy.toFixed(4)} bits/byte` : 'N/A'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">
              2. Cryptographic Evidence Hashes & Runs
            </span>
            <div className="space-y-0.5">
              <span className="text-slate-400 text-[10px] block">SHA-256:</span>
              <span className="text-cyan-400 text-[10px] break-all block">{file.sha256Hash || 'N/A'}</span>
            </div>
            <div className="space-y-0.5 pt-1">
              <span className="text-slate-400 text-[10px] block">MD5:</span>
              <span className="text-emerald-400 text-[10px] block">{file.md5Hash || 'N/A'}</span>
            </div>
            {file.ntfsRecord?.clusterInfo && (
              <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
                <span>Cluster Allocation:</span>
                <span className="text-cyan-300 font-mono">
                  {file.ntfsRecord.clusterInfo.totalClusters} Clusters ({file.ntfsRecord.clusterInfo.clusterSize} B/Cluster)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* NTFS MFT Record Analysis Schema */}
        {file.ntfsRecord && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-cyan-400">
                3. NTFS Master File Table (MFT) Record #{file.ntfsRecord.recordNumber}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                file.ntfsRecord.status === 'RECOVERABLE'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-950 text-amber-400 border border-amber-500/30'
              }`}>
                STATUS: {file.ntfsRecord.status}
              </span>
            </div>
            <pre className="p-3 rounded-lg bg-slate-900/90 text-cyan-300 text-[11px] overflow-x-auto max-h-48 border border-slate-800 leading-relaxed select-all">
{JSON.stringify({
  filename: file.name,
  extension: file.extension,
  size: file.sizeBytes,
  mft_record: file.ntfsRecord.recordNumber,
  deleted: !file.ntfsRecord.isAllocatedInMft,
  timestamps: file.ntfsRecord.timestamps || {
    created: file.modifyDate,
    modified: file.modifyDate,
    date_deleted: file.dateDeleted
  },
  data_runs: file.ntfsRecord.dataRuns || [],
  status: file.ntfsRecord.status
}, null, 2)}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
};
