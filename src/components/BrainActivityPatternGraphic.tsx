/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect } from 'react';
import { Brain, Activity, Zap, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface BrainActivityPatternGraphicProps {
  stage: number; // 1 to 5
  emotion?: string;
  initialBelief?: number; // 0 to 100
  reframedBelief?: number; // 0 to 100
  selectedDistortionsCount?: number;
  evidenceAgainstCount?: number;
  autoCycle?: boolean; // If true, seamlessly shifts stages automatically
  onStageChange?: (stage: number) => void;
}

export const BrainActivityPatternGraphic: React.FC<BrainActivityPatternGraphicProps> = ({
  stage: controlledStage,
  emotion = 'Anxious',
  initialBelief = 85,
  reframedBelief = 25,
  selectedDistortionsCount = 0,
  evidenceAgainstCount = 0,
  autoCycle = false,
  onStageChange,
}) => {
  const [internalStage, setInternalStage] = useState<number>(controlledStage || 1);
  const [isPlaying, setIsPlaying] = useState<boolean>(autoCycle);
  const [isManualPaused, setIsManualPaused] = useState<boolean>(false);

  // Swipe gesture tracking
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [mouseStartX, setMouseStartX] = useState<number | null>(null);

  // Sync when controlled stage changes
  useEffect(() => {
    if (controlledStage && controlledStage !== internalStage) {
      setInternalStage(controlledStage);
    }
  }, [controlledStage]);

  // Seamless auto-progression loop through neural shifts
  useEffect(() => {
    if (!isPlaying || isManualPaused) return;

    const timer = setInterval(() => {
      setInternalStage((prev) => {
        const next = prev >= 5 ? 1 : prev + 1;
        if (onStageChange) onStageChange(next);
        return next;
      });
    }, 3800);

    return () => clearInterval(timer);
  }, [isPlaying, isManualPaused, onStageChange]);

  const activeStage = autoCycle ? internalStage : controlledStage || internalStage;

  // Swiping back or forth pauses auto-cycle and activates manual navigation
  const handleSwipe = (direction: 'left' | 'right') => {
    setIsManualPaused(true);
    setIsPlaying(false);

    setInternalStage((prev) => {
      let next: number;
      if (direction === 'right') {
        // Swipe right = swipe back to previous step
        next = prev <= 1 ? 5 : prev - 1;
      } else {
        // Swipe left = advance to next step
        next = prev >= 5 ? 1 : prev + 1;
      }
      if (onStageChange) onStageChange(next);
      return next;
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX;
    const threshold = 35; // px

    if (Math.abs(diffX) > threshold) {
      handleSwipe(diffX > 0 ? 'right' : 'left');
    }
    setTouchStartX(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setMouseStartX(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (mouseStartX === null) return;
    const diffX = e.clientX - mouseStartX;
    const threshold = 35;

    if (Math.abs(diffX) > threshold) {
      handleSwipe(diffX > 0 ? 'right' : 'left');
    }
    setMouseStartX(null);
  };

  // Plain-English layman terms for every stage
  const neuralState = useMemo(() => {
    switch (activeStage) {
      case 1:
        return {
          stepName: '1. What Happened',
          title: 'Noticing the situation as simple facts',
          subtitle: 'Before anxiety starts, your brain calmly records what just occurred without racing ahead.',
          status: 'Calm Baseline',
          waveColor: '#38bdf8',
          accentColor: '#0284c7',
          pulseSpeed: '3.2s',
          stateTag: 'Calm Rhythm',
          activityLabel: 'State: Baseline',
        };
      case 2:
        return {
          stepName: '2. Racing Worry',
          title: 'Alarm bell fires and worries feel 100% real',
          subtitle: `Stress signals flare up quickly (${initialBelief}% conviction). Racing thoughts make the worst-case scenario feel unavoidable.`,
          status: 'Racing Mind',
          waveColor: initialBelief > 70 ? '#f43f5e' : '#f59e0b',
          accentColor: '#e11d48',
          pulseSpeed: initialBelief > 75 ? '0.8s' : '1.4s',
          stateTag: 'High Stress',
          activityLabel: 'State: Racing Thoughts',
        };
      case 3:
        return {
          stepName: '3. Stuck in a Trap',
          title: 'Thoughts get caught in a repeating loop',
          subtitle: 'A thinking trap (like catastrophizing or mind reading) locks your mind into one narrow, stressful interpretation.',
          status: 'Stuck Loop',
          waveColor: '#fb923c',
          accentColor: '#c2410c',
          pulseSpeed: '1.2s',
          stateTag: 'Stuck in Loop',
          activityLabel: 'State: Trapped Pattern',
        };
      case 4:
        return {
          stepName: '4. Checking Facts',
          title: 'Separating fears from observable proof',
          subtitle: 'Examining what actually happened starts to break the panic. New, reasonable explanations begin to open up.',
          status: 'Untangling Thoughts',
          waveColor: '#26c6da',
          accentColor: '#00838f',
          pulseSpeed: '2.0s',
          stateTag: 'Sorting Facts',
          activityLabel: 'State: Untangling Fears',
        };
      case 5:
      default: {
        const beliefDelta = Math.max(0, initialBelief - reframedBelief);
        return {
          stepName: '5. Balanced & Grounded',
          title: 'Calm is restored with a realistic view',
          subtitle: `Your brain settles back into clear, relaxed problem-solving. Belief in the panic drops by -${beliefDelta}%.`,
          status: 'Clear & Grounded',
          waveColor: '#10b981',
          accentColor: '#26c6da',
          pulseSpeed: '3.6s',
          stateTag: 'Calm Restored',
          activityLabel: 'State: Peaceful & Grounded',
        };
      }
    }
  }, [activeStage, initialBelief, reframedBelief]);

  const isHarmonious = activeStage === 5;
  const isChaotic = activeStage === 2;

  const handleSelectStage = (s: number) => {
    setIsManualPaused(true);
    setIsPlaying(false);
    setInternalStage(s);
    if (onStageChange) onStageChange(s);
  };

  const handleResumeAutoShift = () => {
    setIsManualPaused(false);
    setIsPlaying(true);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="relative w-full rounded-2xl bg-gradient-to-b from-[#001726] via-[#001c2e] to-[#00121d] border border-[#003d58] shadow-lg overflow-hidden select-none p-3.5 sm:p-4 touch-pan-y group cursor-grab active:cursor-grabbing"
    >
      {/* Background ambient neural aura */}
      <div
        className="absolute -top-10 -right-10 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-40 transition-colors duration-1000"
        style={{
          background: `radial-gradient(circle, ${neuralState.waveColor} 0%, transparent 70%)`,
        }}
      />
      <div
        className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-2xl pointer-events-none opacity-25 transition-colors duration-1000"
        style={{
          background: isHarmonious ? '#10b981' : '#0284c7',
        }}
      />

      {/* Top Header Bar: Clean & Plain English (NO Pause button, NO Stage text) */}
      <div className="flex items-center justify-between border-b border-[#002f45] pb-2 mb-2 relative z-10 text-xs">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors duration-500 shadow-inner"
            style={{
              backgroundColor: `${neuralState.waveColor}20`,
              color: neuralState.waveColor,
              border: `1px solid ${neuralState.waveColor}50`,
            }}
          >
            <Brain className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-white text-xs tracking-tight">
              {neuralState.stepName}
            </span>
          </div>
        </div>

        {/* State Tag & Optional Resume Action when paused by swipe */}
        <div className="flex items-center gap-2">
          {isManualPaused && (
            <button
              type="button"
              onClick={handleResumeAutoShift}
              className="text-[10px] text-[#26c6da] hover:text-white flex items-center gap-1 bg-[#002334] px-2 py-0.5 rounded-md border border-[#003952] transition cursor-pointer"
              title="Resume automatic neural shift"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Auto-Play</span>
            </button>
          )}

          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full animate-ping"
              style={{ backgroundColor: neuralState.waveColor }}
            />
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md font-sans"
              style={{
                backgroundColor: `${neuralState.waveColor}20`,
                color: neuralState.waveColor,
                border: `1px solid ${neuralState.waveColor}40`,
              }}
            >
              {neuralState.stateTag}
            </span>
          </div>
        </div>
      </div>

      {/* Central Visualizer: ORGANIC ANATOMICAL BRAIN GRAPHIC (With Gyri & Sulci Folds) */}
      <div className="relative w-full h-38 sm:h-44 flex items-center justify-center my-0.5">
        
        {/* Swipe Affordance Chevrons */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSwipe('right');
          }}
          className="absolute left-1 z-20 w-7 h-7 rounded-full bg-[#001724]/70 hover:bg-[#00283c] border border-[#003a52] flex items-center justify-center text-[#719bb0] hover:text-[#26c6da] transition opacity-40 hover:opacity-100 shadow-md"
          title="Swipe back to previous step"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSwipe('left');
          }}
          className="absolute right-1 z-20 w-7 h-7 rounded-full bg-[#001724]/70 hover:bg-[#00283c] border border-[#003a52] flex items-center justify-center text-[#719bb0] hover:text-[#26c6da] transition opacity-40 hover:opacity-100 shadow-md"
          title="Swipe forward to next step"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <svg
          viewBox="0 0 340 160"
          className="w-full h-full max-w-[340px] drop-shadow-[0_0_12px_rgba(38,198,218,0.2)] transition-all duration-700 pointer-events-none"
        >
          <defs>
            <linearGradient id="leftHemiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={neuralState.accentColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor={neuralState.waveColor} stopOpacity="0.4" />
            </linearGradient>

            <linearGradient id="rightHemiGrad" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={neuralState.waveColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor={neuralState.accentColor} stopOpacity="0.4" />
            </linearGradient>

            <filter id="neuralGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ORGANIC ANATOMICAL CEREBRAL CORTEX CONTOURS (Convoluted Lobes, Gyri & Sulci) */}
          <g opacity="0.95" className="transition-all duration-700">
            {/* Left Cerebral Hemisphere - Undulating frontal, temporal, and occipital lobes */}
            <path
              d="M 166 20
                 C 152 17, 136 21, 122 27
                 C 112 32, 102 42, 94 54
                 C 86 66, 82 78, 85 92
                 C 87 104, 95 116, 106 124
                 C 118 133, 134 139, 148 141
                 C 158 142, 165 136, 166 126
                 Z"
              fill="none"
              stroke={neuralState.waveColor}
              strokeWidth="2.2"
              strokeDasharray={isChaotic ? '5 2.5' : 'none'}
              opacity="0.85"
              className="transition-colors duration-700"
            />

            {/* Left Gyri & Sulcal Folds (The iconic textured grooves of the brain) */}
            <path
              d="M 132 26 C 124 44, 134 60, 118 76"
              fill="none"
              stroke={neuralState.waveColor}
              strokeWidth="1.3"
              strokeLinecap="round"
              opacity="0.6"
            />
            <path
              d="M 88 78 C 106 74, 122 86, 142 82"
              fill="none"
              stroke={neuralState.waveColor}
              strokeWidth="1.3"
              strokeLinecap="round"
              opacity="0.6"
            />
            <path
              d="M 148 34 C 138 46, 146 58, 136 70"
              fill="none"
              stroke={neuralState.waveColor}
              strokeWidth="1.3"
              strokeLinecap="round"
              opacity="0.55"
            />
            <path
              d="M 112 104 C 124 108, 132 120, 146 122"
              fill="none"
              stroke={neuralState.waveColor}
              strokeWidth="1.3"
              strokeLinecap="round"
              opacity="0.55"
            />

            {/* Right Cerebral Hemisphere - Anatomical reflection with organic folds */}
            <path
              d="M 174 20
                 C 188 17, 204 21, 218 27
                 C 228 32, 238 42, 246 54
                 C 254 66, 258 78, 255 92
                 C 253 104, 245 116, 234 124
                 C 222 133, 206 139, 192 141
                 C 182 142, 175 136, 174 126
                 Z"
              fill="none"
              stroke={neuralState.waveColor}
              strokeWidth="2.2"
              strokeDasharray={isChaotic ? '5 2.5' : 'none'}
              opacity="0.85"
              className="transition-colors duration-700"
            />

            {/* Right Gyri & Sulcal Folds */}
            <path
              d="M 208 26 C 216 44, 206 60, 222 76"
              fill="none"
              stroke={neuralState.waveColor}
              strokeWidth="1.3"
              strokeLinecap="round"
              opacity="0.6"
            />
            <path
              d="M 252 78 C 234 74, 218 86, 198 82"
              fill="none"
              stroke={neuralState.waveColor}
              strokeWidth="1.3"
              strokeLinecap="round"
              opacity="0.6"
            />
            <path
              d="M 192 34 C 202 46, 194 58, 204 70"
              fill="none"
              stroke={neuralState.waveColor}
              strokeWidth="1.3"
              strokeLinecap="round"
              opacity="0.55"
            />
            <path
              d="M 228 104 C 216 108, 208 120, 194 122"
              fill="none"
              stroke={neuralState.waveColor}
              strokeWidth="1.3"
              strokeLinecap="round"
              opacity="0.55"
            />

            {/* Central Longitudinal Fissure & Corpus Callosum Bridge */}
            <line
              x1="170"
              y1="19"
              x2="170"
              y2="142"
              stroke="#003e5c"
              strokeWidth="2.5"
              strokeDasharray="4 3"
            />
          </g>

          {/* DYNAMIC NEURAL PATHWAYS & FIRING PATTERNS */}
          {/* Stage 1: Baseline Gentle Waves */}
          {activeStage === 1 && (
            <g className="transition-opacity duration-500">
              <path
                d="M 115 50 Q 140 70, 165 80 T 130 115"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="120"
                strokeDashoffset="0"
                className="animate-pulse"
              />
              <path
                d="M 225 50 Q 200 70, 175 80 T 210 115"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="120"
                strokeDashoffset="0"
                className="animate-pulse"
              />
              <circle cx="105" cy="85" r="5" fill="#38bdf8" filter="url(#neuralGlow)" />
              <circle cx="105" cy="85" r="9" fill="none" stroke="#38bdf8" strokeWidth="1" className="animate-ping" opacity="0.6" />
              <circle cx="235" cy="85" r="5" fill="#38bdf8" filter="url(#neuralGlow)" />
            </g>
          )}

          {/* Stage 2: Acute Stress Loop (Fast erratic red/amber pulses) */}
          {activeStage === 2 && (
            <g className="transition-opacity duration-500">
              <path
                d="M 118 58 L 142 74 L 122 96 L 152 112 L 132 126"
                fill="none"
                stroke={neuralState.waveColor}
                strokeWidth="2.5"
                strokeDasharray="8 4"
                className="animate-pulse"
                filter="url(#neuralGlow)"
              />
              <path
                d="M 222 58 L 198 74 L 218 96 L 188 112 L 208 126"
                fill="none"
                stroke={neuralState.waveColor}
                strokeWidth="2.5"
                strokeDasharray="8 4"
                className="animate-pulse"
                filter="url(#neuralGlow)"
              />
              <circle cx="150" cy="90" r="7" fill={neuralState.waveColor} filter="url(#neuralGlow)" className="animate-ping" opacity="0.75" />
              <circle cx="190" cy="90" r="7" fill={neuralState.waveColor} filter="url(#neuralGlow)" className="animate-ping" opacity="0.75" />
              <circle cx="150" cy="90" r="4" fill="#ffffff" />
              <circle cx="190" cy="90" r="4" fill="#ffffff" />
            </g>
          )}

          {/* Stage 3: Stuck in a Mental Loop */}
          {activeStage === 3 && (
            <g className="transition-opacity duration-500">
              <path
                d="M 135 70 C 120 95, 150 115, 170 95 C 190 115, 220 95, 205 70 C 190 45, 150 45, 135 70 Z"
                fill="none"
                stroke="#fb923c"
                strokeWidth="2.4"
                strokeDasharray="6 3"
                className="animate-spin"
                style={{ transformOrigin: '170px 85px', animationDuration: '6s' }}
                filter="url(#neuralGlow)"
              />
              <rect x="122" y="80" width="10" height="10" rx="3" fill="#ea580c" />
              <rect x="208" y="80" width="10" height="10" rx="3" fill="#ea580c" />
              <circle cx="170" cy="85" r="4" fill="#fbbf24" />
            </g>
          )}

          {/* Stage 4: Untangling with Real Proof */}
          {activeStage === 4 && (
            <g className="transition-opacity duration-500">
              <path
                d="M 100 65 Q 120 40, 150 50 T 165 95"
                fill="none"
                stroke="#26c6da"
                strokeWidth="2.2"
                strokeDasharray="140"
                strokeDashoffset="0"
                filter="url(#neuralGlow)"
              />
              <path
                d="M 240 65 Q 220 40, 190 50 T 175 95"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.2"
                strokeDasharray="140"
                strokeDashoffset="0"
                filter="url(#neuralGlow)"
              />
              <line x1="145" y1="75" x2="195" y2="75" stroke="#26c6da" strokeWidth="2" strokeDasharray="3 3" />
              <line x1="140" y1="95" x2="200" y2="95" stroke="#26c6da" strokeWidth="2" strokeDasharray="3 3" />
              <circle cx="145" cy="75" r="4" fill="#26c6da" />
              <circle cx="195" cy="75" r="4" fill="#26c6da" />
            </g>
          )}

          {/* Stage 5: Grounded Calm Restored */}
          {activeStage === 5 && (
            <g className="transition-opacity duration-500">
              <path
                d="M 95 65 Q 130 30, 170 35 Q 210 30, 245 65 Q 220 115, 170 120 Q 120 115, 95 65 Z"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.4"
                filter="url(#neuralGlow)"
                className="animate-pulse"
                style={{ animationDuration: '3s' }}
              />
              <circle cx="130" cy="80" r="18" fill="none" stroke="#26c6da" strokeWidth="1.5" opacity="0.8" />
              <circle cx="210" cy="80" r="18" fill="none" stroke="#26c6da" strokeWidth="1.5" opacity="0.8" />
              <circle cx="130" cy="80" r="4" fill="#10b981" filter="url(#neuralGlow)" />
              <circle cx="210" cy="80" r="4" fill="#10b981" filter="url(#neuralGlow)" />
              <circle cx="170" cy="38" r="5" fill="#26c6da" filter="url(#neuralGlow)" />
            </g>
          )}

          {/* Synaptic Nodes across Cortex */}
          <g fill={neuralState.waveColor} opacity="0.85" className="transition-colors duration-700">
            <circle cx="110" cy="55" r="3" />
            <circle cx="95" cy="85" r="3" />
            <circle cx="120" cy="115" r="3" />
            <circle cx="230" cy="55" r="3" />
            <circle cx="245" cy="85" r="3" />
            <circle cx="220" cy="115" r="3" />
          </g>
        </svg>

        {/* Clean, Non-Overlapping Telemetry Status Bar */}
        <div className="absolute bottom-1 left-0 right-0 h-5 flex items-center justify-between px-3 pointer-events-none">
          <div className="flex items-center gap-1.5 text-[10px] text-[#93c5d6]">
            <Activity className="w-3 h-3 text-[#26c6da]" />
            <span className="font-medium">{neuralState.activityLabel}</span>
          </div>
          <div className="text-[10px] text-[#93c5d6] font-medium font-mono">
            {activeStage === 5 ? (
              <span className="text-emerald-400 font-bold">Relief: -{Math.max(0, initialBelief - reframedBelief)}%</span>
            ) : (
              <span>Belief: {initialBelief}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Explanatory Caption in Friendly Layman Terms */}
      <div className="mt-1 pt-2 border-t border-[#00283c] flex items-start gap-2 text-xs">
        <Zap className="w-4 h-4 text-[#26c6da] shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-snug">
          <strong className="text-white text-xs block font-semibold">
            {neuralState.title}
          </strong>
          <p className="text-[11px] text-[#93c5d6] leading-relaxed">
            {neuralState.subtitle}
          </p>
        </div>
      </div>

      {/* Seamless Shift Indicator Dots: Clickable or swipable */}
      <div className="mt-2.5 pt-2 border-t border-[#00283c] flex items-center justify-between">
        <span className="text-[10px] text-[#719bb0] font-medium">
          {isManualPaused ? 'Swipe back/forth to explore:' : 'Neural Shift Progression:'}
        </span>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSelectStage(s)}
              className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                activeStage === s
                  ? 'w-7 bg-[#26c6da] shadow-sm shadow-[#26c6da]/50'
                  : 'w-2 bg-[#003850] hover:bg-[#004e70]'
              }`}
              title={`Step ${s}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
