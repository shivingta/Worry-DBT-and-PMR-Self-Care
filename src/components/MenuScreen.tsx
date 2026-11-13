/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useDiary } from '../context/DiaryContext';
import {
  Shield,
  PhoneCall,
  RotateCcw,
  Sparkles,
  Download,
  Bell,
  Heart,
  Brain,
} from 'lucide-react';

interface MenuScreenProps {
  onGoToSelfCare: () => void;
  onOpenCustomizeCompanion: () => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({
  onGoToSelfCare,
  onOpenCustomizeCompanion,
}) => {
  const { pet, resetToSampleData, clearAllData, thoughtRecords } = useDiary();

  const handleExportData = () => {
    const backup = {
      exportDate: new Date().toISOString(),
      companion: pet,
      thoughtRecords,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mannkaa-cbt-thought-diary-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-6 text-white">
      
      {/* Header */}
      <div className="pt-1">
        <span className="text-[11px] font-bold text-[#26c6da] uppercase tracking-wider">
          Account &amp; Settings
        </span>
        <h1 className="text-xl font-bold text-white font-serif">
          Mannkaa Menu
        </h1>
      </div>

      {/* Companion Card Shortcut */}
      <div className="p-4 rounded-3xl bg-[#002233] border border-[#00344d] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-xl">
            🐾
          </div>
          <div>
            <div className="font-bold text-sm text-white">{pet.name}</div>
            <div className="text-xs text-[#93c5d6]">
              Mindful Companion • {pet.streakDays} Day Streak
            </div>
          </div>
        </div>

        <button
          onClick={onOpenCustomizeCompanion}
          className="px-3 py-1.5 rounded-xl bg-[#002d42] border border-[#003e5a] hover:bg-[#003752] text-xs font-semibold text-[#26c6da] transition"
        >
          Customize
        </button>
      </div>

      {/* Menu Options Group 1 */}
      <div className="rounded-3xl bg-[#002233] border border-[#00344d] divide-y divide-[#002d42] overflow-hidden">
        
        <button
          onClick={onGoToSelfCare}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#00283c] transition text-left"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-[#26c6da]" />
            <span className="text-xs font-medium text-white">Self Care Library</span>
          </div>
          <span className="text-[11px] text-[#26c6da] font-medium">2 Core Tools</span>
        </button>

        <button
          onClick={handleExportData}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#00283c] transition text-left"
        >
          <div className="flex items-center gap-3">
            <Download className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-medium text-white">Export CBT Thought Records</span>
          </div>
          <span className="text-[11px] text-[#6b92a8]">JSON</span>
        </button>

        <button
          onClick={() => alert('Daily mindful reflection reminder scheduled for 9:00 AM.')}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#00283c] transition text-left"
        >
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-[#fbbf24]" />
            <span className="text-xs font-medium text-white">Thought Reflection Reminder</span>
          </div>
          <span className="text-[11px] text-[#26c6da] font-medium">9:00 AM</span>
        </button>

      </div>

      {/* Immediate Support Info */}
      <div className="p-4 rounded-3xl bg-[#00283c] border border-[#003c58] space-y-2">
        <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
          <PhoneCall className="w-4 h-4" />
          <span>Immediate Helpline Support (India)</span>
        </div>
        <p className="text-xs text-[#93c5d6] leading-relaxed">
          KIRAN Helpline: <strong>1800-599-0019</strong> (24x7 Toll-Free)
          <br />
          Tele-MANAS: <strong>14416</strong>
          <br />
          SRM Campus Support: <strong>Ext 4040 / 4041</strong>
        </p>
      </div>

      {/* Data Management */}
      <div className="rounded-3xl bg-[#002233] border border-[#00344d] divide-y divide-[#002d42] overflow-hidden">
        
        <button
          onClick={() => {
            if (window.confirm('Reset all thought records back to sample data?')) {
              resetToSampleData();
              alert('Reset to sample data completed!');
            }
          }}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#00283c] transition text-left"
        >
          <div className="flex items-center gap-3">
            <RotateCcw className="w-4 h-4 text-[#fbbf24]" />
            <span className="text-xs font-medium text-white">Restore Sample Records</span>
          </div>
        </button>

        <button
          onClick={() => {
            if (window.confirm('Clear all your thought records?')) {
              clearAllData();
              alert('All records cleared.');
            }
          }}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#00283c] transition text-left text-rose-400"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-medium">Clear All Data</span>
          </div>
        </button>

      </div>

      <div className="text-center pt-2">
        <p className="text-[11px] text-[#6b92a8]">
          Mannkaa CBT Thought Diary
        </p>
      </div>

    </div>
  );
};
