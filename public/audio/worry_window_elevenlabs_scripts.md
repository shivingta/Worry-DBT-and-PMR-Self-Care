# Mannkaa Worry Window & Sorting — ElevenLabs Voice-Over Scripts & Generation Guide

This guide provides the exact scripts, voice configuration settings, and sequential generation instructions for producing professional therapeutic voice-overs for the **Mannkaa Worry Window & Sorting** tool using **ElevenLabs**.

---

## 1. Recommended ElevenLabs Voice Settings

| Parameter | Recommended Value | Rationale |
| :--- | :--- | :--- |
| **Voice Model** | `Eleven Multilingual v2` | Provides warm, natural breathing pauses and empathetic cadence |
| **Suggested Voice** | **"Charlotte"** (Meditative/Calm) or **"Callum"** (Grounded/Warm) or **"Aditi"** (South Asian Warm Cadence) | Soothing, non-judgmental, grounded clinical therapist tone |
| **Stability** | `70% - 75%` | Prevents emotional swings; maintains steady, calming, regulated breathing pace |
| **Clarity + Similarity** | `75% - 80%` | Crisp diction without synthetic artifacts |
| **Style Exaggeration** | `5% - 10%` | Keep low to avoid overly theatrical tone |
| **Pacing / Speed** | `0.88x - 0.92x` *(via ElevenLabs Reader or timeline slider)* | Slightly slower than conversational speech to cue parasympathetic relaxation |

---

## 2. Sequential Audio Tracks & Exact Scripts

### Track 01: `01_worry_capture_intro.mp3`
- **Context:** Plays when user opens Step 1 (Capture Concern)
- **Duration Target:** ~15–18 seconds
- **Script:**
> "Take a gentle breath in... and exhale slowly.  
> Right now, whatever thought is looping in your mind, give it permission to be put into words.  
> You don't need to solve it right now. Simply type what is weighing on you, and we will sort it together."

---

### Track 02: `02_worry_classify_prompt.mp3`
- **Context:** Plays when user progresses to Step 2 (Classify Control)
- **Duration Target:** ~18–22 seconds
- **Script:**
> "Notice this concern carefully.  
> Is this something within your direct control to act on today?  
> If yes, we'll assign one small five-minute micro-step.  
> If it is a hypothetical uncertainty or out of your hands, we will seal it away until your designated worry window."

---

### Track 03: `03_worry_vault_seal.mp3`
- **Context:** Plays when user reaches Step 3 (Secure in Vault)
- **Duration Target:** ~18–20 seconds
- **Script:**
> "Your worry is now ready to be put in a secure place.  
> Place your finger on the glowing dial handle on the right, and slowly turn it three hundred and sixty degrees clockwise.  
> Feel the weight leave your mind as the vault door seals shut."

---

### Track 04: `04_worry_sealed_affirmation.mp3`
- **Context:** Plays immediately when the vault locks (vaultAnimPhase === 'locked')
- **Duration Target:** ~14–16 seconds
- **Script:**
> "The vault is now locked.  
> Your mind is free to return to what matters right now.  
> If this thought returns today, gently remind yourself: it is safely secured, and you will give it your full attention during your worry window."

---

## 3. How to Generate in ElevenLabs (Step-by-Step)

1. **Log in** to your ElevenLabs dashboard ([elevenlabs.io](https://elevenlabs.io)).
2. Navigate to **Speech Synthesis / Text to Speech**.
3. Select **Voice**: Choose **Charlotte** or **Aditi** (or your preferred therapist voice).
4. Set **Model**: `Eleven Multilingual v2`.
5. Under **Voice Settings**:
   - Stability: **72%**
   - Similarity: **78%**
   - Style Exaggeration: **8%**
6. Copy and paste each track's script individually into the text box.
7. Click **Generate Speech**, listen to verify the gentle pacing, then click **Download**.
8. Rename the downloaded files exactly as:
   - `01_worry_capture_intro.mp3`
   - `02_worry_classify_prompt.mp3`
   - `03_worry_vault_seal.mp3`
   - `04_worry_sealed_affirmation.mp3`
9. Place the files in this project's `/public/audio/` directory. They will automatically be detected and played by the audio engine!
