import React, { useState, useMemo } from 'react';
import { X, Search, ChevronLeft, ChevronRight, Binary, Eye, Sparkles, Copy, Check } from 'lucide-react';
import { Badge } from '../common/Badge';

interface HexViewerModalProps {
  title: string;
  data: Uint8Array;
  highlightRange?: [number, number]; // [start, end]
  onClose: () => void;
}

const BYTES_PER_ROW = 16;
const ROWS_PER_PAGE = 32; // 512 bytes per page

export const HexViewerModal: React.FC<HexViewerModalProps> = ({
  title,
  data,
  highlightRange,
  onClose
}) => {
  const [page, setPage] = useState(0);
  const [selectedOffset, setSelectedOffset] = useState<number | null>(highlightRange ? highlightRange[0] : 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const totalBytes = data.length;
  const bytesPerPage = BYTES_PER_ROW * ROWS_PER_PAGE;
  const totalPages = Math.max(1, Math.ceil(totalBytes / bytesPerPage));

  const currentPageStart = page * bytesPerPage;
  const currentPageEnd = Math.min(totalBytes, currentPageStart + bytesPerPage);

  const pageSlice = useMemo(() => {
    return data.slice(currentPageStart, currentPageEnd);
  }, [data, currentPageStart, currentPageEnd]);

  // Jump to specific offset
  const handleJumpToOffset = (offset: number) => {
    const targetPage = Math.floor(offset / bytesPerPage);
    if (targetPage >= 0 && targetPage < totalPages) {
      setPage(targetPage);
      setSelectedOffset(offset);
    }
  };

  // Selected Byte Inspector data
  const inspectedByte = selectedOffset !== null && selectedOffset < totalBytes ? data[selectedOffset] : null;

  const handleCopyHex = () => {
    const hexString = Array.from(pageSlice).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
    navigator.clipboard.writeText(hexString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#080d18] border border-cyan-500/40 rounded-2xl shadow-2xl p-6 space-y-4 text-xs font-mono text-slate-300 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Binary className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-100 uppercase">{title}</h3>
                <Badge variant="cyan">HEX WORKBENCH</Badge>
              </div>
              <p className="text-[11px] text-slate-400">
                Buffer: {totalBytes.toLocaleString()} Bytes ({(totalBytes / 1024).toFixed(2)} KB) • Read-Only Forensic View
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyHex}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copied ? 'Copied Page' : 'Copy Hex'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search and Navigation Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Jump to offset (e.g. 0x1000 or 4096)..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value.trim();
                    const num = val.startsWith('0x') ? parseInt(val, 16) : parseInt(val, 10);
                    if (!isNaN(num)) handleJumpToOffset(num);
                  }
                }}
                className="bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-cyan-300 focus:border-cyan-500 focus:outline-none w-64"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>

            {highlightRange && (
              <button
                onClick={() => handleJumpToOffset(highlightRange[0])}
                className="px-2.5 py-1.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[11px] hover:bg-cyan-900 transition"
              >
                Jump to Evidence Start (0x{highlightRange[0].toString(16)})
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-400 text-xs">
              Page <strong className="text-slate-200">{page + 1}</strong> of <strong className="text-slate-200">{totalPages}</strong>
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Hex Dump Table */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-96 overflow-y-auto font-mono-hex select-text">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-[10px] border-b border-slate-800 pb-1">
                <th className="w-24 pb-1">OFFSET</th>
                <th className="pb-1" colSpan={16}>
                  <div className="grid grid-cols-16 text-center text-slate-400">
                    {Array.from({ length: 16 }, (_, i) => (
                      <span key={i}>{i.toString(16).toUpperCase()}</span>
                    ))}
                  </div>
                </th>
                <th className="w-44 pl-4 pb-1">DECODED TEXT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {Array.from({ length: Math.ceil(pageSlice.length / BYTES_PER_ROW) }, (_, rowIdx) => {
                const rowStart = currentPageStart + (rowIdx * BYTES_PER_ROW);
                const rowBytes = pageSlice.slice(rowIdx * BYTES_PER_ROW, (rowIdx + 1) * BYTES_PER_ROW);

                return (
                  <tr key={rowIdx} className="hover:bg-slate-900/60 transition">
                    {/* Offset Address */}
                    <td className="text-cyan-500 py-1 select-none text-[11px]">
                      0x{rowStart.toString(16).padStart(8, '0').toUpperCase()}
                    </td>

                    {/* 16 Hex Bytes */}
                    <td className="py-1">
                      <div className="grid grid-cols-16 gap-1 text-center text-[11px]">
                        {Array.from({ length: 16 }, (_, colIdx) => {
                          const byte = rowBytes[colIdx];
                          if (byte === undefined) return <span key={colIdx} className="text-slate-800">..</span>;

                          const absOffset = rowStart + colIdx;
                          const isSelected = selectedOffset === absOffset;
                          const isHighlighted = highlightRange && absOffset >= highlightRange[0] && absOffset < highlightRange[1];

                          let color = 'text-slate-300';
                          if (byte === 0x00) color = 'text-slate-600';
                          else if (byte === 0xFF) color = 'text-rose-400';
                          else if (byte >= 32 && byte <= 126) color = 'text-cyan-300';

                          return (
                            <button
                              key={colIdx}
                              onClick={() => setSelectedOffset(absOffset)}
                              className={`rounded px-0.5 transition cursor-pointer font-bold ${
                                isSelected 
                                  ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-400' 
                                  : isHighlighted 
                                  ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50' 
                                  : color
                              }`}
                            >
                              {byte.toString(16).padStart(2, '0').toUpperCase()}
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    {/* ASCII Representation */}
                    <td className="pl-4 py-1 text-slate-400 text-[11px] tracking-wider">
                      {Array.from({ length: 16 }, (_, colIdx) => {
                        const byte = rowBytes[colIdx];
                        if (byte === undefined) return ' ';
                        return (byte >= 32 && byte <= 126) ? String.fromCharCode(byte) : '·';
                      }).join('')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Selected Byte Inspector Panel */}
        {inspectedByte !== null && selectedOffset !== null && (
          <div className="p-3.5 rounded-xl bg-slate-900 border border-cyan-500/30 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Selected Offset:</span>
              <span className="text-cyan-400 font-bold">0x{selectedOffset.toString(16).toUpperCase()} ({selectedOffset})</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Hex / Value:</span>
              <span className="text-slate-100 font-bold">0x{inspectedByte.toString(16).padStart(2, '0').toUpperCase()} ({inspectedByte})</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Binary 8-Bit:</span>
              <span className="text-emerald-400 font-mono">{inspectedByte.toString(2).padStart(8, '0')}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">ASCII Character:</span>
              <span className="text-sky-300 font-bold">
                {inspectedByte >= 32 && inspectedByte <= 126 ? `'${String.fromCharCode(inspectedByte)}'` : 'Non-printable'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Entropy State:</span>
              <span className="text-purple-400">{inspectedByte === 0 ? 'Zero (Wiped)' : 'Structured'}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
