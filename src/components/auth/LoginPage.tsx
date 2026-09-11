import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Key, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  Eye, 
  Edit3, 
  AlertCircle,
  Database,
  Cpu,
  Layers,
  Laptop
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import { Badge } from '../common/Badge';

interface LoginPageProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login, quickLogin } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await login(username, password);
      if (res.success) {
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(res.message || 'Authentication failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickRoleLogin = (role: UserRole) => {
    quickLogin(role);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* Top Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-600/30 border border-cyan-400/40 shadow-xl shadow-cyan-500/10 mb-2">
            <ShieldCheck className="w-10 h-10 text-cyan-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-wide bg-gradient-to-r from-cyan-400 via-sky-200 to-emerald-400 bg-clip-text text-transparent uppercase">
            Data Guardian & File Rescue Suite
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Forensic Sanitization, Digital Evidence Carving, and Tamper-Resistant Audit Management
          </p>
        </div>

        {/* 2-Column Authentication Console */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: Quick 1-Click Role Login & Capabilities */}
          <div className="md:col-span-6 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Select Role / Quick Demo Login
                </h2>
              </div>

              {/* Admin Card */}
              <div 
                onClick={() => handleQuickRoleLogin('ADMIN')}
                className="p-4 rounded-2xl border border-purple-500/40 bg-purple-950/30 hover:bg-purple-950/60 hover:border-purple-400 transition-all cursor-pointer space-y-2 group shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-purple-300 font-bold">
                      👑
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
                        Administrator
                        <Badge variant="purple" size="sm">FULL PRIVILEGES</Badge>
                      </div>
                      <span className="text-[11px] text-purple-300">Dr. Elena Rostova (Chief Auditor)</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                </div>

                <div className="pt-2 border-t border-purple-500/20 grid grid-cols-2 gap-1.5 text-[11px] text-slate-300">
                  <span className="flex items-center gap-1.5 text-purple-200">
                    <Edit3 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <strong>Edit & Annotate Logs</strong>
                  </span>
                  <span className="flex items-center gap-1.5 text-purple-200">
                    <Eye className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <strong>View Shredded Files</strong>
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    Drive & File Eraser
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    File Carver Recovery
                  </span>
                </div>
              </div>

              {/* User / Investigator Card */}
              <div 
                onClick={() => handleQuickRoleLogin('USER')}
                className="p-4 rounded-2xl border border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-950/60 hover:border-cyan-400 transition-all cursor-pointer space-y-2 group shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-cyan-600/30 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-bold">
                      🔍
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
                        Investigator / User
                        <Badge variant="cyan" size="sm">STANDARD</Badge>
                      </div>
                      <span className="text-[11px] text-cyan-300">Senior Investigator J. Miller</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                </div>

                <div className="pt-2 border-t border-cyan-500/20 grid grid-cols-2 gap-1.5 text-[11px] text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    Drive & File Eraser
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    File Carver Recovery
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    PDF Destruction Certs
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    Logs (Read-Only)
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Demo Credentials Footer */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono space-y-1">
              <div className="text-slate-300 font-bold">Default Demo Credentials:</div>
              <div>Admin: <code className="text-purple-300">admin / admin123</code></div>
              <div>User: <code className="text-cyan-300">user / user123</code></div>
            </div>
          </div>

          {/* Right Column: Credential Form */}
          <div className="md:col-span-6 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col justify-between">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Lock className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Sign In with Credentials
                </h2>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  Username / Officer ID:
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or user..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  Security Passphrase:
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter security key..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-950/60 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isLoading ? "Authenticating Session..." : "Authorize & Enter Console"}</span>
                </button>
              </div>
            </form>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
              Secured with SHA-256 Merkle Authentication & Role-Based Access Control (RBAC)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
