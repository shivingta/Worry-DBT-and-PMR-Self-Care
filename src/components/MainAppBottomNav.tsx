/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MannkaaMainTab } from '../types';
import { Home, Calendar } from 'lucide-react';

interface MainAppBottomNavProps {
  activeTab: MannkaaMainTab;
  onSelectTab: (tab: MannkaaMainTab) => void;
  isCBTExperienceOpen?: boolean;
}

export const MainAppBottomNav: React.FC<MainAppBottomNavProps> = ({
  activeTab,
  onSelectTab,
  isCBTExperienceOpen = false,
}) => {
  return (
    <nav
      id="mannkaa-global-bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#001724]/95 backdrop-blur-lg border-t border-[#002d3f] py-2 px-3 select-none"
    >
      <div className="max-w-md sm:max-w-lg md:max-w-xl mx-auto flex items-center justify-around">
        
        {/* 1. HOME */}
        <button
          id="nav-tab-home"
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center min-w-[68px] py-1 transition active:scale-95 ${
            activeTab === 'home'
              ? 'text-[#26c6da]'
              : 'text-[#628093] hover:text-[#94a3b8]'
          }`}
        >
          <Home className={`w-6 h-6 ${activeTab === 'home' ? 'stroke-[2.2]' : 'stroke-[1.6]'}`} />
          <span className="text-[11px] font-medium tracking-tight mt-1">Home</span>
        </button>

        {/* 2. SESSIONS (Matches screenshot label and calendar icon) */}
        <button
          id="nav-tab-sessions"
          onClick={() => onSelectTab('experts')}
          className={`flex flex-col items-center justify-center min-w-[68px] py-1 transition active:scale-95 ${
            activeTab === 'experts'
              ? 'text-[#26c6da]'
              : 'text-[#628093] hover:text-[#94a3b8]'
          }`}
        >
          <Calendar className={`w-6 h-6 ${activeTab === 'experts' ? 'stroke-[2.2]' : 'stroke-[1.6]'}`} />
          <span className="text-[11px] font-medium tracking-tight mt-1">Sessions</span>
        </button>

        {/* 3. SELF-CARE (Active in screenshot with bright cyan Lotus flower icon!) */}
        <button
          id="nav-tab-self-care"
          onClick={() => onSelectTab('self_care')}
          className={`flex flex-col items-center justify-center min-w-[68px] py-1 transition active:scale-95 ${
            activeTab === 'self_care'
              ? 'text-[#26c6da]'
              : 'text-[#628093] hover:text-[#94a3b8]'
          }`}
        >
          {/* Stylized Lotus Flower Icon matching the screenshot */}
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              className={`w-6 h-6 fill-none stroke-current ${
                activeTab === 'self_care' ? 'stroke-[2.2]' : 'stroke-[1.6]'
              }`}
            >
              {/* Center lotus petal */}
              <path
                d="M 12 3 C 10 7, 10 12, 12 17 C 14 12, 14 7, 12 3 Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Left lotus petal */}
              <path
                d="M 11 16 C 6 15, 3 10, 5 7 C 8 8, 10 12, 11 16 Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Right lotus petal */}
              <path
                d="M 13 16 C 18 15, 21 10, 19 7 C 16 8, 14 12, 13 16 Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Bottom stem / pool curve */}
              <path
                d="M 7 19 C 10 21, 14 21, 17 19"
                strokeLinecap="round"
              />
            </svg>

            {/* Small active indicator if CBT is running */}
            {isCBTExperienceOpen && activeTab === 'self_care' && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#26c6da] animate-ping" />
            )}
          </div>

          <span className="text-[11px] font-medium tracking-tight mt-1">
            Self-Care
          </span>
        </button>

        {/* 4. MENU (Matches screenshot icon: rounded disc with 3 dots) */}
        <button
          id="nav-tab-menu"
          onClick={() => onSelectTab('menu')}
          className={`flex flex-col items-center justify-center min-w-[68px] py-1 transition active:scale-95 ${
            activeTab === 'menu'
              ? 'text-[#26c6da]'
              : 'text-[#628093] hover:text-[#94a3b8]'
          }`}
        >
          {/* Rounded circle with 3 horizontal dots matching screenshot */}
          <div className="w-6 h-6 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className={`w-5 h-5 fill-none stroke-current ${
                activeTab === 'menu' ? 'stroke-[2.2]' : 'stroke-[1.6]'
              }`}
            >
              <rect x="2" y="2" width="20" height="20" rx="6" />
              <circle cx="8" cy="12" r="1" fill="currentColor" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="16" cy="12" r="1" fill="currentColor" />
            </svg>
          </div>
          <span className="text-[11px] font-medium tracking-tight mt-1">Menu</span>
        </button>

      </div>
    </nav>
  );
};
