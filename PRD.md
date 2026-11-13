# Product Requirements Document (PRD)
## Feature: CBT Thought & Mood Diary ("Mannkaa Saathi")
**Product**: Mannkaa Mental Health Platform  
**Target Platform**: Mobile-Native Web & App (iOS & Android)  
**Version**: 1.0 (MVP)  
**Status**: Ready for Implementation / Review  
**Date**: September 2026  

---

## 1. Executive Summary & Vision

Cognitive Behavioral Therapy (CBT) is an established, evidence-based modality for treating anxiety, depressive rumination, and cognitive distortions. However, traditional CBT worksheets and digital diaries suffer from steep drop-off rates due to cognitive friction, clinical coldness, and lack of ongoing emotional feedback loops.

The **Mannkaa CBT Thought & Mood Diary** transforms self-care into an engaging, culturally grounded daily practice. By pairing structured 5-column cognitive restructuring and daily mood attunement with a **Mindful Indian Creature Companion** (*Appu the Elephant, Mayur the Peacock, Sheru the Tiger, and Mithu the Parakeet*), users nurture an emotional companion that mirrors their feelings, celebrates cognitive breakthroughs, and grows alongside them through their mental health journey.

---

## 2. Problem Statement & User Personas

### 2.1 The Problem
1. **Clinical Intimidation & Friction**: Traditional CBT thought records feel like homework. Users facing acute distress find it difficult to self-initiate analysis of automatic negative thoughts (NATs).
2. **Lack of Sustained Engagement**: Users log moods for 2–3 days, but stop when they don't see tangible progress or immediate emotional payoff.
3. **Cultural Incongruence**: Most global mental health apps use Western paradigms that overlook the cultural idioms of distress, familial context, and emotional vocabulary relevant to Indian users.

### 2.2 Target Personas
- **The Chronic Overthinker (Aarav, 26, Bengaluru)**: Experiences late-night spiral thinking and imposter syndrome at work. Needs a low-friction tool to dissect catastrophic predictions and ground his nervous system.
- **The Therapy Seeker (Priya, 32, Mumbai)**: In active therapy with a clinical psychologist. Wants a structured daily thought record between sessions to log homework and share 7-day emotional trends with her therapist.
- **The Daily Mindful Practitioner (Kabir, 22, Delhi)**: Seeks an ambient, stress-relieving self-check-in that feels comforting, gameful, and non-judgmental.

---

## 3. Goals & Success Metrics

### 3.1 Primary Product Objectives
- Provide an intuitive, evidence-based cognitive restructuring tool following Beck's CBT framework.
- Increase Day-7 and Day-30 retention in self-care exercises through gamified companion nurturing.
- Deliver measurable distress relief per session (target: ≥30% reduction in subjective distress after thought reframing).

### 3.2 Key Performance Indicators (KPIs)
| Metric | Baseline / Target | Definition |
| :--- | :--- | :--- |
| **D7 Retention (Self Care)** | Target: ≥42% | Percentage of users returning to Self Care within 7 days |
| **Completion Rate (CBT Challenge)** | Target: ≥75% | Percentage of users who start a thought challenge and reach Step 5 |
| **Average Distress Reduction (Δ)** | Target: ≥35% | Difference between initial intensity and post-reframe intensity |
| **Daily Mood Check-in Frequency** | Target: ≥1.8/day | Average daily check-ins per active user |
| **Crisis Intervention Safety** | 100% SLA | Immediate 1-tap display of Indian crisis helplines (KIRAN / Tele-MANAS) |

---

## 4. Information Architecture & User Journey

### 4.1 Entry Point: Self Care Hub
```
[Main Navigation Bar]
  ├── Home
  ├── Sessions (Expert Clinicians)
  ├── Self-Care (Active Hub) ◄── [ENTRY POINT]
  │     ├── Breathing Exercises Tile (5–10m Somatic regulation)
  │     ├── CBT Thought Diary Tile ◄── [FEATURE TILE]
  │     │     └── Shows: Active Pet Avatar, Level, Streak, "Open Sanctuary" CTA
  │     ├── Assess Wellbeing Tile (PHQ-9 / GAD-7)
  │     └── Distortions Library Tile (10 Cognitive Traps)
  └── Menu (Account, Helplines, Data Export)
```

### 4.2 In-Exercise Navigation Hierarchy
Once the user enters the CBT Thought Diary, they access a focused, distraction-free environment:
- **Sticky Top Bar**:
  - Breadcrumb: `← Self Care Library / CBT Diary` (preserves all states upon return).
  - Quick Companion Badge: `🐾 [Pet Name] Lv.X`.
  - Instant Somatic Reset: Quick 4-7-8 Breathing Action.
