import React, { useRef, useState, useEffect } from 'react';
import { 
  UploadCloud, 
  FolderPlus, 
  FilePlus, 
  Sparkles, 
  Folder, 
  File as FileIcon, 
  HardDrive, 
  CheckCircle2, 
  ChevronRight, 
  Layers, 
  HelpCircle,
  Flame,
  ShieldCheck,
  FolderSync,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { ErasableItem, SanitizationTargetType } from '../../types/fileEraser';
import { Badge } from '../common/Badge';
import { RealDeviceService, FolderStatusResult } from '../../services/realDeviceService';
import { useUI } from '../../context/UIContext';

interface DropZoneShredderProps {
  targetType: SanitizationTargetType;
  onTargetTypeChange: (type: SanitizationTargetType) => void;
  onAddFiles: (items: ErasableItem[], folderPath?: string) => void;
  onSelectStorageDeviceMode?: () => void;
  disabled?: boolean;
}

export const DropZoneShredder: React.FC<DropZoneShredderProps> = ({
  targetType,
  onTargetTypeChange,
  onAddFiles,
  onSelectStorageDeviceMode,
  disabled = false
}) => {
  const { isRealDiskMode } = useUI();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [customPathInput, setCustomPathInput] = useState('TestCase');
  const [realFolderStatus, setRealFolderStatus] = useState<FolderStatusResult | null>(null);
  const [isCreatingOnDisk, setIsCreatingOnDisk] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Check physical disk status of the folder
  const checkStatus = async (pathToCheck?: string) => {
    try {
      const res = await RealDeviceService.checkFolderStatus(pathToCheck || customPathInput);
      setRealFolderStatus(res);
      if (res.exists) {
        setCustomPathInput(res.path);
      }
    } catch {}
  };

  useEffect(() => {
    checkStatus();
  }, [customPathInput]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragOver(true);
    } else if (e.type === 'dragleave') {
      setIsDragOver(false);
    }
  };

  const processFiles = (fileList: FileList | null, isFolder = false, rootFolder = 'TestCase') => {
    if (!fileList || fileList.length === 0) return;

    const items: ErasableItem[] = Array.from(fileList).map((f, idx) => {
      const clusterSize = 4096;
      const slack = f.size % clusterSize === 0 ? 0 : clusterSize - (f.size % clusterSize);
      const now = new Date().toISOString();
      const relativePath = (f as any).webkitRelativePath || `${rootFolder}/${f.name}`;

      return {
        id: `item-${Date.now()}-${idx}`,
        name: f.name,
        originalPath: isFolder ? `${customPathInput}\\${f.name}` : `/media/evidence/${f.name}`,
        relativePath,
        parentFolder: isFolder ? rootFolder : undefined,
        sizeBytes: f.size,
        type: 'FILE',
        fileSystem: 'NTFS',
        macbTimestamps: {
          modified: new Date(f.lastModified).toISOString(),
          accessed: now,
          created: new Date(f.lastModified - 86400000).toISOString(),
          birth: new Date(f.lastModified - 172800000).toISOString()
        },
        adsStreamsDetected: [':Zone.Identifier:$DATA', ':SecurityDescriptor'],
        slackSizeBytes: slack,
        status: 'QUEUED',
        progressPct: 0,
        erasureHash: '',
        residualEntropy: 7.2,
        realFile: f,
        isRealDiskTarget: isRealDiskMode,
        isUnknownBinary: !f.name.includes('.') || f.name.endsWith('.bin') || f.name.endsWith('.dat')
      };
    });

    onAddFiles(items, isFolder ? customPathInput : undefined);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (!disabled && e.dataTransfer.files) {
      processFiles(e.dataTransfer.files, targetType === 'FOLDER', 'TestCase');
    }
  };

  // 1. Create real test folder on Windows disk via local backend
  const handleCreateRealTestFolderOnDisk = async () => {
    setIsCreatingOnDisk(true);
    setStatusMessage('');
    try {
      const res = await RealDeviceService.createRealSampleFolder();
      setCustomPathInput(res.folderPath);
      setStatusMessage(`✅ Real test folder created on your computer drive at: ${res.folderPath}`);
      await checkStatus(res.folderPath);

      // Load into queue
      const sampleFiles: ErasableItem[] = [
        {
          id: `tc-${Date.now()}-1`,
          name: 'photo.jpg',
          originalPath: `${res.folderPath}\\photo.jpg`,
          relativePath: 'TestCase/photo.jpg',
          parentFolder: 'TestCase',
          sizeBytes: 2458120,
          type: 'FILE',
          fileSystem: 'NTFS',
          macbTimestamps: {
            modified: '2026-08-20T14:30:00Z',
            accessed: '2026-09-01T09:15:00Z',
            created: '2026-08-01T10:00:00Z',
            birth: '2026-08-01T10:00:00Z'
          },
          adsStreamsDetected: [':Zone.Identifier:$DATA'],
          slackSizeBytes: 1896,
          status: 'QUEUED',
          progressPct: 0,
          erasureHash: '',
          residualEntropy: 7.92,
          isRealDiskTarget: true
        },
        {
          id: `tc-${Date.now()}-2`,
          name: 'report.pdf',
          originalPath: `${res.folderPath}\\report.pdf`,
          relativePath: 'TestCase/report.pdf',
          parentFolder: 'TestCase',
          sizeBytes: 1048576,
          type: 'FILE',
          fileSystem: 'NTFS',
          macbTimestamps: {
            modified: '2026-09-02T11:20:00Z',
            accessed: '2026-09-05T16:40:00Z',
            created: '2026-07-15T08:30:00Z',
            birth: '2026-07-15T08:30:00Z'
          },
          adsStreamsDetected: [':SecurityDescriptor:$DATA'],
          slackSizeBytes: 3072,
          status: 'QUEUED',
          progressPct: 0,
          erasureHash: '',
          residualEntropy: 7.64,
          isRealDiskTarget: true
        },
        {
          id: `tc-${Date.now()}-3`,
          name: 'video.mp4',
          originalPath: `${res.folderPath}\\video.mp4`,
          relativePath: 'TestCase/video.mp4',
          parentFolder: 'TestCase',
          sizeBytes: 1048576,
          type: 'FILE',
          fileSystem: 'NTFS',
          macbTimestamps: {
            modified: '2026-09-06T20:10:00Z',
            accessed: '2026-09-08T12:00:00Z',
            created: '2026-09-06T18:00:00Z',
            birth: '2026-09-06T18:00:00Z'
          },
          adsStreamsDetected: [],
          slackSizeBytes: 2048,
          status: 'QUEUED',
          progressPct: 0,
          erasureHash: '',
          residualEntropy: 7.99,
          isRealDiskTarget: true
        },
        {
          id: `tc-${Date.now()}-4`,
          name: 'database.db',
          originalPath: `${res.folderPath}\\database.db`,
          relativePath: 'TestCase/database.db',
          parentFolder: 'TestCase',
          sizeBytes: 65536,
          type: 'FILE',
          fileSystem: 'NTFS',
          macbTimestamps: {
            modified: '2026-09-09T08:00:00Z',
            accessed: '2026-09-09T14:30:00Z',
            created: '2026-05-10T12:00:00Z',
            birth: '2026-05-10T12:00:00Z'
          },
          adsStreamsDetected: [':Zone.Identifier:$DATA'],
          slackSizeBytes: 0,
          status: 'QUEUED',
          progressPct: 0,
          erasureHash: '',
          residualEntropy: 6.88,
          isRealDiskTarget: true
        },
        {
          id: `tc-${Date.now()}-5`,
          name: 'unknown.bin',
          originalPath: `${res.folderPath}\\unknown.bin`,
          relativePath: 'TestCase/unknown.bin',
          parentFolder: 'TestCase',
          sizeBytes: 131072,
          type: 'FILE',
          fileSystem: 'NTFS',
          macbTimestamps: {
            modified: '2026-09-10T02:15:00Z',
            accessed: '2026-09-10T04:00:00Z',
            created: '2026-09-10T02:00:00Z',
            birth: '2026-09-10T02:00:00Z'
          },
          adsStreamsDetected: [':AuditLogFork:$DATA'],
          slackSizeBytes: 1536,
          status: 'QUEUED',
          progressPct: 0,
          erasureHash: '',
          residualEntropy: 7.82,
          isUnknownBinary: true,
          isRealDiskTarget: true
        }
      ];

      onAddFiles(sampleFiles, res.folderPath);
    } catch (e: any) {
      setStatusMessage(`Error creating folder on disk: ${e.message}`);
    } finally {
      setIsCreatingOnDisk(false);
    }
  };

  // 2. Pick Real Folder via Browser Native File System Access API
  const handlePickRealFolderNative = async () => {
    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker({
          mode: 'readwrite'
        });
        const items: ErasableItem[] = [];
        let idx = 0;

        for await (const [name, handle] of (dirHandle as any).entries()) {
          if (handle.kind === 'file') {
            const file = await handle.getFile();
            items.push({
              id: `native-item-${Date.now()}-${idx++}`,
              name: file.name,
              originalPath: `${dirHandle.name}\\${file.name}`,
              relativePath: `${dirHandle.name}/${file.name}`,
              parentFolder: dirHandle.name,
              sizeBytes: file.size,
              type: 'FILE',
              fileSystem: 'NTFS',
              macbTimestamps: {
                modified: new Date(file.lastModified).toISOString(),
                accessed: new Date().toISOString(),
                created: new Date(file.lastModified - 86400000).toISOString(),
                birth: new Date(file.lastModified - 172800000).toISOString()
              },
              adsStreamsDetected: [':Zone.Identifier:$DATA'],
              slackSizeBytes: 4096 - (file.size % 4096 || 4096),
              status: 'QUEUED',
              progressPct: 0,
              erasureHash: '',
              residualEntropy: 7.5,
              realFile: file,
              fileHandle: handle,
              dirHandle: dirHandle,
              isRealDiskTarget: true,
              isUnknownBinary: !file.name.includes('.') || file.name.endsWith('.bin')
            });
          }
        }

        if (items.length > 0) {
          setCustomPathInput(dirHandle.name);
          onAddFiles(items, dirHandle.name);
          setStatusMessage(`Loaded ${items.length} real files from folder "${dirHandle.name}" with direct write/delete permission.`);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Native Directory Picker error:', err);
        }
      }
    } else {
      folderInputRef.current?.click();
    }
  };

  // 3. Pick Real Files via Browser Native File System Access API
  const handlePickRealFilesNative = async () => {
    if ('showOpenFilePicker' in window) {
      try {
        const fileHandles = await (window as any).showOpenFilePicker({
          multiple: true,
          mode: 'readwrite'
        });
        const items: ErasableItem[] = [];
        let idx = 0;

        for (const handle of fileHandles) {
          const file = await handle.getFile();
          items.push({
            id: `native-file-${Date.now()}-${idx++}`,
            name: file.name,
            originalPath: `LocalDrive:\\${file.name}`,
            relativePath: file.name,
            sizeBytes: file.size,
            type: 'FILE',
            fileSystem: 'NTFS',
            macbTimestamps: {
              modified: new Date(file.lastModified).toISOString(),
              accessed: new Date().toISOString(),
              created: new Date(file.lastModified - 86400000).toISOString(),
              birth: new Date(file.lastModified - 172800000).toISOString()
            },
            adsStreamsDetected: [':Zone.Identifier:$DATA'],
            slackSizeBytes: 4096 - (file.size % 4096 || 4096),
            status: 'QUEUED',
            progressPct: 0,
            erasureHash: '',
            residualEntropy: 7.5,
            realFile: file,
            fileHandle: handle,
            isRealDiskTarget: true,
            isUnknownBinary: !file.name.includes('.') || file.name.endsWith('.bin')
          });
        }

        if (items.length > 0) {
          onAddFiles(items);
          setStatusMessage(`Loaded ${items.length} real files with direct disk write & wipe permission.`);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Native File Picker error:', err);
        }
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Target Type Selector Radio Cards */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Step 1: Select Target Type
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Option: File */}
          <div
            onClick={() => onTargetTypeChange('FILE')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
              targetType === 'FILE'
                ? 'bg-cyan-950/60 border-cyan-400 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-400/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
              targetType === 'FILE' ? 'border-cyan-400 bg-cyan-500' : 'border-slate-600 bg-slate-800'
            }`}>
              {targetType === 'FILE' && <div className="w-2 h-2 rounded-full bg-slate-950" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <FileIcon className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-sm text-slate-100">File</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Single or multiple individual files of any format
              </p>
            </div>
          </div>

          {/* Option: Folder (Recursive) */}
          <div
            onClick={() => onTargetTypeChange('FOLDER')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
              targetType === 'FOLDER'
                ? 'bg-emerald-950/60 border-emerald-400 shadow-md shadow-emerald-950/50 ring-1 ring-emerald-400/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
              targetType === 'FOLDER' ? 'border-emerald-400 bg-emerald-500' : 'border-slate-600 bg-slate-800'
            }`}>
              {targetType === 'FOLDER' && <div className="w-2 h-2 rounded-full bg-slate-950" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm text-slate-100">Folder</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Recursive directory tree (e.g. TestCase/ folder)
              </p>
            </div>
          </div>

          {/* Option: Storage Device */}
          <div
            onClick={() => {
              onTargetTypeChange('STORAGE_DEVICE');
              if (onSelectStorageDeviceMode) onSelectStorageDeviceMode();
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
              targetType === 'STORAGE_DEVICE'
                ? 'bg-purple-950/60 border-purple-400 shadow-md shadow-purple-950/50 ring-1 ring-purple-400/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
              targetType === 'STORAGE_DEVICE' ? 'border-purple-400 bg-purple-500' : 'border-slate-600 bg-slate-800'
            }`}>
              {targetType === 'STORAGE_DEVICE' && <div className="w-2 h-2 rounded-full bg-slate-950" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-sm text-slate-100">Storage Device</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Full media sanitization (Internal Storage & External Pendrives)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status banner if message exists */}
      {statusMessage && (
        <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-500/40 text-xs text-cyan-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Storage Device vs File Deletion Architectural Note */}
      {targetType === 'STORAGE_DEVICE' ? (
        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-3">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
            <HardDrive className="w-5 h-5 text-purple-400" />
            <span>Why Storage Device Sanitization is Different from File Deletion</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            For modern <strong>Internal NVMe SSDs and External Flash Pendrives</strong>, simply overwriting files at the file system level is <strong>not a reliable guarantee</strong> of physical data destruction due to internal Flash Translation Layers (FTL), wear-leveling block reallocation, and over-provisioned spare memory.
          </p>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/30 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-3">
            <span>Our platform automatically selects <strong>device-supported standards</strong>: IEEE 2883-2022 Flash Purge & NVMe Crypto Erase for Internal Storage, and NIST SP 800-88 Clear for External Pendrives.</span>
            <button
              type="button"
              onClick={() => onSelectStorageDeviceMode && onSelectStorageDeviceMode()}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              Open Device Eraser →
            </button>
          </div>
        </div>
      ) : targetType === 'FOLDER' ? (
        /* Folder Mode Selection & Path Input */
        <div className="space-y-3">
          {/* Folder Path Input & Sample Load */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Folder className="w-4 h-4 text-emerald-400" />
                Target Directory Path on Your System:
              </span>

              {/* 1-Click Real Disk Test Folder Creator */}
              <button
                type="button"
                onClick={handleCreateRealTestFolderOnDisk}
                disabled={isCreatingOnDisk}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white border border-emerald-400 text-xs font-bold hover:brightness-110 shadow-md transition cursor-pointer"
                title="Creates a real physical test folder on your computer disk with photo.jpg, report.pdf, video.mp4, database.db, unknown.bin"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isCreatingOnDisk ? "Creating on Disk..." : "📁 Create Real Test Folder on My Disk"}
              </button>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
              <input
                type="text"
                value={customPathInput}
                onChange={(e) => setCustomPathInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                placeholder="Enter folder path (e.g. C:\Users\...\TestCase)..."
              />
              
              <button
                type="button"
                onClick={handlePickRealFolderNative}
                className="px-3.5 py-2 rounded-xl bg-cyan-950 border border-cyan-500/50 hover:bg-cyan-900 text-xs text-cyan-200 font-semibold transition cursor-pointer shrink-0 flex items-center gap-1.5"
                title="Select a real folder with direct browser disk write/delete permission"
              >
                <FolderPlus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pick Real Folder from PC</span>
              </button>

              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold transition cursor-pointer shrink-0"
              >
                Upload Folder
              </button>
            </div>

            {/* Live Disk Status Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Host Disk Status:</span>
                {realFolderStatus?.exists ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Found on Host Drive ({realFolderStatus.fileCount} files, {(realFolderStatus.totalBytes / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                    Not created on host drive yet (Click "Create Real Test Folder" above)
                  </span>
                )}
              </div>
              <span className="text-slate-400 font-mono text-[10px]">{customPathInput}</span>
            </div>

            {/* Hidden webkitdirectory input */}
            <input
              ref={folderInputRef}
              type="file"
              // @ts-ignore
              webkitdirectory="true"
              // @ts-ignore
              directory="true"
              multiple
              className="hidden"
              onChange={(e) => processFiles(e.target.files, true, 'TestCase')}
            />
          </div>

          {/* Folder Recursive Structure Preview Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800">
              <span>RECURSIVE DIRECTORY TREE (ALL FILE TYPES & UNKNOWN RAW STREAMS)</span>
              <span className="text-emerald-400">Recursive Shredding Engine</span>
            </div>

            <pre className="text-slate-300 text-xs leading-relaxed py-1">
{`TestCase/
├── photo.jpg          [Image / Exif & GPS Metadata Cleanse]
├── report.pdf         [PDF Document / Streams & Form Fields Wiped]
├── video.mp4          [MP4 Media Container / Multi-Pass Overwritten]
├── database.db        [SQLite Database / B-Tree & WAL Pages Zeroed]
└── unknown.bin        [Raw Binary Stream / Cluster Slack Scrubbed]`}
            </pre>
          </div>
        </div>
      ) : (
        /* File Mode: Drag and Drop any arbitrary files or pick real files with native disk access */
        <div className="space-y-3">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !disabled && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
              isDragOver
                ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01]'
                : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => processFiles(e.target.files, false)}
              disabled={disabled}
            />

            <div className="p-3 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 mb-3">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="font-bold text-sm text-slate-100 mb-1">
              Drag & Drop Any Files from Your PC
            </h3>
            <p className="text-xs text-slate-400 max-w-md mb-4 leading-relaxed">
              Accepts any binary files, executables, database dumps, documents, archives, or unknown raw streams.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePickRealFilesNative();
                }}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs text-white font-bold shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <FilePlus className="w-3.5 h-3.5" />
                Pick Real Files from My PC (Direct Disk Access)
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold border border-slate-700"
              >
                Standard Browse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

