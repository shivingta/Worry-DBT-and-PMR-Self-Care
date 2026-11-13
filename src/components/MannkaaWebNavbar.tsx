/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronDown, MessageSquare } from 'lucide-react';

interface MannkaaWebNavbarProps {
  onGoToSelfCareLibrary: () => void;
  isCBTExperienceOpen?: boolean;
  onContactSupport?: () => void;
}

export const MannkaaWebNavbar: React.FC<MannkaaWebNavbarProps> = ({
  onGoToSelfCareLibrary,
  isCBTExperienceOpen = false,
  onContactSupport,
}) => {
  return (
    <header className="w-full bg-white border-b border-slate-200/90 px-6 sm:px-12 py-3 flex items-center justify-between sticky top-0 z-40 select-none shadow-xs">
      {/* Left: Mannkaa Logo */}
      <div
        onClick={onGoToSelfCareLibrary}
        className="flex items-center gap-2.5 cursor-pointer group"
      >
        {/* Teal Logo Mark matching Screenshot 1 */}
        <div className="w-8 h-8 rounded-lg bg-[#00a896] flex items-center justify-center p-1 text-white shadow-xs group-hover:opacity-95 transition">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            {/* Connected loops / mind wellness infinity emblem */}
            <circle cx="8" cy="12" r="3.5" />
            <circle cx="16" cy="12" r="3.5" />
            <path d="M 8 8.5 C 10 7, 14 7, 16 8.5" />
            <path d="M 8 15.5 C 10 17, 14 17, 16 15.5" />
          </svg>
        </div>

        <span className="text-xl font-bold font-sans tracking-tight text-[#002233]">
          Mannkaa
        </span>
      </div>

      {/* Middle Navigation Links (Clean, No Pills, Matches Screenshot 1) */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
        <button
          type="button"
          onClick={onGoToSelfCareLibrary}
          className="text-slate-600 hover:text-slate-900 transition cursor-pointer"
        >
          Dashboard
        </button>

        <button
          type="button"
          onClick={onGoToSelfCareLibrary}
          className="text-slate-600 hover:text-slate-900 transition cursor-pointer"
        >
          My Appointments
        </button>

        {/* Active Self Care Link */}
        <button
          type="button"
          onClick={onGoToSelfCareLibrary}
          className="text-[#00a896] font-semibold flex items-center gap-1 cursor-pointer transition relative"
        >
          <span>Self Care</span>
          <span className="absolute -bottom-3 left-0 right-0 h-0.5 bg-[#00a896] rounded-full" />
        </button>

        <div className="relative group cursor-pointer flex items-center gap-1 text-slate-600 hover:text-slate-900 transition">
          <span>Clinical Information</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition" />
        </div>

        <div className="relative group cursor-pointer flex items-center gap-1 text-slate-600 hover:text-slate-900 transition">
          <span>Other Information</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition" />
        </div>
      </nav>

      {/* Right Controls: Chat Button + Profile Avatar */}
      <div className="flex items-center gap-3">
        {/* Support Chat Bubble Button */}
        <button
          type="button"
          onClick={onContactSupport}
          className="w-9 h-9 rounded-full bg-[#00a896] hover:bg-[#009282] text-white flex items-center justify-center transition shadow-xs cursor-pointer"
          title="Contact Support"
        >
          <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
            <path d="M 20 2 H 4 C 2.9 2 2 2.9 2 4 V 22 L 6 18 H 20 C 21.1 18 22 21.1 22 20 V 4 C 22 2.9 21.1 2 20 2 Z" />
            <circle cx="8" cy="10" r="1.2" fill="#00a896" />
            <circle cx="12" cy="10" r="1.2" fill="#00a896" />
            <circle cx="16" cy="10" r="1.2" fill="#00a896" />
          </svg>
        </button>

        {/* User Profile Avatar */}
        <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 ring-2 ring-emerald-500/20 bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-900 shadow-xs cursor-pointer">
          <span className="tracking-tight">SB</span>
        </div>
      </div>
    </header>
  );
};
