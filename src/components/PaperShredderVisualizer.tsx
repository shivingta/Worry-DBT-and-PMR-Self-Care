/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Trash2, ArrowDown, CheckCircle2, Hand } from 'lucide-react';

interface PaperShredderVisualizerProps {
  worryText: string;
  worryType?: 'actionable' | 'hypothetical';
  onPaperTearSound?: () => void;
  onShredComplete: () => void;
}

const RIBBON_COUNT = 12;

export const PaperShredderVisualizer: React.FC<PaperShredderVisualizerProps> = ({
  worryText,
  worryType = 'hypothetical',
  onPaperTearSound,
  onShredComplete,
}) => {
  const [shredProgress, setShredProgress] = useState<number>(0); // 0 to 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const dragStartYRef = useRef<number | null>(null);
  const dragStartProgressRef = useRef<number>(0);
  const lastHapticStepRef = useRef<number>(0);
  const soundTriggeredRef = useRef<boolean>(false);
  const completedRef = useRef<boolean>(false);

  // Continuous Web Audio Foley Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseGainRef = useRef<GainNode | null>(null);
  const motorOscRef = useRef<OscillatorNode | null>(null);
  const motorGainRef = useRef<GainNode | null>(null);

  const isActive = isDragging || isHolding;

  const stopFoley = useCallback(() => {
    if (audioCtxRef.current && noiseGainRef.current && motorGainRef.current) {
      const now = audioCtxRef.current.currentTime;
      try {
        noiseGainRef.current.gain.setTargetAtTime(0.0001, now, 0.04);
        motorGainRef.current.gain.setTargetAtTime(0.0001, now, 0.04);
      } catch {}
    }
  }, []);

  const ensureFoleyEngine = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Crinkle / Paper Shear Noise Generator
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const crackle = Math.random() > 0.92 ? (Math.random() * 2 - 1) * 1.4 : (Math.random() * 2 - 1) * 0.45;
        data[i] = Math.max(-1, Math.min(1, crackle));
      }

      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = buffer;
      noiseSrc.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(1950, ctx.currentTime);
      bandpass.Q.setValueAtTime(1.4, ctx.currentTime);

      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.0001, ctx.currentTime);

      noiseSrc.connect(bandpass);
      bandpass.connect(nGain);
      nGain.connect(ctx.destination);
      noiseSrc.start();
      noiseGainRef.current = nGain;

      // Low Mechanical Shredder Gear Hum
      const motor = ctx.createOscillator();
      motor.type = 'sawtooth';
      motor.frequency.setValueAtTime(68, ctx.currentTime);

      const motorFilter = ctx.createBiquadFilter();
      motorFilter.type = 'lowpass';
      motorFilter.frequency.setValueAtTime(180, ctx.currentTime);

      const mGain = ctx.createGain();
      mGain.gain.setValueAtTime(0.0001, ctx.currentTime);

      motor.connect(motorFilter);
      motorFilter.connect(mGain);
      mGain.connect(ctx.destination);
      motor.start();
      motorOscRef.current = motor;
      motorGainRef.current = mGain;
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
  }, []);

  const updateFoleyIntensity = useCallback(
    (progress: number, active: boolean) => {
      if (!active || progress >= 100) {
        stopFoley();
        return;
      }
      ensureFoleyEngine();
      if (!audioCtxRef.current || !noiseGainRef.current || !motorGainRef.current || !motorOscRef.current) return;
      const now = audioCtxRef.current.currentTime;
      const intensity = 0.08 + (progress / 100) * 0.09;
      try {
        noiseGainRef.current.gain.setTargetAtTime(intensity, now, 0.03);
        motorGainRef.current.gain.setTargetAtTime(0.055, now, 0.03);
        motorOscRef.current.frequency.setTargetAtTime(65 + (progress / 100) * 28, now, 0.05);
      } catch {}
    },
    [ensureFoleyEngine, stopFoley]
  );

  const playReleaseChime = useCallback(() => {
    try {
      ensureFoleyEngine();
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const now = ctx.currentTime;
      [528, 660].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.14, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4 + idx * 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + 1.5 + idx * 0.15);
      });
    } catch {}
  }, [ensureFoleyEngine]);

  // Cleanup audio nodes on unmount
  useEffect(() => {
    return () => {
      stopFoley();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [stopFoley]);

  const finishShredSequence = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setShredProgress(100);
    setIsDragging(false);
    setIsHolding(false);
    setIsCompleted(true);
    stopFoley();
    playReleaseChime();
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([25, 40, 60]);
      } catch {}
    }
    setTimeout(() => {
      onShredComplete();
    }, 950);
  }, [onShredComplete, playReleaseChime, stopFoley]);

  // Hold-to-Shred smooth interval
  useEffect(() => {
    if (!isHolding || isCompleted) return;
    const interval = setInterval(() => {
      setShredProgress((prev) => {
        const next = Math.min(100, prev + 2.6);
        const step = Math.floor(next / 10);
        if (step !== lastHapticStepRef.current) {
          lastHapticStepRef.current = step;
          if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            try {
              navigator.vibrate(10);
            } catch {}
          }
        }
        updateFoleyIntensity(next, true);
        if (next >= 100) {
          clearInterval(interval);
          finishShredSequence();
        }
        return next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [isHolding, isCompleted, finishShredSequence, updateFoleyIntensity]);

  // Pointer Drag Handlers on the Paper Slip
  const handlePaperPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isCompleted || isHolding) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartYRef.current = e.clientY;
    dragStartProgressRef.current = shredProgress;
    setIsDragging(true);
    if (!soundTriggeredRef.current) {
      soundTriggeredRef.current = true;
      onPaperTearSound?.();
    }
    updateFoleyIntensity(shredProgress, true);
  };

  const handlePaperPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || dragStartYRef.current === null || isCompleted) return;
    const deltaY = e.clientY - dragStartYRef.current;
    // 115px downward drag = 100% shred
    const next = Math.max(0, Math.min(100, dragStartProgressRef.current + (deltaY / 115) * 100));
    setShredProgress(next);

    const step = Math.floor(next / 10);
    if (step !== lastHapticStepRef.current) {
      lastHapticStepRef.current = step;
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(10);
        } catch {}
      }
    }

    updateFoleyIntensity(next, true);

    if (next >= 88) {
      finishShredSequence();
    }
  };

  const handlePaperPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    dragStartYRef.current = null;
    stopFoley();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const pct = Math.round(shredProgress);
  const paperTranslateY = (shredProgress / 100) * 96;

  return (
    <div className="p-4 rounded-2xl bg-[#00111a] border border-rose-500/40 space-y-3 select-none">
      {/* Top Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isCompleted
                ? 'bg-emerald-400'
                : isActive
                ? 'bg-rose-400 animate-ping'
                : 'bg-rose-400/70'
            }`}
          />
          <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-rose-300">
            {isCompleted
              ? 'THOUGHT DEFUSED & RELEASED'
              : isActive
              ? 'SHREDDING THOUGHT LOOP...'
              : 'DRAG SLIP DOWN OR HOLD BUTTON'}
          </span>
        </div>
        <span className="text-xs font-mono font-extrabold text-[#26c6da]">{pct}%</span>
      </div>

      {/* Main Shredder Stage */}
      <div className="relative rounded-2xl bg-[#000b12] border border-[#002b3d] pt-3 pb-4 px-3 overflow-hidden">
        {/* Upper Intake Zone (Clips paper cleanly at the steel slot) */}
        <div className="relative h-28 overflow-hidden flex flex-col items-center justify-end">
          {/* Downward Guide Chevrons (fade once user starts feeding) */}
          {pct < 15 && !isCompleted && (
            <div className="absolute top-1 right-3 flex flex-col items-center text-[#26c6da]/75 animate-bounce pointer-events-none z-20">
              <Hand className="w-3.5 h-3.5 mb-0.5" />
              <ArrowDown className="w-3.5 h-3.5" />
            </div>
          )}

          {/* Draggable Textured Paper Slip */}
          {!isCompleted && (
            <div
              onPointerDown={handlePaperPointerDown}
              onPointerMove={handlePaperPointerMove}
              onPointerUp={handlePaperPointerUp}
              onPointerCancel={handlePaperPointerUp}
              style={{
                transform: `translateY(${paperTranslateY}px) scale(${1 - (shredProgress / 100) * 0.03})`,
                transition: isDragging ? 'none' : 'transform 0.18s ease-out',
                touchAction: 'none',
              }}
              className="w-[92%] rounded-t-xl bg-gradient-to-b from-slate-100 to-slate-200 text-slate-900 p-3 shadow-xl border border-white cursor-grab active:cursor-grabbing relative z-10"
            >
              {/* Subtle ruled paper lines */}
              <div className="flex items-center justify-between border-b border-slate-300/80 pb-1 mb-1.5">
                <span
                  className={`text-[9px] font-mono font-extrabold uppercase tracking-wider ${
                    worryType === 'actionable' ? 'text-amber-700' : 'text-slate-600'
                  }`}
                >
                  {worryType === 'actionable'
                    ? 'RELEASING ACTION LOOP'
                    : 'UNGROUNDED HYPOTHETICAL WORRY'}
                </span>
                <span className="text-[9px] font-mono font-bold text-rose-600 uppercase">
                  {pct > 0 ? 'FEEDING...' : 'PULL DOWN ↓'}
                </span>
              </div>
              <p className="text-xs font-bold italic text-slate-900 line-clamp-2 text-left">
                &ldquo;{worryText}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Interlocking Steel Roller Blade Bar */}
        <div
          className={`relative z-20 h-7 rounded-lg bg-gradient-to-b from-[#0a293b] via-[#061b28] to-[#020e16] border flex items-center justify-around px-2 shadow-lg transition-colors ${
            isActive
              ? 'border-rose-400/80 shadow-rose-950/60'
              : 'border-[#26c6da]/40'
          }`}
        >
          {Array.from({ length: 12 }).map((_, idx) => (
            <div
              key={idx}
              style={{
                transform: `rotate(${shredProgress * 7.2 * (idx % 2 === 0 ? 1 : -1)}deg)`,
              }}
              className="w-3.5 h-3.5 rounded-full bg-[#001724] border border-[#26c6da]/80 flex items-center justify-center shadow-inner"
            >
              <div className="w-2.5 h-[2px] bg-slate-200 rounded-full" />
            </div>
          ))}
        </div>

        {/* Lower Chute: Curling Paper Ribbons Emerging Below Blades */}
        <div className="relative h-24 overflow-hidden flex items-start justify-center pt-0.5">
          {isCompleted ? (
            <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 mb-1">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-emerald-300">
                Released. Not yours to carry right now.
              </span>
            </div>
          ) : shredProgress > 4 ? (
            <div className="w-[90%] grid grid-cols-12 gap-1 px-1">
              {Array.from({ length: RIBBON_COUNT }).map((_, i) => {
                const waveOffset = ((i * 19) % 14) - 7;
                const ribbonHeight = Math.min(86, (shredProgress / 100) * (72 + (i % 3) * 10));
                const ribbonOpacity =
                  shredProgress > 82 ? Math.max(0.15, 1 - (shredProgress - 82) / 22) : 0.92;
                return (
                  <div
                    key={i}
                    style={{
                      height: `${ribbonHeight}px`,
                      opacity: ribbonOpacity,
                      transform: `translateY(${(shredProgress / 100) * 10}px) rotate(${
                        waveOffset * (shredProgress / 100)
                      }deg)`,
                    }}
                    className={`rounded-b-sm transition-opacity ${
                      i % 2 === 0
                        ? 'bg-gradient-to-b from-slate-200 via-slate-300 to-transparent'
                        : 'bg-gradient-to-b from-slate-100 via-slate-300/90 to-transparent'
                    }`}
                  />
                );
              })}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center gap-1.5 text-[11px] text-[#719bb0]">
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Pull the slip into the blades or hold below to release</span>
            </div>
          )}
        </div>
      </div>

      {/* Tactile Press-and-Hold Fallback Button */}
      {!isCompleted && (
        <button
          type="button"
          onPointerDown={() => {
            if (!soundTriggeredRef.current) {
              soundTriggeredRef.current = true;
              onPaperTearSound?.();
            }
            setIsHolding(true);
          }}
          onPointerUp={() => {
            setIsHolding(false);
            stopFoley();
          }}
          onPointerLeave={() => {
            setIsHolding(false);
            stopFoley();
          }}
          onPointerCancel={() => {
            setIsHolding(false);
            stopFoley();
          }}
          className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer select-none ${
            isHolding
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-950/60 scale-[0.99]'
              : 'bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-200'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>{isHolding ? `Shredding... ${pct}%` : 'Press & Hold to Shred Thought'}</span>
        </button>
      )}
    </div>
  );
};