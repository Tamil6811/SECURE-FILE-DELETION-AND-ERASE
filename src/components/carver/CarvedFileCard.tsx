import React from 'react';
import { CarvedFile } from '../../types/carver';
import { FileText, Image as ImageIcon, Download, Binary, Eye, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '../common/Badge';
import { useUI } from '../../context/UIContext';

interface CarvedFileCardProps {
  file: CarvedFile;
  onPreview: (file: CarvedFile) => void;
  onHexInspect: (file: CarvedFile) => void;
  onRestore?: (file: CarvedFile) => void;
}

export const CarvedFileCard: React.FC<CarvedFileCardProps> = ({
  file,
  onPreview,
  onHexInspect,
  onRestore
}) => {
  const { isSimpleMode } = useUI();

  const getCategoryIcon = () => {
    switch (file.category) {
      case 'IMAGE': return <ImageIcon className="w-5 h-5 text-cyan-400" />;
      case 'DOCUMENT': return <FileText className="w-5 h-5 text-emerald-400" />;
      case 'DATABASE': return <Database className="w-5 h-5 text-purple-400" />;
      default: return <Binary className="w-5 h-5 text-amber-400" />;
    }
  };

  const handleDownloadSingle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = new Blob([file.rawData as unknown as BlobPart], { type: file.mimeType || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 transition-all duration-150 flex flex-col justify-between space-y-3 font-sans shadow-md">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-slate-800">
              {getCategoryIcon()}
            </div>
            <span className="font-bold text-xs text-slate-100 truncate">{file.name}</span>
          </div>
          <Badge variant={file.confidenceScore >= 80 ? 'emerald' : 'amber'}>
            {isSimpleMode 
              ? (file.confidenceScore >= 80 ? '🟢 100% Intact' : '🟡 Partial') 
              : `${file.confidenceScore}%`}
          </Badge>
        </div>

        {/* Source & Recovery State Distinction */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          {file.recoveryState === 'CONTENT_RECOVERED' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/50">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              FILE CONTENT RECOVERED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/50">
              <AlertCircle className="w-3 h-3 text-amber-400" />
              RECYCLE BIN METADATA FOUND
            </span>
          )}

          {file.source === 'USB_PENDRIVE' || file.carvingTechnique?.toLowerCase().includes('usb') || file.originalLocation?.toLowerCase().includes('usb') || file.originalLocation?.toLowerCase().startsWith('e:') ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-500/40">
              💾 USB Pendrive
            </span>
          ) : file.source === 'RECYCLE_BIN' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-950/70 text-purple-300 border border-purple-500/40">
              🗑️ $Recycle.Bin
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              📁 NTFS Local
            </span>
          )}

          {file.ntfsRecord && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              MFT #{file.ntfsRecord.recordNumber}
            </span>
          )}
        </div>

        {/* Thumbnail Preview for Images */}
        {file.category === 'IMAGE' && (
          <div 
            onClick={() => onPreview(file)}
            className="w-full h-28 rounded-xl bg-slate-950 border border-slate-800/80 overflow-hidden mb-2 cursor-pointer flex items-center justify-center group relative"
          >
            {file.previewUrl ? (
              <img 
                src={file.previewUrl} 
                alt={file.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-cyan-400 transition">
                <ImageIcon className="w-8 h-8 mb-1 opacity-70 group-hover:scale-110 transition" />
                <span className="text-[10px] font-semibold">Click to Load Preview</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition">
              Click to View Full Size
            </div>
          </div>
        )}

        {/* File Details */}
        <div className="space-y-1 text-xs text-slate-400">
          <div className="flex justify-between">
            <span>Size:</span>
            <span className="text-slate-200 font-semibold">{(file.sizeBytes / 1024).toFixed(1)} KB</span>
          </div>
          <div className="flex justify-between">
            <span>Type:</span>
            <span className="text-cyan-300 font-medium">{file.extension.toUpperCase()} {file.category}</span>
          </div>
          {file.originalLocation && (
            <div className="flex justify-between text-[11px] truncate">
              <span>Deleted From:</span>
              <span className="text-slate-300 truncate max-w-[150px]" title={file.originalLocation}>{file.originalLocation}</span>
            </div>
          )}
          {file.dateDeleted && (
            <div className="flex justify-between text-[10px] text-amber-300/90 font-medium">
              <span>Deleted On:</span>
              <span>{file.dateDeleted}</span>
            </div>
          )}
          {file.originalPath && !file.originalLocation && (
            <div className="flex justify-between text-[11px] truncate">
              <span>Original Path:</span>
              <span className="text-slate-300 truncate max-w-[140px]" title={file.originalPath}>{file.originalPath}</span>
            </div>
          )}
          {file.modifyDate && !file.dateDeleted && (
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Modified:</span>
              <span>{new Date(file.modifyDate).toLocaleDateString()}</span>
            </div>
          )}
          {file.ntfsRecord && (
            <div className="flex justify-between text-[10px] text-slate-400 font-mono border-t border-slate-800/60 pt-1 mt-1">
              <span>NTFS Record:</span>
              <span className="text-cyan-300">MFT #{file.ntfsRecord.recordNumber} • {file.ntfsRecord.status}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 flex-1">
          <button
            onClick={() => onPreview(file)}
            className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-950/80 text-cyan-300 hover:bg-cyan-900 border border-cyan-500/40 text-xs font-semibold transition cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View</span>
          </button>

          {!isSimpleMode && (
            <button
              onClick={() => onHexInspect(file)}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition cursor-pointer"
              title="Inspect in Hex Workbench"
            >
              <Binary className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {onRestore && file.canRestore && (
          <button
            onClick={() => onRestore(file)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-950 text-purple-300 border border-purple-500/40 hover:bg-purple-900 text-xs font-semibold transition cursor-pointer"
            title="Restore to Computer Folder"
          >
            <span>Restore</span>
          </button>
        )}

        <button
          onClick={handleDownloadSingle}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900 text-xs font-semibold transition cursor-pointer"
          title="Download File"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Save</span>
        </button>
      </div>
    </div>
  );
};
