/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDiary } from '../context/DiaryContext';
import { COGNITIVE_DISTORTIONS, EMOTIONS, PHYSICAL_SENSATIONS } from '../data/cbtData';
import {
  X,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  Brain,
  HelpCircle,
  Lightbulb,
  Compass,
  Sparkles,
  TrendingDown,
} from 'lucide-react';
import { BrainActivityPatternGraphic } from './BrainActivityPatternGraphic';
import { BeliefDeescalationDial } from './BeliefDeescalationDial';
import { CognitiveAISuggestions } from './CognitiveAISuggestions';

interface ThoughtRecordFormProps {
  isOpen?: boolean;
  onClose?: () => void;
  onBack?: () => void;
  onComplete?: () => void;
  onOpenDistortionGuide?: () => void;
  defaultDate?: string;
  initialAutomaticThought?: string;
  onSaveReframeResult?: (reframe: { balancedThought: string; distortion?: string }) => void;
}

const TOTAL_STAGES = 5;

const STAGE_NAMES = [
  'Situation',
  'Emotion & Body Cues',
  'Automatic Thought',
  'Fact Checking',
  'Balanced Reframe',
];

interface StepGuide {
  title: string;
  neuroInsight: string;
  example: string;
  socraticTip: string;
}

const STEP_GUIDANCE: Record<number, StepGuide> = {
  1: {
    title: 'Grounding in Observable Facts',
    neuroInsight: 'Writing down what physically occurred without adding interpretations helps quiet the amygdala and prevents emotional runaway.',
    example: "Observable fact: 'Received a calendar invite for a 1:1 meeting tomorrow with no agenda.'",
    socraticTip: 'Describe what happened as if a neutral video camera recorded the scene.',
  },
  2: {
    title: 'Pinpointing Bodily Cues',
    neuroInsight: 'Naming your exact emotions and body sensations signals the autonomic nervous system to slow down heart rate and reduce cortisol.',
    example: "Somatic cue: 'Tightness across chest, shallow breathing, clenched jaw.'",
    socraticTip: 'Where does the tension physically live in your body right now?',
  },
  3: {
    title: 'Exposing Automatic Worries',
    neuroInsight: 'Automatic thoughts often feel 100% true because adrenaline tricks the brain into mistaking fears for observable facts.',
    example: "Automatic worry: 'They are going to fire me and everyone will see I am a failure.'",
    socraticTip: 'What was the exact sentence your mind whispered right before your mood sank?',
  },
  4: {
    title: 'Prefrontal Fact Checking',
    neuroInsight: 'Weighing tangible evidence for and against your thought activates the prefrontal cortex to separate catastrophic predictions from real facts.',
    example: "Counter-evidence: 'My manager praised my project last week; routine check-ins happen every quarter.'",
    socraticTip: 'What would you say to a trusted friend who had this exact catastrophic fear?',
  },
  5: {
    title: 'Grounded Perspective & Relief',
    neuroInsight: 'Crafting a balanced alternative reinforces resilient neural pathways and permanently dials down belief in the catastrophic thought.',
    example: "Balanced reframe: 'A meeting without an agenda feels uncertain, but uncertainty is not proof of disaster. I can handle it.'",
    socraticTip: 'Aim for realism, clarity, and self-compassion rather than forced positive thinking.',
  },
};

