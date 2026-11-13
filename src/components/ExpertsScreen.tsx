/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, Star, Calendar, ShieldCheck, Search, Filter } from 'lucide-react';

export const ExpertsScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('cbt');

  const experts = [
    {
      id: 1,
      name: 'Dr. Ananya Sharma',
      title: 'Consultant Clinical Psychologist',
      credentials: 'Ph.D., M.Phil Clinical Psychology (NIMHANS)',
      experience: '11+ Years Exp.',
      rating: 4.95,
      reviewsCount: 142,
      specialties: ['CBT', 'Anxiety & Panic', 'Depression', 'OCD'],
      available: 'Today at 4:30 PM',
      fee: '₹1,500 / 50m',
    },
    {
      id: 2,
      name: 'Rohan Deshmukh',
      title: 'Licensed Psychotherapist & CBT Specialist',
      credentials: 'M.Sc. Counseling Psychology, Certified Cognitive Behavioral Therapist',
      experience: '8+ Years Exp.',
      rating: 4.9,
      reviewsCount: 98,
      specialties: ['CBT', 'Work Burnout', 'Relationship Therapy'],
      available: 'Tomorrow at 11:00 AM',
      fee: '₹1,200 / 50m',
    },
    {
      id: 3,
      name: 'Dr. Meera Sen',
      title: 'Senior Neuropsychologist',
      credentials: 'MD Psychiatry, DPM',
      experience: '15+ Years Exp.',
      rating: 4.98,
      reviewsCount: 230,
      specialties: ['Clinical Depression', 'Mood Disorders', 'Trauma'],
      available: 'Thursday at 2:00 PM',
      fee: '₹2,000 / 50m',
    },
  ];

  return (
    <div className="space-y-4 animate-fadeIn pb-6 text-white">
      
      {/* Header */}
      <div className="pt-1">
        <span className="text-[11px] font-bold text-[#26c6da] uppercase tracking-wider">
          Mannkaa Clinical Network
        </span>
        <h1 className="text-xl font-bold text-white font-serif">
          Consult Therapy Sessions
        </h1>
        <p className="text-xs text-[#93c5d6] mt-0.5">
          Book 1-on-1 sessions with licensed CBT clinicians &amp; counselors
        </p>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Therapists' },
          { id: 'cbt', label: 'CBT Specialists' },
          { id: 'anxiety', label: 'Anxiety & Panic' },
          { id: 'depression', label: 'Depression Care' },
        ].map((chip) => (
          <button
            key={chip.id}
            onClick={() => setActiveFilter(chip.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              activeFilter === chip.id
                ? 'bg-[#26c6da] text-[#001724] font-bold'
                : 'bg-[#002233] text-[#93c5d6] hover:text-white border border-[#00344d]'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Clinician Cards */}
      <div className="space-y-3">
        {experts.map((exp) => (
          <div
            key={exp.id}
            className="p-4 rounded-3xl bg-[#002233] border border-[#00344d] hover:border-[#26c6da]/50 transition shadow-lg space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#002b3d] border border-[#003f5c] flex items-center justify-center font-bold text-base text-[#26c6da]">
                  {exp.name.split(' ')[1]?.[0] || exp.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white font-serif">{exp.name}</h3>
                  <p className="text-[11px] text-[#93c5d6]">{exp.title}</p>
                  <p className="text-[10px] text-[#6b92a8]">{exp.credentials}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#fbbf24]/20 border border-[#fbbf24]/30 text-[#fbbf24] text-[11px] font-bold">
                <Star className="w-3 h-3 fill-[#fbbf24]" />
                <span>{exp.rating}</span>
              </div>
            </div>

            {/* Specialties */}
            <div className="flex flex-wrap gap-1">
              {exp.specialties.map((spec) => (
                <span
                  key={spec}
                  className="px-2 py-0.5 rounded-md bg-[#002d42] border border-[#003e5a] text-[10px] text-[#93c5d6]"
                >
                  {spec}
                </span>
              ))}
            </div>

            {/* Timing & Booking CTA */}
            <div className="pt-2 border-t border-[#003247] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#6b92a8]">Next Available:</span>
                <div className="text-xs font-semibold text-white">{exp.available}</div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-white">{exp.fee}</span>
                <button
                  onClick={() => alert(`Selected session with ${exp.name}. In-app scheduling confirmed!`)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#26c6da] hover:bg-[#20b2c4] text-[#001724] font-bold text-xs transition active:scale-95"
                >
                  Book Session
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
