import React from 'react';
import { 
  Home, 
  Disc, 
  Trash2, 
  Search, 
  FileCheck2, 
  BookOpen, 
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';

export type ActiveTab = 
  | 'dashboard' 
  | 'drive_eraser' 
  | 'file_eraser' 
  | 'file_carver' 
  | 'compliance_audit' 
  | 'documentation';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { isSimpleMode, isRealDiskMode } = useUI();
  const { isAdmin, currentUser } = useAuth();

  const menuItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: isSimpleMode ? 'Home / Overview' : 'Mission Control',
      subtext: isSimpleMode ? 'Quick actions & status' : 'Telemetry & Overview',
      icon: Home,
      badge: undefined
    },
    {
      id: 'drive_eraser' as ActiveTab,
      label: isSimpleMode ? 'Erase Whole Drive' : 'Secure Drive Eraser',
      subtext: isSimpleMode ? 'Wipe USB or SSD permanently' : 'NIST 800-88 / DoD Overwrite',
      icon: Disc,
      badge: isSimpleMode ? 'STEP 1' : 'MODULE 1'
    },
    {
      id: 'file_eraser' as ActiveTab,
      label: isSimpleMode ? 'Shred Files & Folders' : 'Secure File & Folder Eraser',
      subtext: isSimpleMode ? 'Permanently delete private files' : 'MACB & Slack Space Purge',
      icon: Trash2,
      badge: isSimpleMode ? 'STEP 2' : 'MODULE 2'
    },
    {
      id: 'file_carver' as ActiveTab,
      label: isSimpleMode ? 'Recover Lost Files' : 'Forensic File Carver',
      subtext: isSimpleMode ? 'Find deleted photos & docs' : 'Fragmented & Magic Signature',
      icon: Search,
      badge: isSimpleMode ? 'RESCUE' : 'MODULE 3'
    },
    {
      id: 'compliance_audit' as ActiveTab,
      label: isSimpleMode ? (isAdmin ? 'Admin Logs & Shred Vault' : 'History & Certificates') : 'Audit & Compliance Center',
      subtext: isAdmin ? 'Edit logs & view shredded files' : 'Merkle Ledger & PDF Certs',
      icon: FileCheck2,
      badge: isAdmin ? 'ADMIN' : undefined
    },
    {
      id: 'documentation' as ActiveTab,
      label: isSimpleMode ? 'Easy User Guide' : 'Docs & Standards',
      subtext: isSimpleMode ? 'Step-by-step help & FAQ' : 'Manuals & Specs',
      icon: BookOpen,
      badge: undefined
    }
  ];

  return (
    <aside className="w-72 border-r border-slate-800/80 bg-[#080d16]/95 backdrop-blur-xl flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[11px] font-sans font-bold tracking-wider text-slate-400 uppercase">
              {isSimpleMode ? "Main Tools" : "Forensic Modules"}
            </span>
            <span className="text-[10px] text-cyan-400 font-medium">
              {isSimpleMode ? "Beginner Friendly" : "Enterprise"}
            </span>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-start gap-3.5 px-3.5 py-3 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-950/90 to-slate-900/90 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-950/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/70 border border-transparent'
                  }`}
                >
                  <div className={`mt-0.5 p-1.5 rounded-lg ${isActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs tracking-tight truncate">{item.label}</span>
                      {item.badge && (
                        <span className={`text-[9px] font-sans font-bold px-1.5 py-0.5 rounded ${
                          isActive ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.subtext}</p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Friendly Safety & Protection Info Card */}
        <div className={`p-3.5 rounded-xl border space-y-2 transition-colors ${
          isRealDiskMode 
            ? 'bg-rose-950/30 border-rose-500/30' 
            : 'bg-emerald-950/30 border-emerald-500/30'
        }`}>
          <div className={`flex items-center gap-2 text-xs font-bold font-sans ${
            isRealDiskMode ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            <ShieldCheck className="w-4 h-4" />
            <span>{isRealDiskMode ? "Real Disk Action Active" : "Safe Sandbox Mode"}</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
            {isRealDiskMode 
              ? "Real deletion is enabled. Erased files and folders will be physically overwritten and deleted on your real host computer drive." 
              : "Safe simulation mode. Your computer's real Windows drive and documents are 100% protected."}
          </p>
        </div>
      </div>

      {/* Footer Support */}
      <div className="pt-3 border-t border-slate-800/60 text-[11px] text-slate-400 font-sans space-y-1">
        <div className="flex justify-between">
          <span>Mode:</span>
          <span className="text-cyan-400 font-semibold">{isSimpleMode ? "Simple Mode" : "Forensics Pro"}</span>
        </div>
        <div className="flex justify-between">
          <span>Disk Operation:</span>
          <span className={`font-semibold ${isRealDiskMode ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isRealDiskMode ? "Real Disk Active" : "Safe Sandbox"}
          </span>
        </div>
      </div>
    </aside>
  );
};
