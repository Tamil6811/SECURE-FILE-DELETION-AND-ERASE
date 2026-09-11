import React from 'react';
import { computeEntropyMap, EntropyBlock } from '../../services/entropyCalculator';
import { Activity, Info } from 'lucide-react';
import { Badge } from '../common/Badge';

interface EntropyHeatmapProps {
  data: Uint8Array;
  onInspectOffset?: (offset: number) => void;
}

export const EntropyHeatmap: React.FC<EntropyHeatmapProps> = ({ data, onInspectOffset }) => {
  const blocks = React.useMemo(() => computeEntropyMap(data, 64), [data]);

  return (
    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200 uppercase text-xs">
            Shannon Entropy & Data Distribution Heatmap
          </span>
        </div>
        <Badge variant="cyan">64 SAMPLING BLOCKS</Badge>
      </div>

      {/* Heatmap Bar / Grid */}
      <div className="grid grid-cols-16 sm:grid-cols-32 lg:grid-cols-64 gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
        {blocks.map((b) => (
          <button
            key={b.blockIndex}
            onClick={() => onInspectOffset && onInspectOffset(b.offsetStart)}
            title={`Block #${b.blockIndex} (0x${b.offsetStart.toString(16)} - 0x${b.offsetEnd.toString(16)}) | Entropy: ${b.entropy} | ${b.entropyCategory}`}
            style={{ backgroundColor: b.colorHex }}
            className="h-7 rounded-[2px] opacity-85 hover:opacity-100 hover:scale-110 hover:z-10 transition-all cursor-pointer shadow-sm"
          />
        ))}
      </div>

      {/* Entropy Classification Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] text-slate-400 pt-1">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981]" />
            <span>Zero / Wiped (H &lt; 0.05)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#06b6d4]" />
            <span>Structured Text (H &lt; 3.5)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]" />
            <span>Executable / Bytecode (H &lt; 6.5)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#a855f7]" />
            <span>Compressed / Media (H &lt; 7.85)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#f43f5e]" />
            <span>Random / PRNG Overwrite (H ~ 8.0)</span>
          </div>
        </div>

        <span className="text-slate-500">
          Click block to open Hex view at offset
        </span>
      </div>
    </div>
  );
};
