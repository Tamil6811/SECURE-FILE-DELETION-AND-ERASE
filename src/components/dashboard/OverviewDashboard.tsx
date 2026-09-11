import React, { useState, useEffect } from 'react';
import { 
  Disc, 
  Trash2, 
  Search, 
  FileCheck2, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  FileQuestion,
  HelpCircle,
  Clock,
  Laptop
} from 'lucide-react';
import { CyberCard } from '../common/CyberCard';
import { Badge } from '../common/Badge';
import { ActiveTab } from '../layout/Sidebar';
import { AuditService } from '../../services/auditService';
import { AuditLogRecord } from '../../types/audit';
import { useUI } from '../../context/UIContext';

interface OverviewDashboardProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onNavigate }) => {
  const [recentLogs, setRecentLogs] = useState<AuditLogRecord[]>([]);
  const { isSimpleMode } = useUI();

  useEffect(() => {
    const list = AuditService.getInstance().getRecords();
    setRecentLogs(list.slice(-5).reverse());
  }, []);

  return (
    <div className="space-y-8 font-sans">
      {/* Friendly Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0c182c] via-[#0a1220] to-[#070b14] p-6 md:p-8 shadow-2xl shadow-cyan-950/40">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Easy-to-Use Data Protection Suite
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Safe Simulation Mode
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
            What would you like to do today?
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed font-normal">
            Whether you want to <strong>permanently erase private files</strong>, <strong>wipe a USB drive before selling it</strong>, or <strong>rescue deleted photos & documents</strong>, pick a tool below to get started in seconds.
          </p>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
      </div>

      {/* 3 Giant, Friendly Primary Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Action 1: Erase Whole Drive */}
        <div 
          onClick={() => onNavigate('drive_eraser')}
          className="group p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 hover:border-cyan-500/60 hover:shadow-xl hover:shadow-cyan-950/50 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center group-hover:scale-110 transition">
                <Disc className="w-6 h-6" />
              </div>
              <Badge variant="cyan">STEP 1</Badge>
            </div>

            <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition">
              Erase Whole Drive
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Permanently wipe all data from a <strong>USB drive, external hard drive, or SSD</strong> before selling, donating, or recycling it.
            </p>

            <ul className="text-xs text-slate-400 space-y-1.5 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Government & Military standards</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Generates official destruction certificate PDF</span>
              </li>
            </ul>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition">
            <span>Open Drive Eraser</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Action 2: Shred Specific Files */}
        <div 
          onClick={() => onNavigate('file_eraser')}
          className="group p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 hover:border-emerald-500/60 hover:shadow-xl hover:shadow-emerald-950/50 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center group-hover:scale-110 transition">
                <Trash2 className="w-6 h-6" />
              </div>
              <Badge variant="emerald">STEP 2</Badge>
            </div>

            <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-300 transition">
              Shred Private Files
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Permanently destroy <strong>confidential documents, private photos, or financial records</strong> so no recovery software can bring them back.
            </p>

            <ul className="text-xs text-slate-400 space-y-1.5 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Clears hidden date stamps & file traces</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Easy drag-and-drop shredder</span>
              </li>
            </ul>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition">
            <span>Open File Shredder</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Action 3: Recover Lost Files */}
        <div 
          onClick={() => onNavigate('file_carver')}
          className="group p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 hover:border-purple-500/60 hover:shadow-xl hover:shadow-purple-950/50 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center group-hover:scale-110 transition">
                <Search className="w-6 h-6" />
              </div>
              <Badge variant="purple">RECOVERY</Badge>
            </div>

            <h3 className="text-lg font-bold text-slate-100 group-hover:text-purple-300 transition">
              Recover Deleted Files
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Accidentally deleted important files or formatted a storage drive? <strong>Scan and reconstruct lost photos, PDFs, and office files</strong> in 1 click.
            </p>

            <ul className="text-xs text-slate-400 space-y-1.5 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Works even on damaged or formatted disks</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Preview pictures & download in 1 click</span>
              </li>
            </ul>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-purple-400 group-hover:translate-x-1 transition">
            <span>Open File Rescue</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* How it Works Guide in 3 Steps */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              How It Works & Why Regular Deletion Isn't Enough
            </h2>
          </div>
          <span className="text-xs text-slate-400">Quick 1-Minute Guide</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <strong className="text-rose-400 font-bold block text-sm">1. Regular Delete is Incomplete</strong>
            <p className="text-slate-400">
              When you empty the Recycle Bin or quick-format a USB, your operating system only removes the table of contents. <strong>The real photos and files stay on the drive</strong> and can be easily recovered by anyone.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <strong className="text-emerald-400 font-bold block text-sm">2. Secure Overwriting Fixes This</strong>
            <p className="text-slate-400">
              Our Secure Eraser overwrites every single bit on the drive with zeroes and random data (using official standards like NIST 800-88), making recovery mathematically impossible.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <strong className="text-purple-400 font-bold block text-sm">3. Deep Carving Rescues Lost Data</strong>
            <p className="text-slate-400">
              If you lost files by accident, our Carving engine ignores corrupted file tables and directly reads the raw data blocks to piece your photos and documents back together.
            </p>
          </div>
        </div>
      </div>

      {/* Recent History Table */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200">Recent Activity & Wipe History</span>
          </div>
          <button
            onClick={() => onNavigate('compliance_audit')}
            className="text-cyan-400 hover:text-cyan-300 transition font-medium"
          >
            View Full History & Certificates →
          </button>
        </div>

        <div className="divide-y divide-slate-800/60">
          {recentLogs.map((log, idx) => (
            <div key={`${log.id}-${idx}`} className="py-2.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <Badge variant={log.module === 'DRIVE_ERASER' ? 'cyan' : log.module === 'FILE_ERASER' ? 'emerald' : 'purple'}>
                  {log.action.replace(/_/g, ' ')}
                </Badge>
                <span className="text-slate-200 font-medium">{log.details}</span>
              </div>
              <div className="text-slate-500 text-[11px]">
                <span>{log.timestamp.slice(0, 19).replace('T', ' ')} UTC</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
