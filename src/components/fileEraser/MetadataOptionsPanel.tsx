import React from 'react';
import { MetadataCleansingConfig } from '../../types/fileEraser';
import { ShieldCheck, Clock, FileKey, Sparkles, Binary, RefreshCw, CheckCircle2, HelpCircle } from 'lucide-react';
import { Badge } from '../common/Badge';
import { useUI } from '../../context/UIContext';

interface MetadataOptionsPanelProps {
  config: MetadataCleansingConfig;
  onChange: (config: MetadataCleansingConfig) => void;
  disabled?: boolean;
}

export const MetadataOptionsPanel: React.FC<MetadataOptionsPanelProps> = ({
  config,
  onChange,
  disabled = false
}) => {
  const { isSimpleMode } = useUI();

  const toggleOption = (key: keyof MetadataCleansingConfig) => {
    if (disabled) return;
    if (typeof config[key] === 'boolean') {
      onChange({
        ...config,
        [key]: !config[key]
      });
    }
  };

  const applyPreset = (preset: 'QUICK' | 'DEEP') => {
    if (disabled) return;
    if (preset === 'QUICK') {
      onChange({
        zeroTimestamps: true,
        purgeAlternateDataStreams: true,
        wipeFileSlackSpace: false,
        obfuscateFileName: true,
        sanitizeMFTRecord: true,
        wipeExtendedAttributes: false,
        passes: 1,
        patternType: 'ZERO'
      });
    } else {
      onChange({
        zeroTimestamps: true,
        purgeAlternateDataStreams: true,
        wipeFileSlackSpace: true,
        obfuscateFileName: true,
        sanitizeMFTRecord: true,
        wipeExtendedAttributes: true,
        passes: 3,
        patternType: 'DOD_TRIPLE'
      });
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-sm text-slate-100">
            {isSimpleMode ? "Step 2: Deep Cleaning & Privacy Options" : "Forensic Metadata Cleansing & Anti-Forensics Neutralizer"}
          </h3>
        </div>

        {/* Quick Presets for Simple Mode */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => applyPreset('QUICK')}
            disabled={disabled}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition cursor-pointer"
          >
            Standard Clean
          </button>
          <button
            type="button"
            onClick={() => applyPreset('DEEP')}
            disabled={disabled}
            className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-semibold hover:bg-emerald-900 transition cursor-pointer"
          >
            Maximum Scrub (Recommended)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        
        {/* MACB Timestamps Option */}
        <label 
          onClick={() => toggleOption('zeroTimestamps')}
          className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
            config.zeroTimestamps ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-slate-950/60 border-slate-800 opacity-60'
          }`}
        >
          <input 
            type="checkbox" 
            checked={config.zeroTimestamps} 
            onChange={() => {}} 
            className="mt-1 accent-emerald-500 w-4 h-4" 
            disabled={disabled}
          />
          <div className="text-xs space-y-1">
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> 
              {isSimpleMode ? "Erase File Dates (Created & Modified)" : "Zero MACB Timestamps"}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Zeros out hidden date/time records so no one can see when the file was created, edited, or opened.
            </p>
          </div>
        </label>

        {/* NTFS Alternate Data Streams (ADS) Option */}
        <label 
          onClick={() => toggleOption('purgeAlternateDataStreams')}
          className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
            config.purgeAlternateDataStreams ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-slate-950/60 border-slate-800 opacity-60'
          }`}
        >
          <input 
            type="checkbox" 
            checked={config.purgeAlternateDataStreams} 
            onChange={() => {}} 
            className="mt-1 accent-emerald-500 w-4 h-4" 
            disabled={disabled}
          />
          <div className="text-xs space-y-1">
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <FileKey className="w-3.5 h-3.5 text-amber-400" /> 
              {isSimpleMode ? "Erase Hidden Web Download Tags" : "Purge Alternate Data Streams (ADS)"}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Removes invisible secondary tags (like the website URL where the file was downloaded).
            </p>
          </div>
        </label>

        {/* File Slack Space Wiping Option */}
        <label 
          onClick={() => toggleOption('wipeFileSlackSpace')}
          className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
            config.wipeFileSlackSpace ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-slate-950/60 border-slate-800 opacity-60'
          }`}
        >
          <input 
            type="checkbox" 
            checked={config.wipeFileSlackSpace} 
            onChange={() => {}} 
            className="mt-1 accent-emerald-500 w-4 h-4" 
            disabled={disabled}
          />
          <div className="text-xs space-y-1">
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <Binary className="w-3.5 h-3.5 text-purple-400" /> 
              {isSimpleMode ? "Scrub Residual Slack Memory" : "Overwrite Cluster Slack Space"}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Overwrites leftover memory bytes between the end of the file and the hard drive sector.
            </p>
          </div>
        </label>

        {/* Filename Obfuscation Option */}
        <label 
          onClick={() => toggleOption('obfuscateFileName')}
          className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
            config.obfuscateFileName ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-slate-950/60 border-slate-800 opacity-60'
          }`}
        >
          <input 
            type="checkbox" 
            checked={config.obfuscateFileName} 
            onChange={() => {}} 
            className="mt-1 accent-emerald-500 w-4 h-4" 
            disabled={disabled}
          />
          <div className="text-xs space-y-1">
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" /> 
              {isSimpleMode ? "Scramble File Name Before Delete" : "256-Char Filename Obfuscation"}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Renames the file to random gibberish before deleting so forensic tools cannot see original titles.
            </p>
          </div>
        </label>

        {/* MFT Record / Inode Overwrite */}
        <label 
          onClick={() => toggleOption('sanitizeMFTRecord')}
          className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
            config.sanitizeMFTRecord ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-slate-950/60 border-slate-800 opacity-60'
          }`}
        >
          <input 
            type="checkbox" 
            checked={config.sanitizeMFTRecord} 
            onChange={() => {}} 
            className="mt-1 accent-emerald-500 w-4 h-4" 
            disabled={disabled}
          />
          <div className="text-xs space-y-1">
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-sky-400" /> 
              {isSimpleMode ? "Wipe File Table Pointers ($MFT)" : "Sanitize $MFT & Inode Pointers"}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Clears the hard drive directory pointer entry so the operating system loses all traces.
            </p>
          </div>
        </label>

        {/* Overwrite Passes Selector */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between">
          <div className="text-xs space-y-1">
            <span className="font-bold text-slate-200 block">Wipe Strength Algorithm</span>
            <select
              value={config.patternType}
              onChange={(e) => onChange({ ...config, patternType: e.target.value as any })}
              disabled={disabled}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-semibold focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="ZERO">1 Pass (0x00 Zeroes - Standard)</option>
              <option value="DOD_TRIPLE">3 Passes (DoD Military Grade)</option>
              <option value="RANDOM">2 Passes (Random Cryptographic Noise)</option>
              <option value="GUTMANN">35 Passes (Peter Gutmann Algorithm)</option>
            </select>
          </div>
          <span className="text-[10px] text-slate-500 mt-2 font-mono">
            Verification: Automatic Read-Back Check
          </span>
        </div>

      </div>
    </div>
  );
};
