/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useDiary } from '../context/DiaryContext';
import { PetAvatar } from './PetAvatar';
import {
  Sparkles,
  Heart,
  PlusCircle,
  Flame,
  ArrowRight,
  Brain,
} from 'lucide-react';

interface HomeScreenProps {
  onGoToCBTExperience: (subTab?: 'records' | 'distortions') => void;
  onOpenThoughtModal: () => void;
  onOpenBreathingModal: () => void;
  onOpenLumiSanctuary: () => void;
  onGoToExperts: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onGoToCBTExperience,
  onOpenThoughtModal,
  onOpenBreathingModal,
  onOpenLumiSanctuary,
  onGoToExperts,
}) => {
  const { pet, stats } = useDiary();

  return (
    <div className="space-y-4 animate-fadeIn pb-6 text-white">
      
      {/* Welcome Greeting Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[11px] font-bold text-[#26c6da] uppercase tracking-wider">
            Namaste &amp; Welcome
          </span>
          <h1 className="text-xl font-bold text-white font-serif">
            Your Mannkaa Space
          </h1>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#00283c] border border-[#003d58] text-[#fbbf24] text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 fill-[#fbbf24] text-[#fbbf24]" />
          <span>{pet.streakDays}d Streak</span>
        </div>
      </div>

      {/* Flagship CBT Thought Record Spotlight */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#12364a] to-[#0a2333] border border-[#26c6da]/40 text-white shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#26c6da]/20 text-[#26c6da] border border-[#26c6da]/30">
            CBT Thought Record
          </span>
          <span className="text-xs text-[#26c6da] font-semibold">
            {stats.totalThoughtRecords} Entries Logged
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#001724]/80 border border-[#26c6da]/40 flex items-center justify-center shrink-0 text-[#26c6da]">
            <Brain className="w-7 h-7 stroke-[1.8]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-bold text-base text-white font-serif">
              CBT Thought Diary
            </div>
            <p className="text-xs text-[#93c5d6] leading-snug break-words">
              Catch automatic thoughts, examine facts &amp; reframe
            </p>
            <div className="text-[11px] text-[#719bb0] mt-1">
              Primary emotion: <span className="text-teal-300 font-medium">{stats.topEmotion}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={onOpenThoughtModal}
            className="text-xs text-[#26c6da] hover:text-white flex items-center gap-1 font-semibold transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Record Thought</span>
          </button>

          <button
            onClick={() => onGoToCBTExperience('records')}
            className="px-3.5 py-1.5 rounded-xl bg-[#26c6da] hover:bg-[#20b2c4] text-[#001724] font-bold text-xs transition flex items-center gap-1"
          >
            <span>Open Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mindful Companion (Lumi) Sanctuary Quick Access */}
      <div
        onClick={onOpenLumiSanctuary}
        className="p-4 rounded-3xl bg-gradient-to-r from-[#2a2415] to-[#1a1710] border border-amber-500/30 flex items-center justify-between cursor-pointer hover:border-amber-400/50 transition group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center p-0.5 group-hover:scale-105 transition">
            <PetAvatar
              archetype={pet.archetype}
              stage={pet.evolutionStage}
              moodExpression="peaceful"
              colorTheme={pet.colorTheme}
              size="sm"
              interactive={false}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-amber-200">
                {pet.name} Sanctuary
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30">
                Grounding
              </span>
            </div>
            <p className="text-xs text-amber-100/70 mt-0.5 leading-snug break-words">
              Take a mindful pause &amp; receive gentle comfort
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
          <Heart className="w-3.5 h-3.5 fill-amber-400" />
          <span>{pet.careHearts}</span>
        </div>
      </div>

    </div>
  );
};