export const ThoughtRecordForm: React.FC<ThoughtRecordFormProps> = ({
  isOpen = true,
  onClose,
  onBack,
  onComplete,
  onOpenDistortionGuide,
  defaultDate,
  initialAutomaticThought,
  onSaveReframeResult,
}) => {
  const { addThoughtRecord, deviceMode } = useDiary();
  const isMobile = deviceMode === 'mobile';

  const [currentStage, setCurrentStage] = useState<number>(1);
  const [date, setDate] = useState<string>(defaultDate || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  // Stage 1: Situation
  const [situation, setSituation] = useState<string>(
    initialAutomaticThought ? 'Worry Window Review Session' : ''
  );
  const [showDateTime, setShowDateTime] = useState<boolean>(false);

  // Stage 2: Acute Activated Emotion & Somatic Bodily Cues
  const [emotion, setEmotion] = useState<string>('Anxious');
  const [selectedSensations, setSelectedSensations] = useState<string[]>([]);

  // Stage 3: Automatic Thought & Belief
  const [automaticThought, setAutomaticThought] = useState<string>(initialAutomaticThought || '');
  const [belief, setBelief] = useState<number>(85);
  const [selectedDistortions, setSelectedDistortions] = useState<string[]>([]);
  const [trapCategory, setTrapCategory] = useState<string>('All');

  // Stage 4: Facts Supporting & Not Supporting
  const [evidenceFor, setEvidenceFor] = useState<string>('');
  const [evidenceAgainst, setEvidenceAgainst] = useState<string>('');

  // Stage 5: Balanced Alternative Perspective & Belief De-escalation Dial
  const [balancedAlternative, setBalancedAlternative] = useState<string>('');
  const [reframedBelief, setReframedBelief] = useState<number>(25);
  const [actionPlan, setActionPlan] = useState<string>('');

  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  if (isOpen === false) return null;

  const handleExit = () => {
    if (situation.trim() || automaticThought.trim()) {
      if (window.confirm('Discard your progress on this thought record?')) {
        handleResetForm();
        if (onBack) onBack();
        else if (onClose) onClose();
      }
    } else {
      handleResetForm();
      if (onBack) onBack();
      else if (onClose) onClose();
    }
  };

  const toggleDistortion = (id: string) => {
    if (selectedDistortions.includes(id)) {
      setSelectedDistortions(selectedDistortions.filter((d) => d !== id));
    } else {
      setSelectedDistortions([...selectedDistortions, id]);
    }
  };

  const toggleSensation = (sens: string) => {
    if (selectedSensations.includes(sens)) {
      setSelectedSensations(selectedSensations.filter((s) => s !== sens));
    } else {
      setSelectedSensations([...selectedSensations, sens]);
    }
  };

  const handleResetForm = () => {
    setCurrentStage(1);
    setSituation('');
    setShowDateTime(false);
    setEmotion('Anxious');
    setSelectedSensations([]);
    setAutomaticThought('');
    setBelief(85);
    setSelectedDistortions([]);
    setTrapCategory('All');
    setEvidenceFor('');
    setEvidenceAgainst('');
    setBalancedAlternative('');
    setReframedBelief(25);
    setActionPlan('');
    setSubmittedSuccess(false);
  };

  const handleNext = () => {
    if (currentStage < TOTAL_STAGES) {
      setCurrentStage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousStep = () => {
    if (currentStage > 1) {
      setCurrentStage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleExit();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addThoughtRecord({
      situation: situation.trim() || 'Moment of distress',
      emotion: emotion.trim() || 'Distress',
      intensity: 75,
      sensations: selectedSensations,
      automaticThought: automaticThought.trim() || 'Automatic thought',
      belief,
      reframedBelief,
      distortions: selectedDistortions,
      evidenceFor: evidenceFor.trim(),
      evidenceAgainst: evidenceAgainst.trim(),
      balancedAlternative: balancedAlternative.trim() || 'Balanced perspective formed',
      actionPlan: actionPlan.trim(),
    });

    onSaveReframeResult?.({
      balancedThought: balancedAlternative.trim() || 'Balanced perspective formed',
      distortion: selectedDistortions[0] || 'Uncertainty Bias',
    });

    setSubmittedSuccess(true);
    setTimeout(() => {
      handleResetForm();
      if (onComplete) {
        onComplete();
      } else if (onBack) {
        onBack();
      }
    }, 900);
  };

  const currentGuide = STEP_GUIDANCE[currentStage] || STEP_GUIDANCE[1];

  // Core reusable stage inputs
  const renderStageContent = () => (
    <>
      {/* STAGE 1: SITUATION */}
      {currentStage === 1 && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            {!isMobile && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#26c6da] block mb-1">
                Step 1 · Situation Trigger
              </span>
            )}
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
              What was happening right before you felt a shift?
            </h2>
            <p className="text-xs text-[#93c5d6] mt-1 leading-relaxed">
              Describe the specific moment, conversation, message, or setting in simple observable facts.
            </p>
          </div>

          <div>
            <textarea
              rows={isMobile ? 5 : 6}
              required
              autoFocus
              placeholder="Describe what occurred in your own words..."
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[#00364d] bg-[#00121c] text-sm text-white placeholder:text-[#577b8f] focus:border-[#26c6da] outline-hidden transition shadow-inner leading-relaxed"
            />
          </div>

          {/* Optional Date & Time Picker */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowDateTime(!showDateTime)}
              className="text-xs text-[#719bb0] hover:text-[#26c6da] flex items-center gap-1.5 transition py-1 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-[#26c6da]" />
              <span>{showDateTime ? 'Hide timestamp' : `Logged for ${date} at ${time} (click to adjust)`}</span>
            </button>

            {showDateTime && (
              <div className="grid grid-cols-2 gap-3 text-xs bg-[#00121c] p-3 rounded-2xl border border-[#002d42] mt-2 animate-fadeIn">
                <div>
                  <label className="text-[#93c5d6] font-medium flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3 text-[#26c6da]" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#00364d] bg-[#001b29] text-white text-xs outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[#93c5d6] font-medium flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3 text-[#26c6da]" />
                    Time
                  </label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#00364d] bg-[#001b29] text-white text-xs outline-hidden"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STAGE 2: CLINICALLY DIFFERENTIATED ACUTE EMOTION & SOMATIC CUES */}
      {currentStage === 2 && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            {!isMobile && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#26c6da] block mb-1">
                Step 2 · Emotion &amp; Body Tension
              </span>
            )}
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
              What emotion was triggered in that moment?
            </h2>
            <p className="text-xs text-[#93c5d6] mt-1 leading-relaxed">
              In CBT, noticing the exact feeling and physical somatic cue pinpoints the automatic thought that sparked it.
            </p>
          </div>

          {/* Specific Emotion Selection */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-[#719bb0] uppercase tracking-wider block">
              Primary Triggered Emotion
            </span>
            <div className="flex flex-wrap gap-2">
              {EMOTIONS.map((emo) => {
                const isSelected = emotion === emo.name;
                return (
                  <button
                    key={emo.name}
                    type="button"
                    onClick={() => setEmotion(emo.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition active:scale-95 flex items-center gap-1.5 min-h-[36px] cursor-pointer ${
                      isSelected
                        ? 'bg-[#26c6da] text-[#001724] border-[#26c6da] shadow-md font-bold'
                        : 'bg-[#00121c] text-[#93c5d6] border-[#002f44] hover:text-white hover:bg-[#001b29]'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#001724]' : emo.dot}`} />
                    <span>{emo.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Physical Sensations (Visceral Somatic Cue) */}
          <div className="space-y-2 pt-2 border-t border-[#00283c]">
            <span className="text-[11px] font-semibold text-[#719bb0] uppercase tracking-wider block">
              Physical Somatic Cue in Your Body
            </span>
            <p className="text-[11px] text-[#93c5d6]">
              Where did your body first signal distress?
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PHYSICAL_SENSATIONS.map((sens) => {
                const isChecked = selectedSensations.includes(sens);
                return (
                  <button
                    key={sens}
                    type="button"
                    onClick={() => toggleSensation(sens)}
                    className={`px-3 py-1.5 rounded-xl text-xs border transition min-h-[32px] cursor-pointer ${
                      isChecked
                        ? 'bg-[#003b54] text-[#26c6da] border-[#26c6da] font-semibold shadow-xs'
                        : 'bg-[#00121c] text-[#719bb0] border-[#002d42] hover:text-[#93c5d6]'
                    }`}
                  >
                    {sens}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3: AUTOMATIC THOUGHT & BELIEF */}
      {currentStage === 3 && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            {!isMobile && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#26c6da] block mb-1">
                Step 3 · Automatic Thought
              </span>
            )}
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
              What thought or assumption flashed through your mind?
            </h2>
            <p className="text-xs text-[#93c5d6] mt-1 leading-relaxed">
              The raw, unfiltered thought or worry you caught yourself thinking right then.
            </p>
          </div>

          <div>
            <textarea
              rows={isMobile ? 3 : 4}
              required
              autoFocus
              placeholder='e.g. "I am going to fail this exam and everyone will realize I do not belong here."'
              value={automaticThought}
              onChange={(e) => setAutomaticThought(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[#00364d] bg-[#00121c] text-sm text-white placeholder:text-[#577b8f] focus:border-[#26c6da] outline-hidden transition shadow-inner leading-relaxed"
            />
          </div>

          {/* Initial belief rating slider */}
          <div className="p-3.5 rounded-2xl bg-[#00121c] border border-[#002838] space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-white">
                How true did this thought feel at that moment?
              </span>
              <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                {belief}%
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={belief}
              onChange={(e) => setBelief(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-[#002438] rounded-lg"
            />
            <p className="text-[10px] text-[#719bb0]">
              Even distorted thoughts can feel 100% convincing when stress spikes.
            </p>
          </div>

          {/* Socratic Suggestions */}
          <CognitiveAISuggestions
            stage={3}
            situation={situation}
            emotion={emotion}
            automaticThought={automaticThought}
            selectedDistortions={selectedDistortions}
            evidenceAgainst={evidenceAgainst}
            onApplySuggestion={() => {}}
            onSelectTrap={toggleDistortion}
          />

          {/* Common Thinking Traps Classification */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">
                  Common thinking traps (optional):
                </span>
                {selectedDistortions.length > 0 && (
                  <span className="text-[11px] font-bold text-[#26c6da] bg-[#26c6da]/15 border border-[#26c6da]/30 px-2 py-0.5 rounded-full">
                    {selectedDistortions.length} selected
                  </span>
                )}
              </div>
              {onOpenDistortionGuide && (
                <button
                  type="button"
                  onClick={onOpenDistortionGuide}
                  className="text-[11px] text-[#26c6da] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Guide</span>
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {['All', 'Assuming', 'Magnifying', 'Filtering', 'Judging'].map((cat) => {
                const isSelected = trapCategory === cat;
                const count =
                  cat === 'All'
                    ? COGNITIVE_DISTORTIONS.length
                    : COGNITIVE_DISTORTIONS.filter((d) => d.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setTrapCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition active:scale-95 min-h-[30px] flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#26c6da] text-[#001724] font-bold shadow-xs'
                        : 'bg-[#00121c] text-[#93c5d6] border border-[#002f44] hover:text-white'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-[#001724]/70 font-bold' : 'text-[#719bb0]'}`}>
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Trap Cards */}
            <div className="space-y-2 pt-1 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
              {(trapCategory === 'All'
                ? COGNITIVE_DISTORTIONS
                : COGNITIVE_DISTORTIONS.filter((d) => d.category === trapCategory)
              ).map((d) => {
                const isChecked = selectedDistortions.includes(d.id);
                return (
                  <div
                    key={d.id}
                    onClick={() => toggleDistortion(d.id)}
                    className={`p-3 rounded-2xl border cursor-pointer select-none transition flex items-start justify-between gap-3 ${
                      isChecked
                        ? 'border-[#26c6da] bg-[#002c3f] shadow-xs ring-1 ring-[#26c6da]/50'
                        : 'border-[#002838] bg-[#00121c] hover:bg-[#001b29]'
                    }`}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="font-semibold text-white text-xs leading-snug flex items-center gap-2">
                        <span>{d.name}</span>
                        <span className="text-[10px] text-[#719bb0] font-normal px-2 py-0.2 rounded-md bg-[#001420] border border-[#002438]">
                          {d.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#93c5d6] leading-relaxed">
                        {d.shortDefinition}
                      </p>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition ${
                        isChecked
                          ? 'bg-[#26c6da] border-[#26c6da] text-[#001724]'
                          : 'border-[#00364d] bg-[#001420]'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STAGE 4: FACTS SUPPORTING & NOT SUPPORTING */}
      {currentStage === 4 && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            {!isMobile && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#26c6da] block mb-1">
                Step 4 · Fact Checking
              </span>
            )}
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
              What supports this thought, and what points against it?
            </h2>
            <p className="text-xs text-[#93c5d6] mt-1 leading-relaxed">
              Separate feelings from verifiable, observable facts.
            </p>
          </div>

          <div className="p-3 bg-[#00121c] rounded-xl border border-[#002d42] text-xs text-[#93c5d6]">
            <span className="text-white font-semibold">Caught Thought: </span>
            <span className="italic text-slate-200">&quot;{automaticThought || 'My automatic worry'}&quot;</span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span>Facts that support the thought</span>
                <span className="text-[10px] text-[#719bb0]">Observable facts only</span>
              </label>
              <textarea
                rows={3}
                placeholder="What observable facts occurred? (Avoid 'I feel like...')"
                value={evidenceFor}
                onChange={(e) => setEvidenceFor(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#00364d] bg-[#00121c] text-xs text-white placeholder:text-[#577b8f] focus:border-[#26c6da] outline-hidden transition leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#26c6da] flex items-center justify-between">
                <span>Facts that do NOT support it</span>
                <span className="text-[10px] text-[#26c6da]">Alternative facts &amp; context</span>
              </label>
              <textarea
                rows={3}
                placeholder="What other explanations exist? Have you handled challenges like this before?"
                value={evidenceAgainst}
                onChange={(e) => setEvidenceAgainst(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#004d6d] bg-[#001826] text-xs text-white placeholder:text-[#577b8f] focus:border-[#26c6da] outline-hidden transition leading-relaxed"
              />
            </div>

            <CognitiveAISuggestions
              stage={4}
              situation={situation}
              emotion={emotion}
              automaticThought={automaticThought}
              selectedDistortions={selectedDistortions}
              evidenceAgainst={evidenceAgainst}
              onApplySuggestion={() => {}}
            />
          </div>
        </div>
      )}

      {/* STAGE 5: BALANCED ALTERNATIVE PERSPECTIVE */}
      {currentStage === 5 && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            {!isMobile && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                Step 5 · Balanced Reframe
              </span>
            )}
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
              What is a more grounded, balanced perspective?
            </h2>
            <p className="text-xs text-[#93c5d6] mt-1 leading-relaxed">
              Not forced positivity — just a realistic, compassionate view based on all the facts.
            </p>
          </div>

          <div>
            <textarea
              rows={isMobile ? 4 : 5}
              required
              autoFocus
              placeholder='e.g. "It is natural to feel stressed before a big exam. Experiencing self-doubt does not mean I will fail. I have studied and can take it one question at a time."'
              value={balancedAlternative}
              onChange={(e) => setBalancedAlternative(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-emerald-500/50 bg-[#001f2c] text-sm text-white placeholder:text-[#577b8f] focus:border-emerald-400 outline-hidden transition shadow-inner leading-relaxed"
            />
          </div>

          {/* Socratic Reframe suggestions */}
          <CognitiveAISuggestions
            stage={5}
            situation={situation}
            emotion={emotion}
            automaticThought={automaticThought}
            selectedDistortions={selectedDistortions}
            evidenceAgainst={evidenceAgainst}
            onApplySuggestion={(reframeText) => setBalancedAlternative(reframeText)}
          />

          {/* Belief De-escalation Dial */}
          <BeliefDeescalationDial
            initialBelief={belief}
            reframedBelief={reframedBelief}
            onChange={setReframedBelief}
          />

          {/* Optional Coping Action */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#93c5d6]">
              A small practical step or coping action (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g. Drink water, take 3 slow breaths, review just chapter 4 summary."
              value={actionPlan}
              onChange={(e) => setActionPlan(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#00364d] bg-[#00121c] text-xs text-white placeholder:text-[#577b8f] focus:border-[#26c6da] outline-hidden"
            />
          </div>

          {submittedSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Thought Record saved to your collection!</span>
            </div>
          )}
        </div>
      )}
    </>
  );

  // 1. MOBILE APP LAYOUT (Preserves pure authentic mobile UI)
  if (isMobile) {
    return (
      <div className="w-full flex-1 flex flex-col bg-[#001724] text-white animate-fadeIn pb-6">
        {/* Mobile Header */}
        <div className="bg-[#001724]/95 text-white -mx-4 -mt-4 px-4 py-3 border-b border-[#002d3f] shadow-md sticky top-0 z-20 backdrop-blur-lg">
          <div className="flex items-center justify-between mb-2.5">
            <button
              type="button"
              onClick={handlePreviousStep}
              className="flex items-center gap-1.5 text-xs text-[#93c5d6] hover:text-white transition py-1 pr-2 rounded-lg group min-h-[40px] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#26c6da] group-hover:-translate-x-0.5 transition" />
              <span className="font-semibold text-white">
                {currentStage === 1 ? 'Cancel' : 'Back'}
              </span>
            </button>

            <div className="text-center px-1">
              <h1 className="font-bold text-sm text-white font-serif leading-tight">
                CBT Thought Record
              </h1>
              <span className="text-xs text-[#26c6da] font-semibold tracking-tight block mt-0.5">
                Step {currentStage} of {TOTAL_STAGES} · {STAGE_NAMES[currentStage - 1]}
              </span>
            </div>

            <button
              type="button"
              onClick={handleExit}
              className="p-1.5 rounded-xl text-[#719bb0] hover:text-white hover:bg-[#00283c] transition min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
              title="Exit Thought Record"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepped Progress Track */}
          <div className="grid grid-cols-5 gap-1.5 pt-1.5">
            {STAGE_NAMES.map((stepName, idx) => {
              const stageNum = idx + 1;
              return (
                <button
                  key={stageNum}
                  type="button"
                  onClick={() => {
                    if (stageNum < currentStage) setCurrentStage(stageNum);
                  }}
                  disabled={stageNum > currentStage}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    stageNum === currentStage
                      ? 'bg-[#26c6da] shadow-sm shadow-[#26c6da]/50'
                      : stageNum < currentStage
                      ? 'bg-[#005775] cursor-pointer hover:bg-[#00749e]'
                      : 'bg-[#002838]'
                  }`}
                  title={`Step ${stageNum}: ${stepName}`}
                />
              );
            })}
          </div>
        </div>

        {/* Mobile Stepped Form Body (Single Column Vertical Flow) */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between pt-3 max-w-md mx-auto w-full px-1">
          <div className="space-y-4">
            {/* Brain Activity & Neural Pattern Alteration Graphic on Mobile */}
            <BrainActivityPatternGraphic
              stage={currentStage}
              emotion={emotion}
              initialBelief={belief}
              reframedBelief={reframedBelief}
              selectedDistortionsCount={selectedDistortions.length}
              evidenceAgainstCount={evidenceAgainst.trim() ? 1 : 0}
            />

            {renderStageContent()}
          </div>

          {/* Sticky Bottom Thumb Action Bar on Mobile */}
          <div className="sticky bottom-0 -mx-4 -mb-6 px-4 pt-3 pb-3 bg-[#001724]/95 backdrop-blur-md border-t border-[#002838] flex items-center justify-between gap-3 w-[calc(100%+2rem)] z-30 mt-6 shadow-2xl">
            <button
              type="button"
              onClick={handlePreviousStep}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-medium text-[#93c5d6] hover:text-white bg-[#001b29] hover:bg-[#002233] border border-[#00344d] transition active:scale-95 min-h-[42px] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{currentStage === 1 ? 'Cancel' : 'Back'}</span>
            </button>

            {currentStage < TOTAL_STAGES ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#26c6da] hover:bg-[#20b2c4] text-[#001724] shadow-md transition active:scale-95 min-h-[42px] cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                id="submit-thought-record-btn"
                className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#26c6da] hover:bg-[#20b2c4] text-[#001724] shadow-md transition active:scale-95 min-h-[42px] cursor-pointer"
              >
                <Brain className="w-4 h-4" />
                <span>Save Thought Record</span>
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  // 2. WEB DESKTOP LAYOUT (2-Column Side-by-Side Workspace with Single Exit)
  return (
    <div className="w-full flex-1 flex flex-col bg-[#001724] text-white animate-fadeIn pb-12">
      {/* Web Header */}
      <div className="bg-[#001724]/95 text-white -mx-4 -mt-4 px-4 py-3.5 border-b border-[#002d3f] shadow-md sticky top-0 z-30 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <button
            type="button"
            onClick={handlePreviousStep}
            className="flex items-center gap-1.5 text-xs text-[#93c5d6] hover:text-white transition py-1.5 px-2.5 rounded-xl hover:bg-[#002235] group min-h-[40px] cursor-pointer"
            title={currentStage === 1 ? 'Cancel and return to Self Care' : `Return to Step ${currentStage - 1}`}
          >
            <ArrowLeft className="w-4 h-4 text-[#26c6da] group-hover:-translate-x-0.5 transition" />
            <span className="font-semibold text-white">
              {currentStage === 1 ? 'Cancel' : `Back to Step ${currentStage - 1}`}
            </span>
          </button>

          <div className="text-center px-2">
            <h1 className="font-bold text-sm sm:text-base text-white font-serif leading-tight">
              CBT Thought Record
            </h1>
            <span className="text-xs text-[#26c6da] font-semibold tracking-tight block mt-0.5">
              Step {currentStage} of {TOTAL_STAGES} · {STAGE_NAMES[currentStage - 1]}
            </span>
          </div>

          <div className="w-24 hidden sm:block" />
        </div>

        {/* Stepped Progress Track */}
        <div className="max-w-6xl mx-auto w-full grid grid-cols-5 gap-2 pt-3">
          {STAGE_NAMES.map((stepName, idx) => {
            const stageNum = idx + 1;
            const isCompleted = stageNum < currentStage;
            const isCurrent = stageNum === currentStage;

            return (
              <button
                key={stageNum}
                type="button"
                onClick={() => {
                  if (stageNum < currentStage) setCurrentStage(stageNum);
                }}
                disabled={stageNum > currentStage}
                className="group text-left cursor-pointer disabled:cursor-default"
                title={`Step ${stageNum}: ${stepName}`}
              >
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isCurrent
                      ? 'bg-[#26c6da] shadow-sm shadow-[#26c6da]/50'
                      : isCompleted
                      ? 'bg-[#00749e] hover:bg-[#26c6da]'
                      : 'bg-[#002838]'
                  }`}
                />
                <span
                  className={`text-[10px] hidden md:block mt-1 font-medium truncate ${
                    isCurrent
                      ? 'text-[#26c6da] font-bold'
                      : isCompleted
                      ? 'text-[#93c5d6]'
                      : 'text-[#476779]'
                  }`}
                >
                  {stageNum}. {stepName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Web 2-Column Side-by-Side Workspace */}
      <form onSubmit={handleSubmit} className="flex-1 w-full max-w-6xl mx-auto pt-6 px-2 sm:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (5 of 12): Neural Companion & Coach Card */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
            <div className="p-4 sm:p-5 rounded-3xl bg-[#001724] border border-[#002f44] text-white shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#26c6da]/20 text-[#26c6da] border border-[#26c6da]/40">
                  Step {currentStage} Neural Shift
                </span>
                <span className="text-[11px] text-[#719bb0]">Real-time reaction</span>
              </div>

              <BrainActivityPatternGraphic
                stage={currentStage}
                emotion={emotion}
                initialBelief={belief}
                reframedBelief={reframedBelief}
                selectedDistortionsCount={selectedDistortions.length}
                evidenceAgainstCount={evidenceAgainst.trim() ? 1 : 0}
              />
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-[#00121c] border border-[#002838] space-y-3.5 shadow-md">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                <span>What Happens in Your Brain Right Now</span>
              </div>

              <p className="text-xs text-[#93c5d6] leading-relaxed">
                {currentGuide.neuroInsight}
              </p>

              <div className="p-3 rounded-2xl bg-[#001a28] border border-[#002e42] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#719bb0] tracking-wider block">
                  Example for this step
                </span>
                <p className="text-xs text-slate-200 italic leading-relaxed">
                  {currentGuide.example}
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#719bb0]">
                <Compass className="w-3.5 h-3.5 text-[#26c6da] shrink-0" />
                <span>{currentGuide.socraticTip}</span>
              </div>
            </div>
          </div>

          {/* Right Column (7 of 12): Active Journaling Canvas */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-5 sm:p-7 rounded-3xl bg-[#001724] border border-[#002f44] shadow-xl space-y-5">
              {renderStageContent()}

              <div className="pt-4 border-t border-[#00283c] flex items-center justify-between gap-3">
                {currentStage > 1 ? (
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#93c5d6] hover:text-white bg-[#00121c] hover:bg-[#001a28] border border-[#002f44] transition active:scale-95 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#26c6da]" />
                    <span>Back to Step {currentStage - 1}</span>
                  </button>
                ) : (
                  <div />
                )}

                {currentStage < TOTAL_STAGES ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-2xl text-xs font-bold bg-[#26c6da] hover:bg-[#20b2c4] text-[#001724] shadow-lg shadow-[#26c6da]/20 transition active:scale-95 cursor-pointer ml-auto min-h-[44px]"
                  >
                    <span>Continue to Step {currentStage + 1}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    id="submit-thought-record-btn"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-2xl text-xs font-bold bg-[#26c6da] hover:bg-[#20b2c4] text-[#001724] shadow-lg shadow-[#26c6da]/20 transition active:scale-95 cursor-pointer ml-auto min-h-[44px]"
                  >
                    <Brain className="w-4 h-4" />
                    <span>Save Thought Record</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
