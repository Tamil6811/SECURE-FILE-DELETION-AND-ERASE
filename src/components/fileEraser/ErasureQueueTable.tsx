import React from 'react';
import { ErasableItem } from '../../types/fileEraser';
import { Trash2, CheckCircle2, RefreshCw, Sparkles, Clock, FileKey, Binary, ShieldCheck } from 'lucide-react';
import { Badge } from '../common/Badge';

interface ErasureQueueTableProps {
  items: ErasableItem[];
  onRemoveItem: (id: string) => void;
  onClearQueue: () => void;
  isExecuting: boolean;
}

export const ErasureQueueTable: React.FC<ErasureQueueTableProps> = ({
  items,
  onRemoveItem,
  onClearQueue,
  isExecuting
}) => {
  if (items.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500 font-mono text-xs">
        No files queued for shredding. Upload files or load sample evidence above.
      </div>
    );
  }

  const getStatusBadge = (status: ErasableItem['status']) => {
    switch (status) {
      case 'QUEUED':
        return <Badge variant="slate">QUEUED</Badge>;
      case 'SHREDDING_PAYLOAD':
        return <Badge variant="cyan" className="animate-pulse">SHREDDING BYTES</Badge>;
      case 'CLEANSING_METADATA':
        return <Badge variant="amber" className="animate-pulse">CLEANSING MACB</Badge>;
      case 'PURGING_SLACK':
        return <Badge variant="purple" className="animate-pulse">PURGING SLACK</Badge>;
      case 'OBFUSCATING_NAME':
        return <Badge variant="rose" className="animate-pulse">OBFUSCATING</Badge>;
      case 'DESTROYED':
        return <Badge variant="emerald">DESTROYED (100%)</Badge>;
      case 'FAILED':
        return <Badge variant="rose">FAILED</Badge>;
    }
  };

  return (
    <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs uppercase tracking-wide text-slate-200">
            Sanitization Queue Manifest ({items.length} Target{items.length === 1 ? '' : 's'})
          </span>
          <Badge variant="cyan">
            {(items.reduce((acc, it) => acc + it.sizeBytes, 0) / (1024 * 1024)).toFixed(2)} MB TOTAL
          </Badge>
        </div>

        {!isExecuting && (
          <button
            onClick={onClearQueue}
            className="text-xs text-slate-400 hover:text-rose-400 font-mono transition"
          >
            Clear Queue
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
              <th className="pb-2.5">Target File</th>
              <th className="pb-2.5">Size</th>
              <th className="pb-2.5">FS / Meta Artifacts</th>
              <th className="pb-2.5">Slack Space</th>
              <th className="pb-2.5">Residual Entropy</th>
              <th className="pb-2.5">Status</th>
              {!isExecuting && <th className="pb-2.5 text-right">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {items.map((it) => (
              <tr key={it.id} className="hover:bg-slate-800/30 transition">
                <td className="py-3 pr-3">
                  <div className="font-semibold text-slate-200 truncate max-w-xs">{it.name}</div>
                  <div className="text-[10px] text-slate-500 truncate max-w-xs">{it.originalPath}</div>
                </td>
                <td className="py-3 text-slate-300">
                  {(it.sizeBytes / 1024).toFixed(1)} KB
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                      {it.fileSystem}
                    </span>
                    {it.adsStreamsDetected.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 text-[10px] border border-amber-500/30">
                        {it.adsStreamsDetected.length} ADS
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 text-slate-400">
                  {it.slackSizeBytes > 0 ? `${it.slackSizeBytes} B` : '0 B'}
                </td>
                <td className="py-3">
                  <span className={it.status === 'DESTROYED' ? 'text-emerald-400 font-bold' : 'text-purple-400'}>
                    {it.residualEntropy.toFixed(2)}
                  </span>
                </td>
                <td className="py-3">
                  {getStatusBadge(it.status)}
                </td>
                {!isExecuting && (
                  <td className="py-3 text-right">
                    <button
                      onClick={() => onRemoveItem(it.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
