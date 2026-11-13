/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Check, Sparkles, Heart } from 'lucide-react';
import { useDiary } from '../context/DiaryContext';
import { PetArchetype } from '../types';
import { PetAvatar } from './PetAvatar';

interface PetCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PetCustomizeModal: React.FC<PetCustomizeModalProps> = ({ isOpen, onClose }) => {
  const { pet, updatePet } = useDiary();

  const [name, setName] = useState<string>(pet.name);
  const [archetype, setArchetype] = useState<PetArchetype>(pet.archetype);
  const [colorTheme, setColorTheme] = useState<'teal' | 'lavender' | 'amber' | 'rose' | 'sage'>(
    pet.colorTheme
  );
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const archetypes: { id: PetArchetype; title: string; desc: string }[] = [
    { id: 'elephant', title: 'Appu the Elephant (Gajraj)', desc: 'Wise, grounded & steady patience (Dhriti)' },
    { id: 'peacock', title: 'Mayur the Peacock (Mor)', desc: 'Radiant, mindful & dancing through storms' },
    { id: 'tiger', title: 'Sheru the Bengal Cub (Bagh)', desc: 'Brave, protective & inner courage (Dhairya)' },
    { id: 'parakeet', title: 'Mithu the Parakeet (Tota)', desc: 'Inquisitive, clever & cognitive reframer' },
    { id: 'fox', title: 'Kitsu the Fox', desc: 'Alert, observant & curious' },
    { id: 'cat', title: 'Nimbus the Cat', desc: 'Calm, steady & self-soothing' },
  ];

  const colors: { id: 'teal' | 'lavender' | 'amber' | 'rose' | 'sage'; label: string; swatch: string }[] = [
    { id: 'teal', label: 'Mayur Neel (Peacock Teal)', swatch: 'bg-teal-600' },
    { id: 'amber', label: 'Genda Amber (Marigold & Haldi)', swatch: 'bg-amber-500' },
    { id: 'rose', label: 'Desi Gulabi (Indian Rose)', swatch: 'bg-rose-500' },
    { id: 'lavender', label: 'Kesar (Saffron & Lotus)', swatch: 'bg-purple-600' },
    { id: 'sage', label: 'Tulsi Green (Sacred Basil)', swatch: 'bg-emerald-600' },
  ];

  const nameSuggestions = ['Appu', 'Mayur', 'Sheru', 'Mithu', 'Gajju', 'Neel', 'Tara', 'Anandi'];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePet({
      name: name.trim() || 'Appu',
      archetype,
      colorTheme,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full my-6 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Companion Customization</h3>
              <p className="text-xs text-stone-400">Personalize your mindful CBT guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1 text-stone-800 text-xs">
          
          {/* Live Character Preview */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
            <PetAvatar
              archetype={archetype}
              stage={pet.evolutionStage}
              moodExpression="happy"
              colorTheme={colorTheme}
              size="md"
              interactive={false}
            />
            <div className="text-center mt-2">
              <div className="font-bold text-sm text-stone-900">{name || 'Your Companion'}</div>
              <div className="text-[11px] text-stone-500 capitalize">
                Level {pet.level} • {pet.evolutionStage} stage
              </div>
            </div>
          </div>

          {/* 1. Name Input */}
          <div>
            <label className="block text-xs font-semibold text-stone-900 mb-1">
              Companion Name
            </label>
            <input
              type="text"
              required
              maxLength={20}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Appu, Mayur, Sheru, Mithu"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-1 focus:ring-teal-600 outline-hidden font-medium"
            />
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] text-stone-400">Suggestions:</span>
              {nameSuggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setName(sug)}
                  className="px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-teal-50 hover:text-teal-700 text-stone-600 text-[10px] transition"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Companion Archetype */}
          <div>
            <label className="block text-xs font-semibold text-stone-900 mb-2">
              Select Creature Archetype
            </label>
            <div className="grid grid-cols-2 gap-2">
              {archetypes.map((arch) => {
                const isSelected = archetype === arch.id;
                return (
                  <button
                    key={arch.id}
                    type="button"
                    onClick={() => setArchetype(arch.id)}
                    className={`p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-teal-50/80 border-teal-700 shadow-2xs'
                        : 'bg-white border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-bold text-stone-900 text-xs">{arch.title}</div>
                    <div className="text-[10px] text-stone-500 mt-0.5">{arch.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Aura Color Theme */}
          <div>
            <label className="block text-xs font-semibold text-stone-900 mb-2">
              Aura & Color Theme
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => {
                const isSelected = colorTheme === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColorTheme(c.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${c.swatch}`} />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Companion updated!</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow-xs transition active:scale-95"
            >
              Save Companion
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
