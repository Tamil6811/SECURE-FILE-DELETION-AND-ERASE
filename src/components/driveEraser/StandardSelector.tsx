import React from 'react';
import { ErasureStandard, ErasureStandardId } from '../../types/sanitization';
import { Shield, CheckCircle2, Award, Zap, Sparkles } from 'lucide-react';
import { Badge } from '../common/Badge';
import { useUI } from '../../context/UIContext';

export const ERASURE_STANDARDS: ErasureStandard[] = [
  {
    id: 'NIST_800_88_CLEAR',
    name: 'Quick Secure Wipe (1-Pass 0x00)',
    authority: 'NIST SP 800-88 Rev. 1 (Standard Clear)',
    category: 'CLEAR',
    passes: 1,
    description: 'Fastest and most popular. Overwrites the entire drive once with zeroes (0x00). Perfect for everyday privacy and selling drives safely.',
    passDetails: ['Pass 1: Write fixed pattern 0x00 across 100% of storage space, followed by read verification.'],
    recommendedFor: ['Selling USBs & Laptops', 'Everyday Media Reuse', 'HDDs & SSDs'],
    complianceLevel: 'Standard',
    verificationMethod: '100% Sector Zero Check'
  },
  {
    id: 'DOD_5220_22_M',
    name: 'Government Grade (3-Pass DoD)',
    authority: 'U.S. Department of Defense (NISPOM)',
    category: 'PURGE',
    passes: 3,
    description: 'Overwrites all sectors 3 times: first with zeroes (0x00), then with ones (0xFF), then with random noise. Highly secure.',
    passDetails: [
      'Pass 1: Overwrite with all binary zeroes (0x00)',
      'Pass 2: Overwrite with all binary ones (0xFF)',
      'Pass 3: Overwrite with pseudo-random cryptographic stream + Verification'
    ],
    recommendedFor: ['Confidential Records', 'Government Agencies', 'Enterprise Storage'],
    complianceLevel: 'Military',
    verificationMethod: 'Multi-Pass Inversion Check'
  },
  {
    id: 'IEEE_2883_2022',
    name: 'Modern SSD & NVMe Flash Purge',
    authority: 'IEEE 2883-2022 Standard for Sanitizing Storage',
    category: 'PURGE',
    passes: 2,
    description: 'Engineered specifically for modern NVMe and solid-state SSD flash storage to clear wear-leveling and spare blocks.',
    passDetails: [
      'Pass 1: Controller-level block erase & TRIM command broadcast',
      'Pass 2: Cryptographic key wipe + Reallocated Sector Purge'
    ],
    recommendedFor: ['NVMe M.2 SSDs', 'Solid State Drives', 'Fast Flash Cards'],
    complianceLevel: 'Forensic Purge',
    verificationMethod: 'Flash Block Range Purge Check'
  },
  {
    id: 'DOD_5220_22_M_ECE',
    name: 'Maximum Military (7-Pass Enhanced)',
    authority: 'U.S. Department of Defense (DoD 5220.22-M ECE)',
    category: 'PURGE',
    passes: 7,
    description: '7-pass military standard executing alternating character sequences, zeroes, ones, and cryptographic noise with full verification.',
    passDetails: [
      'Pass 1: 0x00 Zeroes',
      'Pass 2: 0xFF Ones',
      'Pass 3: Random Noise',
      'Pass 4: 0x96 Pattern',
      'Pass 5: 0x00 Zeroes',
      'Pass 6: 0xFF Ones',
      'Pass 7: Random Stream + 100% Verify'
    ],
    recommendedFor: ['Classified Environments', 'High-Risk Storage Destruction'],
    complianceLevel: 'Military',
    verificationMethod: '7-Pass Resonance Verification'
  },
  {
    id: 'NIST_800_88_PURGE',
    name: 'NIST Forensic Purge & Crypto Wipe',
    authority: 'NIST SP 800-88 Rev. 1 (Purge Level)',
    category: 'PURGE',
    passes: 3,
    description: 'Executes physical sanitization and cryptographic key eradication to render forensic lab recovery completely infeasible.',
    passDetails: [
      'Pass 1: ATA/NVMe Sanitize Crypto Scramble',
      'Pass 2: Pseudo-random block distribution',
      'Pass 3: Zero fill + Spare Area Flush'
    ],
    recommendedFor: ['Enterprise NVMe Arrays', 'Sensitive Healthcare Data'],
    complianceLevel: 'Forensic Purge',
    verificationMethod: 'Cryptographic Hash Inspection'
  },
  {
    id: 'GUTMANN_35',
    name: 'Peter Gutmann (35-Pass Exhaustive)',
    authority: 'Peter Gutmann (University of Auckland)',
    category: 'DESTROY',
    passes: 35,
    description: 'Comprehensive 35-pass algorithm designed to defeat magnetic microscopy recovery on legacy magnetic drives.',
    passDetails: [
      'Passes 1-4: Pseudo-random patterns',
      'Passes 5-31: 27 specific magnetic transition test patterns',
      'Passes 32-35: Pseudo-random overwrites'
    ],
    recommendedFor: ['Legacy Magnetic Media', 'Ultra-High Paranoia'],
    complianceLevel: 'Government',
    verificationMethod: 'Full LBA Transition Check'
  }
];

interface StandardSelectorProps {
  selectedStandardId: ErasureStandardId;
  onSelectStandard: (id: ErasureStandardId) => void;
  disabled?: boolean;
}

export const StandardSelector: React.FC<StandardSelectorProps> = ({
  selectedStandardId,
  onSelectStandard,
  disabled = false
}) => {
  const { isSimpleMode } = useUI();

  // In simple mode, prioritize the top 3 most common options!
  const displayedStandards = isSimpleMode 
    ? ERASURE_STANDARDS.slice(0, 3) 
    : ERASURE_STANDARDS;

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          {isSimpleMode ? "Step 2: Choose Wipe Strength" : "Select Sanitization Standard & Destruction Protocol"}
        </label>
        <span className="text-xs text-cyan-400 font-medium">
          {isSimpleMode ? "3 Recommended Options" : "6 Statutory Standards Active"}
        </span>
      </div>

      <div className={`grid grid-cols-1 ${isSimpleMode ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'} gap-3`}>
        {displayedStandards.map((std) => {
          const isSelected = selectedStandardId === std.id;

          return (
            <div
              key={std.id}
              onClick={() => !disabled && onSelectStandard(std.id)}
              className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-cyan-950/50 border-cyan-400 shadow-lg shadow-cyan-950/60 ring-1 ring-cyan-400/40'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-bold text-sm text-slate-100">{std.name}</span>
                  <Badge variant={std.passes === 1 ? 'emerald' : std.passes === 3 ? 'cyan' : 'rose'}>
                    {std.passes} {std.passes === 1 ? 'PASS (FAST)' : `${std.passes} PASSES`}
                  </Badge>
                </div>
                <p className="text-[11px] text-cyan-400 mb-2 font-medium">{std.authority}</p>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {std.description}
                </p>
              </div>

              <div className="pt-2.5 border-t border-slate-800/80 text-xs text-slate-400 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Best For:</span>
                  <span className="text-slate-200 font-medium truncate max-w-[170px] text-right">{std.recommendedFor[0]}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
