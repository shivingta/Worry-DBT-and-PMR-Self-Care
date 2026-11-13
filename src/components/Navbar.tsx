/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Wind, RotateCcw, Brain } from 'lucide-react';
import { useDiary } from '../context/DiaryContext';
import { MannkaaMainTab } from '../types';

interface NavbarProps {
  currentTab: MannkaaMainTab;
  onOpenBreathingModal: () => void;
  onOpenCustomizeModal: () => void;
  onGoToCBT: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBreathingModal,
  onGoToCBT,
}) => {
  const { resetToSampleData, stats } = useDiary();

  return (
    <header
      id="main-mobile-header"
      className="sticky top-0 z-30 bg-[#001724]/95 text-white border-b border-[#002d3f] px-4 py-2.5 backdrop-blur-md"
    >
      <div className="max-w-md mx-auto flex items-center justify-between">
        
        {/* Brand & CBT Thought Record Link */}
        <button
          onClick={onGoToCBT}
          className="flex items-center gap-2.5 text-left group"
          title="Open CBT Thought Diary in Self Care"
        >
          <div className="w-8 h-8 rounded-xl bg-[#26c6da]/20 border border-[#26c6da]/40 flex items-center justify-center text-[#26c6da] shadow-inner group-hover:scale-105 transition">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-white font-serif tracking-tight">
                Mannkaa
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#00283c] text-[#26c6da] border border-[#003d58]">
                CBT
              </span>
            </div>
            <p className="text-[10px] text-[#93c5d6] group-hover:text-[#26c6da] transition">
              {stats.totalThoughtRecords} records logged
            </p>
          </div>
        </button>

        {/* Quick Tools */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              if (
                window.confirm(
                  'Reset all thought records and settings to initial sample data?'
                )
              ) {
                resetToSampleData();
              }
            }}
            className="p-1.5 rounded-xl text-[#93c5d6] hover:text-white hover:bg-[#00283c] transition"
            title="Reset to sample data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
};
