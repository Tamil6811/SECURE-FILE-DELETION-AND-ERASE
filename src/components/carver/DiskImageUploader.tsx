import React from 'react';
import { TEST_PRESETS } from '../../services/testImagesGenerator';
import { HardDrive, UploadCloud, Sparkles, FolderArchive, FileSearch, Camera, FileText, CheckCircle2 } from 'lucide-react';
import { Badge } from '../common/Badge';
import { useUI } from '../../context/UIContext';

interface DiskImageUploaderProps {
  selectedPresetId: string;
  onSelectPreset: (presetId: string) => void;
  onCustomImageUpload: (file: File) => void;
  isScanning: boolean;
}

export const DiskImageUploader: React.FC<DiskImageUploaderProps> = ({
  selectedPresetId,
  onSelectPreset,
  onCustomImageUpload,
  isScanning
}) => {
  const { isSimpleMode } = useUI();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCustomImageUpload(file);
    }
  };

  const getFriendlyPresetName = (id: string, name: string) => {
    if (!isSimpleMode) return name;
    if (id === 'formatted_usb') return 'Formatted USB Pendrive (Photos & Documents)';
    if (id === 'corrupted_ntfs') return 'Damaged Drive (SQLite Database & Notes)';
    if (id === 'bifragment_sd') return 'Fragmented USB Pendrive (Split Photos)';
    if (id === 'partial_residual') return 'Partially Wiped Internal Storage (Residual Leak Audit)';
    return name;
  };

  const getFriendlyDescription = (id: string, desc: string) => {
    if (!isSimpleMode) return desc;
    if (id === 'formatted_usb') return 'Simulates an accidentally formatted USB drive containing deleted photos and PDF documents.';
    if (id === 'corrupted_ntfs') return 'Simulates a damaged file system with intact customer database records and notes.';
    if (id === 'bifragment_sd') return 'Simulates a fragmented USB pen drive where photos are split across different sectors.';
    if (id === 'partial_residual') return 'Simulates internal storage wiped incompletely by legacy single-pass tools.';
    return desc;
  };

  return (
    <div className="space-y-4 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-cyan-400" />
          {isSimpleMode ? "Step 1: Choose a Sample Damaged Drive to Test" : "Select Target Forensic Media / Disk Image for Evidence Carving"}
        </label>
        
        {/* Custom Upload button */}
        <label className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 text-xs font-semibold transition cursor-pointer">
          <UploadCloud className="w-4 h-4 text-cyan-400" />
          <span>Upload Custom Disk Image</span>
          <input 
            type="file" 
            className="hidden" 
            onChange={handleFileChange}
            disabled={isScanning}
          />
        </label>
      </div>

      {/* Preset Scenarios Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {TEST_PRESETS.map((p) => {
          const isSelected = selectedPresetId === p.id;

          return (
            <div
              key={p.id}
              onClick={() => !isScanning && onSelectPreset(p.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-purple-950/50 border-purple-400 shadow-lg shadow-purple-950/60 ring-1 ring-purple-400/40'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              } ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={p.scenarioType === 'BIFRAGMENT_MEDIA' ? 'rose' : p.scenarioType === 'FORMATTED_USB' ? 'cyan' : 'purple'}>
                    {isSimpleMode ? (p.scenarioType === 'FORMATTED_USB' ? 'QUICK TEST' : 'CHALLENGE') : p.scenarioType.replace('_', ' ')}
                  </Badge>
                  <span className="text-[11px] text-cyan-400 font-mono">
                    {(p.totalSizeBytes / 1024).toFixed(0)} KB
                  </span>
                </div>

                <h3 className="font-bold text-xs text-slate-100 mb-1 leading-snug">
                  {getFriendlyPresetName(p.id, p.name)}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                  {getFriendlyDescription(p.id, p.description)}
                </p>
              </div>

              <div className="pt-2.5 border-t border-slate-800/80 text-xs text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Target Files:</span>
                  <span className="text-emerald-400 font-bold">{p.fileCount} Hidden Files</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
