/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronRight, Lock } from 'lucide-react';

interface SelfCareHubProps {
  onOpenDbtStop: () => void;
  onOpenPmr: () => void;
  onOpenWorryWindow: (mode?: 'triage' | 'vault') => void;
}

export const SelfCareHub: React.FC<SelfCareHubProps> = ({
  onOpenDbtStop,
  onOpenPmr,
  onOpenWorryWindow,
}) => {
  return (
    <div className="w-full space-y-4 select-none">
      <h1 className="text-xl sm:text-2xl font-extrabold text-white text-center tracking-tight mb-5">
        Self Care Library
      </h1>

      {/* 1. DBT STOP Skill Card */}
      <button
        onClick={onOpenDbtStop}
        className="w-full p-4 rounded-[26px] bg-[#E8DCFA] hover:bg-[#DFCFFA] active:scale-[0.99] transition-all flex items-center justify-between text-left shadow-md cursor-pointer group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/80 border border-purple-200 flex items-center justify-center shrink-0 shadow-xs">
            <div className="w-7 h-7 rounded-full bg-[#6D28D9] text-white flex items-center justify-center shadow-xs">
              <div className="flex items-center gap-0.5">
                <span className="w-0.5 h-2.5 bg-white rounded-full" />
                <span className="w-0.5 h-2.5 bg-white rounded-full" />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#1E1B4B] tracking-tight">
              DBT STOP Skill
            </h2>
            <p className="text-xs font-medium text-[#4C1D95]/85 mt-0.5">
              Bullet-time freeze &amp; values rail
            </p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#3B0764]/10 group-hover:bg-[#3B0764]/15 flex items-center justify-center text-[#3B0764] shrink-0 transition-colors">
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </div>
      </button>

      {/* 2. Muscle Relaxation (PMR) Card */}
      <button
        onClick={onOpenPmr}
        className="w-full p-4 rounded-[26px] bg-[#9CE8E4] hover:bg-[#8CE0DC] active:scale-[0.99] transition-all flex items-center justify-between text-left shadow-md cursor-pointer group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/80 border border-teal-200 flex items-center justify-center shrink-0 shadow-xs">
            <svg
              viewBox="0 0 32 32"
              className="w-7 h-7 text-[#0D9488]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 12C8.5 9.5 11.5 9.5 15 12C18.5 14.5 21.5 14.5 25 12"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <path
                d="M5 17.5C8.5 15 11.5 15 15 17.5C18.5 20 21.5 20 25 17.5"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <path
                d="M7 23C10 21 12.5 21 15.5 23C18.5 25 21 25 24 23"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#042F2E] tracking-tight">
              Muscle Relaxation
            </h2>
            <p className="text-xs font-medium text-[#115E59] mt-0.5">
              Head-to-toe tension release (PMR)
            </p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#042F2E]/10 group-hover:bg-[#042F2E]/15 flex items-center justify-center text-[#042F2E] shrink-0 transition-colors">
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </div>
      </button>

      {/* 3. Worry Window & Sorting Card (with Variant B Amber Vault & Time Dial SVG) */}
      <div className="w-full p-4 rounded-[26px] bg-[#DCF2E9] shadow-md transition-all">
        <div
          onClick={() => onOpenWorryWindow('triage')}
          className="flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            {/* Variant B SVG: Warm Amber Vault Shackle, Time Dial & Floating Capsule */}
            <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center shrink-0 shadow-xs">
              <svg
                viewBox="0 0 48 48"
                className="w-10 h-10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Lock Shackle */}
                <path
                  d="M18 17V13.5C18 10.4624 20.4624 8 23.5 8H24.5C27.5376 8 30 10.4624 30 13.5V17"
                  stroke="#D97706"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                {/* Vault Body */}
                <rect
                  x="13"
                  y="17"
                  width="22"
                  height="21"
                  rx="5"
                  fill="#FDE68A"
                  stroke="#D97706"
                  strokeWidth="2.2"
                />
                {/* Center Time Dial */}
                <circle
                  cx="24"
                  cy="27.5"
                  r="6.5"
                  fill="#FFFBEB"
                  stroke="#B45309"
                  strokeWidth="1.8"
                />
                <path
                  d="M24 24.2V27.5L26.3 29"
                  stroke="#B45309"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Floating Thought Capsule */}
                <rect
                  x="31"
                  y="10"
                  width="9.5"
                  height="4.8"
                  rx="2.4"
                  transform="rotate(-18 31 10)"
                  fill="#F59E0B"
                  stroke="#FFFBEB"
                  strokeWidth="1.2"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-base font-extrabold text-[#064E3B] tracking-tight">
                Worry Window &amp; Sorting
              </h2>
              <p className="text-xs font-medium text-[#065F46]/85 mt-0.5">
                Ground worries, seal in vault &amp; 15-min review
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-[#064E3B]/10 group-hover:bg-[#064E3B]/15 flex items-center justify-center text-[#064E3B] shrink-0 transition-colors">
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>

        {/* Dedicated Dual Action Shortcuts */}
        <div className="grid grid-cols-2 gap-2.5 mt-3.5 pt-3 border-t border-[#064E3B]/10">
          <button
            onClick={() => onOpenWorryWindow('triage')}
            className="py-2.5 px-3 rounded-xl bg-[#C7E7DA] hover:bg-[#B7DFCF] active:scale-[0.98] text-[#064E3B] font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>✍️</span>
            <span>Triage Worry</span>
          </button>
          <button
            onClick={() => onOpenWorryWindow('vault')}
            className="py-2.5 px-3 rounded-xl bg-[#053B30] hover:bg-[#042E25] active:scale-[0.98] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-300" />
            <span>Open Vault (15m)</span>
          </button>
        </div>
      </div>
    </div>
  );
};