- **Sub-Navigation Tabs**:
  1. **Sanctuary (`sanctuary`)**: Interactive habitat, emotional reflection, tactile petting, daily action shortcuts.
  2. **Moods (`mood`)**: Daily check-in history, emotional valence breakdown, somatic sensations.
  3. **CBT Journal (`thoughts`)**: Filterable thought records, Socratic evidence comparison, reframing deltas.
  4. **7d Trends (`trends`)**: Recharts interactive trajectory, distortion distribution, and decatastrophizing tools.
  5. **My Pet (`pet`)**: Evolution lineage tree (Bal Roop → Kishore Saathi → Maha Rakshak), personal CBT anchor mantra.

---

## 5. Functional Specifications

### 5.1 Daily Mood Check-In & Somatic Attunement
- **Trigger**: Tap "+ Log Mood" button in Sanctuary, Moods tab, or Self Care Hub.
- **Inputs**:
  - **Mood Score Slider**: Scale of 1 to 10 (1 = Severe Distress, 5 = Neutral, 10 = Flourishing).
  - **Primary Emotion**: Selection among 8 core categories (Joyful, Calm, Hopeful, Neutral, Anxious, Low, Frustrated, Overwhelmed).
  - **Emotional Intensity**: Percentage slider (0% to 100%).
  - **Somatic Sensations (Body Scan)**: Multi-select tags (e.g., Chest tightness, Clenched jaw, Restlessness, Fatigue, Muscle tension, Deep breathing).
  - **Context / Trigger**: Situational context (Work, Relationship, Health, Solitude, Family).
  - **Personal Reflection Notes**: Free-form journaling field.
- **Gamification Reward**: +25 XP for the companion and +1 Care Heart.

### 5.2 5-Column CBT Thought Restructuring Record
Follows classical Cognitive Behavioral Therapy protocol:
1. **Step 1: The Activating Situation**: What happened? Where were you? Who was involved?
2. **Step 2: The Automatic Negative Thought (NAT)**: The raw, unedited thought that triggered distress, along with initial emotion & intensity rating.
3. **Step 3: Identifying Cognitive Distortions**: Multi-select tags for 10 classical cognitive traps:
   - *Catastrophizing*, *All-or-Nothing Thinking*, *Mind Reading*, *Fortune Telling*, *Emotional Reasoning*, *Mental Filter*, *Overgeneralization*, *"Should" Statements*, *Personalization*, *Labeling*.
   - Each distortion includes an interactive definition and Socratic challenge prompt.
4. **Step 4: Objective Evidence Weighing (Socratic Trial)**:
   - *Evidence For*: Facts supporting the thought (excluding feelings).
   - *Evidence Against*: Contradictory evidence, historical counter-examples, alternative viewpoints.
5. **Step 5: Balanced Alternative Reframe & Outcome**:
   - Synthesis of an objective, compassionate cognitive reframe.
   - Outcome mood & distress rating (0–100%).
   - Calculation of **Relief Delta** (`Initial Intensity - Outcome Intensity`).
- **Gamification Reward**: +60 XP ("Clarity Crystals") and +3 Care Hearts.

### 5.3 Mindful Indian Creature Companion Gamification
- **Cultural Archetypes**:
  - **Appu (Gentle Elephant / Gajraj)**: Symbol of *Buddhi* (Wisdom) and steadfast grounding; adorned with an auspicious sandalwood *teeka*.
  - **Mayur (Radiant Peacock / Mor)**: Symbol of resilience and dancing in the rain; royal indigo/teal body with *Kalgi* crown and *chandrika* tail feathers.
  - **Sheru (Royal Bengal Cub / Bagh)**: Symbol of *Dhairya* (Courage) against cognitive distortions; haldi/saffron coat with natural *trishul* stripes.
  - **Mithu (Observant Parakeet / Tota)**: Symbol of mindful awareness, challenging automatic repetitive chatter; rose-ringed collar (*kanthi*) and curved ruby beak.
- **Emotional Mirroring**:
  - The companion dynamically updates facial expressions and dialogue based on the user's latest logged mood.
  - Low/Anxious mood triggers supportive, co-regulating dialogue (*"Take a deep breath with me, dost. You are safe."*).
  - Joyful/Content mood triggers celebration and golden aura animations.
- **Evolutionary Stages**:
  - **Stage 1 (Bal Roop / Playful Sprout, Lvl 1–2)**: Youthful companion with subtle tilak.
  - **Stage 2 (Kishore Saathi / Curious Companion, Lvl 3–5)**: Adorned with a Marigold Garland (*Genda Phool Mala*).
  - **Stage 3 (Maha Rakshak / Wise Guardian, Lvl 6+)**: Radiates an 8-petal Sacred Lotus Mandala halo and celestial jewel.
- **Care Currency**:
  - **Mindful Streak**: Increments for every consecutive day with at least one check-in or CBT record.
  - **Care Hearts**: Accumulated to unlock customization options (Aura colors: Mayur Neel, Genda Amber, Desi Gulabi, Kesar, Tulsi Sage).

