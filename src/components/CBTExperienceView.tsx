/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useDiary } from '../context/DiaryContext';
import { ThoughtLog } from './ThoughtLog';
import { ThoughtRecordForm } from './ThoughtRecordForm';
import { BrainActivityPatternGraphic } from './BrainActivityPatternGraphic';
import { PersonalizedCognitiveInsights } from './PersonalizedCognitiveInsights';
import { ClinicalCBTAnalysisSuite } from './ClinicalCBTAnalysisSuite';
import {
  ArrowLeft,
  Brain,
  HelpCircle,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  TrendingDown,
  Clock,
  CheckCircle2,
  PlusCircle,
} from 'lucide-react';

export type CBTActiveView = 'overview' | 'past_records' | 'create';

interface CBTExperienceViewProps {
  onBackToSelfCareHub: () => void;
  onOpenThoughtModal?: () => void;
  onOpenDistortionGuide: () => void;
  initialView?: CBTActiveView;
  activeView?: CBTActiveView;
  onChangeView?: (view: CBTActiveView) => void;
}

export const CBTExperienceView: React.FC<CBTExperienceViewProps> = ({
  onBackToSelfCareHub,
  onOpenDistortionGuide,
  initialView = 'overview',
  activeView: controlledActiveView,
  onChangeView,
}) => {
  const { stats, thoughtRecords, deviceMode } = useDiary();
  const [internalActiveView, setInternalActiveView] = useState<CBTActiveView>(initialView);
  const [previewStage, setPreviewStage] = useState<number>(2);

  const isMobile = deviceMode === 'mobile';

  // Sync with controlled prop if passed
  useEffect(() => {
    if (controlledActiveView) {
      setInternalActiveView(controlledActiveView);
    }
  }, [controlledActiveView]);

  useEffect(() => {
    if (initialView) {
      setInternalActiveView(initialView);
    }
  }, [initialView]);

  const currentView = controlledActiveView || internalActiveView;

  const handleSetView = (view: CBTActiveView) => {
    setInternalActiveView(view);
    if (onChangeView) {
      onChangeView(view);
    }
  };

  // 1. NATIVE IN-APP THOUGHT RECORD CREATION SCREEN
  if (currentView === 'create') {
    return (
      <ThoughtRecordForm
        onBack={() => handleSetView('overview')}
        onComplete={() => handleSetView('past_records')}
        onOpenDistortionGuide={onOpenDistortionGuide}
      />
    );
  }

  // 2. NATIVE IN-APP PAST THOUGHT RECORDS FEED
  if (currentView === 'past_records') {
    return (
      <ThoughtLog
        onBackToCBTHome={() => handleSetView('overview')}
        onOpenCreateThought={() => handleSetView('create')}
      />
    );
  }

  // 3A. MOBILE APP CBT OVERVIEW (Preserves Authentic Mobile UI)
  if (isMobile) {
    return (
      <div className="space-y-4 animate-fadeIn pb-12">
        {/* Mobile Top Header with + New Button */}
        <div className="bg-[#001724]/95 text-white -mx-4 -mt-4 px-4 py-3 border-b border-[#002d3f] shadow-md sticky top-0 z-20 backdrop-blur-lg">
          <div className="flex items-center justify-between">
            {/* Back button */}
            <button
              onClick={onBackToSelfCareHub}
              className="flex items-center gap-1.5 text-xs text-[#93c5d6] hover:text-white transition py-1 pr-2 rounded-lg group min-h-[40px] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#26c6da] group-hover:-translate-x-0.5 transition" />
              <span className="font-semibold text-white">Back</span>
            </button>

            {/* Centered Activity Title */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 flex items-center justify-center text-[#d8ccf7]">
                <Brain className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-sm text-white font-serif">
                CBT Thought Record
              </span>
            </div>

            {/* Mobile Top-Right + New Button */}
            <button
              onClick={() => handleSetView('create')}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#26c6da] bg-[#002235] hover:bg-[#002e44] border border-[#003d58] px-2.5 py-1.5 rounded-xl transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* Mobile Hero: Thought Record Creation Hero Experience */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#122336] via-[#091b2b] to-[#041421] border border-[#26c6da]/35 text-white shadow-xl relative overflow-hidden space-y-3.5">
          <div className="absolute top-0 right-0 w-44 h-44 bg-[#26c6da]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#26c6da]/20 text-[#26c6da] border border-[#26c6da]/40">
                Live Neural Shift
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
              How Your Brain Calms Down
            </h2>
            <p className="text-xs text-[#93c5d6] leading-relaxed">
              Watch how your mind naturally shifts from a racing panic loop into clear, grounded thinking as you work through a thought record.
            </p>
          </div>

          {/* Live Mobile Brain Neural Shift Visualizer */}
          <div>
            <BrainActivityPatternGraphic
              stage={previewStage}
              initialBelief={85}
              reframedBelief={25}
              selectedDistortionsCount={2}
              evidenceAgainstCount={1}
              autoCycle={true}
              onStageChange={(newStage) => setPreviewStage(newStage)}
            />
          </div>

          {/* Full-Width Mobile Action Button */}
          <button
            onClick={() => handleSetView('create')}
            className="w-full py-3.5 rounded-2xl bg-[#26c6da] hover:bg-[#20b2c4] active:scale-[0.985] text-[#001724] font-bold text-sm transition shadow-lg shadow-[#26c6da]/20 flex items-center justify-center gap-2 group cursor-pointer min-h-[48px]"
          >
            <Brain className="w-4 h-4 stroke-[2.2] group-hover:scale-110 transition" />
            <span>Start Thought Record (~3 mins)</span>
          </button>
        </div>

        {/* Mobile Personalized Cognitive Health & Data Insights */}
        <PersonalizedCognitiveInsights />

        {/* Mobile 1-in-a-Row Streamlined Navigation Cards */}
        <div className="space-y-3 pt-1">
          {/* Past Records Row */}
          <div
            onClick={() => handleSetView('past_records')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleSetView('past_records')}
            className="w-full p-4 rounded-2xl bg-[#001b29] hover:bg-[#002235] border border-[#002d3f] hover:border-[#003d58] cursor-pointer transition group select-none flex items-center justify-between shadow-xs active:scale-[0.99] min-h-[56px]"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#001420] border border-[#002838] flex items-center justify-center text-[#26c6da] group-hover:scale-105 transition shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white tracking-tight">
                  Past Thought Records
                </h4>
                <p className="text-xs text-[#93c5d6] leading-snug break-words mt-0.5">
                  {thoughtRecords.length} reflections • Date filtered feed
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-[#001420] flex items-center justify-center text-[#719bb0] group-hover:text-[#26c6da] group-hover:translate-x-0.5 transition shrink-0 ml-2">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Distortion Guide Row */}
          <div
            onClick={onOpenDistortionGuide}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onOpenDistortionGuide()}
            className="w-full p-4 rounded-2xl bg-[#001b29] hover:bg-[#002235] border border-[#002d3f] hover:border-[#003d58] cursor-pointer transition group select-none flex items-center justify-between shadow-xs active:scale-[0.99] min-h-[56px]"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#001420] border border-[#002838] flex items-center justify-center text-[#26c6da] group-hover:scale-105 transition shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white tracking-tight">
                  Thinking Traps Guide
                </h4>
                <p className="text-xs text-[#93c5d6] leading-snug break-words mt-0.5">
                  12 common cognitive distortions &amp; Socratic questions
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-[#001420] flex items-center justify-center text-[#719bb0] group-hover:text-[#26c6da] group-hover:translate-x-0.5 transition shrink-0 ml-2">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3B. WEB DESKTOP CBT OVERVIEW (Aligned Full-Width Neural Canvas + Clinical Analysis)
  return (
    <div className="w-full animate-fadeIn pb-16 space-y-6">
      
      {/* Top Header - Mindful, Clean Back Navigation (No button on top right for web) */}
      <div className="bg-[#001724]/95 text-white -mx-4 -mt-4 px-4 py-3 border-b border-[#002d3f] shadow-md sticky top-0 z-20 backdrop-blur-lg">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          {/* Back button */}
          <button
            onClick={onBackToSelfCareHub}
            className="flex items-center gap-1.5 text-xs text-[#93c5d6] hover:text-white transition py-1 pr-2 rounded-lg group min-h-[40px] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#26c6da] group-hover:-translate-x-0.5 transition" />
            <span className="font-semibold text-white">Back to Self Care</span>
          </button>

          {/* Centered Activity Title */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 flex items-center justify-center text-[#d8ccf7]">
              <Brain className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm sm:text-base text-white font-serif">
              CBT Thought Record
            </span>
          </div>

          {/* Balanced Symmetrical Spacer */}
          <div className="w-24 hidden sm:block" />
        </div>
      </div>

      {/* FULL-WIDTH INTERACTIVE NEURAL CANVAS WITH DOCKED QUICK-START (Matching Aligned Height & Width) */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT SECTION (7 of 12 on Desktop): Interactive Neural Motion Canvas */}
        <div className="lg:col-span-7 rounded-3xl bg-[#001724] border border-[#002f44] p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#26c6da]/20 text-[#26c6da] border border-[#26c6da]/40">
                Interactive Neural Motion
              </span>
              <span className="text-[11px] text-[#719bb0]">Swipe or drag to explore shifts</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Live Neural Shift Visualizer
            </h2>
            <p className="text-xs text-[#93c5d6] leading-relaxed">
              Watch how your mind shifts from amygdala panic into grounded prefrontal clarity as you test observable facts.
            </p>
          </div>

          {/* Seamless Multi-Lobed Anatomical Brain Visualizer */}
          <div className="my-auto py-1">
            <BrainActivityPatternGraphic
              stage={previewStage}
              initialBelief={85}
              reframedBelief={25}
              selectedDistortionsCount={2}
              evidenceAgainstCount={1}
              autoCycle={true}
              onStageChange={(newStage) => setPreviewStage(newStage)}
            />
          </div>

          {/* Calming reassurance telemetry */}
          <div className="pt-2 border-t border-[#002438] flex items-center justify-between text-xs text-[#719bb0]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-time Neuro-Emotional Feedback</span>
            </span>
            <span className="text-[11px] text-[#26c6da] font-medium">Bilateral Gyri Regulation</span>
          </div>
        </div>

        {/* RIGHT SECTION (5 of 12 on Desktop): Docked Quick-Start Hero Card (Matching Height) */}
        <div className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-[#122336] via-[#091b2b] to-[#041421] border border-[#26c6da]/35 p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 bg-[#26c6da]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#26c6da]/20 text-[#26c6da] border border-[#26c6da]/40 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                ~3 Mins Guided Exercise
              </span>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
                Catch Automatic Thoughts &amp; Test Observable Facts
              </h3>
              <p className="text-xs sm:text-[13px] text-[#93c5d6] mt-2 leading-relaxed">
                When stress or exam worry spikes, the mind jumps to catastrophic assumptions. 
                Writing down observable facts reduces belief in catastrophic thoughts by an average of 48%.
              </p>
            </div>

            {/* Cognitive benefits checklist */}
            <div className="space-y-2 pt-1 text-xs text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Tactile Belief De-escalation Dial (0–100%)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>12 Cognitive Distortion Classifiers &amp; Prompts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Side-by-side evidence examination canvas</span>
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              onClick={() => handleSetView('create')}
              className="w-full py-3.5 rounded-2xl bg-[#26c6da] hover:bg-[#20b2c4] active:scale-[0.985] text-[#001724] font-bold text-sm transition shadow-lg shadow-[#26c6da]/20 flex items-center justify-center gap-2 group cursor-pointer min-h-[48px]"
            >
              <Brain className="w-4 h-4 stroke-[2.2] group-hover:scale-110 transition" />
              <span>Start Thought Record (~3 mins)</span>
            </button>
          </div>
        </div>

      </div>

      {/* CBT ANALYSIS OF THEIR DATA FROM A CLINICAL PERSPECTIVE (Desktop-Specific Suite) */}
      <div className="max-w-6xl mx-auto">
        <ClinicalCBTAnalysisSuite />
      </div>

      {/* QUICK ACTIONS & PAST THOUGHT RECORDS NAVIGATION */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Past Records Row */}
        <div
          onClick={() => handleSetView('past_records')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleSetView('past_records')}
          className="p-5 rounded-2xl bg-[#001724] hover:bg-[#001f30] border border-[#002f44] hover:border-[#26c6da]/50 cursor-pointer transition group select-none flex items-center justify-between shadow-md active:scale-[0.99] min-h-[64px]"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-[#00121c] border border-[#002838] flex items-center justify-center text-[#26c6da] group-hover:scale-105 transition shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Past Thought Records
                </h4>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#002438] text-[#26c6da]">
                  {thoughtRecords.length}
                </span>
              </div>
              <p className="text-xs text-[#93c5d6] leading-snug break-words mt-0.5">
                Inspect your saved reflections, facts &amp; belief shifts
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#00121c] flex items-center justify-center text-[#719bb0] group-hover:text-[#26c6da] group-hover:translate-x-0.5 transition shrink-0 ml-2">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Distortion Guide Row */}
        <div
          onClick={onOpenDistortionGuide}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onOpenDistortionGuide()}
          className="p-5 rounded-2xl bg-[#001724] hover:bg-[#001f30] border border-[#002f44] hover:border-[#26c6da]/50 cursor-pointer transition group select-none flex items-center justify-between shadow-md active:scale-[0.99] min-h-[64px]"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-[#00121c] border border-[#002838] flex items-center justify-center text-[#26c6da] group-hover:scale-105 transition shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Thinking Traps Guide
              </h4>
              <p className="text-xs text-[#93c5d6] leading-snug break-words mt-0.5">
                12 common cognitive distortions &amp; Socratic challenge questions
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#00121c] flex items-center justify-center text-[#719bb0] group-hover:text-[#26c6da] group-hover:translate-x-0.5 transition shrink-0 ml-2">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

      </div>

    </div>
  );
};
