/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Sparkles, Activity, ShieldCheck, Scale, Compass, Eye } from 'lucide-react';

interface CognitiveMotionVisualizerProps {
  stage: number;
  emotion: string;
  belief: number;
  sensations: string[];
  selectedDistortions: string[];
  evidenceForCount: number;
  evidenceAgainstCount: number;
}

export const CognitiveMotionVisualizer: React.FC<CognitiveMotionVisualizerProps> = ({
  stage,
  emotion,
  belief,
  sensations,
  selectedDistortions,
  evidenceForCount,
  evidenceAgainstCount,
}) => {
  // Color palette and mood tuning based on active emotion and belief
  const emotionTheme = useMemo(() => {
    switch (emotion) {
      case 'Panicked':
      case 'Catastrophic':
        return { primary: '#f43f5e', secondary: '#fb7185', pulseDuration: '1.2s', label: 'High Arousal' };
      case 'Anxious':
      case 'Overwhelmed':
        return { primary: '#f59e0b', secondary: '#fbbf24', pulseDuration: '1.8s', label: 'Elevated Tension' };
      case 'Sad':
      case 'Hopeless':
        return { primary: '#38bdf8', secondary: '#818cf8', pulseDuration: '3.2s', label: 'Low Energy' };
      case 'Frustrated':
      case 'Angry':
        return { primary: '#ef4444', secondary: '#f97316', pulseDuration: '1.4s', label: 'Reactive Surge' };
      default:
        return { primary: '#26c6da', secondary: '#80deea', pulseDuration: '2.4s', label: 'Mindful Steady' };
    }
  }, [emotion]);

  // Balance calculation for Stage 4
  const evidenceTilt = useMemo(() => {
    const total = evidenceForCount + evidenceAgainstCount;
    if (total === 0) return 0;
    // Positive tilt = counter evidence outweighs negative assumption
    const diff = evidenceAgainstCount - evidenceForCount;
    return Math.max(-15, Math.min(15, diff * 3));
  }, [evidenceForCount, evidenceAgainstCount]);

  return (
    <div className="relative w-full h-36 rounded-2xl bg-gradient-to-br from-[#02131f] via-[#051c2c] to-[#010e17] border border-[#003b54] overflow-hidden shadow-inner flex flex-col justify-between p-3 select-none">
      
      {/* Background ambient particle aura */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40 transition-colors duration-700"
        style={{
          background:
            stage === 5
              ? 'radial-gradient(circle, #26c6da 0%, #8b5cf6 70%, transparent 100%)'
              : stage === 4
              ? 'radial-gradient(circle, #38bdf8 0%, #26c6da 70%, transparent 100%)'
              : `radial-gradient(circle, ${emotionTheme.primary} 0%, #001724 70%, transparent 100%)`,
        }}
      />

      <div
        className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-2xl pointer-events-none opacity-30 transition-colors duration-700"
        style={{
          background: stage === 5 ? '#34d399' : '#003a52',
        }}
      />

      {/* Top telemetry bar */}
      <div className="relative z-10 flex items-center justify-between text-[10px] font-mono tracking-wider">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#001724]/80 border border-[#002f44] text-[#93c5d6]">
          <span
            className="w-1.5 h-1.5 rounded-full animate-ping"
            style={{
              backgroundColor: stage === 5 ? '#34d399' : emotionTheme.primary,
              animationDuration: emotionTheme.pulseDuration,
            }}
          />
          <span className="uppercase text-[9px] font-bold text-white tracking-widest">
            {stage === 1 && 'Neural Grounding'}
            {stage === 2 && `Somatic Resonance: ${emotionTheme.label}`}
            {stage === 3 && `Thought Tension: ${belief}%`}
            {stage === 4 && 'Evidence Ratio Monitor'}
            {stage === 5 && 'Cognitive Synthesis: Radiant'}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-[#26c6da]">
          {stage === 1 && <Eye className="w-3 h-3 text-[#26c6da]" />}
          {stage === 2 && <Activity className="w-3 h-3 text-amber-300" />}
          {stage === 3 && <Compass className="w-3 h-3 text-purple-400" />}
          {stage === 4 && <Scale className="w-3 h-3 text-cyan-400" />}
          {stage === 5 && <Sparkles className="w-3 h-3 text-emerald-400" />}
          <span className="font-semibold text-white/90">
            {stage === 1 && 'Observing Facts'}
            {stage === 2 && `${sensations.length} Somatic Cues`}
            {stage === 3 && `${selectedDistortions.length} Traps Tagged`}
            {stage === 4 && `${evidenceAgainstCount} Counter-Facts`}
            {stage === 5 && 'Reframe Activated'}
          </span>
        </div>
      </div>

      {/* Center Interactive Motion Graphic Canvas */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-1 overflow-hidden">
        
        {/* STAGE 1 MOTION GRAPHIC: Grounding Bio-Ripples */}
        {stage === 1 && (
          <div className="relative flex items-center justify-center w-full h-full">
            {/* Pulsing Concentric Ripple Rings */}
            <div className="absolute w-24 h-24 rounded-full border border-[#26c6da]/20 animate-ping opacity-75" style={{ animationDuration: '3s' }} />
            <div className="absolute w-18 h-18 rounded-full border border-[#26c6da]/35 animate-ping opacity-60" style={{ animationDuration: '2.2s' }} />
            <div className="absolute w-12 h-12 rounded-full border border-[#26c6da]/60 bg-[#26c6da]/10 flex items-center justify-center shadow-lg shadow-[#26c6da]/20">
              <div className="w-4 h-4 rounded-full bg-[#26c6da] animate-pulse" />
            </div>

            {/* Floating horizon grid scanlines */}
            <svg className="w-full h-16 opacity-30" viewBox="0 0 300 60" fill="none">
              <path d="M 0 30 Q 75 22 150 30 T 300 30" stroke="#26c6da" strokeWidth="1.5" strokeDasharray="4 4" />
              <path d="M 0 35 Q 75 42 150 35 T 300 35" stroke="#93c5d6" strokeWidth="1" opacity="0.6" />
            </svg>
          </div>
        )}

        {/* STAGE 2 MOTION GRAPHIC: Dynamic Somatic Bio-Pulse Orb */}
        {stage === 2 && (
          <div className="relative flex items-center justify-center w-full h-full">
            {/* Outer harmonic rings */}
            <div
              className="absolute w-28 h-28 rounded-full border transition-all duration-700"
              style={{
                borderColor: `${emotionTheme.primary}40`,
                boxShadow: `0 0 20px ${emotionTheme.primary}25`,
                transform: `scale(${1 + sensations.length * 0.05})`,
              }}
            />
            {/* Heartbeat EKG Pulse Wave */}
            <svg className="w-full h-16" viewBox="0 0 320 60" fill="none">
              <path
                d="M 10 30 L 70 30 L 85 10 L 95 50 L 105 20 L 115 30 L 210 30 L 225 15 L 235 45 L 245 25 L 255 30 L 310 30"
                stroke={emotionTheme.primary}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-pulse"
                style={{ filter: `drop-shadow(0 0 8px ${emotionTheme.primary})` }}
              />
            </svg>
            {/* Central Bio-Core */}
            <div
              className="absolute w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300"
              style={{
                backgroundColor: `${emotionTheme.primary}30`,
                border: `2px solid ${emotionTheme.primary}`,
                boxShadow: `0 0 15px ${emotionTheme.primary}`,
              }}
            >
              <div
                className="w-3.5 h-3.5 rounded-full animate-ping"
                style={{ backgroundColor: emotionTheme.primary, animationDuration: emotionTheme.pulseDuration }}
              />
            </div>
          </div>
        )}

        {/* STAGE 3 MOTION GRAPHIC: Thought Untangler & Trap Neutralizer */}
        {stage === 3 && (
          <div className="relative flex items-center justify-center w-full h-full">
            {/* Neural Matrix Network */}
            <svg className="w-full h-full max-h-24" viewBox="0 0 320 70">
              <defs>
                <linearGradient id="trapGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#26c6da" />
                </linearGradient>
              </defs>

              {/* Distorted chaotic wave transforming into smooth wave based on traps tagged */}
              <path
                d={
                  selectedDistortions.length > 0
                    ? 'M 10 35 C 60 15, 100 55, 160 35 C 220 20, 260 50, 310 35'
                    : 'M 10 35 Q 40 5, 80 55 T 160 10 T 240 60 T 310 35'
                }
                fill="none"
                stroke="url(#trapGrad)"
                strokeWidth={selectedDistortions.length > 0 ? '3' : '2'}
                strokeDasharray={selectedDistortions.length > 0 ? 'none' : '3 3'}
                className="transition-all duration-700"
                style={{ filter: 'drop-shadow(0 0 8px rgba(38,198,218,0.5))' }}
              />

              {/* Dynamic synaptic nodes */}
              {[40, 100, 160, 220, 280].map((cx, i) => {
                const isActive = i < selectedDistortions.length;
                return (
                  <circle
                    key={cx}
                    cx={cx}
                    cy={35 + Math.sin(i * 1.5) * (selectedDistortions.length > 0 ? 8 : 16)}
                    r={isActive ? 5 : 3.5}
                    fill={isActive ? '#26c6da' : '#8b5cf6'}
                    stroke="#001724"
                    strokeWidth="1.5"
                    className="transition-all duration-500"
                  />
                );
              })}
            </svg>

            {/* Central Belief Intensity Tag */}
            <div className="absolute right-3 top-1 px-2 py-0.5 rounded-md bg-[#001420]/90 border border-amber-500/40 text-[9px] font-mono text-amber-300">
              Belief: {belief}%
            </div>
          </div>
        )}

        {/* STAGE 4 MOTION GRAPHIC: Kinetic Truth & Evidence Balance Scale */}
        {stage === 4 && (
          <div className="relative flex items-center justify-center w-full h-full">
            <svg
              className="w-full h-24 transition-transform duration-700 ease-out"
              viewBox="0 0 320 80"
              style={{ transform: `rotate(${evidenceTilt}deg)` }}
            >
              {/* Central Pivot Fulcrum */}
              <polygon points="160,45 150,70 170,70" fill="#003b54" stroke="#26c6da" strokeWidth="1.5" />
              <circle cx="160" cy="45" r="4" fill="#26c6da" />

              {/* Main Balance Beam */}
              <line x1="60" y1="45" x2="260" y2="45" stroke="#93c5d6" strokeWidth="3" strokeLinecap="round" />

              {/* Left Pan: Supporting Facts */}
              <line x1="80" y1="45" x2="65" y2="65" stroke="#719bb0" strokeWidth="1" />
              <line x1="80" y1="45" x2="95" y2="65" stroke="#719bb0" strokeWidth="1" />
              <path d="M 60 65 Q 80 72 100 65 Z" fill="#002233" stroke="#f59e0b" strokeWidth="1.5" />

              {/* Right Pan: Alternative / Counter Evidence */}
              <line x1="240" y1="45" x2="225" y2="65" stroke="#719bb0" strokeWidth="1" />
              <line x1="240" y1="45" x2="255" y2="65" stroke="#719bb0" strokeWidth="1" />
              <path d="M 220 65 Q 240 72 260 65 Z" fill="#002233" stroke="#26c6da" strokeWidth="1.5" />
            </svg>

            {/* Labels on each side */}
            <div className="absolute left-4 bottom-1 text-[9px] font-mono text-amber-300/90 bg-[#001724]/80 px-1.5 py-0.5 rounded">
              Worry Facts: {evidenceForCount}
            </div>
            <div className="absolute right-4 bottom-1 text-[9px] font-mono text-[#26c6da] bg-[#001724]/80 px-1.5 py-0.5 rounded font-bold">
              Counter Facts: {evidenceAgainstCount}
            </div>
          </div>
        )}

        {/* STAGE 5 MOTION GRAPHIC: Luminous Neuro-Synthesis Bloom */}
        {stage === 5 && (
          <div className="relative flex items-center justify-center w-full h-full">
            {/* Radiant Blooming Aura Rings */}
            <div className="absolute w-28 h-28 rounded-full border border-emerald-400/30 animate-ping opacity-50" style={{ animationDuration: '3s' }} />
            <div className="absolute w-20 h-20 rounded-full border border-[#26c6da]/40 animate-pulse" style={{ animationDuration: '2s' }} />
            <div className="absolute w-14 h-14 rounded-full bg-gradient-to-tr from-[#26c6da] to-emerald-400 opacity-20 blur-md animate-pulse" />

            {/* Golden Harmony Mandala Rays */}
            <svg className="w-24 h-24 animate-spin-slow opacity-80" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="30" stroke="#26c6da" strokeWidth="1.5" fill="none" strokeDasharray="4 6" />
              <circle cx="50" cy="50" r="20" stroke="#34d399" strokeWidth="1" fill="none" strokeDasharray="2 4" />
              <polygon points="50,22 56,40 74,40 60,52 65,70 50,58 35,70 40,52 26,40 44,40" fill="none" stroke="#a78bfa" strokeWidth="1.2" />
            </svg>

            <div className="absolute w-8 h-8 rounded-full bg-emerald-400/20 border border-emerald-300 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom status text / guidance prompt */}
      <div className="relative z-10 flex items-center justify-between pt-1 border-t border-[#002f44] text-[10px] text-[#93c5d6]">
        <span>
          {stage === 1 && 'Observe the situation cleanly without self-blame.'}
          {stage === 2 && 'Notice where tension lives in your body to locate the thought.'}
          {stage === 3 && 'Labeling the thinking trap breaks its automatic grip.'}
          {stage === 4 && 'Truth emerges when we balance worries with observable facts.'}
          {stage === 5 && 'Forming a balanced perspective restores emotional control.'}
        </span>
        <span className="font-mono text-[#26c6da] font-bold shrink-0 ml-2">
          {stage}/5
        </span>
      </div>
    </div>
  );
};
