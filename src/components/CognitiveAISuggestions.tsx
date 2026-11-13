/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Sparkles, ArrowRight, RotateCw, Check, Lightbulb, Compass, Heart } from 'lucide-react';

interface CognitiveAISuggestionsProps {
  stage: number;
  situation: string;
  emotion: string;
  automaticThought: string;
  selectedDistortions: string[];
  evidenceAgainst: string;
  onApplySuggestion: (text: string) => void;
  onSelectTrap?: (trapId: string) => void;
}

export const CognitiveAISuggestions: React.FC<CognitiveAISuggestionsProps> = ({
  stage,
  situation,
  emotion,
  automaticThought,
  selectedDistortions,
  evidenceAgainst,
  onApplySuggestion,
  onSelectTrap,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [variantOffset, setVariantOffset] = useState<number>(0);

  // Generate context-aware AI reframes tailored to student input
  const suggestions = useMemo(() => {
    const rawThought = automaticThought.trim() || 'I am going to fail and let everyone down.';
    const rawSituation = situation.trim() || 'An upcoming high-stakes challenge';
    const primaryEmotion = emotion || 'Anxious';

    // Tailored variations based on emotion and thought content
    const variants = [
      {
        type: 'Self-Compassion',
        icon: Heart,
        accent: 'text-rose-300 border-rose-500/30 bg-rose-500/10',
        text: `It is completely natural to feel ${primaryEmotion.toLowerCase()} given ${rawSituation.toLowerCase().slice(0, 45)}. Feeling nervous or doubting myself is my brain trying to protect me, not proof that things will go wrong. I can treat myself with kindness right now.`,
      },
      {
        type: 'Objective Evidence',
        icon: Compass,
        accent: 'text-teal-300 border-teal-500/30 bg-teal-500/10',
        text: evidenceAgainst.trim()
          ? `Looking at the facts: ${evidenceAgainst.trim().slice(0, 70)}. My automatic thought ("${rawThought.slice(0, 40)}...") is an assumption under stress, not a certified fact. The most probable outcome is manageable.`
          : `While "${rawThought.slice(0, 45)}..." feels intensely true right now, my past track record shows I have handled difficult moments before. Emotions are information, not definitive facts about my future.`,
      },
      {
        type: 'Grounded Action',
        icon: Lightbulb,
        accent: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
        text: `I cannot control every external variable, but I can control my breathing and my next single step. Instead of solving the entire semester or future right now, I will take it one hour and one task at a time.`,
      },
    ];

    if (variantOffset % 2 === 1) {
      return [variants[1], variants[0], variants[2]];
    }
    return variants;
  }, [automaticThought, situation, emotion, evidenceAgainst, variantOffset]);

  const handleApply = (text: string, index: number) => {
    onApplySuggestion(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setVariantOffset((prev) => prev + 1);
      setIsGenerating(false);
    }, 400);
  };

  // Only render on relevant stages (Stage 3 thought guidance, Stage 4 facts, Stage 5 reframe)
  if (stage !== 3 && stage !== 4 && stage !== 5) {
    return null;
  }

  // STAGE 3: AI Socratic Thinking Trap Detector
  if (stage === 3) {
    const detectedTrap =
      automaticThought.toLowerCase().includes('fail') || automaticThought.toLowerCase().includes('ruin')
        ? 'catastrophizing'
        : automaticThought.toLowerCase().includes('everyone') || automaticThought.toLowerCase().includes('think')
        ? 'mind-reading'
        : 'all-or-nothing';

    const trapName =
      detectedTrap === 'catastrophizing'
        ? 'Catastrophizing & Fortune Telling'
        : detectedTrap === 'mind-reading'
        ? 'Mind Reading'
        : 'All-or-Nothing Thinking';

    return (
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0d2233] to-[#0a1a26] border border-[#26c6da]/30 text-white space-y-2 animate-fadeIn shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#26c6da]/20 flex items-center justify-center text-[#26c6da]">
              <Sparkles className="w-3 h-3" />
            </div>
            <span className="text-xs font-bold text-white tracking-wide">
              AI Socratic Insight
            </span>
          </div>
          <span className="text-[10px] text-[#26c6da] font-mono font-semibold">CBT Engine</span>
        </div>

        <p className="text-xs text-[#93c5d6] leading-relaxed">
          {automaticThought.trim()
            ? `Notice the pattern in "${automaticThought.slice(0, 50)}...". This strongly resembles `
            : 'As you describe your thought, the AI assists in identifying cognitive distortions like '}
          <strong className="text-amber-300 font-semibold">{trapName}</strong>.
        </p>

        {onSelectTrap && !selectedDistortions.includes(detectedTrap) && (
          <button
            type="button"
            onClick={() => onSelectTrap(detectedTrap)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#002f44] hover:bg-[#003d58] border border-[#26c6da]/40 text-xs text-[#26c6da] font-semibold transition active:scale-95"
          >
            <span>Tag &quot;{trapName}&quot;</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  // STAGE 4: AI Fact-Finding Prompts
  if (stage === 4) {
    return (
      <div className="p-3 rounded-2xl bg-[#001c2c] border border-[#003d59] text-xs text-[#93c5d6] space-y-2 animate-fadeIn">
        <div className="flex items-center gap-1.5 text-[#26c6da] font-semibold text-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Fact-Checking Socratic Inquiries:</span>
        </div>
        <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-300 pl-1 leading-relaxed">
          <li>&quot;If a close friend had this exact worry, what observable counter-evidence would you point out to them?&quot;</li>
          <li>&quot;Have there been times when you predicted total failure, yet navigated through anyway?&quot;</li>
        </ul>
      </div>
    );
  }

  // STAGE 5: Flagship AI Cognitive Reframe Engine
  return (
    <div className="p-4 rounded-3xl bg-gradient-to-br from-[#061b2b] via-[#082236] to-[#041521] border border-[#26c6da]/40 text-white space-y-3 shadow-xl animate-fadeIn relative overflow-hidden">
      {/* Radiant corner glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#26c6da]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#26c6da]/20 border border-[#26c6da]/40 flex items-center justify-center text-[#26c6da]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                AI Cognitive Reframe Engine
              </h4>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live
              </span>
            </div>
            <p className="text-[10px] text-[#93c5d6]">
              Clinical Socratic suggestions based on your situation &amp; facts
            </p>
          </div>
        </div>

        {/* Regenerate Inspiration button */}
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={isGenerating}
          className="flex items-center gap-1 text-[11px] text-[#26c6da] hover:text-white px-2.5 py-1 rounded-xl bg-[#001b29] hover:bg-[#00283c] border border-[#00344d] transition active:scale-95 disabled:opacity-50"
          title="Generate alternative perspective angles"
        >
          <RotateCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Suggestion Cards Stack */}
      <div className="space-y-2 pt-1">
        {suggestions.map((item, idx) => {
          const Icon = item.icon;
          const isCopied = copiedIndex === idx;

          return (
            <div
              key={item.type}
              className="p-3 rounded-2xl bg-[#001622]/90 border border-[#002f47] hover:border-[#26c6da]/50 transition group space-y-2 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-[#26c6da]" />
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${item.accent}`}>
                    {item.type}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleApply(item.text, idx)}
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-xl transition active:scale-95 shadow-xs ${
                    isCopied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#26c6da] hover:bg-[#20b2c4] text-[#001724]'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 stroke-[2.5]" />
                      <span>Applied!</span>
                    </>
                  ) : (
                    <>
                      <span>Use This Reframe</span>
                      <ArrowRight className="w-3 h-3 stroke-[2.2]" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-sans select-text">
                &ldquo;{item.text}&rdquo;
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
