/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  Brain,
  Trash2,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { PaperShredderVisualizer } from './PaperShredderVisualizer';

export interface ResolutionWorry {
  id: string;
  text: string;
  type: 'actionable' | 'hypothetical';
  actionStep?: string;
  timestamp: string;
  resolved: boolean;
  cbtReframe?: {
    balancedThought: string;
    distortion?: string;
    completedAt: string;
  };
}

interface WorryResolutionModalProps {
  worry: ResolutionWorry | null;
  isOpen: boolean;
  onClose: () => void;
  onExecuteMicroAction: (worryId: string) => void;
  onNavigateToCbt: (worry: ResolutionWorry) => void;
  onShredWorry: (worryId: string) => void;
  onPaperTearSound?: () => void;
}

export const WorryResolutionModal: React.FC<WorryResolutionModalProps> = ({
  worry,
  isOpen,
  onClose,
  onExecuteMicroAction,
  onNavigateToCbt,
  onShredWorry,
  onPaperTearSound,
}) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'micro_action' | 'shredder'>('menu');
  const [microSecondsLeft, setMicroSecondsLeft] = useState<number>(300); // 5:00
  const [isMicroTimerRunning, setIsMicroTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('menu');
      setMicroSecondsLeft(300);
      setIsMicroTimerRunning(false);
    }
  }, [isOpen, worry]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isMicroTimerRunning && microSecondsLeft > 0) {
      interval = setInterval(() => {
        setMicroSecondsLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMicroTimerRunning, microSecondsLeft]);

  if (!isOpen || !worry) return null;

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#001724] border border-[#00384f] rounded-t-3xl sm:rounded-3xl shadow-2xl text-white overflow-hidden flex flex-col max-h-[92vh]">
        {/* Mobile Sheet Grabber Handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-[#001420]">
          <div className="w-10 h-1 rounded-full bg-[#00384f]" />
        </div>

        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-[#002d40] flex items-center justify-between shrink-0 bg-[#001420]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#26c6da] animate-pulse" />
            <h3 className="text-sm font-extrabold text-white tracking-tight">
              Clinical Review &amp; Resolution
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#719bb0] hover:text-white hover:bg-[#00283d] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Active Worry Card */}
          <div className="p-3.5 rounded-2xl bg-[#00111a] border border-[#002b3d] text-left">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#7ea5ba]">
                PARKED CONCERN
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  worry.type === 'actionable'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                }`}
              >
                {worry.type === 'actionable' ? '⚡ Actionable' : '🌀 Hypothetical'}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-white italic leading-relaxed">
              &ldquo;{worry.text}&rdquo;
            </p>
            {worry.actionStep && (
              <div className="mt-2 pt-2 border-t border-[#002233] flex items-center gap-1.5 text-xs text-emerald-300 font-semibold">
                <span>Micro-action:</span>
                <span className="text-emerald-100 font-normal">{worry.actionStep}</span>
              </div>
            )}
          </div>

          {/* VIEW: MAIN 3-WAY CHOICE MENU */}
          {activeTab === 'menu' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="text-left">
                <span className="text-[10px] font-bold tracking-widest text-[#26c6da] uppercase">
                  THERAPEUTIC RESOLUTION PATHWAYS
                </span>
                <h4 className="text-base font-black text-white tracking-tight mt-0.5">
                  How would you like to process this concern?
                </h4>
              </div>

              {/* Pathway 1: Execute Micro-Action */}
              <button
                onClick={() => setActiveTab('micro_action')}
                className="w-full p-3.5 rounded-2xl bg-[#032e29]/70 hover:bg-[#032e29] border-2 border-[#10b981]/50 hover:border-[#10b981] text-left transition-all cursor-pointer shadow-md group"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#10b981]/25 text-[#34d399] flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white group-hover:text-emerald-200">
                      1. Execute 5-Min Micro-Action
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    Action Plan →
                  </span>
                </div>
                <p className="text-[11px] text-[#a7f3d0]/80 leading-relaxed ml-9">
                  Run a bounded 5-minute timer right now to take back immediate control.
                </p>
              </button>

              {/* Pathway 2: CBT Thought Record Navigation */}
              <button
                onClick={() => {
                  onNavigateToCbt(worry);
                }}
                className="w-full p-3.5 rounded-2xl bg-[#002235]/70 hover:bg-[#002235] border-2 border-[#26c6da]/50 hover:border-[#26c6da] text-left transition-all cursor-pointer shadow-md group"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#26c6da]/25 text-[#26c6da] flex items-center justify-center">
                      <Brain className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white group-hover:text-teal-200">
                      2. Reframe with CBT Thought Record
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#26c6da] uppercase tracking-wider">
                    Open CBT →
                  </span>
                </div>
                <p className="text-[11px] text-[#93c5d6] leading-relaxed ml-9">
                  Navigate into the 5-step CBT thought record to test evidence and build a balanced perspective.
                </p>
              </button>

              {/* Pathway 3: Shred & Release */}
              <button
                onClick={() => setActiveTab('shredder')}
                className="w-full p-3.5 rounded-2xl bg-[#2a121d]/70 hover:bg-[#2a121d] border-2 border-rose-500/50 hover:border-rose-400 text-left transition-all cursor-pointer shadow-md group"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/25 text-rose-300 flex items-center justify-center">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white group-hover:text-rose-200">
                      3. Shred &amp; Defuse Groundless Loop
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                    Shred →
                  </span>
                </div>
                <p className="text-[11px] text-rose-200/80 leading-relaxed ml-9">
                  Somatic release for hypothetical fears that have faded or have no factual basis.
                </p>
              </button>
            </div>
          )}

          {/* VIEW: MICRO-ACTION 5-MIN RUNNER */}
          {activeTab === 'micro_action' && (
            <div className="space-y-4 animate-in fade-in text-center">
              <div className="p-5 rounded-2xl bg-[#032e29] border border-[#10b981]/60 relative overflow-hidden">
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block mb-2">
                  5-MINUTE EXECUTIVE ACTION RUNNER
                </span>

                <div className="relative inline-flex items-center justify-center my-2">
                  {isMicroTimerRunning && (
                    <span className="absolute -inset-2 rounded-2xl border border-emerald-400/40 animate-ping pointer-events-none" />
                  )}
                  <div className="text-3xl font-mono font-black text-white tracking-wider px-4 py-1.5 rounded-xl bg-[#001724]/60 border border-[#10b981]/40">
                    {formatTimer(microSecondsLeft)}
                  </div>
                </div>

                <p className="text-xs text-emerald-200 font-medium leading-relaxed mt-2">
                  {worry.actionStep || 'Focus exclusively on your small micro-step right now.'}
                </p>

                {/* Micro Timer Controls */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() => setIsMicroTimerRunning((prev) => !prev)}
                    className="px-4 py-1.5 rounded-full bg-[#10b981] hover:bg-emerald-400 text-[#001724] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition"
                  >
                    {isMicroTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isMicroTimerRunning ? 'Pause' : 'Start Timer'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMicroTimerRunning(false);
                      setMicroSecondsLeft(300);
                    }}
                    className="px-3 py-1.5 rounded-full border border-[#10b981]/50 text-emerald-300 text-xs font-semibold hover:bg-[#10b981]/15 cursor-pointer transition"
                    title="Reset 5-minute timer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  onClick={() => setActiveTab('menu')}
                  className="px-4 py-2.5 rounded-full border border-[#00344d] bg-[#001a24] text-xs font-semibold text-[#93c5d6] hover:text-white cursor-pointer"
                >
                  ← Back to Options
                </button>
                <button
                  onClick={() => {
                    onExecuteMicroAction(worry.id);
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#10b981] hover:bg-emerald-400 text-[#001724] font-bold text-xs cursor-pointer shadow-md flex items-center gap-1.5 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Step Completed</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW: TACTILE MECHANICAL PAPER SHREDDER */}
          {activeTab === 'shredder' && (
            <div className="space-y-3 animate-in fade-in">
              <PaperShredderVisualizer
                worryText={worry.text}
                worryType={worry.type}
                onPaperTearSound={onPaperTearSound}
                onShredComplete={() => {
                  onShredWorry(worry.id);
                  onClose();
                }}
              />
              <button
                onClick={() => setActiveTab('menu')}
                className="text-xs text-[#93c5d6] hover:text-white cursor-pointer underline pt-1"
              >
                Cancel and return
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};