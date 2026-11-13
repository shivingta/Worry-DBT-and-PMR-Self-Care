/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PetArchetype, PetStage, PetMoodExpression, PetColorTheme } from '../types';
import { Heart } from 'lucide-react';

interface PetAvatarProps {
  archetype: PetArchetype;
  stage: PetStage;
  moodExpression: PetMoodExpression;
  colorTheme: PetColorTheme;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onPet?: () => void;
}

export const PetAvatar: React.FC<PetAvatarProps> = ({
  archetype,
  stage,
  moodExpression,
  colorTheme,
  size = 'lg',
  interactive = true,
  onPet,
}) => {
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number }[]>([]);

  const handleTap = (e: React.MouseEvent) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newHeart = { id: Date.now() + Math.random(), x };
    setFloatingHearts((prev) => [...prev.slice(-4), newHeart]);
    if (onPet) onPet();
  };

  // Indian / Desi Inspired Palettes
  const colorMap = {
    teal: {
      // Mayur Neel (Peacock Teal)
      primary: '#0f766e',
      secondary: '#14b8a6',
      accent: '#0284c7',
      light: '#ccfbf1',
      glow: 'rgba(20, 184, 166, 0.3)',
      cheeks: '#f43f5e',
    },
    lavender: {
      // Kesar & Lotus (Kashmiri Saffron-Lavender)
      primary: '#6d28d9',
      secondary: '#9333ea',
      accent: '#f59e0b',
      light: '#f3e8ff',
      glow: 'rgba(147, 51, 234, 0.3)',
      cheeks: '#ec4899',
    },
    amber: {
      // Genda & Haldi (Marigold Gold)
      primary: '#b45309',
      secondary: '#f59e0b',
      accent: '#ea580c',
      light: '#fef3c7',
      glow: 'rgba(245, 158, 11, 0.32)',
      cheeks: '#f97316',
    },
    rose: {
      // Desi Gulabi (Indian Rose)
      primary: '#be123c',
      secondary: '#f43f5e',
      accent: '#fb7185',
      light: '#ffe4e6',
      glow: 'rgba(244, 63, 94, 0.3)',
      cheeks: '#fb7185',
    },
    sage: {
      // Tulsi Green (Holy Basil)
      primary: '#047857',
      secondary: '#10b981',
      accent: '#059669',
      light: '#d1fae5',
      glow: 'rgba(16, 185, 129, 0.3)',
      cheeks: '#f43f5e',
    },
  };

  const theme = colorMap[colorTheme] || colorMap.teal;

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-44 h-44 sm:w-52 sm:h-52',
    xl: 'w-60 h-60',
  }[size];

  const isBaby = stage === 'baby';
  const isTeen = stage === 'teen';
  const isGuardian = stage === 'guardian';

  return (
    <div
      onClick={handleTap}
      className={`relative select-none flex items-center justify-center cursor-pointer ${sizeClasses}`}
      style={{ filter: `drop-shadow(0 12px 28px ${theme.glow})` }}
    >
      {/* Floating Hearts Animation upon Petting */}
      <AnimatePresence>
        {floatingHearts.map((heart) => (
          <motion.div
            key={heart.id}
            initial={{ opacity: 1, y: 0, scale: 0.6 }}
            animate={{ opacity: 0, y: -80, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute pointer-events-none z-30"
            style={{ left: `${Math.max(10, Math.min(80, (heart.x / 200) * 100))}%` }}
          >
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500 drop-shadow-md" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Guardian Rotating Indian Mandala Aura Ring */}
      {isGuardian && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 pointer-events-none scale-125 flex items-center justify-center"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-60">
            {/* 8-Petal Sacred Lotus Mandala Halo */}
            <circle cx="100" cy="100" r="92" fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="4 4" />
            <circle cx="100" cy="100" r="82" fill="none" stroke="#fbbf24" strokeWidth="0.75" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <g key={angle} transform={`rotate(${angle} 100 100)`}>
                <path d="M 100 12 C 96 22, 94 30, 100 35 C 106 30, 104 22, 100 12 Z" fill="#f59e0b" opacity="0.6" />
                <circle cx="100" cy="8" r="2" fill="#d97706" />
              </g>
            ))}
          </svg>
        </motion.div>
      )}

      {/* Main Animated Character Container */}
      <motion.div
        animate={{
          y: moodExpression === 'radiant' ? [0, -7, 0] : [0, -3.5, 0],
          scale: moodExpression === 'radiant' ? [1, 1.03, 1] : [1, 1.015, 1],
        }}
        transition={{
          duration: moodExpression === 'comforting' ? 4.5 : 3.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        whileTap={{ scale: 0.94 }}
        className="w-full h-full relative flex items-center justify-center"
      >
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <radialGradient id={`glow-${colorTheme}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={theme.light} stopOpacity="0.9" />
              <stop offset="100%" stopColor={theme.light} stopOpacity="0.1" />
            </radialGradient>
            <linearGradient id={`bodyGrad-${colorTheme}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.secondary} />
              <stop offset="100%" stopColor={theme.primary} />
            </linearGradient>
            <linearGradient id="elephantEarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbcfe8" />
              <stop offset="100%" stopColor="#fed7aa" />
            </linearGradient>
            <linearGradient id="peacockNeckGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0f766e" />
            </linearGradient>
            <linearGradient id="tigerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="parakeetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
          </defs>

          {/* Ground Soft Shadow */}
          <ellipse cx="100" cy="180" rx={isBaby ? '40' : '55'} ry="10" fill="#00000015" />

          {/* Sparkles / Auspicious Diya Light for High Mood / Guardian */}
          {(moodExpression === 'radiant' || isGuardian) && (
            <g>
              <circle cx="45" cy="45" r="3" fill="#fbbf24" opacity="0.85" />
              <circle cx="155" cy="40" r="3.5" fill="#fbbf24" opacity="0.85" />
              {/* Star / Sparkle */}
              <path d="M 100 16 L 103 23 L 110 26 L 103 29 L 100 36 L 97 29 L 90 26 L 97 23 Z" fill="#f59e0b" />
            </g>
          )}

          {/* ========================================================================= */}
          {/* ARCHETYPE 1: APPU THE WISE ELEPHANT (Gajraj / Haathi)                    */}
          {/* ========================================================================= */}
          {archetype === 'elephant' && (
            <g>
              {/* Flapping Big Friendly Ears Behind Body */}
              <motion.path
                d="M 64 90 C 25 65, 15 130, 60 125 Z"
                fill="#cbd5e1"
                stroke="#94a3b8"
                strokeWidth="1.5"
                animate={{ rotate: [0, -3, 2, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '64px 90px' }}
              />
              <path d="M 58 92 C 32 75, 26 122, 56 118 Z" fill="url(#elephantEarGrad)" opacity="0.8" />

              <motion.path
                d="M 136 90 C 175 65, 185 130, 140 125 Z"
                fill="#cbd5e1"
                stroke="#94a3b8"
                strokeWidth="1.5"
                animate={{ rotate: [0, 3, -2, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '136px 90px' }}
              />
              <path d="M 142 92 C 168 75, 174 122, 144 118 Z" fill="url(#elephantEarGrad)" opacity="0.8" />

              {/* Plump Body with Theme Tint */}
              <ellipse cx="100" cy="142" rx="46" ry="38" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
              <ellipse cx="100" cy="146" rx="30" ry="26" fill={`url(#bodyGrad-${colorTheme})`} opacity="0.25" />

              {/* Chubby Legs */}
              <rect x="74" y="152" width="18" height="24" rx="9" fill="#cbd5e1" />
              <rect x="108" y="152" width="18" height="24" rx="9" fill="#cbd5e1" />
              {/* Cute Toenails */}
              <circle cx="78" cy="174" r="2.5" fill="#ffffff" />
              <circle cx="83" cy="175" r="2.5" fill="#ffffff" />
              <circle cx="88" cy="174" r="2.5" fill="#ffffff" />
              <circle cx="112" cy="174" r="2.5" fill="#ffffff" />
              <circle cx="117" cy="175" r="2.5" fill="#ffffff" />
              <circle cx="122" cy="174" r="2.5" fill="#ffffff" />

              {/* Round Friendly Head */}
              <ellipse cx="100" cy="94" rx="42" ry="36" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* Tiny Tusks */}
              <path d="M 86 112 C 84 122, 82 126, 80 128 C 83 126, 88 120, 89 113 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
              <path d="M 114 112 C 116 122, 118 126, 120 128 C 117 126, 112 120, 111 113 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />

              {/* Gentle Curved Trunk that breathes/sways */}
              <motion.path
                d="M 94 100 C 92 118, 86 134, 98 136 C 108 138, 114 124, 106 122 C 100 122, 98 128, 97 128 C 95 125, 98 114, 106 100 Z"
                fill="#cbd5e1"
                stroke="#94a3b8"
                strokeWidth="1.5"
                animate={{
                  d:
                    moodExpression === 'radiant'
                      ? [
                          'M 94 100 C 92 118, 86 134, 98 136 C 108 138, 114 124, 106 122 C 100 122, 98 128, 97 128 C 95 125, 98 114, 106 100 Z',
                          'M 94 100 C 90 114, 88 125, 104 124 C 116 123, 118 112, 110 112 C 102 112, 100 118, 99 119 C 97 116, 98 108, 106 100 Z',
                          'M 94 100 C 92 118, 86 134, 98 136 C 108 138, 114 124, 106 122 C 100 122, 98 128, 97 128 C 95 125, 98 114, 106 100 Z',
                        ]
                      : undefined,
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Trunk ridges */}
              <line x1="96" y1="106" x2="104" y2="106" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
              <line x1="96" y1="112" x2="103" y2="112" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />

              {/* Traditional Red Kumkum & Sandalwood Tilak / Bindi on Forehead */}
              <g transform="translate(100, 75)">
                {/* Sandalwood crescent base */}
                <path d="M -7 4 Q 0 9, 7 4 Q 0 6, -7 4 Z" fill="#fef08a" />
                {/* Vermilion bindi dot */}
                <circle cx="0" cy="0" r="3" fill="#dc2626" />
                <circle cx="0" cy="0" r="1" fill="#fef08a" />
              </g>
            </g>
          )}

          {/* ========================================================================= */}
          {/* ARCHETYPE 2: MAYUR THE RADIANT PEACOCK (Mor)                             */}
          {/* ========================================================================= */}
          {archetype === 'peacock' && (
            <g>
              {/* Majestic Fanned Peacock Tail in the Background */}
              <g opacity="0.95">
                {/* Fan of tail feathers */}
                {[-45, -30, -15, 0, 15, 30, 45].map((deg) => (
                  <g key={deg} transform={`rotate(${deg} 100 155)`}>
                    <path d="M 98 150 L 98 68 Q 100 60, 102 68 L 102 150 Z" fill="#0f766e" />
                    {/* Feather eye (Chandrika) */}
                    <ellipse cx="100" cy="65" rx="8" ry="12" fill="#0284c7" />
                    <ellipse cx="100" cy="66" rx="5.5" ry="8" fill="#14b8a6" />
                    <circle cx="100" cy="67" r="3.5" fill="#f59e0b" />
                    <circle cx="100" cy="67" r="1.8" fill="#1e1b4b" />
                  </g>
                ))}
              </g>

              {/* Peacock Body & Chest (Royal Indigo/Teal) */}
              <ellipse cx="100" cy="144" rx="34" ry="32" fill="url(#peacockNeckGrad)" />
              {/* Scalloped Breast Feathers */}
              <path d="M 88 135 Q 100 145, 112 135 Q 100 152, 88 135 Z" fill="#14b8a6" opacity="0.5" />

              {/* Slender Arched Royal Neck & Head */}
              <path d="M 92 138 C 90 108, 93 90, 100 88 C 107 90, 110 108, 108 138 Z" fill="url(#peacockNeckGrad)" />
              <circle cx="100" cy="85" r="22" fill="url(#peacockNeckGrad)" />

              {/* 3-Plume Feather Crest Crown (Kalgi) */}
              <g>
                <line x1="96" y1="65" x2="88" y2="48" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" />
                <ellipse cx="87" cy="46" rx="3.5" ry="5" fill="#14b8a6" transform="rotate(-25, 87, 46)" />
                <circle cx="87" cy="46" r="1.5" fill="#fbbf24" />

                <line x1="100" y1="64" x2="100" y2="44" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" />
                <ellipse cx="100" cy="42" rx="4" ry="5.5" fill="#14b8a6" />
                <circle cx="100" cy="42" r="1.8" fill="#fbbf24" />

                <line x1="104" y1="65" x2="112" y2="48" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" />
                <ellipse cx="113" cy="46" rx="3.5" ry="5" fill="#14b8a6" transform="rotate(25, 113, 46)" />
                <circle cx="113" cy="46" r="1.5" fill="#fbbf24" />
              </g>

              {/* Golden Curved Beak */}
              <polygon points="96,93 104,93 100,103" fill="#f59e0b" />
              <polygon points="97,93 103,93 100,99" fill="#fbbf24" />

              {/* Auspicious Tilak between the crested feathers */}
              <circle cx="100" cy="74" r="2.2" fill="#f59e0b" />
              <circle cx="100" cy="74" r="1" fill="#dc2626" />
            </g>
          )}

          {/* ========================================================================= */}
          {/* ARCHETYPE 3: SHERU THE ROYAL BENGAL CUB (Bagh / Tiger)                   */}
          {/* ========================================================================= */}
          {archetype === 'tiger' && (
            <g>
              {/* Fluffy Swishing Tiger Tail */}
              <motion.path
                d="M 130 148 C 165 140, 175 105, 160 90 C 150 82, 142 105, 132 135 Z"
                fill="url(#tigerGrad)"
                animate={{ rotate: [-2, 5, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '130px 148px' }}
              />
              {/* Tail Stripes and Black Tip */}
              <path d="M 160 90 C 155 86, 148 98, 144 108 C 152 112, 158 102, 160 90 Z" fill="#1c1917" />
              <path d="M 148 116 C 145 120, 140 126, 136 132" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" />

              {/* Tiger Rounded Ears */}
              <circle cx="68" cy="62" r="16" fill="#ea580c" />
              <circle cx="68" cy="62" r="10" fill="#1c1917" />
              <circle cx="68" cy="62" r="7" fill="#ffffff" />

              <circle cx="132" cy="62" r="16" fill="#ea580c" />
              <circle cx="132" cy="62" r="10" fill="#1c1917" />
              <circle cx="132" cy="62" r="7" fill="#ffffff" />

              {/* Plump Saffron Body */}
              <ellipse cx="100" cy="142" rx="44" ry="38" fill="url(#tigerGrad)" />
              {/* Warm Cream Belly */}
              <ellipse cx="100" cy="146" rx="26" ry="26" fill="#fef3c7" opacity="0.9" />

              {/* Body Tiger Stripes */}
              <path d="M 60 135 L 72 138 L 62 143 Z" fill="#1c1917" opacity="0.85" />
              <path d="M 64 147 L 74 149 L 66 153 Z" fill="#1c1917" opacity="0.85" />
              <path d="M 140 135 L 128 138 L 138 143 Z" fill="#1c1917" opacity="0.85" />
              <path d="M 136 147 L 126 149 L 134 153 Z" fill="#1c1917" opacity="0.85" />

              {/* Cute Paws */}
              <ellipse cx="78" cy="168" rx="12" ry="8" fill="#fef3c7" stroke="#ea580c" strokeWidth="1" />
              <ellipse cx="122" cy="168" rx="12" ry="8" fill="#fef3c7" stroke="#ea580c" strokeWidth="1" />

              {/* Tiger Head */}
              <ellipse cx="100" cy="94" rx="44" ry="36" fill="url(#tigerGrad)" />

              {/* White Cheek Ruffs */}
              <path d="M 60 98 C 50 106, 54 116, 70 114 Z" fill="#ffffff" />
              <path d="M 140 98 C 150 106, 146 116, 130 114 Z" fill="#ffffff" />

              {/* Forehead Tiger Stripes (Trishul / Trident motif) */}
              <path d="M 100 68 L 100 80" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" />
              <path d="M 92 72 Q 98 75, 100 78" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 108 72 Q 102 75, 100 78" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" fill="none" />

              {/* Cream Muzzle */}
              <ellipse cx="94" cy="106" rx="8" ry="7" fill="#ffffff" />
              <ellipse cx="106" cy="106" rx="8" ry="7" fill="#ffffff" />

              {/* Auspicious Sandalwood & Red Tilak on forehead */}
              <circle cx="100" cy="83" r="2.5" fill="#dc2626" />
              <circle cx="100" cy="83" r="1.2" fill="#fef08a" />
            </g>
          )}

          {/* ========================================================================= */}
          {/* ARCHETYPE 4: MITHU THE DESI PARAKEET (Tota / Shuka)                       */}
          {/* ========================================================================= */}
          {archetype === 'parakeet' && (
            <g>
              {/* Long Elegant Green Parakeet Tail */}
              <path d="M 100 155 Q 105 188, 116 195 Q 108 175, 104 155 Z" fill="#15803d" />
              <path d="M 96 155 Q 98 185, 106 192 Q 101 172, 98 155 Z" fill="#16a34a" />

              {/* Perched Body */}
              <ellipse cx="100" cy="138" rx="34" ry="36" fill="url(#parakeetGrad)" />
              {/* Light Green Breast */}
              <ellipse cx="100" cy="142" rx="22" ry="24" fill="#bbf7d0" opacity="0.8" />

              {/* Folded Wings */}
              <path d="M 70 120 Q 64 145, 78 155 Q 82 135, 76 122 Z" fill="#15803d" />
              <path d="M 130 120 Q 136 145, 122 155 Q 118 135, 124 122 Z" fill="#15803d" />

              {/* Head */}
              <ellipse cx="100" cy="90" rx="36" ry="32" fill="url(#parakeetGrad)" />

              {/* Signature Indian Rose-Ringed Collar (Kanthi) */}
              <path d="M 74 98 Q 100 114, 126 98" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 76 101 Q 100 117, 124 101" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" fill="none" />

              {/* Ruby Red Curved Hook Beak */}
              <path d="M 94 94 Q 100 92, 106 94 Q 104 108, 98 112 Q 95 106, 94 94 Z" fill="#dc2626" />
              <path d="M 96 95 Q 100 94, 104 95 Q 102 102, 99 104 Z" fill="#f87171" />
              {/* Lower Beak */}
              <path d="M 96 104 Q 99 108, 102 104 Z" fill="#991b1b" />

              {/* Small Cheek Patch */}
              <ellipse cx="78" cy="94" rx="4" ry="6" fill="#86efac" opacity="0.8" />
              <ellipse cx="122" cy="94" rx="4" ry="6" fill="#86efac" opacity="0.8" />

              {/* Auspicious forehead mark */}
              <circle cx="100" cy="74" r="2.2" fill="#fbbf24" />
              <circle cx="100" cy="74" r="1" fill="#dc2626" />
            </g>
          )}

          {/* ========================================================================= */}
          {/* FALLBACKS FOR EXISTING PROFILES (Fox, Cat, Panda, Axolotl)                */}
          {/* ========================================================================= */}
          {archetype === 'fox' && (
            <g>
              <polygon points="62,75 42,25 90,55" fill={theme.primary} />
              <polygon points="65,70 50,35 85,55" fill={theme.light} />
              <polygon points="138,75 158,25 110,55" fill={theme.primary} />
              <polygon points="135,70 150,35 115,55" fill={theme.light} />
              <ellipse cx="100" cy="140" rx="44" ry="40" fill={`url(#bodyGrad-${colorTheme})`} />
              <ellipse cx="100" cy="145" rx="26" ry="28" fill="#ffffff" opacity="0.9" />
              <ellipse cx="100" cy="95" rx="44" ry="36" fill={`url(#bodyGrad-${colorTheme})`} />
            </g>
          )}

          {archetype === 'cat' && (
            <g>
              <path d="M 60 70 Q 50 30, 80 50 Z" fill={theme.primary} />
              <path d="M 140 70 Q 150 30, 120 50 Z" fill={theme.primary} />
              <ellipse cx="100" cy="140" rx="42" ry="38" fill={`url(#bodyGrad-${colorTheme})`} />
              <ellipse cx="100" cy="144" rx="26" ry="26" fill="#ffffff" opacity="0.85" />
              <ellipse cx="100" cy="92" rx="44" ry="35" fill={`url(#bodyGrad-${colorTheme})`} />
            </g>
          )}

          {archetype === 'panda' && (
            <g>
              <circle cx="65" cy="55" r="16" fill="#1c1917" />
              <circle cx="135" cy="55" r="16" fill="#1c1917" />
              <ellipse cx="100" cy="142" rx="45" ry="38" fill="#f8fafc" />
              <ellipse cx="100" cy="94" rx="45" ry="37" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
              <ellipse cx="80" cy="92" rx="13" ry="16" fill="#1c1917" transform="rotate(-15, 80, 92)" />
              <ellipse cx="120" cy="92" rx="13" ry="16" fill="#1c1917" transform="rotate(15, 120, 92)" />
            </g>
          )}

          {archetype === 'axolotl' && (
            <g>
              <path d="M 60 70 Q 30 60, 45 78 Q 25 82, 50 90 Q 30 98, 60 102 Z" fill={theme.secondary} />
              <path d="M 140 70 Q 170 60, 155 78 Q 175 82, 150 90 Q 170 98, 140 102 Z" fill={theme.secondary} />
              <ellipse cx="100" cy="140" rx="40" ry="36" fill={`url(#bodyGrad-${colorTheme})`} />
              <ellipse cx="100" cy="92" rx="46" ry="36" fill={`url(#bodyGrad-${colorTheme})`} />
            </g>
          )}

          {/* ========================================================================= */}
          {/* FACIAL EXPRESSIONS & MOOD REFLECTION                                      */}
          {/* ========================================================================= */}

          {/* Cheeks Blush */}
          <circle cx="74" cy="104" r="7" fill={theme.cheeks} opacity="0.4" />
          <circle cx="126" cy="104" r="7" fill={theme.cheeks} opacity="0.4" />

          {/* EYES based on Mood Expression (with Desi Kohl / Kajal touches) */}
          {moodExpression === 'radiant' && (
            <g>
              <path d="M 75 92 Q 83 82, 91 92" stroke="#1c1917" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <path d="M 109 92 Q 117 82, 125 92" stroke="#1c1917" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              {/* Kohl outer flick */}
              <path d="M 91 92 Q 95 89, 97 88" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M 109 92 Q 105 89, 103 88" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" fill="none" />
              <circle cx="83" cy="83" r="1.5" fill="#f59e0b" />
              <circle cx="117" cy="83" r="1.5" fill="#f59e0b" />
            </g>
          )}

          {moodExpression === 'happy' && (
            <g>
              <ellipse cx="83" cy="91" rx="5" ry="6.5" fill="#1c1917" />
              <circle cx="81.5" cy="89" r="2.2" fill="#ffffff" />
              <circle cx="85" cy="93" r="1" fill="#ffffff" />
              <ellipse cx="117" cy="91" rx="5" ry="6.5" fill="#1c1917" />
              <circle cx="115.5" cy="89" r="2.2" fill="#ffffff" />
              <circle cx="119" cy="93" r="1" fill="#ffffff" />
            </g>
          )}

          {moodExpression === 'peaceful' && (
            <g>
              <path d="M 77 91 Q 83 96, 89 91" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 111 91 Q 117 96, 123 91" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" fill="none" />
            </g>
          )}

          {(moodExpression === 'comforting' || moodExpression === 'holding_space') && (
            <g>
              <ellipse cx="83" cy="91" rx="4.5" ry="5.5" fill="#1c1917" />
              <circle cx="81.5" cy="89" r="1.8" fill="#ffffff" />
              <ellipse cx="117" cy="91" rx="4.5" ry="5.5" fill="#1c1917" />
              <circle cx="115.5" cy="89" r="1.8" fill="#ffffff" />
              <path d="M 76 83 Q 83 81, 88 85" stroke="#475569" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M 124 83 Q 117 81, 112 85" stroke="#475569" strokeWidth="2" strokeLinecap="round" fill="none" />
            </g>
          )}

          {moodExpression === 'sleepy' && (
            <g>
              <line x1="77" y1="92" x2="89" y2="92" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" />
              <line x1="111" y1="92" x2="123" y2="92" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" />
            </g>
          )}

          {/* Cute Nose (unless bird/elephant which has its own beak/trunk) */}
          {archetype !== 'elephant' && archetype !== 'peacock' && archetype !== 'parakeet' && (
            <polygon points="98,99 102,99 100,102" fill="#1c1917" />
          )}

          {/* MOUTH (for non-beak companions) */}
          {archetype !== 'peacock' && archetype !== 'parakeet' && (
            <>
              {moodExpression === 'radiant' || moodExpression === 'happy' ? (
                <path d="M 94 104 Q 97 109, 100 105 Q 103 109, 106 104" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" fill="none" />
              ) : (
                <path d="M 96 104 Q 100 107, 104 104" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" fill="none" />
              )}
            </>
          )}

          {/* ========================================================================= */}
          {/* STAGE ACCESSORIES: DESI GENDA MALA & CELESTIAL LOTUS JEWEL                 */}
          {/* ========================================================================= */}
          {/* TEEN STAGE: Sacred Marigold (Genda Phool) Garland / Mala */}
          {isTeen && (
            <g id="genda-phool-garland">
              <path d="M 76 126 Q 100 144, 124 126" stroke="#f59e0b" strokeWidth="2" strokeDasharray="1 3" fill="none" />
              {/* Marigold flowers */}
              {[
                { x: 80, y: 129 },
                { x: 90, y: 135 },
                { x: 100, y: 137 },
                { x: 110, y: 135 },
                { x: 120, y: 129 },
              ].map((pos, idx) => (
                <g key={idx} transform={`translate(${pos.x}, ${pos.y}) scale(0.6)`}>
                  <circle cx="0" cy="0" r="7" fill="#f59e0b" />
                  <circle cx="0" cy="0" r="4.5" fill="#fbbf24" />
                  <circle cx="0" cy="0" r="2" fill="#ea580c" />
                </g>
              ))}
            </g>
          )}

          {/* GUARDIAN STAGE: Golden Lotus (Kamal) Crown & Amulet */}
          {isGuardian && (
            <g id="guardian-kamal-jewel">
              {/* Sacred Lotus Crest on Forehead/Crown */}
              <g transform="translate(100, 48) scale(0.75)">
                {/* Glow ring */}
                <circle cx="0" cy="0" r="12" fill="#f59e0b" opacity="0.3" />
                {/* Center lotus petal */}
                <path d="M 0 -14 C 4 -7, 5 2, 0 8 C -5 2, -4 -7, 0 -14 Z" fill="#f59e0b" />
                {/* Left and right lotus petals */}
                <path d="M -2 -1 C -8 -7, -13 -3, -9 5 C -6 7, -2 3, -2 -1 Z" fill="#fbbf24" />
                <path d="M 2 -1 C 8 -7, 13 -3, 9 5 C 6 7, 2 3, 2 -1 Z" fill="#fbbf24" />
                <circle cx="0" cy="2" r="3" fill="#dc2626" />
              </g>
              {/* Golden Rudraksha / Pearl Mala necklace */}
              <path d="M 72 126 Q 100 148, 128 126" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
              <circle cx="100" cy="140" r="4" fill="#dc2626" stroke="#fbbf24" strokeWidth="1.5" />
            </g>
          )}
        </svg>
      </motion.div>
    </div>
  );
};
