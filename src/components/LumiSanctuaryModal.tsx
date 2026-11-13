/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDiary } from '../context/DiaryContext';
import { PetAvatar } from './PetAvatar';
import {
  X,
  Sparkles,
  Heart,
  Flame,
  Wind,
  Palette,
  Smile,
  Shield,
  Volume2,
} from 'lucide-react';

interface LumiSanctuaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBreathingModal: () => void;
  onOpenCustomizeModal: () => void;
}

export const LumiSanctuaryModal: React.FC<LumiSanctuaryModalProps> = ({
  isOpen,
  onClose,
  onOpenBreathingModal,
  onOpenCustomizeModal,
}) => {
  const { pet, petInteraction, petMoodExpression, petDialogue } = useDiary();
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePetAffection = () => {
    const res = petInteraction();
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 3500);
  };

  const getArchetypeName = (arch: string) => {
    switch (arch) {
      case 'elephant':
        return 'Gajraj (Elephant)';
      case 'peacock':
        return 'Mayur (Peacock)';
      case 'tiger':
        return 'Bagh Cub (Tiger)';
      case 'parakeet':
        return 'Mithu (Parakeet)';
      default:
        return arch;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#000d14]/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-[#001724] border border-[#00344d] rounded-3xl shadow-2xl max-w-lg w-full my-4 overflow-hidden flex flex-col text-white">
        
        {/* Top Header */}
        <div className="px-5 py-4 bg-[#001f30] border-b border-[#002d3f] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center text-sm">
              🐾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Mindful Companion</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#00364d] text-[#26c6da]">
                  Grounding Space
                </span>
              </div>
              <p className="text-xs text-[#93c5d6]">
                Gentle presence &amp; soothing comfort with {pet.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCustomizeModal}
              className="p-1.5 rounded-xl text-[#26c6da] hover:bg-[#00283c] transition border border-[#003d58]"
              title="Customize companion"
            >
              <Palette className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#719bb0] hover:text-white hover:bg-[#00283c] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Sanctuary Stage */}
          <div className="relative rounded-3xl bg-gradient-to-b from-[#002538] via-[#001d2c] to-[#001724] border border-[#003c58] p-6 flex flex-col items-center justify-center overflow-hidden min-h-[300px] shadow-lg">
            
            {/* Subtle glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#26c6da]/10 rounded-full blur-2xl pointer-events-none" />

            {/* Status pills */}
            <div className="flex items-center gap-2 mb-2 z-10">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#00283c] border border-[#003d58] text-[#93c5d6]">
                {getArchetypeName(pet.archetype)}
              </span>
              <span className="text-xs text-rose-300 flex items-center gap-1 bg-[#00283c] border border-[#003d58] px-2.5 py-0.5 rounded-full">
                <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                <span>{pet.careHearts}</span>
              </span>
            </div>

            {/* Dialogue Bubble */}
            <motion.div
              key={feedback || petDialogue}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative max-w-sm mx-auto my-3 p-3.5 rounded-2xl bg-[#002b3d] border border-[#00415d] text-white text-xs leading-relaxed text-center shadow-md z-10"
            >
              {feedback ? (
                <span className="text-[#26c6da] font-medium">{feedback}</span>
              ) : (
                <span>{petDialogue}</span>
              )}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-6 border-t-[#002b3d]" />
            </motion.div>

            {/* Interactive Avatar */}
            <div className="my-2 z-10 cursor-pointer">
              <PetAvatar
                archetype={pet.archetype}
                stage={pet.evolutionStage}
                moodExpression={petMoodExpression}
                colorTheme={pet.colorTheme}
                size="lg"
                interactive={true}
                onPet={handlePetAffection}
              />
            </div>

            <p className="text-[11px] text-[#6b92a8] italic mt-1 z-10">
              Tap {pet.name} to receive a calming touch &amp; affirmation
            </p>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 mt-5 z-10 w-full max-w-xs justify-center">
              <button
                onClick={handlePetAffection}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#00283c] hover:bg-[#00344d] border border-[#003d58] text-xs font-semibold text-white transition active:scale-95"
              >
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Pet {pet.name}</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenBreathingModal();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#26c6da] hover:bg-[#20b2c4] text-[#001724] text-xs font-bold transition active:scale-95"
              >
                <Wind className="w-3.5 h-3.5" />
                <span>4-7-8 Breath</span>
              </button>
            </div>
          </div>

          {/* Gentle Mindful Anchor Note */}
          <div className="p-4 rounded-2xl bg-[#002233] border border-[#00344d] text-xs text-[#93c5d6] space-y-1">
            <strong className="text-white block font-semibold">Separate Mindful Sanctuary</strong>
            <p>
              Lumi offers grounding companionship and nervous system regulation. For cognitive restructuring of negative automatic thoughts, use the <strong>CBT Thought Record</strong> in your Self Care Library.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
