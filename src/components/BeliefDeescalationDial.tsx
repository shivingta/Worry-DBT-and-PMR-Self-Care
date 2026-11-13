/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { TrendingDown, Sparkles, Shield, ArrowDownRight, RotateCcw } from 'lucide-react';

interface BeliefDeescalationDialProps {
  initialBelief: number; // 0 to 100 (from Step 3)
  reframedBelief: number; // 0 to 100
  onChange: (newBelief: number) => void;
}

export const BeliefDeescalationDial: React.FC<BeliefDeescalationDialProps> = ({
  initialBelief,
  reframedBelief,
  onChange,
}) => {
  const deescalationDrop = Math.max(0, initialBelief - reframedBelief);

  // Cognitive shift stage descriptor
  const shiftStage = useMemo(() => {
    if (reframedBelief >= 75) {
      return {
        label: 'Heavy Worry',
        description: 'The scary thought still feels very real right now.',
        color: '#f43f5e',
        badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      };
    }
    if (reframedBelief >= 50) {
      return {
        label: 'Doubt Creeping In',
        description: 'Looking at the facts is starting to poke holes in the panic.',
        color: '#f59e0b',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      };
    }
    if (reframedBelief >= 25) {
      return {
        label: 'Grounded & Balanced',
        description: 'The panic has backed down into a realistic, manageable view.',
        color: '#26c6da',
        badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      };
    }
    return {
      label: 'Full Relief & Calm',
      description: 'You see the thought for what it was: just stress speaking, not the truth.',
      color: '#10b981',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    };
  }, [reframedBelief]);

  // SVG Arc calculation for radial dial
  // Radius = 68, Center = (90, 85)
  // Semicircle from angle -180 deg to 0 deg
  const startAngle = -180;
  const totalAngleRange = 180;

  const currentAngle = startAngle + (reframedBelief / 100) * totalAngleRange;
  const initialAngle = startAngle + (initialBelief / 100) * totalAngleRange;

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  // SVG path definition for arc
  const describeArc = (x: number, y: number, radius: number, startA: number, endA: number) => {
    const start = polarToCartesian(x, y, radius, endA);
    const end = polarToCartesian(x, y, radius, startA);
    const largeArcFlag = endA - startA <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  const bgArc = describeArc(90, 85, 65, 0, 180);
  const activeArc = describeArc(90, 85, 65, 0, (reframedBelief / 100) * 180);

  // Position of dial handle
  const handleAngleDeg = (reframedBelief / 100) * 180;
  // 0 deg in our arc is left (90 - 65, 85) = (25, 85)
  // 180 deg is right (90 + 65, 85) = (155, 85)
  const rad = (Math.PI * (180 - handleAngleDeg)) / 180;
  const handleX = 90 - 65 * Math.cos(rad);
  const handleY = 85 - 65 * Math.sin(rad);

  // Initial belief flag position
  const initialRad = (Math.PI * (180 - (initialBelief / 100) * 180)) / 180;
  const initialFlagX = 90 - 65 * Math.cos(initialRad);
  const initialFlagY = 85 - 65 * Math.sin(initialRad);

  return (
    <div className="p-4 rounded-2xl bg-[#001726] border border-[#003852] shadow-xl space-y-3 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#002f45] pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#26c6da]/20 border border-[#26c6da]/40 flex items-center justify-center text-[#26c6da]">
            <TrendingDown className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-tight">
              Dial Down Your Worry
            </h4>
            <p className="text-[10px] text-[#719bb0]">
              Lower your belief in the original scary thought
            </p>
          </div>
        </div>

        {/* Live Delta Badge */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-0.5 font-mono shadow-xs">
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
            -{deescalationDrop}% Drop
          </span>
        </div>
      </div>

      {/* Interactive Radial Dial Visual */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-1">
        {/* Arc Gauge */}
        <div className="relative w-44 h-28 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 180 110" className="w-full h-full overflow-visible">
            {/* Background Track */}
            <path
              d="M 25 85 A 65 65 0 0 1 155 85"
              fill="none"
              stroke="#002b40"
              strokeWidth="10"
              strokeLinecap="round"
            />

            {/* Active Reframed Arc */}
            <path
              d={`M 25 85 A 65 65 0 ${handleAngleDeg > 180 ? '1' : '0'} 1 ${handleX} ${handleY}`}
              fill="none"
              stroke={shiftStage.color}
              strokeWidth="10"
              strokeLinecap="round"
              className="transition-all duration-200"
            />

            {/* Initial Belief Marker Flag */}
            <g>
              <line
                x1={initialFlagX}
                y1={initialFlagY - 4}
                x2={initialFlagX}
                y2={initialFlagY + 4}
                stroke="#f43f5e"
                strokeWidth="2.5"
              />
              <circle cx={initialFlagX} cy={initialFlagY} r="3" fill="#f43f5e" />
            </g>

            {/* Dial Knob (Interactive handle) */}
            <circle
              cx={handleX}
              cy={handleY}
              r="7"
              fill="#ffffff"
              stroke={shiftStage.color}
              strokeWidth="3.5"
              className="drop-shadow-md cursor-pointer transition-all duration-150"
            />

            {/* Center Readout */}
            <text x="90" y="70" textAnchor="middle" fill="#ffffff" fontSize="22" fontWeight="bold" fontFamily="monospace">
              {reframedBelief}%
            </text>
            <text x="90" y="85" textAnchor="middle" fill="#719bb0" fontSize="8.5" fontFamily="sans-serif">
              Belief in old thought
            </text>
            <text x="90" y="100" textAnchor="middle" fill="#93c5d6" fontSize="7.5" fontFamily="sans-serif">
              (Started at {initialBelief}%)
            </text>
          </svg>
        </div>

        {/* Cognitive Shift Status & Dynamic Feedback */}
        <div className="flex-1 space-y-1.5 text-center sm:text-left min-w-0">
          <div className="flex items-center justify-center sm:justify-start gap-1.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${shiftStage.badgeBg}`}>
              {shiftStage.label}
            </span>
          </div>
          <p className="text-[11px] text-[#93c5d6] leading-snug">
            {shiftStage.description}
          </p>
          <div className="text-[10px] text-[#719bb0] pt-1">
            Belief dropped from <strong className="text-rose-400">{initialBelief}%</strong> down to{' '}
            <strong className="text-emerald-300">{reframedBelief}%</strong>
          </div>
        </div>
      </div>

      {/* Tactile Range Slider for Finger & Touch Dragging */}
      <div className="space-y-1 pt-1">
        <div className="flex items-center justify-between text-[10px] text-[#719bb0]">
          <span>0% (Full Calm)</span>
          <span className="text-[#26c6da] font-semibold">Slide to lower worry</span>
          <span>{initialBelief}% (Started Here)</span>
        </div>
        <input
          type="range"
          min={0}
          max={initialBelief}
          step={5}
          value={reframedBelief}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-[#002b40] rounded-lg appearance-none cursor-pointer accent-[#26c6da] focus:outline-hidden"
        />
      </div>

      {/* Quick Stepper Buttons */}
      <div className="flex items-center justify-between gap-1.5 pt-1">
        <span className="text-[10px] text-[#719bb0] hidden sm:inline">Quick adjustments:</span>
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => onChange(Math.max(0, initialBelief - 25))}
            className="px-2 py-1 rounded-lg bg-[#002436] hover:bg-[#00314a] border border-[#003b54] text-[10px] text-[#93c5d6] hover:text-white transition"
          >
            -25%
          </button>
          <button
            type="button"
            onClick={() => onChange(Math.max(0, initialBelief - 50))}
            className="px-2 py-1 rounded-lg bg-[#002436] hover:bg-[#00314a] border border-[#003b54] text-[10px] text-[#93c5d6] hover:text-white transition"
          >
            -50%
          </button>
          <button
            type="button"
            onClick={() => onChange(15)}
            className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-[10px] text-emerald-300 font-semibold transition"
          >
            Grounded (15%)
          </button>
          <button
            type="button"
            onClick={() => onChange(initialBelief)}
            className="p-1 rounded-lg text-[#719bb0] hover:text-white transition"
            title="Reset to initial belief"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
