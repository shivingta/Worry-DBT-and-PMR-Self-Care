/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EmotionType =
  | 'Anxious'
  | 'Overwhelmed'
  | 'Self-Critical'
  | 'Catastrophic'
  | 'Sad'
  | 'Frustrated'
  | 'Hopeless'
  | 'Guilty'
  | 'Ashamed'
  | 'Neutral'
  | 'Calm'
  | 'Grounded'
  | 'Hopeful'
  | 'Resilient';

export interface CognitiveDistortionInfo {
  id: string;
  name: string;
  shortDefinition: string;
  fullDescription: string;
  example: string;
  counterQuestion: string;
  category: 'Filtering' | 'Assuming' | 'Magnifying' | 'Judging';
  color: string;
}

/**
 * CBT Thought Record Schema
 * Structured reflection & evidence-based reappraisal of automatic thoughts
 */
export interface ThoughtRecord {
  id: string;
  timestamp: number;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "02:30 PM"
  situation: string; // What happened right before the mood shift
  emotion: string; // Primary emotion experienced
  intensity: number; // 0 to 100%
  sensations?: string[]; // Bodily / physical cues (e.g. racing heart, shallow breathing)
  automaticThought: string; // Core thought or worry that flashed through the mind
  belief: number; // 0 to 100% belief in the automatic thought
  distortions: string[]; // List of tagged thinking trap IDs
  evidenceFor: string; // Facts supporting the thought (observable evidence)
  evidenceAgainst: string; // Facts not supporting the thought (counter-evidence, alternative angles)
  balancedAlternative: string; // Realistic, compassionate, evidence-based reappraisal
  reframedBelief?: number; // 0 to 100% belief in the automatic thought after reframe (de-escalated)
  actionPlan?: string; // Optional gentle practical step or coping action
}

export type PetArchetype =
  | 'elephant' // Appu the Wise Elephant (Gajraj)
  | 'peacock'  // Mayur the Radiant Peacock (Mor)
  | 'tiger'    // Sheru the Brave Bengal Tiger Cub (Bagh)
  | 'parakeet' // Mithu the Observant Indian Parakeet (Tota)
  | 'fox'
  | 'cat'
  | 'panda'
  | 'axolotl';

export type PetColorTheme = 'teal' | 'lavender' | 'amber' | 'rose' | 'sage';
export type PetStage = 'baby' | 'teen' | 'guardian';
export type PetMoodExpression = 'radiant' | 'happy' | 'peaceful' | 'comforting' | 'holding_space' | 'sleepy';

export interface PetState {
  name: string;
  archetype: PetArchetype;
  colorTheme: PetColorTheme;
  level: number;
  careHearts: number;
  streakDays: number;
  evolutionStage: PetStage;
  favoriteQuote?: string;
}

export type MannkaaMainTab = 'home' | 'experts' | 'self_care' | 'menu';
export type CBTSubTab = 'records' | 'distortions';
export type DeviceMode = 'mobile' | 'web';
