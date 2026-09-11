import React, { useState } from 'react';
import { SectorBlock } from '../../types/sanitization';
import { HardDrive, Activity, Eye, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Badge } from '../common/Badge';

interface SectorVisualizerGridProps {
  sectors: SectorBlock[];
  currentPass: number;
  totalPasses: number;
  progressPercentage: number;
  throughputMBps: number;
  badSectorsFound: number;
  status: string;
}

export const SectorVisualizerGrid: React.FC<SectorVisualizerGridProps> = ({
  sectors,
  currentPass,
  totalPasses,
  progressPercentage,
  throughputMBps,
  badSectorsFound,
  status
}) => {
  const [inspectedBlock, setInspectedBlock] = useState<SectorBlock | null>(null);

  const getBlockColor = (b: SectorBlock) => {
    if (b.status === 'BAD_SECTOR') return 'bg-rose-600 border-rose-400 animate-pulse';
    if (b.status === 'OVERWRITING') return 'bg-cyan-400 border-cyan-200 shadow-md shadow-cyan-400/50 scale-110';
    if (b.status === 'VERIFYING') return 'bg-amber-400 border-amber-200 animate-pulse';
    if (b.status === 'VERIFIED') return 'bg-emerald-500/80 border-emerald-400/60';
    if (b.status === 'WRITTEN') {
      // Color by entropy: low = green/cyan, high/random = purple
      if (b.entropy < 0.1) return 'bg-emerald-600/70 border-emerald-500/40';
      if (b.entropy < 4.0) return 'bg-sky-600/70 border-sky-500/40';
      return 'bg-purple-600/70 border-purple-500/40';
    }
    return 'bg-slate-800/80 border-slate-700/50';
  };

  return (
    <div className="space-y-4">
      {/* Visualizer Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800/90 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-100">LBA Sector Map Visualizer</span>
              <Badge variant={status === 'RUNNING' ? 'cyan' : status === 'COMPLETED' ? 'emerald' : 'slate'}>
                {status}
              </Badge>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Pass {currentPass} of {totalPasses} • 128 Representative Logical Blocks • {sectors.length * 512} KB Buffer
            </p>
          </div>
        </div>

        {/* Real-time Telemetry Metrics */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/70">
            <span className="text-slate-400 block text-[10px]">THROUGHPUT:</span>
            <span className="text-cyan-300 font-bold">{throughputMBps.toFixed(1)} MB/s</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/70">
            <span className="text-slate-400 block text-[10px]">PROGRESS:</span>
            <span className="text-emerald-400 font-bold">{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/70">
            <span className="text-slate-400 block text-[10px]">BAD BLOCKS:</span>
            <span className={badSectorsFound > 0 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
              {badSectorsFound}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Sector Matrix */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
        <div className="grid grid-cols-16 sm:grid-cols-32 gap-1.5 max-h-56 overflow-y-auto p-1">
          {sectors.map((b) => (
            <button
              key={b.index}
              onClick={() => setInspectedBlock(b)}
              onMouseEnter={() => setInspectedBlock(b)}
              title={`LBA Block #${b.index * 64} | Status: ${b.status} | Entropy: ${b.entropy} | Value: ${b.sampleByte}`}
              className={`aspect-square rounded-[3px] border transition-all duration-75 cursor-pointer ${getBlockColor(b)} hover:scale-125 hover:z-20`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-800 border border-slate-700" />
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 border border-cyan-200" />
              <span>Overwriting</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 border border-emerald-500" />
              <span>Zero-Wiped (0x00)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-purple-600 border border-purple-500" />
              <span>Random Pattern</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 border border-emerald-400" />
              <span>100% Verified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-600 border border-rose-400" />
              <span>Bad Sector</span>
            </div>
          </div>

          <span className="text-[10px] text-slate-500">
            Hover block to inspect LBA details
          </span>
        </div>
      </div>

      {/* Block Inspector Callout */}
      {inspectedBlock && (
        <div className="p-3 rounded-lg bg-slate-900 border border-cyan-500/30 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300">
              LBA Block <strong className="text-cyan-400">0x{(inspectedBlock.index * 64 * 512).toString(16).toUpperCase()}</strong>
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Status: <strong className="text-slate-100">{inspectedBlock.status}</strong></span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Pattern: <strong className="text-emerald-400">{inspectedBlock.sampleByte}</strong></span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Entropy: <strong className="text-purple-400">{inspectedBlock.entropy.toFixed(4)}</strong></span>
          </div>
          <button 
            onClick={() => setInspectedBlock(null)}
            className="text-slate-500 hover:text-slate-300 text-[10px]"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
