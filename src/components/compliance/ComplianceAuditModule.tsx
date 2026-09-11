import React, { useState, useEffect } from 'react';
import { AuditLogRecord } from '../../types/audit';
import { AuditService, COMPLIANCE_REQUIREMENTS } from '../../services/auditService';
import { useAuth } from '../../context/AuthContext';
import { CyberCard } from '../common/CyberCard';
import { Badge } from '../common/Badge';
import { EditLogModal } from './EditLogModal';
import { ShreddedFilesInspector } from './ShreddedFilesInspector';
import { 
  FileCheck2, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Lock, 
  RefreshCw, 
  Award, 
  Copy, 
  Trash2,
  Layers,
  Search,
  Edit3,
  Flame,
  User,
  ExternalLink
} from 'lucide-react';

export const ComplianceAuditModule: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const [records, setRecords] = useState<AuditLogRecord[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [integrityStatus, setIntegrityStatus] = useState<{ isValid: boolean; checkedCount: number } | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'AUDIT_TRAIL' | 'SHREDDED_FILES' | 'COMPLIANCE_MATRIX'>('AUDIT_TRAIL');
  const [editingRecord, setEditingRecord] = useState<AuditLogRecord | null>(null);

  const reloadRecords = () => {
    const list = AuditService.getInstance().getRecords();
    setRecords(list);
  };

  useEffect(() => {
    reloadRecords();
  }, []);

  const handleVerifyIntegrity = async () => {
    setIsVerifying(true);
    await new Promise(r => setTimeout(r, 600));
    const result = await AuditService.getInstance().verifyLedgerIntegrity();
    setIntegrityStatus(result);
    setIsVerifying(false);
  };

  const handleClearLogs = () => {
    if (!isAdmin) {
      alert('Administrative clearance required to reset the audit ledger.');
      return;
    }
    if (window.confirm('Are you sure you want to reset the audit ledger? This creates a new genesis block.')) {
      AuditService.getInstance().clearLogs();
      reloadRecords();
      setIntegrityStatus(null);
    }
  };

  const handleSaveEditedRecord = (_updated: AuditLogRecord) => {
    reloadRecords();
  };

  const filteredRecords = records.filter(r => {
    if (moduleFilter !== 'ALL' && r.module !== moduleFilter) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      return r.id.toLowerCase().includes(q) ||
             r.details.toLowerCase().includes(q) ||
             r.targetIdentifier.toLowerCase().includes(q) ||
             r.action.toLowerCase().includes(q) ||
             (r.caseReference && r.caseReference.toLowerCase().includes(q)) ||
             (r.editedBy && r.editedBy.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Title Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-100 uppercase tracking-wide">
              Audit Trail & Evidence Compliance Center
            </h1>
            <Badge variant={isAdmin ? "purple" : "cyan"}>
              {isAdmin ? "ADMIN CONTROL ACTIVE" : "IMMUTABLE LEDGER"}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-resistant cryptographic audit logs chained via SHA-256 Merkle hashes, with shredded file registries and administrative revision tracking.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('AUDIT_TRAIL')}
            className={`px-3.5 py-2 rounded-xl transition font-semibold cursor-pointer ${
              activeTab === 'AUDIT_TRAIL' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Audit Trail ({records.length})
          </button>
          <button
            onClick={() => setActiveTab('SHREDDED_FILES')}
            className={`px-3.5 py-2 rounded-xl transition font-semibold cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'SHREDDED_FILES' ? 'bg-purple-600 text-white shadow-md font-bold' : 'text-purple-300 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-purple-400" />
            <span>Shredded Files Vault</span>
            {isAdmin && <span className="text-[9px] bg-purple-950 text-purple-300 px-1 rounded">ADMIN</span>}
          </button>
          <button
            onClick={() => setActiveTab('COMPLIANCE_MATRIX')}
            className={`px-3.5 py-2 rounded-xl transition font-semibold cursor-pointer ${
              activeTab === 'COMPLIANCE_MATRIX' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Compliance Standards
          </button>
        </div>
      </div>

      {/* Admin Privilege Banner */}
      {isAdmin ? (
        <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/40 flex flex-wrap items-center justify-between gap-3 text-xs text-purple-200">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <span className="font-bold text-slate-100">ADMINISTRATIVE AUDITOR PRIVILEGES UNLOCKED:</span>
              <span className="text-slate-300 ml-1.5">
                Logged in as <strong>{currentUser?.name}</strong> ({currentUser?.badgeId}). You can edit/annotate audit records, assign forensic case references, and inspect shredded file names.
              </span>
            </div>
          </div>
          <Badge variant="purple" size="sm">LEVEL 5 ACCESS</Badge>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Logged in as <strong>{currentUser?.name}</strong> (Standard Investigator). Audit logs are read-only. Switch to Admin role in Navbar to edit logs.</span>
          </div>
          <Badge variant="cyan" size="sm">READ-ONLY MODE</Badge>
        </div>
      )}

      {/* Tab 1: Audit Trail */}
      {activeTab === 'AUDIT_TRAIL' && (
        <div className="space-y-4 font-mono text-xs">
          {/* Integrity Verification Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-100 block">
                  Merkle-Chained Hash Integrity Validator
                </span>
                <span className="text-[11px] text-slate-400">
                  Each record contains: SHA256(Record_Data + Previous_Record_Hash)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {integrityStatus && (
                <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs ${
                  integrityStatus.isValid 
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' 
                    : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                }`}>
                  {integrityStatus.isValid ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-rose-400" />}
                  <span>{integrityStatus.isValid ? `All ${integrityStatus.checkedCount} records mathematically verified!` : 'Integrity compromise detected!'}</span>
                </div>
              )}

              <button
                onClick={handleVerifyIntegrity}
                disabled={isVerifying}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-lg shadow-cyan-950/50 transition cursor-pointer"
              >
                {isVerifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                <span>Verify Ledger Integrity</span>
              </button>

              {isAdmin && (
                <button
                  onClick={handleClearLogs}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                  title="Reset Audit Ledger (Admin Only)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <div className="relative flex-1 min-w-[240px]">
              <input
                type="text"
                placeholder="Search audit records by ID, action, file name, or case ID..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-cyan-300 focus:border-cyan-500 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-500 text-[11px]">Module:</span>
              {(['ALL', 'DRIVE_ERASER', 'FILE_ERASER', 'CARVER_RECOVERY', 'COMPLIANCE', 'SYSTEM'] as const).map((mod) => (
                <button
                  key={mod}
                  onClick={() => setModuleFilter(mod)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] transition cursor-pointer ${
                    moduleFilter === mod
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mod.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Audit Records Table */}
          <div className="overflow-x-auto border border-slate-800 rounded-2xl shadow-xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <th className="p-3.5">Record ID</th>
                  <th className="p-3.5">Timestamp (UTC)</th>
                  <th className="p-3.5">Action Type</th>
                  <th className="p-3.5">Target Identifier</th>
                  <th className="p-3.5">Operator</th>
                  <th className="p-3.5">Details & Annotations</th>
                  <th className="p-3.5">Merkle Hash</th>
                  {isAdmin && <th className="p-3.5 text-right">Admin Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 text-[11px]">
                {filteredRecords.map((rec, idx) => (
                  <tr key={`${rec.id}-${idx}`} className="hover:bg-slate-800/30 transition">
                    <td className="p-3.5 font-bold text-cyan-400 whitespace-nowrap">
                      {rec.id}
                      {rec.editedBy && (
                        <span className="block text-[9px] text-purple-400 font-normal">Edited by Admin</span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-400 whitespace-nowrap">{rec.timestamp.slice(0, 19).replace('T', ' ')}</td>
                    <td className="p-3.5 whitespace-nowrap">
                      <Badge variant={rec.action === 'LOG_ENTRY_EDITED_BY_ADMIN' ? 'purple' : rec.module === 'DRIVE_ERASER' ? 'cyan' : rec.module === 'FILE_ERASER' ? 'emerald' : 'purple'}>
                        {rec.action.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-slate-200 font-semibold truncate max-w-[150px]" title={rec.targetIdentifier}>
                      {rec.targetIdentifier}
                    </td>
                    <td className="p-3.5 text-slate-400 truncate max-w-[130px]">{rec.operator}</td>
                    <td className="p-3.5 text-slate-300 leading-relaxed min-w-[220px]">
                      <div>{rec.details}</div>
                      {rec.caseReference && (
                        <div className="mt-1 text-[10px] text-purple-300 font-bold">
                          Case Ref: {rec.caseReference}
                        </div>
                      )}
                      {rec.forensicNotes && (
                        <div className="mt-0.5 text-[10px] text-slate-400 italic">
                          Auditor Note: {rec.forensicNotes}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-500 font-mono text-[9px] truncate max-w-[110px]" title={rec.currentRecordHash}>
                      {rec.currentRecordHash.slice(0, 14)}...
                    </td>

                    {/* Admin Action: Edit Button */}
                    {isAdmin && (
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setEditingRecord(rec)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-500/50 hover:bg-purple-900 text-purple-300 font-semibold text-xs transition cursor-pointer shadow-sm ml-auto"
                          title="Edit this log record, add case annotations, and re-certify Merkle hash"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Log</span>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Shredded Files Vault */}
      {activeTab === 'SHREDDED_FILES' && (
        <ShreddedFilesInspector />
      )}

      {/* Tab 3: Compliance Standards Matrix */}
      {activeTab === 'COMPLIANCE_MATRIX' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COMPLIANCE_REQUIREMENTS.map((req) => (
              <CyberCard key={req.id} variant="cyan" className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">{req.standardName}</h3>
                    <span className="text-[10px] text-cyan-400">{req.section}</span>
                  </div>
                  <Badge variant={req.status === 'EXCEEDS_REQUIREMENT' ? 'purple' : 'emerald'}>
                    {req.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="space-y-2 text-[11px] text-slate-300 leading-relaxed">
                  <div>
                    <strong className="text-slate-400 block text-[10px] uppercase">Requirement:</strong>
                    <p className="text-slate-400">{req.requirementText}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80">
                    <strong className="text-emerald-400 block text-[10px] uppercase">Implementation in Suite:</strong>
                    <p className="text-slate-200">{req.implementationInApp}</p>
                  </div>
                </div>
              </CyberCard>
            ))}
          </div>
        </div>
      )}

      {/* Edit Log Modal for Admins */}
      {editingRecord && (
        <EditLogModal
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSave={handleSaveEditedRecord}
        />
      )}
    </div>
  );
};

