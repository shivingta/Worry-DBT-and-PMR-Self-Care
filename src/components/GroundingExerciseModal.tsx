/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Check, Eye, Volume2, Hand, Sparkles, Coffee, Heart } from 'lucide-react';

interface GroundingExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  { step: 5, sense: 'Sight', icon: Eye, prompt: 'Acknowledge 5 things you can see around you.', color: 'text-cyan-300', bg: 'bg-cyan-500/20' },
  { step: 4, sense: 'Touch', icon: Hand, prompt: 'Acknowledge 4 things you can physically feel or touch.', color: 'text-emerald-300', bg: 'bg-emerald-500/20' },
  { step: 3, sense: 'Sound', icon: Volume2, prompt: 'Acknowledge 3 things you can hear right now.', color: 'text-amber-300', bg: 'bg-amber-500/20' },
  { step: 2, sense: 'Smell', icon: Coffee, prompt: 'Acknowledge 2 things you can smell or scents you enjoy.', color: 'text-purple-300', bg: 'bg-purple-500/20' },
  { step: 1, sense: 'Taste', icon: Heart, prompt: 'Acknowledge 1 thing you can taste, or take a sip of water.', color: 'text-rose-300', bg: 'bg-rose-500/20' },
];

export const GroundingExerciseModal: React.FC<GroundingExerciseModalProps> = ({ isOpen, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  if (!isOpen) return null;

  const current = STEPS[currentStepIndex];
  const Icon = current.icon;

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsCompleted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#001724] border border-[#00344d] rounded-3xl max-w-sm w-full p-5 shadow-2xl text-white relative">
        <div className="flex items-center justify-between pb-3 border-b border-[#002a3d]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-400/20 border border-teal-400/40 flex items-center justify-center text-teal-300 font-bold">
              5
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">5-4-3-2-1 Grounding</h2>
              <p className="text-[11px] text-[#93c5d6]">A guided sensory reset to calm you</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-1 rounded-xl text-[#719bb0] hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isCompleted ? (
          <div className="py-8 text-center space-y-3 animate-fadeIn">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Check className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-white">Grounding Complete</h3>
            <p className="text-xs text-[#93c5d6] max-w-xs mx-auto leading-relaxed">
              Your nervous system is anchored back into the present moment. Take one slow, gentle breath.
            </p>
            <button
              onClick={handleReset}
              className="mt-3 px-5 py-2 rounded-xl bg-[#26c6da] hover:bg-[#20b2c4] text-[#001724] font-bold text-xs transition"
            >
              Finish Reset
            </button>
          </div>
        ) : (
          <div className="py-6 space-y-5 text-center">
            {/* Step indicator */}
            <div className="flex justify-center gap-1.5">
              {STEPS.map((s, idx) => (
                <div
                  key={s.step}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStepIndex
                      ? 'w-6 bg-[#26c6da]'
                      : idx < currentStepIndex
                      ? 'w-3 bg-teal-800'
                      : 'w-3 bg-[#002f44]'
                  }`}
                />
              ))}
            </div>

            <div className={`w-16 h-16 mx-auto rounded-2xl ${current.bg} border border-white/10 flex items-center justify-center ${current.color} shadow-lg shadow-black/20 animate-scale`}>
              <Icon className="w-8 h-8" />
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#26c6da] mb-1">
                Step {5 - currentStepIndex} • {current.sense}
              </div>
              <p className="text-sm font-semibold text-white max-w-xs mx-auto leading-snug">
                {current.prompt}
              </p>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-2.5 rounded-xl bg-[#26c6da] hover:bg-[#20b2c4] text-[#001724] font-bold text-xs transition active:scale-98 shadow-md"
            >
              {currentStepIndex < STEPS.length - 1 ? 'Next Sensory Cue' : 'Complete Grounding'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