### 5.4 Analytics & 7-Day Trajectory
- **Visual Trend**: Interactive Recharts Area Chart plotting the 7-day emotional curve with reference lines for Baseline (5) and Flourishing (8+).
- **Metric Toggle**: Switch between Average Mood Score (1–10) and CBT Restructuring Volume.
- **Distortion Pattern Tracker**: Percentage breakdown of the user's most recurrent thinking traps.
- **Socratic Decatastrophizing Tool**: Embedded 3-scenario guide (Worst Case, Best Case, Most Realistic Scenario).

### 5.5 Somatic Regulation (4-7-8 Breathing Reset)
- Interactive visual circle breathing guide:
  - Inhale (4 seconds) → Hold (7 seconds) → Exhale (8 seconds).
  - Pet avatar scales dynamically with the breath cycle to promote co-regulation.
  - Haptic / visual pacing cues with cycle completion counter (+20 XP).

---

## 6. Design System & UX Standards

- **Primary Visual Palette**:
  - **Base Canvas**: Midnight Navy (`#001724`) with secondary surface container (`#002233`).
  - **Dividers & Structural Borders**: Deep Cyan-Navy (`#002d42` and `#00344d`).
  - **Primary Interactive Accent**: Electric Cyan (`#26c6da`) for buttons, active pills, and chart curves.
  - **Secondary Warning / Warm Accent**: Marigold Amber (`#fbbf24`) for streaks and badges.
  - **Affection Accent**: Indian Rose (`#f43f5e`) for Care Hearts.
- **Typography**:
  - Headings: Serif display font for clinical dignity and grounding warmth.
  - Body & Form Controls: Clean Sans-Serif font with high contrast text (`#ffffff` primary, `#93c5d6` secondary).
- **Mobile Constraints**:
  - Fixed mobile viewport (`max-w-md` container).
  - Minimum touch target: 44px.
  - Native mobile status bar (`12:22`, signal, Wi-Fi, battery indicators).

---

## 7. Safety, Clinical Ethics, & Crisis Protocols

1. **Non-Diagnostic Disclaimer**: Explicit UI disclosures that the CBT Diary is a self-reflective educational and wellness tool, not a substitute for clinical psychiatry or emergency care.
2. **Immediate Crisis Pathways**:
   - Persistent access to the Menu and Helplines card.
   - Toll-free Indian mental health hotlines:
     - **KIRAN Helpline**: 1800-599-0019 (24x7 Government of India)
     - **Tele-MANAS**: 14416 / 1800-891-4416
3. **Severe Distress Interventions**:
   - If a user inputs a mood score ≤ 2 or tags severe helplessness, the system immediately presents a supportive dialogue box with a 1-tap call button to crisis support.

---

## 8. Technical Architecture & Data Models

### 8.1 Data Model Specifications
```typescript
interface MoodEntry {
  id: string;
  date: string;          // YYYY-MM-DD
  time: string;          // HH:mm
  timestamp: number;
  score: number;         // 1-10
  primaryEmotion: string;
  intensity: number;     // 0-100%
  sensations: string[];
  triggerContext: string;
  notes?: string;
}

interface ThoughtRecord {
  id: string;
  date: string;
  time: string;
  timestamp: number;
  situation: string;
  automaticThought: string;
  distortions: string[];
  initialMood: { emotion: string; intensity: number };
  evidenceFor: string;
  evidenceAgainst: string;
  rationalResponse: string;
  outcomeMood: { emotion: string; intensity: number };
  outcomeNotes?: string;
}

interface PetCompanion {
  name: string;
  archetype: 'elephant' | 'peacock' | 'tiger' | 'parakeet';
  colorTheme: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  careHearts: number;
  streakDays: number;
  evolutionStage: 'baby' | 'teen' | 'guardian';
  favoriteQuote?: string;
}
```

### 8.2 Offline-First & Storage
- Local persistence via browser storage with encrypted backup/export capability in JSON format.
- Instant fallback and sample state seeding for demo and offline utility.

---

## 9. Phased Rollout Plan

- **Phase 1 (MVP - Current Scope)**:
  - 4-tile Self Care Hub with direct entry to the CBT Thought Diary.
  - Full 5-column thought restructuring form and distortion guide.
  - 4 Desi pet archetypes with emotional mirroring and 3 evolution stages.
  - 7-day mood trend visualization and Recharts analytics.
  - 4-7-8 Somatic breathing integration.
- **Phase 2 (Clinical Integration)**:
  - PDF export of CBT logs formatted specifically for clinical review during 1-on-1 therapy sessions.
  - Therapist homework assigner: clinicians can assign specific thought reframing prompts directly to the user's diary.
  - Push notifications for daily evening reflection and morning mindfulness intention.
- **Phase 3 (Voice & AI Grounding)**:
  - Multilingual support (Hindi, Marathi, Tamil, Bengali, Telugu).
  - Speech-to-text voice journaling for natural emotion logging during high distress.
