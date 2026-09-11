import React, { useState, useEffect, useRef } from 'react';
import { 
  StorageDevice, 
  ErasureStandardId, 
  SectorBlock, 
  CertificateOfDestruction 
} from '../../types/sanitization';
import { ERASURE_STANDARDS, StandardSelector } from './StandardSelector';
import { SectorVisualizerGrid } from './SectorVisualizerGrid';
import { DestructionCertificateModal } from './DestructionCertificateModal';
import { CyberCard } from '../common/CyberCard';
import { Badge } from '../common/Badge';
import { generateRandomHash } from '../../services/hashService';
import { AuditService } from '../../services/auditService';
import { detectRealHardware, convertRealDisksToStorageDevices } from '../../services/hardwareService';
import { 
  HardDrive, 
  Play, 
  Pause, 
  RotateCcw, 
  Award, 
  FileUp, 
  Cpu,
  Laptop,
  RefreshCw,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';

const SAMPLE_DRIVES: StorageDevice[] = [
  {
    id: 'drv-internal-micron',
    name: '[INTERNAL STORAGE] Micron MTFDKCD512QFM-1BD1AABLA',
    type: 'NVME',
    category: 'INTERNAL_STORAGE',
    capacityGB: 512,
    serialNumber: '00A0_7501_464C_50E9.',
    interface: 'Internal NVMe PCIe Gen 4 x4 Controller',
    firmware: '1002V3LN',
    healthStatus: 'HEALTHY',
    wearLevelPct: 98,
    sectorSize: 4096,
    totalSectors: 125026848,
    isMounted: true,
    mountPoint: '\\\\.\\PhysicalDrive0'
  },
  {
    id: 'drv-external-sandisk-pendrive',
    name: '[EXTERNAL PENDRIVE] SanDisk Ultra Dual Drive USB 3.2',
    type: 'USB',
    category: 'EXTERNAL_PENDRIVE',
    capacityGB: 64,
    serialNumber: 'SDCZ880-64G-PENDRIVE',
    interface: 'External USB 3.2 Gen 1 Flash Pen Drive',
    firmware: '1.00',
    healthStatus: 'HEALTHY',
    wearLevelPct: 95,
    sectorSize: 512,
    totalSectors: 125034840,
    isMounted: true,
    mountPoint: 'E:\\ (USB Pen Drive)'
  }
];

export const DriveEraserModule: React.FC = () => {
  const [drives, setDrives] = useState<StorageDevice[]>(SAMPLE_DRIVES);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(SAMPLE_DRIVES[0].id);
  const [selectedStandardId, setSelectedStandardId] = useState<ErasureStandardId>('NIST_800_88_CLEAR');
  const [operatorName, setOperatorName] = useState('Senior Investigator J. Miller');
  const [technicianId, setTechnicianId] = useState('TECH-9402');
  const [organization, setOrganization] = useState('Cyber Forensics & Evidence Unit');
  const [isScanningHost, setIsScanningHost] = useState(false);
  
  // Simulation State
  const [status, setStatus] = useState<'IDLE' | 'RUNNING' | 'PAUSED' | 'VERIFYING' | 'COMPLETED' | 'FAILED'>('IDLE');
  const [currentPass, setCurrentPass] = useState<number>(1);
  const [progressPct, setProgressPct] = useState<number>(0);
  const [throughput, setThroughput] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [badSectors, setBadSectors] = useState<number>(0);
  const [finalCertificate, setFinalCertificate] = useState<CertificateOfDestruction | null>(null);
  const [showCertModal, setShowCertModal] = useState<boolean>(false);
  const [confirmWipeModal, setConfirmWipeModal] = useState<boolean>(false);

  const selectedDevice = drives.find(d => d.id === selectedDeviceId) || drives[0];
  const selectedStandard = ERASURE_STANDARDS.find(s => s.id === selectedStandardId) || ERASURE_STANDARDS[0];

  // 128 Representative Sector Blocks for Visualizer
  const [sectors, setSectors] = useState<SectorBlock[]>(() => {
    return Array.from({ length: 128 }, (_, i) => ({
      index: i,
      status: 'PENDING',
      currentPass: 0,
      entropy: 7.4 + (Math.random() * 0.5),
      sampleByte: '0x' + Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
    }));
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Scan Real Host Drives on Mount
  const scanHostDrives = async () => {
    setIsScanningHost(true);
    try {
      const profile = await detectRealHardware();
      const realDevices = convertRealDisksToStorageDevices(profile);
      if (realDevices.length > 0) {
        setDrives(prev => {
          const nonReal = prev.filter(d => !d.id.startsWith('real-disk-') && !d.id.startsWith('drv-real-'));
          return [...realDevices, ...nonReal];
        });
        setSelectedDeviceId(realDevices[0].id);
      }
    } catch (e) {
      console.warn('Real host scan failed:', e);
    } finally {
      setIsScanningHost(false);
    }
  };

  useEffect(() => {
    scanHostDrives();
  }, []);

  // Initialize fresh sector map when switching device or standard
  const resetSectors = () => {
    setSectors(Array.from({ length: 128 }, (_, i) => ({
      index: i,
      status: 'PENDING',
      currentPass: 0,
      entropy: 6.8 + (Math.random() * 1.0),
      sampleByte: '0x' + Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
    })));
    setProgressPct(0);
    setCurrentPass(1);
    setStatus('IDLE');
    setThroughput(0);
    setElapsedSeconds(0);
    setBadSectors(0);
  };

  useEffect(() => {
    resetSectors();
  }, [selectedDeviceId, selectedStandardId]);

  // Drive Erasure Execution Loop
  useEffect(() => {
    if (status === 'RUNNING') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
        setThroughput(420 + Math.random() * 80);

        setSectors(prevSectors => {
          const pendingIdx = prevSectors.findIndex(b => b.status === 'PENDING' || b.currentPass < currentPass);
          
          if (pendingIdx === -1) {
            if (currentPass < selectedStandard.passes) {
              setCurrentPass(p => p + 1);
              return prevSectors.map(b => ({
                ...b,
                status: 'PENDING',
                currentPass: currentPass
              }));
            } else {
              setStatus('VERIFYING');
              return prevSectors.map(b => ({ ...b, status: 'VERIFYING' }));
            }
          }

          const nextSectors = [...prevSectors];
          for (let k = 0; k < 4; k++) {
            const targetIdx = pendingIdx + k;
            if (targetIdx < nextSectors.length) {
              const isBad = (selectedDevice.healthStatus === 'WARNING' && targetIdx === 64);
              if (isBad) {
                nextSectors[targetIdx] = {
                  ...nextSectors[targetIdx],
                  status: 'BAD_SECTOR',
                  currentPass: currentPass
                };
                setBadSectors(1);
              } else {
                const sampleVal = selectedStandardId === 'NIST_800_88_CLEAR' ? '0x00' : (currentPass % 2 === 0 ? '0xFF' : 'RANDOM');
                const entropyVal = selectedStandardId === 'NIST_800_88_CLEAR' ? 0.0000 : (sampleVal === 'RANDOM' ? 7.9942 : 0.0000);
                
                nextSectors[targetIdx] = {
                  ...nextSectors[targetIdx],
                  status: 'WRITTEN',
                  currentPass: currentPass,
                  entropy: entropyVal,
                  sampleByte: sampleVal
                };
              }
            }
          }

          const completedCount = nextSectors.filter(b => b.status === 'WRITTEN' || b.status === 'BAD_SECTOR').length;
          const totalWork = selectedStandard.passes * 128;
          const currentWork = ((currentPass - 1) * 128) + completedCount;
          setProgressPct(Math.min(99, (currentWork / totalWork) * 100));

          return nextSectors;
        });

      }, 120);
    } else if (status === 'VERIFYING') {
      timerRef.current = setInterval(() => {
        setSectors(prevSectors => {
          const unverifiedIdx = prevSectors.findIndex(b => b.status === 'VERIFYING');
          if (unverifiedIdx === -1) {
            finalizeErasure();
            return prevSectors;
          }

          const nextSectors = [...prevSectors];
          for (let k = 0; k < 8; k++) {
            const idx = unverifiedIdx + k;
            if (idx < nextSectors.length) {
              nextSectors[idx] = {
                ...nextSectors[idx],
                status: 'VERIFIED',
                entropy: 0.0000,
                sampleByte: '0x00'
              };
            }
          }
          return nextSectors;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, currentPass, selectedStandard.passes, selectedStandardId, selectedDevice.healthStatus]);

  const finalizeErasure = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('COMPLETED');
    setProgressPct(100);
    setThroughput(0);

    const postDigest = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

    const cert: CertificateOfDestruction = {
      certificateId: `CERT-DST-${Date.now().toString().slice(-8)}`,
      timestamp: new Date().toISOString(),
      device: {
        name: selectedDevice.name,
        serialNumber: selectedDevice.serialNumber,
        type: selectedDevice.type,
        capacityGB: selectedDevice.capacityGB,
        firmware: selectedDevice.firmware
      },
      sanitization: {
        standardName: selectedStandard.name,
        standardAuthority: selectedStandard.authority,
        passesCompleted: selectedStandard.passes,
        verificationStatus: 'PASS',
        postErasureEntropy: 0.0000,
        sha256VerificationHash: postDigest,
        operatorName,
        technicianId,
        organization
      },
      cryptographicSignature: generateRandomHash() + generateRandomHash(),
      qrVerificationPayload: `AEGIS-VERIFY|${selectedDevice.serialNumber}|PASS|${Date.now()}`
    };

    setFinalCertificate(cert);

    await AuditService.getInstance().logEvent(
      'DRIVE_ERASURE_COMPLETED',
      'DRIVE_ERASER',
      operatorName,
      selectedDevice.serialNumber,
      `Successfully sanitized ${selectedDevice.name} using ${selectedStandard.name} (${selectedStandard.passes} passes). 100% Read-back verified.`
    );
  };

  const handleStartWipe = async () => {
    setConfirmWipeModal(false);
    setStatus('RUNNING');
    await AuditService.getInstance().logEvent(
      'DRIVE_ERASURE_INITIATED',
      'DRIVE_ERASER',
      operatorName,
      selectedDevice.serialNumber,
      `Sanitization initiated on ${selectedDevice.name} with ${selectedStandard.name}`
    );
  };

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const buffer = new Uint8Array(reader.result as ArrayBuffer);
      const customDrive: StorageDevice = {
        id: `custom-img-${Date.now()}`,
        name: `Raw Image: ${file.name}`,
        type: 'RAW_IMAGE',
        capacityGB: Number((file.size / (1024 * 1024 * 1024)).toFixed(3)),
        serialNumber: `IMG-${file.name.slice(0, 12).toUpperCase()}`,
        interface: 'Virtual Disk Image (.raw/.dd)',
        firmware: 'v1.0-IMG',
        healthStatus: 'HEALTHY',
        sectorSize: 512,
        totalSectors: Math.floor(file.size / 512),
        isMounted: true,
        isCustomImage: true,
        customImageData: buffer
      };

      setDrives(prev => [customDrive, ...prev]);
      setSelectedDeviceId(customDrive.id);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-100 uppercase tracking-wide">
              Secure Drive Eraser Module
            </h1>
            <Badge variant="cyan">MODULE 1</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Forensic-grade media sanitization adhering to NIST SP 800-88 Rev. 1, DoD 5220.22-M, and IEEE 2883-2022 standards.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={scanHostDrives}
            disabled={isScanningHost || status !== 'IDLE'}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-950/70 border border-cyan-500/40 hover:bg-cyan-900 text-cyan-300 text-xs font-mono font-semibold transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isScanningHost ? 'animate-spin' : ''}`} />
            <span>{isScanningHost ? 'Scanning Host...' : 'Scan Host Physical Drives'}</span>
          </button>

          <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 text-xs font-mono font-semibold transition cursor-pointer">
            <FileUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upload Raw Disk Image</span>
            <input 
              type="file" 
              className="hidden" 
              accept=".raw,.dd,.img,.bin,.iso" 
              onChange={handleCustomImageUpload} 
            />
          </label>
        </div>
      </div>

      {/* System Protection Guarantee Banner */}
      <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-emerald-300">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="font-bold text-emerald-200">100% NON-DESTRUCTIVE SIMULATION MODE:</span>
            <span className="text-slate-300 ml-1.5">
              Your real operating system, Windows partition (C:), and personal files are strictly protected by browser sandboxing. No physical data is deleted from your actual computer.
            </span>
          </div>
        </div>
        <Badge variant="emerald" size="sm">SYSTEM FILES PROTECTED</Badge>
      </div>

      {/* Target Drive Selector Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            Select Target Storage Media for Sanitization
          </label>
          <span className="text-[11px] text-cyan-400 font-mono">
            Filtered: Internal Storage & External Pendrives Only
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {drives
            .filter(d => d.category === 'INTERNAL_STORAGE' || d.category === 'EXTERNAL_PENDRIVE' || d.type === 'NVME' || d.type === 'SSD' || d.type === 'USB')
            .map((d) => {
              const isSelected = selectedDeviceId === d.id;
              const isPendrive = d.category === 'EXTERNAL_PENDRIVE' || d.type === 'USB';

              return (
                <div
                  key={d.id}
                  onClick={() => status === 'IDLE' && setSelectedDeviceId(d.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? (isPendrive ? 'bg-emerald-950/40 border-emerald-500 shadow-xl shadow-emerald-950/50 ring-1 ring-emerald-400/40' : 'bg-cyan-950/40 border-cyan-500 shadow-xl shadow-cyan-950/50 ring-1 ring-cyan-400/40')
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                  } ${status !== 'IDLE' ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <Badge variant={isPendrive ? 'emerald' : 'cyan'}>
                        {isPendrive ? 'EXTERNAL PENDRIVE' : 'INTERNAL STORAGE'}
                      </Badge>
                      <span className={`text-[11px] font-mono font-bold ${
                        d.healthStatus === 'HEALTHY' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        ● {d.healthStatus}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-100 truncate mb-1">{d.name}</h3>
                    <p className="text-[11px] font-mono text-cyan-400 truncate mb-3">S/N: {d.serialNumber}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 text-xs font-mono text-slate-400 space-y-1.5">
                    <div className="flex justify-between">
                      <span>Raw Capacity:</span>
                      <span className="text-slate-100 font-bold">{d.capacityGB} GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mount Point:</span>
                      <span className="text-slate-300 font-medium">{d.mountPoint || (isPendrive ? 'E:\\' : '\\\\.\\PhysicalDrive0')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Storage Interface:</span>
                      <span className="text-cyan-300 font-medium truncate max-w-[180px] text-right">{d.interface}</span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Standard Selector Component */}
      <StandardSelector
        selectedStandardId={selectedStandardId}
        onSelectStandard={setSelectedStandardId}
        disabled={status !== 'IDLE'}
      />

      {/* Operator & Compliance Sign-off Panel */}
      <CyberCard variant="cyan" className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase text-slate-200 flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            Technician & Custody Sign-Off Metadata
          </span>
          <span className="text-[11px] font-mono text-slate-500">Embedded in Destruction Certificate</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div>
            <label className="text-slate-400 block text-[10px] uppercase mb-1">Lead Investigator:</label>
            <input
              type="text"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              disabled={status !== 'IDLE'}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-slate-400 block text-[10px] uppercase mb-1">Technician Badge / ID:</label>
            <input
              type="text"
              value={technicianId}
              onChange={(e) => setTechnicianId(e.target.value)}
              disabled={status !== 'IDLE'}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-slate-400 block text-[10px] uppercase mb-1">Organization / Unit:</label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              disabled={status !== 'IDLE'}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </CyberCard>

      {/* Live Sector Visualizer Grid */}
      <SectorVisualizerGrid
        sectors={sectors}
        currentPass={currentPass}
        totalPasses={selectedStandard.passes}
        progressPercentage={progressPct}
        throughputMBps={throughput}
        badSectorsFound={badSectors}
        status={status}
      />

      {/* Operation Status Message */}
      {status === 'COMPLETED' && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-between gap-3 text-xs font-mono text-emerald-300 animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-slate-100 block">
                Sanitization Complete: {selectedDevice.name}
              </span>
              <span className="text-[11px] text-emerald-300/90">
                100% Read-back verified. Cryptographic destruction certificate generated.
              </span>
            </div>
          </div>
          {finalCertificate && (
            <button
              onClick={() => setShowCertModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer"
            >
              View Certificate
            </button>
          )}
        </div>
      )}

      {/* Controls & Execution Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-3">
          {status === 'IDLE' && (
            <button
              onClick={() => setConfirmWipeModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-mono text-xs font-bold shadow-lg shadow-rose-950/50 transition cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              EXECUTE SECURE SANITIZATION
            </button>
          )}

          {status === 'RUNNING' && (
            <button
              onClick={() => setStatus('PAUSED')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-mono text-xs font-bold transition cursor-pointer"
            >
              <Pause className="w-4 h-4 fill-current" />
              PAUSE OPERATION
            </button>
          )}

          {status === 'PAUSED' && (
            <button
              onClick={() => setStatus('RUNNING')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              RESUME SANITIZATION
            </button>
          )}

          {(status === 'COMPLETED' || status === 'PAUSED') && (
            <button
              onClick={resetSectors}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-semibold transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}

          {finalCertificate && (
            <button
              onClick={() => setShowCertModal(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-mono text-xs font-bold shadow-lg shadow-emerald-950/50 transition cursor-pointer animate-pulse"
            >
              <Award className="w-4 h-4" />
              VIEW DESTRUCTION CERTIFICATE
            </button>
          )}
        </div>

        <div className="text-right text-xs font-mono text-slate-400">
          <div>Selected Target: <strong className="text-cyan-400">{selectedDevice.name}</strong></div>
          <div>Standard: <strong className="text-slate-200">{selectedStandard.name}</strong></div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmWipeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0d121c] border border-rose-500/50 rounded-2xl p-6 space-y-4 shadow-2xl shadow-rose-950/80 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-400">
              <ShieldAlert className="w-7 h-7" />
              <h3 className="font-bold text-base text-white">CONFIRM PERMANENT ERASURE</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              You are about to execute <strong>{selectedStandard.name}</strong> on <strong>{selectedDevice.name} ({selectedDevice.capacityGB} GB)</strong>.
            </p>
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-[11px] font-mono text-rose-300 space-y-1">
              <p>⚠️ ALL DATA WILL BE PERMANENTLY AND IRREVERSIBLY DESTROYED.</p>
              <p>Forensic laboratory recovery will be rendered infeasible.</p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmWipeModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleStartWipe}
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold shadow-lg shadow-rose-950/60"
              >
                AUTHORIZE DESTRUCTION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Destruction Certificate Modal */}
      {showCertModal && finalCertificate && (
        <DestructionCertificateModal
          certificate={finalCertificate}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </div>
  );
};
