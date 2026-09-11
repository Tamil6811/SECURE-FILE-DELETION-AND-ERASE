import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Laptop, 
  Sliders, 
  CheckCircle2, 
  Palette, 
  Sun, 
  Moon, 
  Terminal, 
  Sparkles, 
  Check, 
  ChevronDown,
  Flame,
  AlertTriangle,
  User,
  LogOut,
  Shield,
  KeyRound,
  RotateCcw
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { HardwareDiagnosticsModal } from '../hardware/HardwareDiagnosticsModal';
import { useUI, AppTheme } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  currentTab?: string;
  onOpenLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLogin }) => {
  const [showHardwareModal, setShowHardwareModal] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const { 
    isSimpleMode, 
    toggleSimpleMode, 
    theme, 
    setTheme, 
    isRealDiskMode, 
    setIsRealDiskMode 
  } = useUI();

  const { currentUser, isAdmin, switchRole, logout } = useAuth();

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themes: { id: AppTheme; label: string; icon: React.FC<any>; desc: string; colorDot: string }[] = [
    {
      id: 'dark',
      label: 'Dark Cyber',
      icon: Moon,
      desc: 'Default forensic navy & cyan',
      colorDot: 'bg-cyan-500'
    },
    {
      id: 'light',
      label: 'Light Enterprise',
      icon: Sun,
      desc: 'Clean, crisp high-contrast light mode',
      colorDot: 'bg-amber-500'
    },
    {
      id: 'matrix',
      label: 'Matrix Terminal',
      icon: Terminal,
      desc: 'Hacker phosphor green & pitch black',
      colorDot: 'bg-emerald-500'
    },
    {
      id: 'midnight',
      label: 'Midnight Purple',
      icon: Sparkles,
      desc: 'Deep cosmic obsidian & neon violet',
      colorDot: 'bg-purple-500'
    }
  ];

  const currentThemeObj = themes.find(t => t.id === theme) || themes[0];
  const CurrentThemeIcon = currentThemeObj.icon;

  return (
    <>
      <header className="sticky top-0 z-40 h-16 border-b border-cyan-500/20 bg-[#070b12]/95 backdrop-blur-md px-4 md:px-6 flex items-center justify-between shadow-md transition-colors duration-200">
        {/* Logo and Friendly App Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-600/40 border border-cyan-400/50 shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base md:text-lg tracking-wide bg-gradient-to-r from-cyan-400 via-sky-200 to-emerald-400 bg-clip-text text-transparent">
                Data Guardian <span className="text-slate-400 font-normal">& File Rescue</span>
              </span>
              <Badge variant={isSimpleMode ? "emerald" : "cyan"} size="sm">
                {isSimpleMode ? "EASY MODE" : "PRO FORENSICS"}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 font-sans tracking-tight">
              {isSimpleMode ? "Safe Data Eraser & Easy File Recovery Suite" : "NIST SP 800-88 & Digital Evidence Carving Suite"}
            </p>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2 md:gap-3">
          
          {/* 1. Theme Switcher Dropdown */}
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setShowThemeMenu(prev => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 hover:text-cyan-300 transition cursor-pointer shadow-sm"
              title="Change UI Theme"
            >
              <CurrentThemeIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">{currentThemeObj.label}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showThemeMenu ? 'rotate-180' : ''}`} />
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center gap-1.5">
                  <Palette className="w-3 h-3 text-cyan-400" />
                  Select Color Theme
                </div>
                <div className="space-y-1 mt-1">
                  {themes.map(t => {
                    const Icon = t.icon;
                    const isSelected = t.id === theme;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setTheme(t.id);
                          setShowThemeMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2.5 h-2.5 rounded-full ${t.colorDot}`} />
                          <Icon className="w-3.5 h-3.5" />
                          <div>
                            <div>{t.label}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{t.desc}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 2. Real Disk vs Safe Mode Switcher */}
          <button
            onClick={() => setIsRealDiskMode(!isRealDiskMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-sans font-semibold transition cursor-pointer shadow-sm ${
              isRealDiskMode
                ? 'bg-rose-950/80 border-rose-500/50 text-rose-300 hover:bg-rose-900/90'
                : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/90'
            }`}
            title={isRealDiskMode ? "Real Disk Mode: Files will physically be deleted from your computer" : "Safe Mode: In-memory simulation"}
          >
            {isRealDiskMode ? (
              <>
                <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span className="hidden md:inline">Disk Mode:</span>
                <strong>Real Delete</strong>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Disk Mode:</span>
                <strong>Safe Sandbox</strong>
              </>
            )}
          </button>

          {/* 3. User / Admin Profile Menu */}
          <div className="relative" ref={userMenuRef}>
            {currentUser ? (
              <button
                onClick={() => setShowUserMenu(prev => !prev)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer shadow-sm ${
                  isAdmin 
                    ? 'bg-purple-950/80 border-purple-500/50 text-purple-200 hover:bg-purple-900/90'
                    : 'bg-cyan-950/80 border-cyan-500/50 text-cyan-200 hover:bg-cyan-900/90'
                }`}
                title="Account & Role Settings"
              >
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] text-white font-bold ${currentUser.avatarColor}`}>
                  {isAdmin ? '👑' : '👤'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-bold text-[11px] leading-tight truncate max-w-[100px]">{currentUser.name.split(' ')[0]}</span>
                  <span className="text-[9px] text-slate-400 leading-tight">{currentUser.role}</span>
                </div>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}

            {/* Profile Popup */}
            {showUserMenu && currentUser && (
              <div className="absolute right-0 mt-2 w-64 p-3 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3 font-sans">
                {/* Officer Card */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-100">{currentUser.name}</span>
                    <Badge variant={isAdmin ? "purple" : "cyan"} size="sm">{currentUser.role}</Badge>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">Badge: {currentUser.badgeId}</div>
                  <div className="text-[10px] text-slate-400 truncate">{currentUser.title}</div>
                  <div className="text-[9px] text-emerald-400 font-semibold pt-1">
                    {isAdmin ? "⚡ Full Rights: Edit Logs & View Shredded Files" : "🔍 Standard Rights: Read-Only Logs"}
                  </div>
                </div>

                {/* Role Switcher */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                    Quick Role Switch:
                  </span>
                  <button
                    onClick={() => {
                      switchRole(isAdmin ? 'USER' : 'ADMIN');
                      setShowUserMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isAdmin 
                        ? 'bg-slate-800 text-cyan-300 hover:bg-slate-700'
                        : 'bg-purple-950 text-purple-300 border border-purple-500/40 hover:bg-purple-900'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <RotateCcw className="w-3.5 h-3.5" />
                      Switch to {isAdmin ? 'Investigator (User)' : 'Administrator (Admin)'}
                    </span>
                  </button>
                </div>

                {/* Log Out Button */}
                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                      if (onOpenLogin) onOpenLogin();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/50 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out / Switch Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. Simple Mode vs Pro Mode Switch */}
          <button
            onClick={toggleSimpleMode}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-sans font-semibold transition cursor-pointer shadow-sm ${
              isSimpleMode
                ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/90'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
            title="Switch between Easy/Beginner Mode and Technical Pro Mode"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden md:inline">View:</span>
            <strong>{isSimpleMode ? "Simple" : "Expert"}</strong>
          </button>
        </div>
      </header>

      {showHardwareModal && (
        <HardwareDiagnosticsModal onClose={() => setShowHardwareModal(false)} />
      )}
    </>
  );
};
