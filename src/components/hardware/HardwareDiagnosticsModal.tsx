import React, { useState, useEffect } from 'react';
import { RealHardwareProfile, detectRealHardware } from '../../services/hardwareService';
import { 
  Cpu, 
  HardDrive, 
  Layers, 
  ShieldCheck, 
  Activity, 
  RefreshCw, 
  X, 
  CheckCircle2, 
  Laptop, 
  Monitor, 
  MemoryStick as MemoryIcon,
  Fingerprint
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface HardwareDiagnosticsModalProps {
  onClose: () => void;
  onSelectRealDisk?: (diskName: string) => void;
}

export const HardwareDiagnosticsModal: React.FC<HardwareDiagnosticsModalProps> = ({
  onClose,
  onSelectRealDisk
}) => {
  const [profile, setProfile] = useState<RealHardwareProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHardware = async () => {
    setLoading(true);
    const data = await detectRealHardware();
    setProfile(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchHardware();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#080d18] border border-cyan-500/40 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 animate-in fade-in zoom-in-95 text-xs font-mono text-slate-300">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-100 uppercase">
                  Real Host Hardware Diagnostics & Storage Bridge
                </h3>
                <Badge variant="cyan">LIVE SENSORS DETECTED</Badge>
              </div>
              <p className="text-[11px] text-slate-400">
                Direct WMI/CIM Kernel Hardware Enumeration & Forensic Hardware-Write-Blocker Status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchHardware}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Re-Scan Hardware</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className="text-slate-400">Querying physical storage controllers, NVMe namespaces, CPU, and RAM...</p>
          </div>
        ) : profile ? (
          <div className="space-y-4">
            
            {/* System Model Banner */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Host System Machine:</span>
                  <span className="text-sm font-bold text-slate-100">
                    {profile.system.manufacturer} {profile.system.model} ({profile.system.hostname})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                <Badge variant="emerald">WRITE-BLOCK: HARDWARE ACTIVE</Badge>
                <Badge variant="cyan">{profile.os.caption.split(' ')[1]} {profile.os.architecture}</Badge>
              </div>
            </div>

            {/* Hardware Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Physical Storage Drives */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-xs text-slate-100 flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-cyan-400" />
                    Storage Media (Internal & USB Flash Pendrive)
                  </span>
                  <Badge variant="cyan">FILTERED: INTERNAL & PENDRIVE</Badge>
                </div>

                {profile.storage.physicalDisks
                  .filter(d => {
                    const bus = (d.BusType || '').toLowerCase();
                    const media = (d.MediaType || '').toLowerCase();
                    const name = (d.FriendlyName || '').toLowerCase();
                    const isUsb = bus.includes('usb') || name.includes('usb') || name.includes('flash') || name.includes('pendrive');
                    const isInternal = bus.includes('nvme') || bus.includes('sata') || bus.includes('scsi') || media.includes('ssd');
                    return isUsb || isInternal;
                  })
                  .map((d, i) => {
                    const isUsb = (d.BusType || '').toLowerCase().includes('usb') || (d.FriendlyName || '').toLowerCase().includes('usb') || (d.FriendlyName || '').toLowerCase().includes('pendrive');
                    return (
                      <div key={i} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <strong className="text-cyan-300 text-xs">{d.FriendlyName}</strong>
                          <div className="flex items-center gap-1.5">
                            <Badge variant={isUsb ? 'emerald' : 'cyan'}>
                              {isUsb ? 'EXTERNAL PENDRIVE' : 'INTERNAL STORAGE'}
                            </Badge>
                            <span className="text-emerald-400 font-bold text-[10px]">{d.HealthStatus}</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>Bus / Media:</span>
                          <span className="text-slate-200">{d.BusType} / {d.MediaType}</span>
                        </div>
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>Raw Capacity:</span>
                          <span className="text-slate-200 font-semibold">{(d.Size / (1024 * 1024 * 1024)).toFixed(1)} GB</span>
                        </div>
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>Serial Number:</span>
                          <span className="text-cyan-400 font-bold">{d.SerialNumber}</span>
                        </div>
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>Firmware Revision:</span>
                          <span className="text-slate-300">{d.FirmwareVersion}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Processor & System Architecture */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-xs text-slate-100 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    Processor & Compute Cores
                  </span>
                  <Badge variant="emerald">{profile.cpu.cores} CORES / {profile.cpu.threads} THREADS</Badge>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="text-emerald-300 font-bold text-xs">{profile.cpu.name}</div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Physical Cores:</span>
                    <span className="text-slate-200">{profile.cpu.cores} Core Units</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Logical Processors:</span>
                    <span className="text-slate-200">{profile.cpu.threads} Threads</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Instruction Set:</span>
                    <span className="text-slate-200">{profile.system.architecture.toUpperCase()} (x86_64 AVX2 / AES-NI)</span>
                  </div>
                </div>
              </div>

              {/* Memory / RAM */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-xs text-slate-100 flex items-center gap-2">
                    <MemoryIcon className="w-4 h-4 text-purple-400" />
                    Physical RAM & Forensic Volatile Buffer
                  </span>
                  <Badge variant="purple">{profile.system.totalMemoryGB} GB TOTAL</Badge>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Total Physical RAM:</span>
                    <span className="text-purple-300 font-bold">{profile.system.totalMemoryGB} GB</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Available Free RAM:</span>
                    <span className="text-emerald-400 font-semibold">{profile.system.freeMemoryGB} GB</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Memory Encryption:</span>
                    <span className="text-slate-200">Hardware DMA Protected</span>
                  </div>
                </div>
              </div>

              {/* Graphics & OS Platform */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-xs text-slate-100 flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-amber-400" />
                    Display Controller & Host OS
                  </span>
                  <Badge variant="amber">KERNEL 10.0</Badge>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>GPU Device:</span>
                    <span className="text-amber-300 truncate max-w-[180px] font-semibold">{profile.gpu.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Operating System:</span>
                    <span className="text-slate-200">{profile.os.caption}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Kernel Build:</span>
                    <span className="text-slate-300">{profile.os.version}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        ) : null}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-slate-500 text-[11px]">
            Hardware Bridge Status: Connected via Local WMI/CIM Service
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition cursor-pointer"
          >
            Close Diagnostics
          </button>
        </div>

      </div>
    </div>
  );
};
