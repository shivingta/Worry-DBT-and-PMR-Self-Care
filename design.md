# Mannkaa - CBT Thought & Mood Diary
## Mobile-Native Experience & Design System Architecture

Mannkaa is an evidence-based mental healthcare platform tailored with Indian cultural warmth and clinical rigor. The primary mobile app interface features a midnight navy design system (`#001724` base, organic waving topography line accents, cyan `#26c6da` and amber `#fbbf24` highlights) directly aligned with the native mobile design.

---

### 1. Primary Mannkaa App Navigation (Midnight Bottom Bar)

The global bottom navigation anchors the 4 pillars of the Mannkaa ecosystem:
1. **Home**: Daily mindful climate, companion glance widget, intention quotes, and quick check-in shortcuts.
2. **Sessions**: Clinical directory of licensed clinical psychologists, psychiatrists, and CBT specialists with booking.
3. **Self-Care (Active Hub & Exercise Container)**: Houses evidence-based psychological tools and the core **CBT Thought & Mood Diary** with your Mindful Companion.
4. **Menu**: Account settings, crisis helplines (KIRAN, Tele-MANAS), data export, and offline backup.

---

### 2. Self Care Hub Architecture (Matching Native Screen)

Inside the **Self Care** tab:
1. **Header**: Centered "Self Care Library" title framed against midnight navy with subtle organic contoured wave graphics.
2. **Tile-Based Exercise Grid**:
   - **Tile 1: Breathing Exercises** (Dark teal/cyan card with calming wavy line art, duration indicator `5-10 mins`, and "Explore" action launching the 4-7-8 Somatic Breathing exercise).
   - **Tile 2: CBT Thought Diary** (Vibrant cyan/teal card featuring your companion avatar `Appu / Mayur / Sheru / Mithu`, Level & Streak indicator, and "Open Sanctuary" entering the focused CBT exercise).
   - **Tile 3: Assess Wellbeing** (Deep blue card with heart/vital symbol, clinical assessments PHQ-9 & GAD-7, and "Start Test").
   - **Tile 4: Cognitive Distortions Library** (Purple/indigo card with brain emblem, 10 classical thinking traps with Socratic reframing questions).
3. **Pet Companion Status Footer**:
   - Displays companion name, Level, Care Hearts, streak, and quick navigation into the CBT Sanctuary.

---

### 3. In-Exercise CBT Sanctuary & Diary Experience

When the user taps the **CBT Thought Diary** tile:
- **Sticky Breadcrumb Header**: Includes `← Self Care Library / CBT Diary` to easily return to the Self Care Hub at any point, alongside the companion indicator (`🐾 Appu Lv.3`), quick breathing reset, and sample data reset.
- **Contextual In-Exercise Sub-Navigation (Horizontal Pill Segmented Bar)**:
  - `[🏡 Sanctuary]`: Pet's habitat, emotional reflection, petting interaction, and quick therapy shortcuts.
  - `[💖 Moods]`: Emotional attunement feed, somatic sensations, and intensity metrics.
  - `[🧠 CBT Journal]`: 5-step cognitive restructuring records (Situation → NAT → Distortions → Evidence → Reframe → Relief Delta).
  - `[📈 7d Trends]`: Interactive Recharts 7-day mood trajectory with cyan area gradient and cognitive distortion distribution.
  - `[✨ My Pet]`: Evolution lineage tree, archetype customization, and personal CBT anchor mantra.

---

### 4. Mindful Pet Companion Gamification Mechanics (Indian / Desi Archetypes)

- **Indian / Desi Creature Archetypes**:
  - **Appu the Gentle Elephant (Gajraj / Haathi)**:
    - *Symbolism*: Represents *Buddhi* (Wisdom), *Dhriti* (Steadfast Patience), and deep emotional grounding.
    - *Visuals*: Auspicious *teeka* / sandalwood tilak on forehead, gentle rounded ears, and curved trunk.
    - *Voice*: Calming, grounding: *"Dost, like the sacred banyan tree, your roots are strong and steady."*
  - **Mayur the Radiant Peacock (Mor)**:
    - *Symbolism*: India's National Bird; symbol of emotional radiance, vigilance, and resilience (dancing through monsoon rains).
    - *Visuals*: Royal indigo & teal body, 3-plume feather crown (*Kalgi*), kohl-lined expressive eyes (*kajal*), and majestic fanned tail feathers with golden *chandrika* eye-spots.
    - *Voice*: Uplifting, artistic: *"Even when monsoon clouds gather, we can learn to dance in the rain, dost!"*
  - **Sheru the Royal Bengal Cub (Bagh)**:
    - *Symbolism*: Symbolizes *Dhairya* (Inner Courage), boundary-setting, and bravery against cognitive distortions.
    - *Visuals*: Haldi/saffron coat, natural trident (*Trishul*) forehead stripes, soft white cheek ruffs, and swishing tiger tail.
    - *Voice*: Protective, encouraging: *"You have great courage within you. Distorted thoughts are just shadows."*
  - **Mithu the Observant Parakeet (Tota / Shuka)**:
    - *Symbolism*: Classic Indian green rose-ringed parakeet; represents mindful awareness and questioning repeated automatic chatter.
    - *Visuals*: Vibrant green plumage, iconic rose-ring collar (*kanthi*), ruby-red curved hook beak, and curious tilted head.
    - *Voice*: Sharp, inquisitive: *"Mithu heard that thought! Is it 100% true, or is our mind just repeating an old tape, saathi?"*

- **Desi Aura Color Palettes**:
  - **Mayur Neel** (Peacock Teal): Royal contemplative calm.
  - **Genda Amber** (Marigold & Haldi): Warm festival cheer and mental illumination.
  - **Desi Gulabi** (Indian Rose): Tender self-compassion and heart healing.
  - **Kesar** (Kashmiri Saffron & Lotus): Meditative depth and serenity.
  - **Tulsi Sage** (Sacred Basil Green): Natural restorative harmony.

- **Therapeutic XP & Care Heart Nourishment**:
  - **Mood Check-in**: Awards +25 XP and +1 Care Heart for pausing to recognize emotional states.
  - **CBT Thought Restructuring**: Awards +60 XP and +3 Care Hearts ("Clarity Crystals") for reframing automatic negative thoughts.
  - **Guided Breathing**: Awards +20 XP and +2 Care Hearts for parasympathetic nervous system regulation.

- **Evolution Stages**:
  - **Stage 1 (Bal Roop / Playful Sprout, Lvl 1-2)**: Gentle and affectionate, with an auspicious subtle *teeka*.
  - **Stage 2 (Kishore Saathi / Curious Companion, Lvl 3-5)**: Adorned with a sacred fresh Marigold Flower Garland (*Genda Phool Mala*).
  - **Stage 3 (Maha Rakshak / Wise Guardian, Lvl 6+)**: Radiates an 8-petal Sacred Lotus Mandala halo and celestial golden lotus jewel.

---

### 5. State Management (`/src/context/DiaryContext.tsx`)

Backed by `localStorage` persistence with seed data:
- `moodEntries`: List of user mood check-ins.
- `thoughtRecords`: List of 5-column CBT thought challenges.
- `pet`: Companion state (name, archetype, colorTheme, level, xp, nextLevelXp, careHearts, streakDays, evolutionStage, favoriteQuote).
- `activeTab`: CBT exercise sub-navigation view selector.
- `petMoodExpression` & `petDialogue`: Dynamically computed from the user's latest emotional valence.
- Full sample dataset with 7-day realistic therapeutic progression and testing reset.
