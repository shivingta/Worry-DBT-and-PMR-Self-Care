/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Wind, CheckCircle2, Heart } from 'lucide-react';
import { useDiary } from '../context/DiaryContext';
import { PetAvatar } from './PetAvatar';

interface GuidedBreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuidedBreathingModal: React.FC<GuidedBreathingModalProps> = ({ isOpen, onClose }) => {
  const { pet, updatePet } = useDiary();
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [countdown, setCountdown] = useState<number>(4);
  const [cyclesCompleted, setCyclesCompleted] = useState<number>(0);
  const [sessionFinished, setSessionFinished] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setPhase('inhale');
      setCountdown(4);
      setCyclesCompleted(0);
      setSessionFinished(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) return prev - 1;

        // Phase transitions
        if (phase === 'inhale') {
          setPhase('hold');
          return 7;
        } else if (phase === 'hold') {
          setPhase('exhale');
          return 8;
        } else {
          // exhale finished -> new cycle
          setCyclesCompleted((c) => {
            const next = c + 1;
            if (next >= 4) {
              setSessionFinished(true);
            }
            return next;
          });
          setPhase('inhale');
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, phase]);

  if (!isOpen) return null;

  const handleFinish = () => {
    // Reward grounding points to pet
    updatePet({
      xp: pet.xp + 20,
      careHearts: pet.careHearts + 2,
    });
    onClose();
  };

  const getPhasePrompt = () => {
    switch (phase) {
      case 'inhale':
        return { text: 'Inhale Deeply...', sub: 'Fill your lungs with calming air', scale: 1.25 };
      case 'hold':
        return { text: 'Gently Hold...', sub: 'Feel the stillness in your chest', scale: 1.25 };
      case 'exhale':
        return { text: 'Slow Exhale...', sub: 'Release all physical tension', scale: 0.9 };
    }
  };

  const prompt = getPhasePrompt();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-stone-900 text-stone-100 rounded-3xl border border-stone-800 shadow-2xl max-w-md w-full p-6 text-center relative overflow-hidden flex flex-col items-center">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Wind className="w-4 h-4" />
          <span>4-7-8 Parasympathetic Reset</span>
        </div>

        <h3 className="text-xl font-bold font-serif text-white">
          Breathe with {pet.name}
        </h3>
        <p className="text-xs text-stone-400 max-w-xs mt-1">
          Synchronize your breath with your companion to ground your nervous system.
        </p>

        {/* Dynamic Breathing Aura with Animated Pet */}
        <div className="my-8 relative w-64 h-64 flex items-center justify-center">
          {/* Animated concentric breathing ring */}
          <motion.div
            animate={{
              scale: prompt.scale,
              opacity: phase === 'hold' ? 0.9 : 0.6,
            }}
            transition={{
              duration: phase === 'inhale' ? 4 : phase === 'hold' ? 0.3 : 8,
              ease: 'easeInOut',
            }}
            className="absolute inset-4 rounded-full bg-teal-500/20 border-2 border-teal-400/40 pointer-events-none"
          />

          <motion.div
            animate={{
              scale: prompt.scale,
            }}
            transition={{
              duration: phase === 'inhale' ? 4 : phase === 'hold' ? 0.3 : 8,
              ease: 'easeInOut',
            }}
            className="z-10"
          >
            <PetAvatar
              archetype={pet.archetype}
              stage={pet.evolutionStage}
              moodExpression={phase === 'exhale' ? 'peaceful' : 'comforting'}
              colorTheme={pet.colorTheme}
              size="md"
              interactive={false}
            />
          </motion.div>
        </div>

        {/* Phase Guidance */}
        <div className="space-y-1 mb-6">
          <div className="text-2xl font-bold text-teal-300 font-serif">
            {prompt.text}
          </div>
          <div className="text-3xl font-mono font-bold text-white">
            {countdown}s
          </div>
          <p className="text-xs text-stone-400">{prompt.sub}</p>
        </div>

        {/* Cycles Progress */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4].map((c) => (
            <div
              key={c}
              className={`w-3 h-3 rounded-full transition ${
                c <= cyclesCompleted ? 'bg-teal-400' : 'bg-stone-700'
              }`}
            />
          ))}
          <span className="text-[11px] text-stone-400 ml-2">
            Cycle {Math.min(cyclesCompleted + 1, 4)} of 4
          </span>
        </div>

        {sessionFinished ? (
          <div className="w-full space-y-3 animate-fadeIn">
            <div className="p-3 bg-teal-950/80 border border-teal-700/60 rounded-xl text-xs text-teal-200 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Breathing exercise completed! +20 XP awarded to {pet.name}.</span>
            </div>
            <button
              onClick={handleFinish}
              className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-lg transition active:scale-95"
            >
              Return to Sanctuary
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="text-xs text-stone-400 hover:text-stone-200 transition"
          >
            End Early
          </button>
        )}

      </div>
    </div>
  );
};
