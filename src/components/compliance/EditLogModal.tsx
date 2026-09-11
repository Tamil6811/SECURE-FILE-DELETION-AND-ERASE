import React, { useState } from 'react';
import { AuditLogRecord } from '../../types/audit';
import { AuditService } from '../../services/auditService';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Edit3, 
  Save, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Hash, 
  User, 
  Calendar,
  Lock
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface EditLogModalProps {
  record: AuditLogRecord;
  onClose: () => void;
  onSave: (updated: AuditLogRecord) => void;
}

export const EditLogModal: React.FC<EditLogModalProps> = ({ record, onClose, onSave }) => {
  const { currentUser } = useAuth();
  const [details, setDetails] = useState(record.details);
  const [targetIdentifier, setTargetIdentifier] = useState(record.targetIdentifier);
  const [status, setStatus] = useState<AuditLogRecord['status']>(record.status);
  const [caseReference, setCaseReference] = useState(record.caseReference || 'CASE-2026-CR-904');
  const [forensicNotes, setForensicNotes] = useState(record.forensicNotes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const adminName = currentUser?.name || 'Dr. Elena Rostova (ADMIN)';
      const updated = await AuditService.getInstance().editLogRecord(
        record.id,
        {
          details,
          targetIdentifier,
          status,
          caseReference,
          forensicNotes
        },
        adminName
      );

      if (updated) {
        onSave(updated);
      }
    } catch (err) {
      console.error('Failed to update log record:', err);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-slate-100 uppercase tracking-wide">
                  Edit Audit Log Entry
                </h2>
                <Badge variant="purple" size="sm">ADMIN PRIVILEGE</Badge>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Modifying Record: <strong className="text-cyan-400">{record.id}</strong> ({record.action})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Admin Notice */}
          <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-purple-200 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-100">Cryptographic Re-Certification:</span>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                Saving modifications will update the record details, append your administrator credentials ({currentUser?.name}), and mathematically re-sign the Merkle blockchain hash chain.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
            {/* Record Metadata Display (Read-Only properties) */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block">Original Timestamp:</span>
              <span className="text-slate-300 font-semibold">{record.timestamp.slice(0, 19).replace('T', ' ')} UTC</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block">Original Operator:</span>
              <span className="text-cyan-300 font-semibold">{record.operator}</span>
            </div>
          </div>

          {/* Target Identifier */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 flex items-center gap-1.5">
              Target Identifier (File Name / Serial / Path):
            </label>
            <input
              type="text"
              value={targetIdentifier}
              onChange={(e) => setTargetIdentifier(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          {/* Details / Description */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 flex items-center gap-1.5">
              Event Details / Technical Description:
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-slate-200 focus:outline-none focus:border-cyan-500 text-xs leading-relaxed"
              required
            />
          </div>

          {/* Case Reference & Verification Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">
                Forensic Case Reference ID:
              </label>
              <input
                type="text"
                value={caseReference}
                onChange={(e) => setCaseReference(e.target.value)}
                placeholder="e.g. CASE-2026-NY-891..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 font-mono text-purple-300 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">
                Audit Verification Status:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="SUCCESS">SUCCESS (Normal)</option>
                <option value="VERIFIED">VERIFIED (Court-Certified)</option>
                <option value="WARNING">WARNING (Review Required)</option>
                <option value="FAILED">FAILED (Non-Compliant)</option>
              </select>
            </div>
          </div>

          {/* Forensic Notes / Auditor Legal Remarks */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 flex items-center gap-1.5">
              Forensic Auditor Remarks & Addendum:
            </label>
            <textarea
              value={forensicNotes}
              onChange={(e) => setForensicNotes(e.target.value)}
              placeholder="Add official administrative remarks, court case cross-reference, or verification notes..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-slate-200 focus:outline-none focus:border-purple-500 text-xs"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-950/50 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Re-Signing Merkle Chain..." : "Save Log & Re-Certify Chain"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
