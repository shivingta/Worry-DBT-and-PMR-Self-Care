/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  ThoughtRecord,
  PetState,
  PetMoodExpression,
  CBTSubTab,
  DeviceMode,
} from '../types';
import { getInitialSeedData } from '../data/cbtData';

interface DiaryContextType {
  thoughtRecords: ThoughtRecord[];
  addThoughtRecord: (record: Omit<ThoughtRecord, 'id' | 'timestamp' | 'date' | 'time'> & { date?: string; time?: string }) => void;
  updateThoughtRecord: (id: string, updatedFields: Partial<ThoughtRecord>) => void;
  deleteThoughtRecord: (id: string) => void;
  resetToSampleData: () => void;
  clearAllData: () => void;
  stats: {
    totalThoughtRecords: number;
    topEmotion: string;
    topDistortion: string;
    averageBelief: number;
  };
  // Mindful Companion (Lumi) state
  pet: PetState;
  updatePet: (updates: Partial<PetState>) => void;
  petInteraction: () => { message: string; heartGained: boolean };
  petMoodExpression: PetMoodExpression;
  petDialogue: string;
  cbtSubTab: CBTSubTab;
  setCbtSubTab: (tab: CBTSubTab) => void;
  deviceMode: DeviceMode;
  setDeviceMode: (mode: DeviceMode) => void;
}

const DiaryContext = createContext<DiaryContextType | undefined>(undefined);

const STORAGE_KEY_THOUGHTS = 'mannkaa_cbt_thought_records_v3';
const STORAGE_KEY_LUMI = 'mannkaa_lumi_companion_v3';
const STORAGE_KEY_DEVICE = 'mannkaa_device_mode_v3';

const INITIAL_PET_STATE: PetState = {
  name: 'Lumi',
  archetype: 'elephant',
  colorTheme: 'teal',
  level: 3,
  careHearts: 12,
  streakDays: 5,
  evolutionStage: 'teen',
  favoriteQuote: 'मन के हारे हार है, मन के जीते जीत (Victory over distorted thoughts brings peace within).',
};

