/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Check, Heart, Shield, Sparkles, AlertCircle } from 'lucide-react';

interface WellbeingAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUESTIONS = [
  'Feeling nervous, anxious, or on edge over the past week?',
  'Trouble relaxing or winding down after classes/exams?',
  'Feeling overwhelmed by racing thoughts before sleeping?',
  'Feeling little interest or pleasure in daily activities?',
];

export const WellbeingAssessmentModal: React.FC<WellbeingAssessmentModalProps> = ({ isOpen, onClose }) => {
  const [answers, setAnswers] = useState<number[]>([1, 1, 1, 1]);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelectAnswer = (qIndex: number, val: number) => {
    const updated = [...answers];
    updated[qIndex] = val;
    setAnswers(updated);
  };

  const totalScore = answers.reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#001724] border border-[#00344d] rounded-3xl max-w-sm w-full p-5 shadow-2xl text-white relative">
        <div className="flex items-center justify-between pb-3 border-b border-[#002a3d]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-400/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
                <path d="M12 6a6 6 0 0 0-6 6c0 2 2 3 2 4h8c0-1 2-2 2-4a6 6 0 0 0-6-6z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Assess Your Wellbeing</h2>
              <p className="text-[11px] text-[#93c5d6]">Check in on your mental health</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-[#719bb0] hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-6 space-y-4 text-center animate-fadeIn">
            <div className="w-14 h-14 mx-auto rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-300">
              <Sparkles className="w-7 h-7" />
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#26c6da]">
                Assessment Result
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                {totalScore <= 3
                  ? 'Mild Fluctuations • Stable'
                  : totalScore <= 7
                  ? 'Moderate Academic Tension'
                  : 'Elevated Cognitive Strain'}
              </h3>
              <p className="text-xs text-[#93c5d6] mt-1.5 leading-relaxed">
                {totalScore <= 3
                  ? 'Your baseline is resilient. Keep using grounding tools and regular pauses.'
                  : totalScore <= 7
                  ? 'You are carrying noticeable tension. Using CBT Thought Records will help catch automatic worries.'
                  : 'Your cognitive load is high. Consider reframing heavy thoughts and connecting with Mannkaa support.'}
              </p>
            </div>

            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-[#26c6da] hover:bg-[#20b2c4] text-[#001724] font-bold text-xs transition"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4 pt-3">
            {QUESTIONS.map((q, idx) => (
              <div key={idx} className="space-y-1.5">
                <p className="text-xs font-medium text-white">{q}</p>
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  {[
                    { label: 'Rarely', val: 0 },
                    { label: 'Sometimes', val: 1 },
                    { label: 'Often', val: 2 },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleSelectAnswer(idx, opt.val)}
                      className={`py-1 px-2 rounded-lg border font-semibold transition ${
                        answers[idx] === opt.val
                          ? 'bg-[#26c6da] text-[#001724] border-[#26c6da]'
                          : 'bg-[#002233] text-[#93c5d6] border-[#00364d] hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={() => setSubmitted(true)}
              className="w-full mt-2 py-2.5 rounded-xl bg-[#26c6da] hover:bg-[#20b2c4] text-[#001724] font-bold text-xs transition active:scale-98 shadow-md"
            >
              View Personalized Insight
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
