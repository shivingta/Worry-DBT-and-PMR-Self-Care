/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Lock, ShieldCheck, RotateCw } from 'lucide-react';

export type VaultAnimPhase = 'ready' | 'tumbling' | 'locked';

interface MechanicalVaultVisualizerProps {
  phase: VaultAnimPhase;
  worryText?: string;
  worryType?: 'actionable' | 'hypothetical' | null;
  scheduledTime?: string;
  onLockTrigger?: () => void;
  onTumblerClick?: () => void;
  compact?: boolean;
}

export const MechanicalVaultVisualizer: React.FC<MechanicalVaultVisualizerProps> = ({
  phase,
  worryText,
  worryType,
  scheduledTime = '17:30',
  onLockTrigger,
  onTumblerClick,
  compact = false,
}) => {
  const isTumbling = phase === 'tumbling';
  const isLocked = phase === 'locked';

  const [rotationDegrees, setRotationDegrees] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isAutoTurning, setIsAutoTurning] = useState<boolean>(false);
  const lastAngleRef = useRef<number | null>(null);
  const totalTurnedRef = useRef<number>(0);
  const lastStepRef = useRef<number>(0);
  const dialRef = useRef<HTMLDivElement | null>(null);
  const autoTurnAnimRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLocked) {
      setRotationDegrees(360);
      totalTurnedRef.current = 360;
      setIsAutoTurning(false);
    } else if (phase === 'ready') {
      setRotationDegrees(0);
      totalTurnedRef.current = 0;
      lastStepRef.current = 0;
      setIsAutoTurning(false);
    }
  }, [phase, isLocked]);

  useEffect(() => {
    return () => {
      if (autoTurnAnimRef.current) cancelAnimationFrame(autoTurnAnimRef.current);
    };
  }, []);

  const turnProgress = isLocked
    ? 1
    : isTumbling
    ? 0.96
    : Math.min(1, Math.max(0, rotationDegrees / 360));

  const triggerTick = useCallback(() => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch {}
    }
    onTumblerClick?.();
  }, [onTumblerClick]);

  const playDirectLockAudio = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const now = ctx.currentTime;

      const strikeOsc = ctx.createOscillator();
      const strikeGain = ctx.createGain();
      strikeOsc.type = 'triangle';
      strikeOsc.frequency.setValueAtTime(480, now);
      strikeOsc.frequency.exponentialRampToValueAtTime(80, now + 0.25);
      strikeGain.gain.setValueAtTime(0.45, now);
      strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      strikeOsc.connect(strikeGain);
      strikeGain.connect(ctx.destination);
      strikeOsc.start(now);
      strikeOsc.stop(now + 0.28);

      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snapOsc.type = 'sawtooth';
      snapOsc.frequency.setValueAtTime(1400, now + 0.08);
      snapOsc.frequency.exponentialRampToValueAtTime(260, now + 0.18);
      snapGain.gain.setValueAtTime(0.35, now + 0.08);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      snapOsc.connect(snapGain);
      snapGain.connect(ctx.destination);
      snapOsc.start(now + 0.08);
      snapOsc.stop(now + 0.22);

      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(110, now + 0.05);
      subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.55);
      subGain.gain.setValueAtTime(0.5, now + 0.05);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now + 0.05);
      subOsc.stop(now + 0.6);

      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(528, now + 0.12);
      chimeGain.gain.setValueAtTime(0.26, now + 0.12);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      chimeOsc.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chimeOsc.start(now + 0.12);
      chimeOsc.stop(now + 1.8);
    } catch {}
  }, []);

  const getAngleFromEvent = (clientX: number, clientY: number): number | null => {
    if (!dialRef.current) return null;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    let deg = Math.atan2(dy, dx) * (180 / Math.PI);
    if (deg < 0) deg += 360;
    return deg;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isLocked || isTumbling || isAutoTurning) return;
    const angle = getAngleFromEvent(e.clientX, e.clientY);
    if (angle === null) return;

    lastAngleRef.current = angle;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    triggerTick();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || isLocked || isTumbling || isAutoTurning || lastAngleRef.current === null)
      return;
    const currentAngle = getAngleFromEvent(e.clientX, e.clientY);
    if (currentAngle === null) return;

    let diff = currentAngle - lastAngleRef.current;
    if (diff < -180) diff += 360;
    if (diff > 180) diff -= 360;

    const newTurned = Math.max(0, Math.min(360, totalTurnedRef.current + diff));
    totalTurnedRef.current = newTurned;
    setRotationDegrees(newTurned);
    lastAngleRef.current = currentAngle;

    const step = Math.floor(newTurned / 25);
    if (step !== lastStepRef.current) {
      triggerTick();
      lastStepRef.current = step;
    }

    if (newTurned >= 355) {
      setIsDragging(false);
      totalTurnedRef.current = 360;
      setRotationDegrees(360);
      playDirectLockAudio();
      onLockTrigger?.();
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    lastAngleRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleStartAutoTurn = () => {
    if (isLocked || isTumbling || isAutoTurning) return;
    setIsAutoTurning(true);
    setIsDragging(false);
    triggerTick();

    const startDegrees = rotationDegrees;
    const targetDegrees = 360;
    const deltaDegrees = targetDegrees - startDegrees;
    const duration = 2600;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease =
        progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

      const currentDeg = Math.min(360, startDegrees + deltaDegrees * ease);
      setRotationDegrees(currentDeg);
      totalTurnedRef.current = currentDeg;

      const step = Math.floor(currentDeg / 24);
      if (step !== lastStepRef.current) {
        triggerTick();
        lastStepRef.current = step;
      }

      if (progress < 1) {
        autoTurnAnimRef.current = requestAnimationFrame(animate);
      } else {
        setRotationDegrees(360);
        totalTurnedRef.current = 360;
        setIsAutoTurning(false);
        playDirectLockAudio();
        onLockTrigger?.();
      }
    };

    autoTurnAnimRef.current = requestAnimationFrame(animate);
  };

  const strokeCircumference = 2 * Math.PI * 114;
  const strokeOffset = strokeCircumference - strokeCircumference * turnProgress;

  const handleRad = (rotationDegrees * Math.PI) / 180;
  const knobX = 130 + 114 * Math.cos(handleRad);
  const knobY = 130 + 114 * Math.sin(handleRad);

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${
        compact ? 'py-1' : 'py-3'
      }`}
    >
      <style>{`
        @keyframes vaultLockSlam {
          0% { transform: scale(1); }
          25% { transform: scale(1.045) translateY(-2px); filter: brightness(1.5); }
          50% { transform: scale(0.985) translateY(1px); }
          100% { transform: scale(1); filter: brightness(1); }
        }
        @keyframes lockShockwavePulse {
          0% { transform: scale(0.85); opacity: 0.9; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        @keyframes suctionVortexSpin {
          0% { transform: rotate(0deg); opacity: 0.5; }
          50% { opacity: 0.9; }
          100% { transform: rotate(360deg); opacity: 0.5; }
        }
      `}</style>

      {/* 1. Animated Worry Capsule Sliding into the Vault Aperture */}
      <div className="relative w-full max-w-sm h-16 flex items-center justify-center z-20 pointer-events-none perspective-[600px]">
        {worryText && (
          <div
            style={{
              transform: `translateY(${turnProgress * 88}px) scale(${Math.max(
                0.18,
                1 - turnProgress * 0.78
              )}) rotateX(${turnProgress * 32}deg)`,
              opacity: isLocked ? 0 : Math.max(0, 1 - turnProgress * 1.35),
              transition: isDragging
                ? 'none'
                : 'transform 0.25s ease-out, opacity 0.25s ease-out',
            }}
            className="w-full px-4 py-2.5 rounded-2xl bg-[#001e2e]/95 border border-[#26c6da]/60 shadow-2xl backdrop-blur-md text-left flex flex-col transition-all duration-75 relative overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[#26c6da]/25 to-transparent pointer-events-none"
              style={{
                transform: `translateX(${-100 + turnProgress * 200}%)`,
              }}
            />

            <div className="flex items-center justify-between text-[10px] font-bold tracking-wider mb-0.5">
              <span className="text-[#26c6da] uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#26c6da] animate-ping" />
                {turnProgress > 0
                  ? turnProgress >= 0.9
                    ? 'Sealing in Core...'
                    : 'Entering Vault Chamber...'
                  : 'Queued for Vault'}
              </span>
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-mono ${
                  worryType === 'actionable'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                }`}
              >
                {worryType === 'actionable' ? '⚡ Actionable' : '🌀 Hypothetical'}
              </span>
            </div>
            <p className="text-xs text-white font-medium line-clamp-1 italic">
              &ldquo;{worryText}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* 2. Circular Vault Dial with Rotary Touch/Drag Gesture */}
      <div
        ref={dialRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'none' }}
        className={`relative ${
          compact ? 'w-56 h-56' : 'w-64 h-64 sm:w-72 sm:h-72'
        } flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform ${
          isLocked ? 'animate-[vaultLockSlam_0.45s_cubic-bezier(0.2,0.8,0.2,1)]' : ''
        }`}
      >
        <div
          className={`absolute inset-0 rounded-full blur-2xl transition-all duration-150 pointer-events-none ${
            isLocked
              ? 'bg-emerald-500/40 scale-105'
              : isDragging || isAutoTurning
              ? 'bg-[#26c6da]/35 scale-110'
              : 'bg-[#26c6da]/15 scale-95'
          }`}
        />

        {isLocked && (
          <div className="absolute inset-0 rounded-full border-2 border-emerald-400/80 pointer-events-none animate-[lockShockwavePulse_0.8s_ease-out_forwards]" />
        )}

        <svg
          viewBox="0 0 260 260"
          className="w-full h-full drop-shadow-[0_12px_28px_rgba(0,0,0,0.8)] overflow-visible"
        >
          <defs>
            <radialGradient id="vaultOuterRim" cx="50%" cy="50%" r="50%">
              <stop offset="60%" stopColor="#001421" />
              <stop offset="85%" stopColor="#002233" />
              <stop offset="100%" stopColor="#003752" />
            </radialGradient>
            <radialGradient id="vaultCorePlate" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0d2b40" />
              <stop offset="70%" stopColor="#001421" />
              <stop offset="100%" stopColor="#000d16" />
            </radialGradient>
            <radialGradient id="apertureVortex" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#26c6da" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#003049" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#00101b" stopOpacity="1" />
            </radialGradient>
            <radialGradient id="knobRadial" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#5eead4" />
              <stop offset="85%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#042f2e" />
            </radialGradient>
            <linearGradient id="boltSteel" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2a5068" />
              <stop offset="50%" stopColor="#26c6da" />
              <stop offset="100%" stopColor="#1a3547" />
            </linearGradient>
            <linearGradient id="boltLocked" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#065f46" />
              <stop offset="50%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>

          <circle
            cx="130"
            cy="130"
            r="124"
            fill="url(#vaultOuterRim)"
            stroke="#00344d"
            strokeWidth="4"
          />

          <circle
            cx="130"
            cy="130"
            r="114"
            fill="none"
            stroke="#00344d"
            strokeWidth="3.5"
            strokeDasharray="4 6"
            opacity="0.7"
          />

          {!isLocked && (
            <g opacity="0.6">
              <path
                d="M 126 12 L 132 16 L 126 20"
                fill="none"
                stroke="#26c6da"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M 134 240 L 128 244 L 134 248"
                fill="none"
                stroke="#26c6da"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M 20 134 L 16 128 L 12 134"
                fill="none"
                stroke="#26c6da"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>
          )}

          <circle
            cx="130"
            cy="130"
            r="114"
            fill="none"
            stroke={isLocked ? '#34d399' : '#26c6da'}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={strokeCircumference}
            strokeDashoffset={strokeOffset}
            style={{
              transition: isDragging ? 'none' : 'stroke-dashoffset 0.2s ease-out, stroke 0.3s',
            }}
          />

          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i * 360) / 16;
            const rad = (angle * Math.PI) / 180;
            const x = 130 + 120 * Math.cos(rad);
            const y = 130 + 120 * Math.sin(rad);
            return (
              <g key={`rivet-${i}`}>
                <circle cx={x} cy={y} r="2.8" fill="#000e17" stroke="#004e75" strokeWidth="1" />
                <circle cx={x - 0.6} cy={y - 0.6} r="0.9" fill="#26c6da" opacity="0.7" />
              </g>
            );
          })}

          {/* 4 Steel Locking Bolts */}
          <rect
            x="122"
            y={isLocked ? '16' : 28 - turnProgress * 12}
            width="16"
            height="32"
            rx="3"
            fill={isLocked ? 'url(#boltLocked)' : 'url(#boltSteel)'}
            stroke={isLocked ? '#34d399' : '#26c6da'}
            strokeWidth="1.5"
            style={{
              transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />
          <rect
            x="122"
            y={isLocked ? '212' : 200 + turnProgress * 12}
            width="16"
            height="32"
            rx="3"
            fill={isLocked ? 'url(#boltLocked)' : 'url(#boltSteel)'}
            stroke={isLocked ? '#34d399' : '#26c6da'}
            strokeWidth="1.5"
            style={{
              transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />
          <rect
            x={isLocked ? '16' : 28 - turnProgress * 12}
            y="122"
            width="32"
            height="16"
            rx="3"
            fill={isLocked ? 'url(#boltLocked)' : 'url(#boltSteel)'}
            stroke={isLocked ? '#34d399' : '#26c6da'}
            strokeWidth="1.5"
            style={{
              transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />
          <rect
            x={isLocked ? '212' : 200 + turnProgress * 12}
            y="122"
            width="32"
            height="16"
            rx="3"
            fill={isLocked ? 'url(#boltLocked)' : 'url(#boltSteel)'}
            stroke={isLocked ? '#34d399' : '#26c6da'}
            strokeWidth="1.5"
            style={{
              transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />

          {/* Rotating Wheel & Spokes */}
          <g
            style={{
              transformOrigin: '130px 130px',
              transform: `rotate(${rotationDegrees}deg)`,
              transition: isDragging ? 'none' : 'transform 0.25s ease-out',
            }}
          >
            <circle
              cx="130"
              cy="130"
              r="94"
              fill="none"
              stroke="#26c6da"
              strokeWidth="1.5"
              strokeDasharray="2 6"
              strokeOpacity="0.5"
            />
            <circle
              cx="130"
              cy="130"
              r="76"
              fill="none"
              stroke="#26c6da"
              strokeWidth="2.5"
              strokeOpacity="0.7"
            />
            <line
              x1="130"
              y1="84"
              x2="130"
              y2="52"
              stroke="#26c6da"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            <circle cx="130" cy="52" r="5" fill="#001421" stroke="#26c6da" strokeWidth="2" />

            <line
              x1="168"
              y1="152"
              x2="196"
              y2="168"
              stroke="#26c6da"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            <circle cx="196" cy="168" r="5" fill="#001421" stroke="#26c6da" strokeWidth="2" />

            <line
              x1="92"
              y1="152"
              x2="64"
              y2="168"
              stroke="#26c6da"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            <circle cx="64" cy="168" r="5" fill="#001421" stroke="#26c6da" strokeWidth="2" />
          </g>

          {/* Central Hub Core */}
          <circle
            cx="130"
            cy="130"
            r="44"
            fill="url(#vaultCorePlate)"
            stroke={isLocked ? '#34d399' : '#00344d'}
            strokeWidth="3.5"
          />

          <circle
            cx="130"
            cy="130"
            r="36"
            fill={isLocked ? '#022c22' : '#00101b'}
            stroke={isLocked ? '#10b981' : '#26c6da'}
            strokeWidth="1.5"
            strokeDasharray={isLocked ? 'none' : '3 3'}
            opacity={0.9}
          />

          {!isLocked && (
            <g>
              <circle
                cx="130"
                cy="130"
                r={Math.max(6, 28 - turnProgress * 22)}
                fill="url(#apertureVortex)"
              />
              {turnProgress > 0 && turnProgress < 0.9 && (
                <g
                  className="animate-[suctionVortexSpin_2s_linear_infinite]"
                  style={{ transformOrigin: '130px 130px' }}
                >
                  <line
                    x1="130"
                    y1="110"
                    x2="130"
                    y2="122"
                    stroke="#26c6da"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                  <line
                    x1="148"
                    y1="130"
                    x2="138"
                    y2="130"
                    stroke="#26c6da"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                  <line
                    x1="112"
                    y1="130"
                    x2="122"
                    y2="130"
                    stroke="#26c6da"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                </g>
              )}
            </g>
          )}

          {/* 6 Mechanical Aperture Iris Leaves */}
          {turnProgress > 0.65 && !isLocked && (
            <g
              style={{
                transformOrigin: '130px 130px',
                transform: `rotate(${turnProgress * 90}deg)`,
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => {
                const leafAngle = (i * 360) / 6;
                const leafRad = (leafAngle * Math.PI) / 180;
                const closeAmt = (turnProgress - 0.65) / 0.35;
                const lx = 130 + (22 - closeAmt * 14) * Math.cos(leafRad);
                const ly = 130 + (22 - closeAmt * 14) * Math.sin(leafRad);
                return (
                  <path
                    key={`iris-leaf-${i}`}
                    d={`M 130 130 L ${lx} ${ly} A 24 24 0 0 1 130 130`}
                    fill="#1e3a4f"
                    stroke="#26c6da"
                    strokeWidth="1"
                    opacity={0.85}
                  />
                );
              })}
            </g>
          )}

          {/* Rotary Dial Knob */}
          {!isLocked && (
            <g style={{ pointerEvents: 'none' }}>
              <circle
                cx={knobX}
                cy={knobY}
                r="24"
                fill="none"
                stroke="#26c6da"
                strokeWidth="1.5"
                opacity="0.8"
                className="animate-ping"
              />
              <circle
                cx={knobX}
                cy={knobY}
                r="18"
                fill="#26c6da"
                fillOpacity={isDragging ? '0.45' : '0.25'}
                stroke="#5eead4"
                strokeWidth="1"
              />
              <circle
                cx={knobX}
                cy={knobY}
                r="13"
                fill="url(#knobRadial)"
                stroke="#ffffff"
                strokeWidth="2.5"
                className="drop-shadow-[0_2px_8px_rgba(38,198,218,0.8)]"
              />
              {[0, 90, 180, 270].map((deg) => {
                const r = (deg * Math.PI) / 180;
                const nx = knobX + 8.5 * Math.cos(r);
                const ny = knobY + 8.5 * Math.sin(r);
                return <circle key={`grip-${deg}`} cx={nx} cy={ny} r="1.2" fill="#0f766e" />;
              })}
              <circle
                cx={knobX}
                cy={knobY}
                r="5.5"
                fill="#001421"
                stroke="#26c6da"
                strokeWidth="1.5"
              />
              <path
                d={`M ${knobX - 2.5} ${knobY} A 2.5 2.5 0 0 1 ${knobX + 2.5} ${knobY} L ${
                  knobX + 1
                } ${knobY + 1.8}`}
                fill="none"
                stroke="#5eead4"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </g>
          )}

          {/* Helper Badge — Immediately hidden once rotation begins so center readout never overlaps */}
          {!isLocked && !isAutoTurning && turnProgress < 0.02 && (
            <g className="pointer-events-none select-none transition-opacity duration-150">
              <g transform={`translate(${knobX - 100}, ${knobY - 68})`}>
                <rect
                  x="0"
                  y="0"
                  width="106"
                  height="26"
                  rx="13"
                  fill="#26c6da"
                  stroke="#ffffff"
                  strokeWidth="2"
                  filter="drop-shadow(0 3px 6px rgba(0,0,0,0.8))"
                />
                <circle cx="14" cy="13" r="3.5" fill="#001724" className="animate-ping" />
                <circle cx="14" cy="13" r="2.5" fill="#001724" />
                <text
                  x="58"
                  y="17"
                  textAnchor="middle"
                  fill="#001724"
                  fontSize="9.5"
                  fontWeight="900"
                  letterSpacing="0.6"
                >
                  HOLD THIS DOT
                </text>
              </g>

              <text
                x={knobX}
                y={knobY - 20}
                textAnchor="middle"
                fontSize="28"
                className="animate-bounce select-none"
                style={{ transformOrigin: `${knobX}px ${knobY - 20}px` }}
              >
                👇
              </text>

              <path
                d={`M ${knobX - 4} ${knobY + 18} A 114 114 0 0 1 190 220`}
                fill="none"
                stroke="#26c6da"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                opacity="0.8"
              />
              <path d="M 186 212 L 192 222 L 180 222" fill="#26c6da" />
            </g>
          )}
        </svg>

        {/* Center Emblem */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {isLocked ? (
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/25 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shadow-xl shadow-emerald-950/90">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Lock
                className={`w-5 h-5 ${
                  turnProgress > 0.5 ? 'text-teal-300' : 'text-[#26c6da]'
                } stroke-[2.4] transition-all`}
              />
              <span className="text-[10px] font-black tracking-wider text-[#93c5d6] mt-0.5">
                {Math.round(turnProgress * 100)}%
              </span>
              <span className="text-[8px] font-extrabold tracking-widest text-[#4d7285] uppercase mt-0.5">
                VAULT CORE
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Instruction Pill & Auto-Turn Button */}
      <div className="mt-3.5 flex flex-col items-center gap-2.5 w-full max-w-sm px-2">
        {!isLocked && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#001e2e] border border-[#26c6da]/40 text-xs shadow-md select-none">
            <span className="text-base text-[#26c6da] leading-none animate-spin">↻</span>
            <span className="font-semibold text-white">
              {isAutoTurning
                ? `Auto-locking vault... ${Math.round(turnProgress * 100)}%`
                : turnProgress === 0
                ? 'Hold the glowing dot on the right & dial 360°'
                : turnProgress >= 0.95
                ? 'Vault sealing...'
                : `Dialing... ${Math.round(turnProgress * 100)}% complete`}
            </span>
          </div>
        )}

        {!isLocked && onLockTrigger && (
          <button
            onClick={handleStartAutoTurn}
            disabled={isTumbling || isAutoTurning}
            className={`w-full py-2.5 px-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer shadow-md select-none ${
              isAutoTurning
                ? 'bg-[#002438] border-[#26c6da] text-white shadow-teal-950/60 ring-2 ring-[#26c6da]/30'
                : 'bg-[#001724]/90 hover:bg-[#002033] border-[#00344d] hover:border-[#26c6da]/60 text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                  isAutoTurning ? 'bg-[#26c6da] text-[#001724]' : 'bg-[#002538] text-[#26c6da]'
                }`}
              >
                <RotateCw className={`w-3.5 h-3.5 ${isAutoTurning ? 'animate-spin' : ''}`} />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>
                    {isAutoTurning ? 'Auto-Locking Mechanism Active' : 'Auto-Turn Vault Dial'}
                  </span>
                  {isAutoTurning && (
                    <span className="text-[10px] font-mono text-[#26c6da] font-extrabold">
                      {Math.round(turnProgress * 100)}%
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#93c5d6]">
                  {isAutoTurning
                    ? 'Motorized 2.6s gear sequence...'
                    : 'Tap to automatically turn the wheel 360°'}
                </p>
              </div>
            </div>

            <div
              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase transition-colors ${
                isAutoTurning
                  ? 'bg-teal-500/20 text-[#26c6da] border border-[#26c6da]/40'
                  : 'bg-[#00283d] text-[#26c6da] border border-[#003d58]'
              }`}
            >
              {isAutoTurning ? 'RUNNING' : 'AUTO TAP'}
            </div>
          </button>
        )}
      </div>

      {/* Secured Confirmation Card */}
      {isLocked && (
        <div className="mt-4 text-center px-4 py-3 rounded-2xl bg-[#001e2e] border border-emerald-500/40 max-w-sm w-full shadow-xl shadow-emerald-950/40">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Worry Safely Locked in Vault</span>
          </div>
          <p className="text-[11px] text-[#93c5d6] mt-1 leading-relaxed">
            Your mind is protected. Review this concern during your scheduled window at{' '}
            <strong className="text-white font-bold">{scheduledTime}</strong>.
          </p>
        </div>
      )}
    </div>
  );
};