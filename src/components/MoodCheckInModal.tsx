/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Check, Heart, Sparkles, Smile, Frown, Meh, Sun, CloudRain } from 'lucide-react';

interface MoodCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOODS = [
  { id: 'calm', label: 'Calm & Peaceful', icon: '🌿', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30' },
  { id: 'happy', label: 'Content / Grateful', icon: '☀️', color: 'from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/30' },
  { id: 'okay', label: 'Neutral / Okay', icon: '⛅', color: 'from-slate-500/20 to-zinc-500/20 text-slate-300 border-slate-500/30' },
  { id: 'anxious', label: 'Anxious / Restless', icon: '🌀', color: 'from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30' },
  { id: 'overwhelmed', label: 'Overwhelmed', icon: '🌊', color: 'from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/30' },
  { id: 'low', label: 'Low / Tired', icon: '🌧️', color: 'from-sky-500/20 to-indigo-500/20 text-sky-300 border-sky-500/30' },
];

export const MoodCheckInModal: React.FC<MoodCheckInModalProps> = ({ isOpen, onClose }) => {
  const [selectedMood, setSelectedMood] = useState<string>('calm');
  const [note, setNote] = useState<string>('');
  const [saved, setSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setNote('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#001724] border border-[#00344d] rounded-3xl max-w-sm w-full p-5 shadow-2xl text-white relative">
        <div className="flex items-center justify-between pb-3 border-b border-[#002a3d]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-lg">
              😊
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Log Mood</h2>
              <p className="text-[11px] text-[#93c5d6]">Check in with yourself right now</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-[#719bb0] hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {saved ? (
          <div className="py-8 text-center space-y-2 animate-fadeIn">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-sm font-bold text-white">Check-in Logged</h3>
            <p className="text-xs text-[#93c5d6]">Self-awareness is the first step to peace.</p>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMood(m.id)}
                  className={`p-2.5 rounded-2xl text-left border text-xs font-semibold flex items-center gap-2 transition active:scale-95 ${
                    selectedMood === m.id
                      ? 'bg-[#26c6da] text-[#001724] border-[#26c6da] shadow-md'
                      : 'bg-[#002233] text-[#93c5d6] border-[#00364d] hover:text-white'
                  }`}
                >
                  <span className="text-base">{m.icon}</span>
                  <span className="truncate">{m.label}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="text-[11px] text-[#719bb0] font-medium block mb-1">
                A quick thought or note (optional):
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="How has your morning or evening been?..."
                className="w-full px-3 py-2 rounded-xl border border-[#00364d] bg-[#001b29] text-xs text-white placeholder:text-[#6b92a8] focus:border-[#26c6da] outline-hidden"
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full py-2.5 rounded-xl bg-[#26c6da] hover:bg-[#20b2c4] text-[#001724] font-bold text-xs transition active:scale-98 shadow-md"
            >
              Save Mood Check-In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