export const DiaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cbtSubTab, setCbtSubTab] = useState<CBTSubTab>('records');

  const [deviceMode, setDeviceModeState] = useState<DeviceMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DEVICE);
      if (saved === 'mobile' || saved === 'web') return saved;
    } catch {
      // ignore
    }
    // Default to mobile view on small screens, or allow switching easily
    return window.innerWidth > 900 ? 'web' : 'mobile';
  });

  const setDeviceMode = (mode: DeviceMode) => {
    setDeviceModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY_DEVICE, mode);
    } catch (e) {
      console.error(e);
    }
  };

  const [thoughtRecords, setThoughtRecords] = useState<ThoughtRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THOUGHTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return getInitialSeedData().thoughtRecords;
  });

  const [pet, setPet] = useState<PetState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LUMI);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_PET_STATE;
  });

  // Persist storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THOUGHTS, JSON.stringify(thoughtRecords));
    } catch (e) {
      console.error(e);
    }
  }, [thoughtRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LUMI, JSON.stringify(pet));
    } catch (e) {
      console.error(e);
    }
  }, [pet]);

  const addThoughtRecord = (record: Omit<ThoughtRecord, 'id' | 'timestamp' | 'date' | 'time'> & { date?: string; time?: string }) => {
    const now = new Date();
    const dateStr = record.date || now.toISOString().split('T')[0];
    const timeStr = record.time || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newRecord: ThoughtRecord = {
      ...record,
      id: `t-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: record.date ? new Date(`${dateStr}T${now.toTimeString().split(' ')[0]}`).getTime() : now.getTime(),
      date: dateStr,
      time: timeStr,
    };
    setThoughtRecords((prev) => [newRecord, ...prev]);
  };

  const updateThoughtRecord = (id: string, updatedFields: Partial<ThoughtRecord>) => {
    setThoughtRecords((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  };

  const deleteThoughtRecord = (id: string) => {
    setThoughtRecords((prev) => prev.filter((item) => item.id !== id));
  };

  const updatePet = (updates: Partial<PetState>) => {
    setPet((prev) => ({ ...prev, ...updates }));
  };

  const petInteraction = () => {
    let dialogues: string[] = [];

    if (pet.archetype === 'elephant') {
      dialogues = [
        `${pet.name} sways gently with a calming breath. "Like a grounded banyan tree, you can pause whenever thoughts feel heavy."`,
        `${pet.name} rests by your side: "You are doing honest, brave work observing your thoughts. I am right here with you."`,
        `${pet.name} touches his soft trunk to your hand: "Notice the stillness right here. You are safe in this moment."`,
      ];
    } else if (pet.archetype === 'peacock') {
      dialogues = [
        `${pet.name} fans his vibrant feathers: "Even in monsoon clouds, clarity always returns in time, dost."`,
        `${pet.name} bows serenely: "Clear awareness brings light to difficult moments. Breathe gently."`,
        `${pet.name} tilts his crest: "Breathe in quiet peace, soften your shoulders."`,
      ];
    } else if (pet.archetype === 'tiger') {
      dialogues = [
        `${pet.name} sits beside you with a gentle, protective purr: "You have natural courage. Thoughts are visitors in the mind, not facts."`,
        `${pet.name} softly rumbles: "One step at a time, saathi. Notice what is real right now."`,
      ];
    } else {
      dialogues = [
        `${pet.name} chirps with bright, warm eyes: "A gentle mindful pause brings lightness to the mind."`,
        `${pet.name} flutters close: "Deep breath in through your nose, gentle release through your mouth."`,
      ];
    }

    const randomMsg = dialogues[Math.floor(Math.random() * dialogues.length)];

    setPet((prev) => ({
      ...prev,
      careHearts: prev.careHearts + 1,
    }));

    return { message: randomMsg, heartGained: true };
  };

  const resetToSampleData = () => {
    const { thoughtRecords: seedThoughts } = getInitialSeedData();
    setThoughtRecords(seedThoughts);
    setPet(INITIAL_PET_STATE);
    localStorage.setItem(STORAGE_KEY_THOUGHTS, JSON.stringify(seedThoughts));
    localStorage.setItem(STORAGE_KEY_LUMI, JSON.stringify(INITIAL_PET_STATE));
  };

  const clearAllData = () => {
    setThoughtRecords([]);
    localStorage.removeItem(STORAGE_KEY_THOUGHTS);
  };

  const { petMoodExpression, petDialogue } = useMemo<{
    petMoodExpression: PetMoodExpression;
    petDialogue: string;
  }>(() => {
    return {
      petMoodExpression: 'peaceful',
      petDialogue: `Namaste! I'm ${pet.name}, your mindful companion. Whenever you need a grounding pause or a calming breath, I am here to hold gentle space with you.`,
    };
  }, [pet.name]);

  // Overall CBT thought record stats
  const stats = useMemo(() => {
    const totalThoughtRecords = thoughtRecords.length;

    let totalBelief = 0;
    const emotionFreq: Record<string, number> = {};
    const distortionFreq: Record<string, number> = {};

    thoughtRecords.forEach((r) => {
      totalBelief += r.belief || 0;
      if (r.emotion) {
        emotionFreq[r.emotion] = (emotionFreq[r.emotion] || 0) + 1;
      }
      r.distortions?.forEach((d) => {
        distortionFreq[d] = (distortionFreq[d] || 0) + 1;
      });
    });

    const averageBelief = totalThoughtRecords > 0 ? Math.round(totalBelief / totalThoughtRecords) : 0;

    const topEmotion =
      Object.keys(emotionFreq).length > 0
        ? Object.entries(emotionFreq).sort((a, b) => b[1] - a[1])[0][0]
        : 'Anxious';

    const topDistortion =
      Object.keys(distortionFreq).length > 0
        ? Object.entries(distortionFreq).sort((a, b) => b[1] - a[1])[0][0]
        : 'catastrophizing';

    return {
      totalThoughtRecords,
      topEmotion,
      topDistortion,
      averageBelief,
    };
  }, [thoughtRecords]);

  return (
    <DiaryContext.Provider
      value={{
        thoughtRecords,
        addThoughtRecord,
        updateThoughtRecord,
        deleteThoughtRecord,
        resetToSampleData,
        clearAllData,
        stats,
        pet,
        updatePet,
        petInteraction,
        petMoodExpression,
        petDialogue,
        cbtSubTab,
        setCbtSubTab,
        deviceMode,
        setDeviceMode,
      }}
    >
      {children}
    </DiaryContext.Provider>
  );
};

export const useDiary = () => {
  const context = useContext(DiaryContext);
  if (!context) {
    throw new Error('useDiary must be used within a DiaryProvider');
  }
  return context;
};
