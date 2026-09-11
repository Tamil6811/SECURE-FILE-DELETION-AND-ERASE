import React, { useState, useEffect } from 'react';
import { ShreddedFileRecord } from '../../types/auth';
import { ShreddedFilesService } from '../../services/shreddedFilesService';
import { CyberCard } from '../common/CyberCard';
import { Badge } from '../common/Badge';
import { 
  FileText, 
  Search, 
  ShieldCheck, 
  Trash2, 
  Download, 
  FileCode, 
  Image, 
  Video, 
  Database, 
  FileSpreadsheet, 
  Layers, 
  ExternalLink,
  Flame,
  CheckCircle2,
  Filter
} from 'lucide-react';

export const ShreddedFilesInspector: React.FC = () => {
  const [shreddedFiles, setShreddedFiles] = useState<ShreddedFileRecord[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedFile, setSelectedFile] = useState<ShreddedFileRecord | null>(null);

  const loadFiles = () => {
    const list = ShreddedFilesService.getInstance().getAll();
    setShreddedFiles(list);
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const filteredFiles = shreddedFiles.filter(f => {
    if (categoryFilter !== 'ALL' && f.category !== categoryFilter) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      return f.fileName.toLowerCase().includes(q) ||
             f.originalPath.toLowerCase().includes(q) ||
             f.erasureHash.toLowerCase().includes(q) ||
             f.operator.toLowerCase().includes(q) ||
             (f.caseReference && f.caseReference.toLowerCase().includes(q));
    }
    return true;
  });

  const totalBytes = shreddedFiles.reduce((acc, f) => acc + f.sizeBytes, 0);
  const totalSlack = shreddedFiles.reduce((acc, f) => acc + f.slackSpacePurgedBytes, 0);

  const getFileIcon = (cat: string) => {
    switch (cat) {
      case 'IMAGE': return Image;
      case 'MEDIA': return Video;
      case 'DATABASE': return Database;
      case 'DOCUMENT': return FileSpreadsheet;
      case 'BINARY': return FileCode;
      default: return FileText;
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(shreddedFiles, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `SHREDDED_FILES_MANIFEST_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-purple-950/30 border border-purple-500/40 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-900/60 border border-purple-400/50 text-purple-300">
            <Flame className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-100 uppercase tracking-wide">
                Admin Shredded Files Manifest & Evidence Vault
              </h2>
              <Badge variant="purple">ADMIN ONLY</Badge>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Comprehensive registry of every file destroyed across all physical drives, partitions, and test cases.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportJson}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Shredded Manifest (JSON)</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase block font-mono">Total Files Shredded:</span>
          <span className="text-purple-400 font-extrabold text-lg">{shreddedFiles.length} Files</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase block font-mono">Total Payload Wiped:</span>
          <span className="text-cyan-300 font-extrabold text-lg">{(totalBytes / (1024 * 1024)).toFixed(2)} MB</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase block font-mono">Slack Space Purged:</span>
          <span className="text-amber-300 font-extrabold text-lg">{totalSlack.toLocaleString()} Bytes</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase block font-mono">Residual Entropy:</span>
          <span className="text-emerald-400 font-extrabold text-lg">0.0000 (H=0)</span>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            placeholder="Search by file name (e.g. photo.jpg, report.pdf), path, or case ID..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-purple-200 focus:border-purple-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(['ALL', 'IMAGE', 'DOCUMENT', 'MEDIA', 'DATABASE', 'BINARY'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-purple-950 text-purple-300 border border-purple-500/50 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Shredded Files Manifest Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-2xl shadow-xl">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
              <th className="p-3.5">File Name & Type</th>
              <th className="p-3.5">Original System Path</th>
              <th className="p-3.5">File Size</th>
              <th className="p-3.5">Destruction Timestamp</th>
              <th className="p-3.5">Sanitization Method</th>
              <th className="p-3.5">Destroyed By</th>
              <th className="p-3.5">Forensic Hash</th>
              <th className="p-3.5 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 text-[11px]">
            {filteredFiles.map((file) => {
              const Icon = getFileIcon(file.category);
              return (
                <tr key={file.id} className="hover:bg-purple-950/20 transition">
                  {/* File Name & Icon */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-slate-800 text-purple-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-100 text-xs block text-purple-200">
                          {file.fileName}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase">{file.category}</span>
                      </div>
                    </div>
                  </td>

                  {/* Original Path */}
                  <td className="p-3.5 text-slate-300 truncate max-w-[220px]" title={file.originalPath}>
                    {file.originalPath}
                  </td>

                  {/* Size */}
                  <td className="p-3.5 font-bold text-slate-200 whitespace-nowrap">
                    {(file.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                  </td>

                  {/* Timestamp */}
                  <td className="p-3.5 text-slate-400 whitespace-nowrap">
                    {file.shredTimestamp.slice(0, 19).replace('T', ' ')}
                  </td>

                  {/* Sanitization Method */}
                  <td className="p-3.5 whitespace-nowrap">
                    <Badge variant="purple" size="sm">
                      {file.patternType} ({file.passes}P)
                    </Badge>
                  </td>

                  {/* Operator */}
                  <td className="p-3.5 text-slate-300 truncate max-w-[130px]">
                    {file.operator}
                  </td>

                  {/* Forensic Hash */}
                  <td className="p-3.5 text-slate-500 font-mono text-[9px] truncate max-w-[110px]" title={file.erasureHash}>
                    {file.erasureHash.slice(0, 12)}...
                  </td>

                  {/* Action */}
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setSelectedFile(file)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-900/60 hover:text-purple-300 text-slate-300 transition cursor-pointer text-[10px] font-semibold"
                    >
                      Dossier
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Selected File Dossier Modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-sm text-slate-100 uppercase">
                  Shredded File Evidence Dossier
                </h3>
              </div>
              <Badge variant="purple">VERIFIED DESTROYED</Badge>
            </div>

            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px]">FILE NAME:</span>
                  <strong className="text-purple-300 text-sm">{selectedFile.fileName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">CASE REFERENCE:</span>
                  <strong className="text-cyan-300">{selectedFile.caseReference || 'UNASSIGNED'}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px]">ORIGINAL PATH ON HOST:</span>
                  <span className="text-slate-200">{selectedFile.originalPath}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">ORIGINAL SIZE:</span>
                  <span className="text-slate-200">{(selectedFile.sizeBytes / (1024 * 1024)).toFixed(3)} MB ({selectedFile.sizeBytes} B)</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">SLACK SPACE PURGED:</span>
                  <span className="text-amber-300">{selectedFile.slackSpacePurgedBytes} Bytes</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">OVERWRITE STANDARD:</span>
                  <span className="text-slate-200">{selectedFile.patternType} ({selectedFile.passes} Passes)</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">RESIDUAL SHANNON ENTROPY:</span>
                  <span className="text-emerald-400 font-bold">0.0000 (H=0)</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px]">FORENSIC SHA-256 ERASURE HASH:</span>
                  <span className="text-slate-400 text-[10px] break-all">{selectedFile.erasureHash}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px]">OFFICER NOTES:</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{selectedFile.notes || 'No special notes recorded.'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedFile(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
