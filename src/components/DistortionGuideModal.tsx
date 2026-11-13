/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { COGNITIVE_DISTORTIONS } from '../data/cbtData';
import { X, BookOpen, Search, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';

interface DistortionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDistortionToChallenge?: (distortionId: string) => void;
}

export const DistortionGuideModal: React.FC<DistortionGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectDistortionToChallenge,
}) => {
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Judging', 'Magnifying', 'Assuming', 'Filtering'];

  const filtered = COGNITIVE_DISTORTIONS.filter((d) => {
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.shortDefinition.toLowerCase().includes(search.toLowerCase()) ||
      d.example.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden animate-fadeIn">
      <div className="bg-[#001724] border border-[#00344d] rounded-t-[32px] sm:rounded-[28px] shadow-2xl max-w-xl w-full flex flex-col max-h-[92vh] sm:max-h-[90vh] text-white animate-slideUp sm:animate-scale overflow-hidden">
        
        {/* Mobile Pull Indicator */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 bg-[#00364d] rounded-full" />
        </div>

        {/* Mobile-Friendly Header */}
        <div className="px-5 sm:px-6 pt-3 sm:pt-4 pb-3 bg-[#001724] border-b border-[#002838] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base leading-tight">
                Thinking Traps Guide
              </h3>
              <p className="text-[11px] text-[#93c5d6]">
                Common cognitive distortions in CBT
              </p>
            </div>
          </div>

          <button
            id="close-distortion-guide-modal"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#719bb0] hover:text-white hover:bg-[#00283c] transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="p-3.5 sm:px-6 bg-[#001b29] border-b border-[#002b3d] space-y-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#6b92a8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search traps or everyday examples..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#00364d] bg-[#00131d] text-xs text-white placeholder:text-[#6b92a8] outline-hidden focus:border-[#26c6da] transition"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition active:scale-95 ${
                  selectedCategory === cat
                    ? 'bg-[#26c6da] text-[#001724] font-bold shadow-xs'
                    : 'bg-[#002233] text-[#93c5d6] hover:text-white border border-[#00364d]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Distortions Cards Scrollable List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#719bb0]">
              No thinking traps match your search. Try another keyword.
            </div>
          ) : (
            filtered.map((distortion) => (
              <div
                key={distortion.id}
                className="p-4 rounded-2xl border border-[#00344d] bg-[#00202e] hover:border-[#26c6da]/50 transition space-y-2.5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">
                      {distortion.name}
                    </h4>
                    <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#001724] text-[#93c5d6] border border-[#00364d]">
                      {distortion.category}
                    </span>
                  </div>

                  {onSelectDistortionToChallenge && (
                    <button
                      onClick={() => {
                        onSelectDistortionToChallenge(distortion.id);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#26c6da] hover:text-[#20b2c4] transition shrink-0"
                    >
                      <span>Challenge</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-[#b8d5e5] leading-relaxed">
                  {distortion.fullDescription}
                </p>

                {/* Example in everyday life */}
                <div className="p-2.5 rounded-xl bg-[#001622] border border-[#002a3d] text-xs space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#719bb0] block">
                    Example in everyday life:
                  </span>
                  <p className="text-[#93c5d6] italic text-xs leading-relaxed">
                    &quot;{distortion.example}&quot;
                  </p>
                </div>

                {/* Socratic Counter-Question */}
                <div className="p-2.5 rounded-xl bg-[#002b3d] border border-[#004f6e] text-xs space-y-0.5">
                  <div className="flex items-center gap-1 text-[#26c6da] font-bold text-[10px] uppercase tracking-wider">
                    <HelpCircle className="w-3 h-3" />
                    <span>Socratic Counter-Question:</span>
                  </div>
                  <p className="text-white text-xs leading-relaxed">
                    {distortion.counterQuestion}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Mobile Sticky Footer */}
        <div className="px-5 py-3 bg-[#001724] border-t border-[#002838] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-[#002233] hover:bg-[#002f47] text-white border border-[#00364d] transition"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
