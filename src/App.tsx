/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Mannkaa Self-Care Suite
 * Evidence-informed digital therapeutics platform
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  ChevronRight,
  ChevronLeft,
  X,
  MessageCircle,
  Laptop,
  Smartphone,
  Check,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Clock,
  CheckCircle2,
  ChevronDown,
  Compass,
  Lock,
  Trash2,
  Zap,
  ArrowRight,
  Calendar,
  Flower2,
  Waves
} from 'lucide-react';
import { MechanicalVaultVisualizer, VaultAnimPhase } from './components/MechanicalVaultVisualizer';
import { SelfCareHub } from './components/SelfCareHub';
import { WorryResolutionModal, ResolutionWorry } from './components/WorryResolutionModal';
import { ThoughtRecordForm } from './components/ThoughtRecordForm';

// --- TYPES ---
type ViewportMode = 'web' | 'mobile';
type PmrStep = 'pre_checkin' | 'active_player' | 'recalibration';
type PmrPhase = 'tense' | 'release';
type PmrPreset = '5min' | '10min' | '15min';

interface MuscleRegion {
  id: string;
  name: string;
  tensePrompt: string;
  releasePrompt: string;
  softenPrompt: string;
}

interface ParkedWorry {
  id: string;
  text: string;
  type: 'actionable' | 'hypothetical';
  actionStep?: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  resolutionType?: 'micro_action' | 'cbt_reframe' | 'shredded';
  cbtReframe?: {
    balancedThought: string;
    distortion?: string;
    completedAt: string;
  };
}

const MUSCLE_REGIONS: MuscleRegion[] = [
  {
    id: 'face',
    name: 'Face, Forehead & Jaw',
    tensePrompt: 'Scrunch your forehead, squeeze your eyes shut, and gently clench your teeth. Notice the tension...',
    releasePrompt: 'Release completely. Feel your brow smooth out, jaw hang slack, and tongue rest gently at the floor of your mouth.',
    softenPrompt: 'Bring warm awareness to your brow and jaw. Breathe into any tightness and invite the muscles to melt and unclench.'
  },
  {
    id: 'shoulders',
    name: 'Shoulders & Neck',
    tensePrompt: 'Shrug your shoulders up toward your ears, tightening the neck and traps firmly. Hold the tension...',
    releasePrompt: 'Drop your shoulders down and away. Feel the heavy burden dissolve into warm ease and space in your neck.',
    softenPrompt: 'Drop your shoulders down. Imagine a warm, soothing stream of light melting through your neck and upper back.'
  },
  {
    id: 'chest',
    name: 'Chest & Upper Back',
    tensePrompt: 'Take a deep breath and hold, drawing your shoulder blades slightly backward. Feel the tight compression...',
    releasePrompt: 'Exhale smoothly. Let the chest cavity soften and expand without effort. Feel the heart space open.',
    softenPrompt: 'Allow your breath to expand the chest gently. With every exhale, feel your thoracic spine soften and rest.'
  },
  {
    id: 'arms',
    name: 'Arms & Hands',
    tensePrompt: 'Clench both hands into firm fists and tense your forearms and biceps. Feel the accumulated energy...',
    releasePrompt: 'Open your fingers wide, then let them curl naturally. Notice the tingling sensation of warmth in your palms.',
    softenPrompt: 'Unfurl your palms. Let your hands lie completely open and soft, feeling gravity support every finger.'
  },
  {
    id: 'abdomen',
    name: 'Abdomen & Core',
    tensePrompt: 'Tighten your abdominal wall as if bracing your center. Notice how restricted it feels...',
    releasePrompt: 'Release your belly completely. Allow your stomach to soften like a warm balloon, breathing deep into your core.',
    softenPrompt: 'Breathe softly into the pit of your stomach. Allow your belly to rise effortlessly, easing any somatic knots.'
  },
  {
    id: 'legs',
    name: 'Thighs & Calves',
    tensePrompt: 'Squeeze your thighs together and flex your calf muscles firmly. Hold the dense muscular contraction...',
    releasePrompt: 'Release all effort. Let your heavy legs sink into the seat or floor, completely supported and at rest.',
    softenPrompt: 'Invite a wave of relaxation to cascade from your hips down through your knees, letting your legs rest heavily.'
  },
  {
    id: 'feet',
    name: 'Feet & Toes',
    tensePrompt: 'Curl your toes tightly downward toward your soles, arching the feet firmly. Feel the tautness...',
    releasePrompt: 'Release your toes. Feel a gentle sensation of lightness and grounding spread from your heels to the tips of your toes.',
    softenPrompt: 'Notice the contact of your feet against the earth. Release any micro-gripping and allow total stability.'
  }
];

const WORRY_CAPTURE_CHIPS = [
  'What if I blank out during my presentation tomorrow?',
  'I am falling behind on internship applications this week',
  'What if my lab group misses Friday’s submission deadline?'
];

const MICRO_STEP_CHIPS = [
  'Outline 3 key bullet points',
  'Send 1 quick email to advisor',
  'Review 1 practice problem'
];

// --- AMBIENT SOUND, BROWN NOISE & FREQUENCY SYNTHESIZER ---
class WellnessAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneOsc: OscillatorNode | null = null;
  private overtoneOsc: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private brownNoiseNode: AudioBufferSourceNode | null = null;
  private brownNoiseGain: GainNode | null = null;
  private isDroneRunning = false;
  private isBrownNoiseRunning = false;

  initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setVolume(level: number) {
    this.initContext();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, level)), this.ctx.currentTime);
    }
  }

  playTone(freq = 432, duration = 1.2, type: OscillatorType = 'sine', gainVal = 0.12) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {}
  }

  playSubBassDrop() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(36, this.ctx.currentTime + 1.2);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 1.5);
    } catch {}
  }

  startBrownNoise() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isBrownNoiseRunning) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      const bufferSize = this.ctx.sampleRate * 3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 2.8;
      }

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.16, this.ctx.currentTime + 1.0);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      source.start();

      this.brownNoiseNode = source;
      this.brownNoiseGain = gain;
      this.isBrownNoiseRunning = true;
    } catch {}
  }

  stopBrownNoise() {
    if (this.ctx && this.brownNoiseGain) {
      try {
        this.brownNoiseGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);
        setTimeout(() => {
          if (this.brownNoiseNode) {
            try {
              this.brownNoiseNode.stop();
              this.brownNoiseNode.disconnect();
            } catch {}
            this.brownNoiseNode = null;
          }
          this.isBrownNoiseRunning = false;
        }, 420);
      } catch {
        this.isBrownNoiseRunning = false;
      }
    }
  }

  startAmbientDrone(freq = 108) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isDroneRunning) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      this.droneOsc = this.ctx.createOscillator();
      this.overtoneOsc = this.ctx.createOscillator();
      this.droneGain = this.ctx.createGain();

      this.droneOsc.type = 'sine';
      this.droneOsc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      this.overtoneOsc.type = 'sine';
      this.overtoneOsc.frequency.setValueAtTime(freq * 2, this.ctx.currentTime);

      this.droneGain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      this.droneGain.gain.exponentialRampToValueAtTime(0.14, this.ctx.currentTime + 1.8);

      this.droneOsc.connect(this.droneGain);
      this.overtoneOsc.connect(this.droneGain);
      this.droneGain.connect(this.masterGain);

      this.droneOsc.start();
      this.overtoneOsc.start();
      this.isDroneRunning = true;
    } catch {}
  }

  stopAmbientDrone() {
    if (this.ctx && this.droneGain) {
      try {
        this.droneGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
        setTimeout(() => {
          if (this.droneOsc) {
            try {
              this.droneOsc.stop();
              this.droneOsc.disconnect();
            } catch {}
            this.droneOsc = null;
          }
          if (this.overtoneOsc) {
            try {
              this.overtoneOsc.stop();
              this.overtoneOsc.disconnect();
            } catch {}
            this.overtoneOsc = null;
          }
          this.isDroneRunning = false;
        }, 500);
      } catch {
        this.isDroneRunning = false;
      }
    }
  }

  playPhaseCue(type: 'tense' | 'release' | 'complete') {
    if (type === 'tense') {
      this.playTone(396, 1.2, 'sine', 0.12);
    } else if (type === 'release') {
      this.playTone(528, 1.8, 'triangle', 0.14);
    } else {
      this.playTone(639, 2.5, 'sine', 0.16);
    }
  }

  playTumblerClick(freq = 840) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {}
  }

  playVaultLockSequence() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      const now = this.ctx.currentTime;

      const bufferSize = Math.floor(this.ctx.sampleRate * 0.3);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(2200, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(320, now + 0.28);
      noiseFilter.Q.setValueAtTime(3.0, now);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.2, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      whiteNoise.start(now);
      whiteNoise.stop(now + 0.3);

      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(95, now + 0.06);
      subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.6);
      subGain.gain.setValueAtTime(0.48, now + 0.06);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
      subOsc.connect(subGain);
      subGain.connect(this.masterGain);
      subOsc.start(now + 0.06);
      subOsc.stop(now + 0.65);

      const metalOsc = this.ctx.createOscillator();
      const metalGain = this.ctx.createGain();
      metalOsc.type = 'triangle';
      metalOsc.frequency.setValueAtTime(440, now + 0.07);
      metalOsc.frequency.exponentialRampToValueAtTime(90, now + 0.35);
      metalGain.gain.setValueAtTime(0.38, now + 0.07);
      metalGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
      metalOsc.connect(metalGain);
      metalGain.connect(this.masterGain);
      metalOsc.start(now + 0.07);
      metalOsc.stop(now + 0.38);

      const harmonics = [
        { freq: 528, gain: 0.24, decay: 2.8 },
        { freq: 396, gain: 0.16, decay: 3.0 },
        { freq: 1056, gain: 0.08, decay: 2.0 }
      ];
      harmonics.forEach(({ freq, gain: initGain, decay }) => {
        const toneOsc = this.ctx!.createOscillator();
        const toneGain = this.ctx!.createGain();
        toneOsc.type = 'sine';
        toneOsc.frequency.setValueAtTime(freq, now + 0.2);
        toneGain.gain.setValueAtTime(initGain, now + 0.2);
        toneGain.gain.exponentialRampToValueAtTime(0.0001, now + decay);
        toneOsc.connect(toneGain);
        toneGain.connect(this.masterGain!);
        toneOsc.start(now + 0.2);
        toneOsc.stop(now + decay);
      });
    } catch {}
  }

  playPaperShredSound() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 1.4);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * (0.5 + 0.5 * Math.sin(i / 150));
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(2200, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(750, now + 1.4);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.18, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      whiteNoise.start(now);
      whiteNoise.stop(now + 1.4);
    } catch {}
  }
}

const audioEngine = new WellnessAudioEngine();

export default function App() {
  // Navigation & Viewport State
  const [viewport, setViewport] = useState<ViewportMode>('web');
  const [activeNav, setActiveNav] = useState<string>('Self Care');
  const [activeDropdown, setActiveDropdown] = useState<'clinical' | 'other' | null>(null);

  // Active Tool Modals (The 3 Prototype Tools)
  const [isDbtStopOpen, setIsDbtStopOpen] = useState<boolean>(false);
  const [isPmrOpen, setIsPmrOpen] = useState<boolean>(false);
  const [isWorryOpen, setIsWorryOpen] = useState<boolean>(false);
  const [showWhatsAppChat, setShowWhatsAppChat] = useState<boolean>(false);

  // Audio & Haptics
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hapticTrigger, setHapticTrigger] = useState<boolean>(false);
  const [brownNoiseActive, setBrownNoiseActive] = useState<boolean>(false);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'care' | 'user'; text: string; time: string }[]>([
    {
      sender: 'care',
      text: 'Namaste! Welcome to Mannkaa Care Support. Our wellness counsellors are here if you need a grounded space.',
      time: 'Just now'
    }
  ]);

  // --- PMR STATE ---
  const [pmrStep, setPmrStep] = useState<PmrStep>('pre_checkin');
  const [preTension, setPreTension] = useState<number>(7);
  const [postTension, setPostTension] = useState<number>(3);
  const [selectedPreset, setSelectedPreset] = useState<PmrPreset>('5min');
  const [releaseOnlyMode, setReleaseOnlyMode] = useState<boolean>(false);
  const [audioTrackMode, setAudioTrackMode] = useState<'voice' | 'ambient'>('voice');
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(36);
  const [audioDuration, setAudioDuration] = useState<number>(132);
  const [activeRegionIndex, setActiveRegionIndex] = useState<number>(0);
  const [currentPhase, setCurrentPhase] = useState<PmrPhase>('tense');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(6);
  const [isPlayerPlaying, setIsPlayerPlaying] = useState<boolean>(true);
  const [audioVolume, setAudioVolume] = useState<number>(0.75);
  const [savedNotesToast, setSavedNotesToast] = useState<boolean>(false);

  // --- DBT STOP: BULLET-TIME FREEZE STATE ENGINE ---
  const [bulletState, setBulletState] = useState<number>(0);
  const [eBrakeProgress, setEBrakeProgress] = useState<number>(0);
  const [isEBrakePressed, setIsEBrakePressed] = useState<boolean>(false);
  const [spotlightNodesRevealed, setSpotlightNodesRevealed] = useState<string[]>([]);
  const [railSwitchPosition, setRailSwitchPosition] = useState<'A' | 'B'>('A');

  // --- WORRY WINDOW & SORTING STATE ---
  const [worryFlowStep, setWorryFlowStep] = useState<'triage' | 'vault'>('triage');
  const [worryStep, setWorryStep] = useState<1 | 2 | 3>(1);
  const [worryInput, setWorryInput] = useState<string>('');
  const [worryTriageChoice, setWorryTriageChoice] = useState<'actionable' | 'hypothetical' | null>(null);
  const [actionStepInput, setActionStepInput] = useState<string>('');
  const [worryWindowTime, setWorryWindowTime] = useState<string>('17:30');
  const [vaultAnimPhase, setVaultAnimPhase] = useState<VaultAnimPhase>('ready');
  const [mobileVaultTab, setMobileVaultTab] = useState<'all' | 'actionable' | 'hypothetical'>('all');
  const [showResolvedDrawer, setShowResolvedDrawer] = useState<boolean>(false);
  const [shreddedCount, setShreddedCount] = useState<number>(2);
  const [shredToast, setShredToast] = useState<string | null>(null);
  const [parkedWorries, setParkedWorries] = useState<ParkedWorry[]>([
    {
      id: 'w-1',
      text: 'What if I forget the formulas during my thermodynamics midterm?',
      type: 'hypothetical',
      timestamp: 'Today, 11:20 AM',
      resolved: false
    },
    {
      id: 'w-2',
      text: 'Need to submit internship documentation before Friday deadline',
      type: 'actionable',
      actionStep: 'Draft email to career advisor with scanned transcripts',
      timestamp: 'Today, 2:15 PM',
      resolved: false
    }
  ]);

  // Worry Window 15-Minute Timer & Clinical Metrics State
  const [worryWindowTimerActive, setWorryWindowTimerActive] = useState<boolean>(false);
  const [worryWindowSecondsLeft, setWorryWindowSecondsLeft] = useState<number>(900);
  const [wasTimerRunningBeforeCbt, setWasTimerRunningBeforeCbt] = useState<boolean>(false);
  const [vaultStreak] = useState<number>(5);
  const [minutesSavedTotal, setMinutesSavedTotal] = useState<number>(125);
  const [activeReviewWorry, setActiveReviewWorry] = useState<ParkedWorry | null>(null);
  const [isCbtReframeActive, setIsCbtReframeActive] = useState<boolean>(false);
  const [cbtReframeWorryId, setCbtReframeWorryId] = useState<string | null>(null);

  // Stop brown noise whenever Worry modal closes
  useEffect(() => {
    if (!isWorryOpen && brownNoiseActive) {
      audioEngine.stopBrownNoise();
      setBrownNoiseActive(false);
    }
  }, [isWorryOpen, brownNoiseActive]);

  const toggleBrownNoise = () => {
    triggerHaptic();
    if (brownNoiseActive) {
      audioEngine.stopBrownNoise();
      setBrownNoiseActive(false);
    } else {
      if (!soundEnabled) setSoundEnabled(true);
      audioEngine.startBrownNoise();
      setBrownNoiseActive(true);
    }
  };

  // 15-Minute Window Countdown Timer Effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (worryWindowTimerActive && worryWindowSecondsLeft > 0) {
      interval = setInterval(() => {
        setWorryWindowSecondsLeft((prev) => {
          if (prev <= 1) {
            setWorryWindowTimerActive(false);
            if (soundEnabled) audioEngine.playPhaseCue('complete');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [worryWindowTimerActive, worryWindowSecondsLeft, soundEnabled]);

  const handleStartWorryTimer = () => {
    triggerHaptic();
    if (worryWindowSecondsLeft === 0) {
      setWorryWindowSecondsLeft(900);
    }
    setWorryWindowTimerActive((prev) => !prev);
  };

  const handleExecuteMicroAction = (worryId: string) => {
    triggerHaptic();
    if (soundEnabled) audioEngine.playTone(528, 0.8, 'sine', 0.12);
    setParkedWorries((prev) =>
      prev.map((w) =>
        w.id === worryId
          ? {
              ...w,
              resolved: true,
              resolutionType: 'micro_action',
              resolvedAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          : w
      )
    );
    setMinutesSavedTotal((prev) => prev + 15);
  };

  const handleStartCbtReframe = (worry: ResolutionWorry) => {
    triggerHaptic();
    setWasTimerRunningBeforeCbt(worryWindowTimerActive);
    setWorryWindowTimerActive(false);
    setActiveReviewWorry(null);
    setCbtReframeWorryId(worry.id);
    setIsCbtReframeActive(true);
  };

  const handleCompleteCbtReframe = (reframe: { balancedThought: string; distortion?: string }) => {
    triggerHaptic();
    if (soundEnabled) audioEngine.playPhaseCue('complete');
    if (cbtReframeWorryId) {
      setParkedWorries((prev) =>
        prev.map((w) =>
          w.id === cbtReframeWorryId
            ? {
                ...w,
                resolved: true,
                resolutionType: 'cbt_reframe',
                cbtReframe: {
                  balancedThought: reframe.balancedThought,
                  distortion: reframe.distortion,
                  completedAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              }
            : w
        )
      );
      setMinutesSavedTotal((prev) => prev + 25);
    }
    setIsCbtReframeActive(false);
    setCbtReframeWorryId(null);
    setIsWorryOpen(true);
    setWorryFlowStep('vault');
    if (wasTimerRunningBeforeCbt && worryWindowSecondsLeft > 0) {
      setWorryWindowTimerActive(true);
    }
  };

  const handleShredWorry = (worryId: string) => {
    triggerHaptic();
    if (soundEnabled) audioEngine.playPaperShredSound();
    setParkedWorries((prev) => prev.filter((w) => w.id !== worryId));
    setShreddedCount((prev) => prev + 1);
    setMinutesSavedTotal((prev) => prev + 25);
    setShredToast('Loop shredded & released. Mental bandwidth reclaimed.');
    setTimeout(() => setShredToast(null), 3500);
  };

  const formatAudioTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const triggerHaptic = () => {
    setHapticTrigger(true);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {}
    }
    setTimeout(() => setHapticTrigger(false), 220);
  };

  const activeRegions = selectedPreset === '5min' ? MUSCLE_REGIONS.slice(0, 4) : MUSCLE_REGIONS;
  const currentRegion = activeRegions[activeRegionIndex] || activeRegions[0];

  // Sync Volume
  useEffect(() => {
    if (voiceAudioRef.current) {
      voiceAudioRef.current.volume = soundEnabled ? audioVolume : 0;
    }
    audioEngine.setVolume(soundEnabled ? audioVolume : 0);
  }, [audioVolume, soundEnabled]);

  const handleVoiceTimeUpdate = () => {
    if (!voiceAudioRef.current) return;
    const t = voiceAudioRef.current.currentTime;
    setAudioCurrentTime(Math.floor(t));
    if (voiceAudioRef.current.duration && !isNaN(voiceAudioRef.current.duration)) {
      setAudioDuration(Math.floor(voiceAudioRef.current.duration));
    }
  };

  // Synchronize PMR Audio Track with State
  useEffect(() => {
    if (!isPmrOpen || pmrStep !== 'active_player') {
      voiceAudioRef.current?.pause();
      audioEngine.stopAmbientDrone();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    if (isPlayerPlaying && soundEnabled) {
      audioEngine.initContext();
      if (audioTrackMode === 'voice') {
        audioEngine.stopAmbientDrone();
        if (voiceAudioRef.current) {
          voiceAudioRef.current.play().catch(() => {});
        }
      } else if (audioTrackMode === 'ambient') {
        voiceAudioRef.current?.pause();
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        audioEngine.startAmbientDrone();
      }
    } else {
      voiceAudioRef.current?.pause();
      audioEngine.stopAmbientDrone();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isPmrOpen, pmrStep, isPlayerPlaying, soundEnabled, audioTrackMode]);

  // Guided Voice Narration for PMR
  useEffect(() => {
    if (!isPmrOpen || pmrStep !== 'active_player' || !isPlayerPlaying || !soundEnabled || audioTrackMode !== 'voice') {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    const textToNarrate =
      releaseOnlyMode && currentPhase === 'tense'
        ? `${currentRegion.name}. ${currentRegion.softenPrompt}`
        : currentPhase === 'tense'
        ? `${currentRegion.name}. ${currentRegion.tensePrompt}`
        : `Release. ${currentRegion.releasePrompt}`;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToNarrate);
      utterance.rate = 0.88;
      utterance.pitch = 0.95;
      utterance.volume = audioVolume;

      try {
        const voices = window.speechSynthesis.getVoices();
        const calmVoice = voices.find(
          (v) =>
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Samantha') ||
              v.name.includes('Serena') ||
              v.lang.startsWith('en')) &&
            !v.name.includes('Bad')
        );
        if (calmVoice) utterance.voice = calmVoice;
      } catch {}

      window.speechSynthesis.speak(utterance);
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [
    isPmrOpen,
    pmrStep,
    isPlayerPlaying,
    soundEnabled,
    audioTrackMode,
    currentPhase,
    activeRegionIndex,
    releaseOnlyMode,
    currentRegion,
    audioVolume
  ]);

  // PMR Active Timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isPmrOpen && pmrStep === 'active_player' && isPlayerPlaying) {
      timer = setInterval(() => {
        setPhaseSecondsLeft((prev) => {
          if (prev <= 1) {
            if (currentPhase === 'tense') {
              setCurrentPhase('release');
              triggerHaptic();
              if (soundEnabled) audioEngine.playPhaseCue('release');
              return 12;
            } else {
              if (activeRegionIndex < activeRegions.length - 1) {
                setActiveRegionIndex((r) => r + 1);
                setCurrentPhase('tense');
                triggerHaptic();
                if (soundEnabled) audioEngine.playPhaseCue('tense');
                return 6;
              } else {
                audioEngine.stopAmbientDrone();
                voiceAudioRef.current?.pause();
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                if (soundEnabled) audioEngine.playPhaseCue('complete');
                setPmrStep('recalibration');
                return 0;
              }
            }
          }
          return prev - 1;
        });

        if (audioTrackMode === 'ambient') {
          setAudioCurrentTime((prev) => (prev >= audioDuration ? 0 : prev + 1));
        }
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [
    isPmrOpen,
    pmrStep,
    isPlayerPlaying,
    audioTrackMode,
    currentPhase,
    activeRegionIndex,
    activeRegions.length,
    soundEnabled,
    audioDuration
  ]);

  // DBT STOP: Bullet-Time Press & Hold E-Brake Timer (Both Mobile & Web)
  useEffect(() => {
    let holdInterval: ReturnType<typeof setInterval> | null = null;
    if (isDbtStopOpen && bulletState === 1 && isEBrakePressed) {
      holdInterval = setInterval(() => {
        setEBrakeProgress((prev) => {
          if (prev >= 100) {
            setIsEBrakePressed(false);
            if (soundEnabled) audioEngine.playTone(528, 1.4, 'triangle', 0.12);
            triggerHaptic();
            setBulletState(2);
            return 100;
          }
          if (soundEnabled && prev % 16 === 0) {
            audioEngine.playTumblerClick(620 - prev * 3.5);
          }
          return prev + 4;
        });
      }, 100);
    } else if (!isEBrakePressed && bulletState === 1) {
      setEBrakeProgress(0);
    }
    return () => {
      if (holdInterval) clearInterval(holdInterval);
    };
  }, [isDbtStopOpen, bulletState, isEBrakePressed, soundEnabled]);

  // PMR Handlers
  const handleStartPmr = () => {
    triggerHaptic();
    audioEngine.initContext();
    setActiveRegionIndex(0);
    setCurrentPhase('tense');
    setPhaseSecondsLeft(6);
    setIsPlayerPlaying(true);
    setPmrStep('active_player');
    if (soundEnabled) {
      audioEngine.playPhaseCue('tense');
      if (audioTrackMode === 'voice' && voiceAudioRef.current) {
        voiceAudioRef.current.currentTime = 0;
        voiceAudioRef.current.play().catch(() => {});
      } else if (audioTrackMode === 'ambient') {
        audioEngine.startAmbientDrone();
      }
    }
  };

  const handleNextRegion = () => {
    triggerHaptic();
    if (activeRegionIndex < activeRegions.length - 1) {
      setActiveRegionIndex((i) => i + 1);
      setCurrentPhase('tense');
      setPhaseSecondsLeft(6);
      if (soundEnabled) audioEngine.playPhaseCue('tense');
    } else {
      audioEngine.stopAmbientDrone();
      voiceAudioRef.current?.pause();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (soundEnabled) audioEngine.playPhaseCue('complete');
      setPmrStep('recalibration');
    }
  };

  const handlePrevRegion = () => {
    triggerHaptic();
    if (activeRegionIndex > 0) {
      setActiveRegionIndex((i) => i - 1);
      setCurrentPhase('tense');
      setPhaseSecondsLeft(6);
      if (soundEnabled) audioEngine.playPhaseCue('tense');
    }
  };

  const handleSavePmrRecord = () => {
    triggerHaptic();
    setSavedNotesToast(true);
    voiceAudioRef.current?.pause();
    audioEngine.stopAmbientDrone();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (soundEnabled) audioEngine.playPhaseCue('complete');
    setTimeout(() => {
      setSavedNotesToast(false);
      setIsPmrOpen(false);
      setPmrStep('pre_checkin');
    }, 1100);
  };

  // Worry Vault Handlers
  const handleTriggerVaultLock = () => {
    triggerHaptic();
    setVaultAnimPhase('tumbling');
    audioEngine.initContext();
    audioEngine.playVaultLockSequence();

    const textToLock = worryInput.trim() || 'Mindful Reflection';
    const choiceToLock = worryTriageChoice || 'hypothetical';

    const newWorry: ParkedWorry = {
      id: 'w-' + Date.now(),
      text: textToLock,
      type: choiceToLock,
      actionStep:
        choiceToLock === 'actionable' ? actionStepInput.trim() || 'Review during scheduled window' : undefined,
      timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      resolved: false
    };

    setTimeout(() => {
      setVaultAnimPhase('locked');
      triggerHaptic();
      setParkedWorries((prev) => [newWorry, ...prev]);
    }, 160);
  };

  const toggleWorryResolved = (id: string) => {
    triggerHaptic();
    if (soundEnabled) audioEngine.playTone(639, 0.8, 'sine', 0.07);
    setParkedWorries((prev) => prev.map((w) => (w.id === id ? { ...w, resolved: !w.resolved } : w)));
  };

  const deleteWorry = (id: string) => {
    triggerHaptic();
    setParkedWorries((prev) => prev.filter((w) => w.id !== id));
  };

  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdown(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Derived Worry Lists (Active sorted first, resolved grouped cleanly)
  const activeWorries = parkedWorries.filter((w) => !w.resolved);
  const resolvedWorries = parkedWorries.filter((w) => w.resolved);
  const timerProgressPct = Math.max(0, Math.min(100, (worryWindowSecondsLeft / 900) * 100));

  return (
    <div className="min-h-screen bg-[#041B2D] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-teal-500/30 selection:text-teal-200 relative antialiased">
      <audio
        ref={voiceAudioRef}
        src="/audio/pmr_5min.mp3"
        preload="auto"
        loop
        onTimeUpdate={handleVoiceTimeUpdate}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (d && !isNaN(d)) setAudioDuration(Math.round(d));
        }}
      />

      {/* ========================================================= */}
      {/* 1. TOP NAVIGATION BAR                                     */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 text-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <div
              onClick={() => {
                setIsDbtStopOpen(false);
                setIsPmrOpen(false);
                setIsWorryOpen(false);
              }}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#00A884]/15 border border-[#00A884]/40 flex items-center justify-center text-[#00A884] shadow-xs group-hover:scale-105 transition-transform duration-300">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-[#0F2942] group-hover:text-teal-800 transition-colors">
                Mannkaa
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-8 ml-10 text-sm font-medium text-slate-500">
              <button
                onClick={() => setActiveNav('Dashboard')}
                className={`transition-colors whitespace-nowrap hover:text-slate-900 ${
                  activeNav === 'Dashboard' ? 'text-[#00A884] font-semibold' : ''
                }`}
              >
                Dashboard
              </button>

              <button
                onClick={() => setActiveNav('My Appointments')}
                className={`transition-colors whitespace-nowrap hover:text-slate-900 ${
                  activeNav === 'My Appointments' ? 'text-[#00A884] font-semibold' : ''
                }`}
              >
                My Appointments
              </button>

              <button
                onClick={() => setActiveNav('Self Care')}
                className="relative text-[#00A884] font-bold whitespace-nowrap py-5"
              >
                Self Care
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00A884] rounded-t-sm" />
              </button>

              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'clinical' ? null : 'clinical')}
                  className="flex items-center gap-1 hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <span>Clinical Information</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
                {activeDropdown === 'clinical' && (
                  <div className="absolute left-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                    <button
                      onClick={() => setActiveDropdown(null)}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                    >
                      <span>Care Assessment Summary</span>
                      <span className="text-[10px] bg-teal-50 text-[#00A884] px-1.5 py-0.5 rounded font-mono">
                        PHQ-9
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveDropdown(null)}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Somatic Tension Journal
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-100 p-1 flex items-center gap-1">
              <button
                onClick={() => setViewport('web')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewport === 'web'
                    ? 'bg-white shadow-xs text-[#0F2942]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Web View</span>
              </button>
              <button
                onClick={() => setViewport('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewport === 'mobile'
                    ? 'bg-[#00A884] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile App</span>
              </button>
            </div>

            <button
              onClick={() => setShowWhatsAppChat((v) => !v)}
              className="w-9 h-9 rounded-full bg-[#00A884]/15 hover:bg-[#00A884]/25 text-[#00A884] flex items-center justify-center transition-colors relative cursor-pointer"
              title="Mannkaa Care Concierge"
            >
              <MessageCircle className="w-4.5 h-4.5 fill-current" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#25D366] rounded-full border-2 border-white" />
            </button>

            <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 ring-2 ring-[#00A884]/30 cursor-pointer shadow-xs">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="User Profile"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN CANVAS VIEWPORT (WEB VS MOBILE)                   */}
      {/* ========================================================= */}
      <main className="flex-1 flex flex-col justify-start items-center relative overflow-x-hidden">
        {viewport === 'web' ? (
          /* ======================================================= */
          /* WEB VIEWPORT CANVAS                                     */
          /* ======================================================= */
          <div className="w-full max-w-[500px] mx-auto pt-8 pb-16 px-4 animate-fadeIn">
            <SelfCareHub
              onOpenDbtStop={() => {
                triggerHaptic();
                setBulletState(0);
                setEBrakeProgress(0);
                setIsEBrakePressed(false);
                setSpotlightNodesRevealed([]);
                setRailSwitchPosition('A');
                setIsDbtStopOpen(true);
                if (soundEnabled) audioEngine.playSubBassDrop();
              }}
              onOpenPmr={() => {
                triggerHaptic();
                setPmrStep('pre_checkin');
                setIsPmrOpen(true);
              }}
              onOpenWorryWindow={(mode) => {
                triggerHaptic();
                setWorryFlowStep(mode || 'triage');
                setIsWorryOpen(true);
                if (soundEnabled) audioEngine.playTone(432, 1.0, 'sine', 0.08);
              }}
            />
          </div>
        ) : (
          /* ======================================================= */
          /* MOBILE VIEWPORT CANVAS (HANDHELD IPHONE 15 FRAME)       */
          /* ======================================================= */
          <div className="w-full flex flex-col items-center py-8 px-4">
            <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#081E2E] border border-[#1A4666] text-xs text-slate-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#00A884] animate-pulse" />
              <span>HANDHELD MOBILE PROTOTYPE (iPhone 15 / 393px)</span>
            </div>

            <div
              className={`w-[393px] max-w-[94vw] h-[844px] bg-[#001724] rounded-[50px] border-[8px] border-[#002d3f] shadow-2xl overflow-hidden flex flex-col relative text-white ${
                hapticTrigger ? 'scale-[0.995] transition-transform' : ''
              }`}
            >
              {/* iPhone Dynamic Island & Status Bar */}
              <div className="h-11 w-full bg-[#001724] shrink-0 px-7 flex items-center justify-between text-white text-xs select-none z-30 pt-1">
                <span className="font-semibold text-xs tracking-tight">7:12</span>
                <div className="w-28 h-7 bg-black rounded-full flex items-center justify-center px-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold">5G</span>
                  <div className="w-5 h-2.5 border border-white/70 rounded-xs p-0.5 flex items-center">
                    <div className="w-full h-full bg-white rounded-xs" />
                  </div>
                </div>
              </div>

              {/* Mobile View Screen Router */}
              {isWorryOpen ? (
                /* ======================================================= */
                /* MOBILE SCREEN: WORRY WINDOW & SORTING                   */
                /* ======================================================= */
                <div className="flex-1 flex flex-col bg-[#001724] text-white overflow-hidden animate-in fade-in">
                  <div className="px-3.5 py-2.5 border-b border-[#00344d] flex items-center justify-between shrink-0 bg-[#001724] gap-1.5">
                    <button
                      onClick={() => {
                        triggerHaptic();
                        setIsWorryOpen(false);
                      }}
                      className="flex items-center gap-0.5 text-xs font-bold text-[#26c6da] hover:text-white transition-colors cursor-pointer py-1 shrink-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Library</span>
                    </button>

                    <div className="flex items-center gap-1 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#26c6da] animate-pulse shrink-0" />
                      <span className="text-[11px] font-extrabold text-white truncate">Worry Window</span>
                    </div>

                    <div className="flex items-center bg-[#00121d] border border-[#00344d] rounded-xl p-0.5 text-[10px] font-semibold shrink-0">
                      <button
                        onClick={() => {
                          triggerHaptic();
                          setWorryFlowStep('triage');
                        }}
                        className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                          worryFlowStep === 'triage'
                            ? 'bg-[#26c6da] text-[#001724] font-extrabold shadow-xs'
                            : 'text-[#93c5d6] hover:text-white'
                        }`}
                      >
                        ✍️ Triage
                      </button>
                      <button
                        onClick={() => {
                          triggerHaptic();
                          setWorryFlowStep('vault');
                        }}
                        className={`px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                          worryFlowStep === 'vault'
                            ? 'bg-[#26c6da] text-[#001724] font-extrabold shadow-xs'
                            : 'text-[#93c5d6] hover:text-white'
                        }`}
                      >
                        <Lock className="w-2.5 h-2.5" />
                        <span>Vault ({activeWorries.length})</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {worryFlowStep === 'triage' ? (
                      <div className="space-y-4 text-left animate-in fade-in">
                        {/* Step Pipeline */}
                        <div className="relative px-3 pt-2.5 pb-3 mb-2 bg-[#001420]/80 border border-[#002b3d] rounded-2xl backdrop-blur-sm">
                          <div className="absolute top-[26px] left-9 right-9 h-1 bg-[#002233] rounded-full z-0 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#10b981] via-[#26c6da] to-[#26c6da] transition-all duration-500 ease-out"
                              style={{
                                width: worryStep === 1 ? '0%' : worryStep === 2 ? '50%' : '100%'
                              }}
                            />
                          </div>

                          <div className="relative flex items-center justify-between z-10">
                            {[
                              { step: 1, title: 'Step 1', label: 'Capture' },
                              { step: 2, title: 'Step 2', label: 'Classify' },
                              { step: 3, title: 'Step 3', label: 'Secure' }
                            ].map((item) => {
                              const isDone = worryStep > item.step;
                              const isCurrent = worryStep === item.step;
                              return (
                                <div key={item.step} className="flex flex-col items-center">
                                  <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                                      isDone
                                        ? 'bg-[#032e29] border-2 border-[#10b981] text-[#34d399] ring-2 ring-[#10b981]/30'
                                        : isCurrent
                                        ? 'bg-[#26c6da] border-2 border-white text-[#001724] ring-4 ring-[#26c6da]/35 scale-110 font-extrabold'
                                        : 'bg-[#001724] border border-[#00384f] text-[#558198]'
                                    }`}
                                  >
                                    {isDone ? <Check className="w-4 h-4 stroke-[3] text-[#34d399]" /> : <span>{item.step}</span>}
                                  </div>
                                  <span
                                    className={`mt-1.5 text-[10px] font-extrabold tracking-wider uppercase ${
                                      isDone ? 'text-[#34d399]' : isCurrent ? 'text-[#26c6da]' : 'text-[#487186]'
                                    }`}
                                  >
                                    {item.title}
                                  </span>
                                  <span
                                    className={`text-[11px] font-semibold ${
                                      isDone ? 'text-[#a7f3d0]' : isCurrent ? 'text-white' : 'text-[#558198]'
                                    }`}
                                  >
                                    {item.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Step 1: Capture */}
                        {worryStep === 1 && (
                          <div className="space-y-3 pt-1 animate-in fade-in">
                            <div className="p-3.5 bg-[#001724] rounded-2xl border border-[#002d40]">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded-full bg-[#26c6da]/15 border border-[#26c6da]/40 text-[#26c6da] text-[10px] font-extrabold tracking-wider uppercase">
                                  Step 1 of 3
                                </span>
                                <span className="text-[11px] font-semibold text-[#82abbf]">Externalize Concern</span>
                              </div>
                              <h3 className="text-xl font-black text-white tracking-tight">What is on your mind?</h3>
                              <p className="text-xs text-[#93c5d6] mt-0.5 leading-relaxed">
                                Put the repetitive concern or thought loop into direct words:
                              </p>
                            </div>

                            <textarea
                              value={worryInput}
                              onChange={(e) => setWorryInput(e.target.value)}
                              placeholder="e.g. What if I completely blank out during my presentation tomorrow?"
                              rows={3}
                              autoFocus
                              className="w-full p-3.5 rounded-2xl border border-[#00344d] text-xs text-white placeholder-[#5d8599] focus:outline-none focus:border-[#26c6da] focus:ring-1 focus:ring-[#26c6da] bg-[#00121d] leading-relaxed transition-all shadow-inner"
                            />

                            <div className="flex flex-wrap gap-1.5">
                              {WORRY_CAPTURE_CHIPS.map((chip) => (
                                <button
                                  key={chip}
                                  type="button"
                                  onClick={() => {
                                    triggerHaptic();
                                    setWorryInput(chip);
                                  }}
                                  className="px-2.5 py-1 rounded-full bg-[#001e2e] hover:bg-[#002c42] border border-[#00384f] text-[10px] text-[#93c5d6] hover:text-white transition cursor-pointer text-left"
                                >
                                  + {chip}
                                </button>
                              ))}
                            </div>

                            <div className="pt-2 flex items-center justify-end">
                              <button
                                onClick={() => {
                                  if (!worryInput.trim()) return;
                                  triggerHaptic();
                                  setWorryStep(2);
                                }}
                                disabled={!worryInput.trim()}
                                className="w-full py-3 rounded-full bg-[#26c6da] hover:bg-[#20b2c4] disabled:opacity-40 text-[#001724] font-extrabold text-xs cursor-pointer transition-all flex items-center justify-center gap-2 shadow-md shadow-teal-950/50"
                              >
                                <span>Continue to Step 2: Classify</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Step 2: Binary Classify */}
                        {worryStep === 2 && (
                          <div className="space-y-3 pt-1 animate-in fade-in">
                            <div className="p-3.5 bg-[#001724] rounded-2xl border border-[#002d40]">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded-full bg-[#26c6da]/15 border border-[#26c6da]/40 text-[#26c6da] text-[10px] font-extrabold tracking-wider uppercase">
                                  Step 2 of 3
                                </span>
                                <span className="text-[11px] font-semibold text-[#82abbf]">Sphere of Control</span>
                              </div>
                              <h3 className="text-xl font-black text-white tracking-tight">Can you act on this today?</h3>
                              <p className="text-xs text-[#93c5d6] mt-0.5 leading-relaxed">
                                Differentiate between immediate actionable control and hypothetical uncertainty:
                              </p>
                            </div>

                            <div className="space-y-2.5 pt-1">
                              <button
                                onClick={() => {
                                  triggerHaptic();
                                  setWorryTriageChoice('actionable');
                                }}
                                className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                                  worryTriageChoice === 'actionable'
                                    ? 'bg-[#032e29] border-2 border-[#10b981] text-white ring-2 ring-[#10b981]/30'
                                    : 'bg-[#001e2e] border-[#00344d] text-slate-300 hover:border-[#004e75]'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-emerald-300 font-extrabold text-xs">⚡ Yes, Actionable</span>
                                  {worryTriageChoice === 'actionable' && (
                                    <span className="px-2 py-0.5 rounded-full bg-[#10b981]/25 text-[#34d399] text-[10px] font-bold">
                                      Selected
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] font-normal text-[#a7f3d0]/90 leading-relaxed block">
                                  I have direct control and can execute one micro-step today.
                                </span>
                              </button>

                              <button
                                onClick={() => {
                                  triggerHaptic();
                                  setWorryTriageChoice('hypothetical');
                                }}
                                className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                                  worryTriageChoice === 'hypothetical'
                                    ? 'bg-[#002636] border-2 border-[#26c6da] text-white ring-2 ring-[#26c6da]/30'
                                    : 'bg-[#001e2e] border-[#00344d] text-slate-300 hover:border-[#004e75]'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[#26c6da] font-extrabold text-xs">🌀 No, Hypothetical</span>
                                  {worryTriageChoice === 'hypothetical' && (
                                    <span className="px-2 py-0.5 rounded-full bg-[#26c6da]/25 text-[#26c6da] text-[10px] font-bold">
                                      Selected
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] font-normal text-[#93c5d6] leading-relaxed block">
                                  Uncertainty out of my immediate hands. Park into vault for review window.
                                </span>
                              </button>
                            </div>

                            {worryTriageChoice === 'actionable' && (
                              <div className="p-3.5 bg-[#032e29]/70 border-2 border-[#10b981]/60 rounded-2xl space-y-2 animate-in fade-in">
                                <label className="text-xs font-bold text-[#34d399] flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Define 1 micro-step (under 5 mins):</span>
                                </label>
                                <input
                                  type="text"
                                  value={actionStepInput}
                                  onChange={(e) => setActionStepInput(e.target.value)}
                                  placeholder="e.g. Draft 1 email or open textbook outline"
                                  className="w-full p-2.5 bg-[#00121d] rounded-xl border border-[#10b981]/50 text-xs text-white placeholder-[#5d8599] focus:outline-none focus:border-[#26c6da]"
                                />
                                <div className="flex flex-wrap gap-1.5">
                                  {MICRO_STEP_CHIPS.map((chip) => (
                                    <button
                                      key={chip}
                                      type="button"
                                      onClick={() => {
                                        triggerHaptic();
                                        setActionStepInput(chip);
                                      }}
                                      className="px-2 py-0.5 rounded-full bg-[#001e2e] border border-[#10b981]/40 text-[10px] text-emerald-200 hover:bg-emerald-900/40 cursor-pointer"
                                    >
                                      + {chip}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="pt-2 flex items-center justify-between gap-2">
                              <button
                                onClick={() => {
                                  triggerHaptic();
                                  setWorryStep(1);
                                }}
                                className="px-4 py-2.5 rounded-full border border-[#00344d] bg-[#001a24] text-xs font-semibold text-[#93c5d6] hover:text-white cursor-pointer"
                              >
                                ← Back
                              </button>
                              <button
                                onClick={() => {
                                  if (!worryTriageChoice) return;
                                  if (worryTriageChoice === 'actionable' && !actionStepInput.trim()) return;
                                  triggerHaptic();
                                  setWorryStep(3);
                                }}
                                disabled={
                                  !worryTriageChoice || (worryTriageChoice === 'actionable' && !actionStepInput.trim())
                                }
                                className="flex-1 py-2.5 px-4 rounded-full bg-[#26c6da] hover:bg-[#20b2c4] disabled:opacity-40 text-[#001724] font-extrabold text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                              >
                                <span>Proceed to Step 3: Vault</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Step 3: Mechanical Vault Lock-In */}
                        {worryStep === 3 && (
                          <div className="text-center pt-1 animate-in fade-in">
                            <div className="mb-1">
                              <span className="text-[10px] font-bold tracking-widest text-[#26c6da] uppercase">
                                03 / 03 • SECURE IN VAULT
                              </span>
                              <h3 className="text-lg font-black text-white tracking-tight mt-0.5">
                                Seal Concern into Vault
                              </h3>
                            </div>

                            <MechanicalVaultVisualizer
                              phase={vaultAnimPhase}
                              worryText={worryInput}
                              worryType={worryTriageChoice}
                              scheduledTime={worryWindowTime}
                              onLockTrigger={handleTriggerVaultLock}
                              onTumblerClick={() => soundEnabled && audioEngine.playTumblerClick()}
                              compact={true}
                            />

                            {vaultAnimPhase === 'locked' && (
                              <div className="pt-3 space-y-2 max-w-sm mx-auto animate-in fade-in">
                                <button
                                  onClick={() => {
                                    triggerHaptic();
                                    setWorryInput('');
                                    setActionStepInput('');
                                    setWorryTriageChoice(null);
                                    setWorryStep(1);
                                    setVaultAnimPhase('ready');
                                    setWorryFlowStep('vault');
                                  }}
                                  className="w-full py-3 bg-[#26c6da] hover:bg-[#20b2c4] text-[#001724] font-bold text-xs rounded-full shadow-md cursor-pointer transition-all uppercase tracking-wider"
                                >
                                  View Stored Worries in Vault ({activeWorries.length})
                                </button>
                                <button
                                  onClick={() => {
                                    triggerHaptic();
                                    setWorryInput('');
                                    setActionStepInput('');
                                    setWorryTriageChoice(null);
                                    setWorryStep(1);
                                    setVaultAnimPhase('ready');
                                    setIsWorryOpen(false);
                                  }}
                                  className="w-full py-2.5 bg-[#001e2e] hover:bg-[#00283d] text-[#93c5d6] hover:text-white font-semibold text-xs rounded-full border border-[#00344d] cursor-pointer transition-all"
                                >
                                  Return to Self-Care Library
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* ======================================================= */
                      /* MOBILE VAULT & REVIEW DASHBOARD                         */
                      /* ======================================================= */
                      <div className="space-y-3.5 text-left animate-in fade-in">
                        {shredToast && (
                          <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-[11px] font-semibold text-center animate-in fade-in">
                            🗑️ {shredToast}
                          </div>
                        )}

                        {/* Clinical Adherence Progress Banner */}
                        <div className="p-3 bg-linear-to-r from-[#002433] to-[#001e2e] rounded-2xl border border-[#26c6da]/40 shadow-sm">
                          <div className="flex items-center justify-between mb-1.5 gap-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">🔥</span>
                              <span className="text-xs font-bold text-white tracking-tight">
                                {vaultStreak}-Day Streak
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-200 text-[10px] font-bold border border-rose-500/30">
                                🗑️ {shreddedCount} Defused
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                                ⏱️ {minutesSavedTotal}m Saved
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] text-[#93c5d6] leading-relaxed">
                            Worries safely contained until your scheduled window, shielding your focus during active hours.
                          </p>
                        </div>

                        {/* 15-Minute Worry Window Active Timer Card */}
                        <div className="p-3 bg-[#001926] rounded-2xl border border-[#00344d] space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              {/* Radial Progress Ring */}
                              <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                                  <circle cx="18" cy="18" r="15" fill="none" stroke="#002b3d" strokeWidth="3" />
                                  <circle
                                    cx="18"
                                    cy="18"
                                    r="15"
                                    fill="none"
                                    stroke={
                                      worryWindowSecondsLeft <= 300 && worryWindowSecondsLeft > 0
                                        ? '#fbbf24'
                                        : '#26c6da'
                                    }
                                    strokeWidth="3"
                                    strokeDasharray={94.2}
                                    strokeDashoffset={94.2 - (94.2 * timerProgressPct) / 100}
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <Clock className="w-3.5 h-3.5 text-[#26c6da] absolute" />
                              </div>
                              <div>
                                <span className="text-[10px] font-extrabold text-[#26c6da] uppercase tracking-wider block">
                                  15-Min Review Window
                                </span>
                                <span className="text-xs font-mono font-bold text-white">
                                  {formatAudioTime(worryWindowSecondsLeft)} Remaining
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={handleStartWorryTimer}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                                  worryWindowTimerActive
                                    ? 'bg-amber-400 text-[#001724] shadow-xs'
                                    : 'bg-[#26c6da] hover:bg-[#20b2c4] text-[#001724]'
                                }`}
                              >
                                {worryWindowTimerActive ? 'Pause' : 'Start (15m)'}
                              </button>
                              <button
                                onClick={() => {
                                  triggerHaptic();
                                  setWorryWindowTimerActive(false);
                                  setWorryWindowSecondsLeft(900);
                                }}
                                className="p-1.5 rounded-xl bg-[#00121d] border border-[#00344d] text-[#719bb0] hover:text-white text-xs cursor-pointer"
                                title="Reset timer"
                              >
                                ↺
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-[#002a3d] text-[11px] text-[#719bb0]">
                            <span>Scheduled Window Time:</span>
                            <input
                              type="time"
                              value={worryWindowTime}
                              onChange={(e) => setWorryWindowTime(e.target.value)}
                              className="bg-[#00121d] px-2 py-0.5 rounded-lg border border-[#00344d] text-xs font-bold text-[#26c6da] cursor-pointer focus:outline-none focus:border-[#26c6da]"
                            />
                          </div>
                        </div>

                        {/* Thumb-friendly Segmented Filter */}
                        <div className="grid grid-cols-3 gap-1 p-0.5 bg-[#00121d] border border-[#00344d] rounded-xl text-[10px] font-semibold">
                          <button
                            onClick={() => {
                              triggerHaptic();
                              setMobileVaultTab('all');
                            }}
                            className={`py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                              mobileVaultTab === 'all' ? 'bg-[#26c6da] text-[#001724] font-bold' : 'text-[#93c5d6]'
                            }`}
                          >
                            Active ({activeWorries.length})
                          </button>
                          <button
                            onClick={() => {
                              triggerHaptic();
                              setMobileVaultTab('actionable');
                            }}
                            className={`py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                              mobileVaultTab === 'actionable'
                                ? 'bg-emerald-400 text-[#001724] font-bold'
                                : 'text-emerald-300'
                            }`}
                          >
                            ⚡ Action ({activeWorries.filter((w) => w.type === 'actionable').length})
                          </button>
                          <button
                            onClick={() => {
                              triggerHaptic();
                              setMobileVaultTab('hypothetical');
                            }}
                            className={`py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                              mobileVaultTab === 'hypothetical'
                                ? 'bg-[#26c6da] text-[#001724] font-bold'
                                : 'text-teal-300'
                            }`}
                          >
                            🌀 Parked ({activeWorries.filter((w) => w.type === 'hypothetical').length})
                          </button>
                        </div>

                        {/* Active Worry List */}
                        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-0.5">
                          {activeWorries.filter((w) => mobileVaultTab === 'all' || w.type === mobileVaultTab).length ===
                          0 ? (
                            <div className="text-center py-6 text-[#5d8599] text-xs border border-dashed border-[#002a3d] rounded-2xl p-4">
                              All worries in this view are cleared.
                            </div>
                          ) : (
                            activeWorries
                              .filter((w) => mobileVaultTab === 'all' || w.type === mobileVaultTab)
                              .map((w) => (
                                <div
                                  key={w.id}
                                  className={`p-3 rounded-2xl border transition-all ${
                                    w.type === 'actionable'
                                      ? 'bg-[#001e2e] border-emerald-500/35'
                                      : 'bg-[#001e2e] border-[#00344d]'
                                  }`}
                                >
                                  <div className="flex items-start gap-2.5">
                                    <button
                                      onClick={() => toggleWorryResolved(w.id)}
                                      className="mt-0.5 w-4 h-4 rounded-md border border-[#004e75] hover:border-[#26c6da] flex items-center justify-center shrink-0 cursor-pointer"
                                    />
                                    <div className="flex-1 text-left text-xs">
                                      <p className="font-semibold text-white">{w.text}</p>
                                      {w.actionStep && (
                                        <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-[10px] text-emerald-300 font-medium">
                                          <span>Next:</span>
                                          <span className="font-bold">{w.actionStep}</span>
                                        </div>
                                      )}
                                      <span className="text-[9px] text-[#719bb0] block mt-1">{w.timestamp}</span>
                                    </div>
                                    <button
                                      onClick={() => deleteWorry(w.id)}
                                      className="text-[#719bb0] hover:text-rose-400 p-1 cursor-pointer transition-colors"
                                      title="Remove from vault"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  <button
                                    onClick={() => {
                                      triggerHaptic();
                                      setActiveReviewWorry(w);
                                    }}
                                    className="mt-2.5 w-full py-1.5 px-3 rounded-xl bg-[#001421] hover:bg-[#00273a] border border-[#26c6da]/35 text-[#26c6da] hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                  >
                                    <Sparkles className="w-3 h-3 text-[#26c6da]" />
                                    <span>Review &amp; Resolve →</span>
                                  </button>
                                </div>
                              ))
                          )}
                        </div>

                        {/* Collapsible Resolved Today Drawer */}
                        {resolvedWorries.length > 0 && (
                          <div className="rounded-2xl border border-[#002a3d] bg-[#00121d]/80 overflow-hidden">
                            <button
                              onClick={() => setShowResolvedDrawer((v) => !v)}
                              className="w-full px-3 py-2 flex items-center justify-between text-[11px] font-bold text-[#82abbf] hover:text-white cursor-pointer"
                            >
                              <span>✓ Resolved Today ({resolvedWorries.length})</span>
                              <ChevronDown
                                className={`w-3.5 h-3.5 transition-transform ${showResolvedDrawer ? 'rotate-180' : ''}`}
                              />
                            </button>
                            {showResolvedDrawer && (
                              <div className="px-3 pb-2.5 space-y-2 border-t border-[#002233] pt-2">
                                {resolvedWorries.map((w) => (
                                  <div
                                    key={w.id}
                                    className="p-2.5 rounded-xl bg-[#001724]/70 border border-[#002a3d] opacity-80 text-xs"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <p className="line-through text-slate-400 font-medium">{w.text}</p>
                                      <button
                                        onClick={() => toggleWorryResolved(w.id)}
                                        className="text-[10px] text-[#26c6da] hover:underline shrink-0 cursor-pointer"
                                      >
                                        Undo
                                      </button>
                                    </div>
                                    {w.cbtReframe && (
                                      <div className="mt-1.5 p-2 rounded-lg bg-[#032e29] border border-[#10b981]/40 text-[10px] text-emerald-200">
                                        <span className="font-bold text-[#34d399] block">🧠 Reframed Thought:</span>
                                        &ldquo;{w.cbtReframe.balancedThought}&rdquo;
                                      </div>
                                    )}
                                    {w.resolutionType === 'micro_action' && (
                                      <span className="mt-1 inline-block text-[10px] text-emerald-300 font-bold">
                                        ⚡ Micro-Action Completed
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="pt-1 flex items-center gap-2">
                          <button
                            onClick={() => {
                              triggerHaptic();
                              setWorryStep(1);
                              setWorryFlowStep('triage');
                            }}
                            className="flex-1 py-2.5 rounded-xl bg-[#001e2e] hover:bg-[#002a3d] border border-[#00344d] text-xs font-bold text-[#26c6da] cursor-pointer transition-all text-center"
                          >
                            + Park Another Concern
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {worryFlowStep === 'vault' && (
                    <div className="p-3 bg-[#001724]/95 border-t border-[#00344d] backdrop-blur-md shrink-0">
                      <button
                        onClick={() => {
                          triggerHaptic();
                          setIsWorryOpen(false);
                        }}
                        className="w-full py-3 bg-[#26c6da] hover:bg-[#20b2c4] text-[#001724] font-bold text-xs rounded-full shadow-md cursor-pointer transition-all uppercase tracking-wider"
                      >
                        Close Vault & Return to Library
                      </button>
                    </div>
                  )}
                </div>
              ) : isPmrOpen ? (
                /* ======================================================= */
                /* MOBILE SCREEN: PROGRESSIVE MUSCLE RELAXATION (FULL PARITY)*/
                /* ======================================================= */
                <div className="flex-1 flex flex-col bg-[#001724] text-white overflow-hidden animate-in fade-in">
                  <div className="px-4 py-3 border-b border-[#00344d] flex items-center justify-between shrink-0 bg-[#001724]">
                    <button
                      onClick={() => {
                        triggerHaptic();
                        setIsPmrOpen(false);
                        voiceAudioRef.current?.pause();
                        audioEngine.stopAmbientDrone();
                        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                          window.speechSynthesis.cancel();
                        }
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-[#26c6da] hover:text-white transition-colors cursor-pointer py-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Library</span>
                    </button>
                    <span className="text-xs font-bold text-white">
                      {pmrStep === 'pre_checkin' && 'Step 1 • Check-In'}
                      {pmrStep === 'active_player' && `Region ${activeRegionIndex + 1}/${activeRegions.length}`}
                      {pmrStep === 'recalibration' && 'Step 3 • Calibrated'}
                    </span>
                    <button
                      onClick={() => {
                        triggerHaptic();
                        audioEngine.initContext();
                        setSoundEnabled(!soundEnabled);
                      }}
                      className={`p-1.5 rounded-full ${
                        soundEnabled ? 'bg-teal-500/20 text-[#26c6da]' : 'bg-[#00121d] text-slate-500'
                      }`}
                    >
                      {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
                    {pmrStep === 'pre_checkin' && (
                      <div className="space-y-4 text-left">
                        <div>
                          <span className="text-[10px] font-bold tracking-widest text-[#26c6da] uppercase">
                            SOMATIC PROTOCOL
                          </span>
                          <h2 className="text-lg font-bold text-white mt-0.5">Muscle Relaxation (PMR)</h2>
                          <p className="text-xs text-[#93c5d6]">Release physical tightness with guided PMR.</p>
                        </div>

                        <div className="bg-[#001e2e] p-4 rounded-2xl border border-[#00344d]">
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-[#93c5d6]">Body Tension Now:</label>
                            <span className="text-sm font-extrabold text-[#26c6da] bg-[#00121d] px-2.5 py-0.5 rounded-lg border border-[#00344d]">
                              {preTension} / 10
                            </span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={preTension}
                            onChange={(e) => setPreTension(Number(e.target.value))}
                            className="w-full accent-[#26c6da] cursor-pointer h-2 bg-[#00121d] rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-[#93c5d6] block mb-1.5">Preset Duration:</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: '5min', label: '5 Min', sub: '4 Regions' },
                              { id: '10min', label: '10 Min', sub: 'Full Body' },
                              { id: '15min', label: '15 Min', sub: 'Sleep Bed' }
                            ].map((preset) => (
                              <button
                                key={preset.id}
                                onClick={() => {
                                  triggerHaptic();
                                  setSelectedPreset(preset.id as PmrPreset);
                                }}
                                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                                  selectedPreset === preset.id
                                    ? 'bg-teal-950/70 border-[#26c6da] text-[#26c6da] font-bold shadow-xs'
                                    : 'bg-[#001e2e] border-[#00344d] text-slate-300'
                                }`}
                              >
                                <div className="text-xs font-bold">{preset.label}</div>
                                <div className="text-[10px] opacity-75">{preset.sub}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="p-3.5 bg-[#032e29]/60 rounded-2xl border border-[#10b981]/40 flex items-center justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold text-white">Release-Only Mode</div>
                            <div className="text-[10px] text-[#a7f3d0]/80 mt-0.5">
                              Gentle softening without tensing (for pain or injury).
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              triggerHaptic();
                              setReleaseOnlyMode(!releaseOnlyMode);
                            }}
                            className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                              releaseOnlyMode ? 'bg-[#10b981]' : 'bg-[#00121d] border border-[#00344d]'
                            }`}
                          >
                            <div
                              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                                releaseOnlyMode ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>

                        <button
                          onClick={handleStartPmr}
                          className="w-full mt-2 py-3.5 bg-[#26c6da] hover:bg-[#20b2c4] text-[#001724] font-bold text-xs rounded-full shadow-md cursor-pointer transition-all"
                        >
                          Begin PMR Practice
                        </button>
                      </div>
                    )}

                    {pmrStep === 'active_player' && (
                      <div className="flex-1 flex flex-col justify-between items-center text-center space-y-3">
                        <div className="relative w-40 h-44 flex items-center justify-center bg-[#00121d] rounded-3xl border border-[#00344d]">
                          <svg viewBox="0 0 200 245" className="w-32 h-40">
                            <circle
                              cx="100"
                              cy="38"
                              r="16"
                              fill={
                                currentRegion.id === 'face'
                                  ? currentPhase === 'tense'
                                    ? '#F59E0B'
                                    : '#26c6da'
                                  : '#1e3a4b'
                              }
                            />
                            <path
                              d="M84 56 H116 L140 72 C146 76 150 82 150 90 L148 108 H52 L50 90 C50 82 54 76 60 72 Z"
                              fill={
                                currentRegion.id === 'shoulders'
                                  ? currentPhase === 'tense'
                                    ? '#F59E0B'
                                    : '#26c6da'
                                  : '#1e3a4b'
                              }
                            />
                            <path
                              d="M60 104 H140 L136 136 H64 Z"
                              fill={
                                currentRegion.id === 'chest'
                                  ? currentPhase === 'tense'
                                    ? '#F59E0B'
                                    : '#26c6da'
                                  : '#1e3a4b'
                              }
                            />
                            <path
                              d="M50 86 L34 130 C32 138 36 144 44 146 L58 148"
                              fill="none"
                              stroke={
                                currentRegion.id === 'arms'
                                  ? currentPhase === 'tense'
                                    ? '#F59E0B'
                                    : '#26c6da'
                                  : '#1e3a4b'
                              }
                              strokeWidth="10"
                              strokeLinecap="round"
                            />
                            <path
                              d="M150 86 L166 130 C168 138 164 144 156 146 L142 148"
                              fill="none"
                              stroke={
                                currentRegion.id === 'arms'
                                  ? currentPhase === 'tense'
                                    ? '#F59E0B'
                                    : '#26c6da'
                                  : '#1e3a4b'
                              }
                              strokeWidth="10"
                              strokeLinecap="round"
                            />
                            <path
                              d="M66 136 H134 L130 166 H70 Z"
                              fill={
                                currentRegion.id === 'abdomen'
                                  ? currentPhase === 'tense'
                                    ? '#F59E0B'
                                    : '#26c6da'
                                  : '#1e3a4b'
                              }
                            />
                            <rect
                              x="72"
                              y="168"
                              width="24"
                              height="60"
                              rx="4"
                              fill={
                                currentRegion.id === 'legs'
                                  ? currentPhase === 'tense'
                                    ? '#F59E0B'
                                    : '#26c6da'
                                  : '#1e3a4b'
                              }
                            />
                            <rect
                              x="104"
                              y="168"
                              width="24"
                              height="60"
                              rx="4"
                              fill={
                                currentRegion.id === 'legs'
                                  ? currentPhase === 'tense'
                                    ? '#F59E0B'
                                    : '#26c6da'
                                  : '#1e3a4b'
                              }
                            />
                            <ellipse
                              cx="84"
                              cy="234"
                              rx="12"
                              ry="5"
                              fill={
                                currentRegion.id === 'feet'
                                  ? currentPhase === 'tense'
                                    ? '#F59E0B'
                                    : '#26c6da'
                                  : '#1e3a4b'
                              }
                            />
                            <ellipse
                              cx="116"
                              cy="234"
                              rx="12"
                              ry="5"
                              fill={
                                currentRegion.id === 'feet'
                                  ? currentPhase === 'tense'
                                    ? '#F59E0B'
                                    : '#26c6da'
                                  : '#1e3a4b'
                              }
                            />
                          </svg>
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#001e2e] text-[#26c6da] text-xs font-bold border border-[#00344d]">
                            {phaseSecondsLeft}s
                          </div>
                        </div>

                        <div>
                          <span
                            className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                              currentPhase === 'tense'
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                                : 'bg-teal-950/80 text-teal-300 border border-teal-500/30'
                            }`}
                          >
                            {releaseOnlyMode && currentPhase === 'tense'
                              ? 'SOFTEN (6s)'
                              : currentPhase === 'tense'
                              ? 'TENSE (6s)'
                              : 'RELEASE (12s)'}
                          </span>
                          <h3 className="text-base font-bold text-white mt-1.5">{currentRegion.name}</h3>
                          <p className="text-xs text-[#93c5d6] mt-1 px-2 line-clamp-3">
                            {releaseOnlyMode && currentPhase === 'tense'
                              ? currentRegion.softenPrompt
                              : currentPhase === 'tense'
                              ? currentRegion.tensePrompt
                              : currentRegion.releasePrompt}
                          </p>
                        </div>

                        <div className="w-full bg-[#001e2e] p-3 rounded-2xl border border-[#00344d] space-y-2.5">
                          <div className="flex justify-center gap-1 bg-[#00121d] p-1 rounded-xl text-[11px] font-bold">
                            <button
                              onClick={() => {
                                triggerHaptic();
                                setAudioTrackMode('voice');
                                audioEngine.stopAmbientDrone();
                                if (soundEnabled && isPlayerPlaying && voiceAudioRef.current)
                                  voiceAudioRef.current.play().catch(() => {});
                              }}
                              className={`flex-1 py-1 px-2 rounded-lg transition-all ${
                                audioTrackMode === 'voice'
                                  ? 'bg-[#26c6da] text-[#001724] font-bold shadow-xs'
                                  : 'text-[#719bb0]'
                              }`}
                            >
                              🎙️ Voice Track
                            </button>
                            <button
                              onClick={() => {
                                triggerHaptic();
                                setAudioTrackMode('ambient');
                                voiceAudioRef.current?.pause();
                                if (soundEnabled && isPlayerPlaying) audioEngine.startAmbientDrone();
                              }}
                              className={`flex-1 py-1 px-2 rounded-lg transition-all ${
                                audioTrackMode === 'ambient'
                                  ? 'bg-[#26c6da] text-[#001724] font-bold shadow-xs'
                                  : 'text-[#719bb0]'
                              }`}
                            >
                              🎵 108Hz Drone
                            </button>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <button
                              onClick={handlePrevRegion}
                              disabled={activeRegionIndex === 0}
                              className="px-3 py-1.5 rounded-full bg-[#00121d] border border-[#00344d] text-xs font-bold text-[#93c5d6] disabled:opacity-30"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                triggerHaptic();
                                audioEngine.initContext();
                                const nextPlaying = !isPlayerPlaying;
                                setIsPlayerPlaying(nextPlaying);
                                if (nextPlaying && soundEnabled) {
                                  if (audioTrackMode === 'voice') voiceAudioRef.current?.play().catch(() => {});
                                  else audioEngine.startAmbientDrone();
                                } else {
                                  voiceAudioRef.current?.pause();
                                  audioEngine.stopAmbientDrone();
                                }
                              }}
                              className="w-11 h-11 rounded-full bg-[#26c6da] text-[#001724] flex items-center justify-center shadow-md hover:bg-[#20b2c4]"
                            >
                              {isPlayerPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                            </button>
                            <button
                              onClick={handleNextRegion}
                              className="px-3 py-1.5 rounded-full bg-[#00121d] border border-[#00344d] text-xs font-bold text-[#93c5d6]"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {pmrStep === 'recalibration' && (
                      <div className="space-y-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-teal-500/20 text-[#26c6da] flex items-center justify-center mx-auto border border-[#26c6da]/40">
                          <Check className="w-6 h-6 stroke-[3]" />
                        </div>
                        <h2 className="text-lg font-bold text-white">Session Calibrated</h2>
                        <div className="bg-[#001e2e] p-4 rounded-2xl border border-[#00344d] text-left">
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-[#93c5d6]">Body Tension Now:</label>
                            <span className="text-sm font-extrabold text-[#26c6da] bg-[#00121d] px-2.5 py-0.5 rounded-lg border border-[#00344d]">
                              {postTension} / 10
                            </span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={postTension}
                            onChange={(e) => setPostTension(Number(e.target.value))}
                            className="w-full accent-[#26c6da] cursor-pointer h-2 bg-[#00121d] rounded-lg"
                          />
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[#032e29] border border-[#10b981]/50 text-emerald-200 text-xs">
                          <span className="font-bold text-[#34d399] block">
                            {Math.max(0, Math.round(((preTension - postTension) / preTension) * 100))}% Physical Tightness Relief
                          </span>
                          Tension lowered from {preTension}/10 to {postTension}/10.
                        </div>

                        {savedNotesToast && (
                          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-200 text-xs font-semibold">
                            ✓ Saved to My Clinical Notes
                          </div>
                        )}

                        <button
                          onClick={handleSavePmrRecord}
                          className="w-full py-3.5 bg-[#26c6da] hover:bg-[#20b2c4] text-[#001724] font-bold text-xs rounded-full shadow-md cursor-pointer transition-all"
                        >
                          Save PMR Session
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : isDbtStopOpen ? (
                /* ======================================================= */
                /* MOBILE SCREEN: DBT STOP SKILL (FULL 5-STAGE PARITY)     */
                /* ======================================================= */
                <div className="flex-1 flex flex-col bg-[#001724] text-white overflow-hidden animate-in fade-in">
                  <div className="px-4 py-3 border-b border-[#00344d] flex items-center justify-between shrink-0 bg-[#001724]">
                    <button
                      onClick={() => {
                        triggerHaptic();
                        setIsDbtStopOpen(false);
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-purple-300 hover:text-white cursor-pointer py-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Library</span>
                    </button>
                    <span className="text-xs font-bold text-purple-200">DBT STOP Skill</span>
                    <span className="text-[10px] font-mono text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full">
                      {bulletState + 1}/5
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between text-center">
                    <div className="space-y-2">
                      <div className="w-10 h-10 mx-auto rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                        <Compass className="w-5 h-5" />
                      </div>
                      <h2 className="text-base font-extrabold text-white">
                        {bulletState === 0 && 'Acute Emotional Surge'}
                        {bulletState === 1 && 'S — Press & Hold E-Brake'}
                        {bulletState === 2 && 'T — Camera Pull-Out'}
                        {bulletState === 3 && 'O — Spotlight the Facts'}
                        {bulletState === 4 && 'P — Values Rail Switch'}
                      </h2>
                      <p className="text-xs text-[#93c5d6] leading-relaxed">
                        {bulletState === 0 && 'Adrenaline is spiking. Pull the somatic brake before reacting.'}
                        {bulletState === 1 && 'Maintain thumb pressure on the reticle until time freezes solid.'}
                        {bulletState === 2 && 'Zoom out 40%. Notice the crisis is one small tile, not your whole world.'}
                        {bulletState === 3 && 'Tap each node to separate objective facts from emotional illusions:'}
                        {bulletState === 4 && 'Flick the track switch from Impulsive Reaction to Values Alignment.'}
                      </p>
                    </div>

                    {/* Interactive Stage Visuals */}
                    <div className="my-2 flex flex-col items-center justify-center">
                      {bulletState === 0 && (
                        <div className="relative w-48 h-48 rounded-3xl bg-[#00121d] border border-purple-500/30 flex items-center justify-center overflow-hidden">
                          <div className="absolute w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping top-6 left-10" />
                          <div className="absolute w-2 h-2 rounded-full bg-amber-400 animate-bounce bottom-8 right-10" />
                          <div className="w-24 h-24 rounded-full border-2 border-rose-500/40 animate-spin flex items-center justify-center">
                            <Zap className="w-9 h-9 text-rose-400" />
                          </div>
                        </div>
                      )}

                      {bulletState === 1 && (
                        <div
                          onMouseDown={() => {
                            setIsEBrakePressed(true);
                            triggerHaptic();
                            if (soundEnabled) audioEngine.playTone(396, 2.6, 'sine', 0.12);
                          }}
                          onMouseUp={() => setIsEBrakePressed(false)}
                          onTouchStart={() => {
                            setIsEBrakePressed(true);
                            triggerHaptic();
                            if (soundEnabled) audioEngine.playTone(396, 2.6, 'sine', 0.12);
                          }}
                          onTouchEnd={() => setIsEBrakePressed(false)}
                          className="relative w-52 h-52 rounded-full bg-[#00121d] border-4 border-purple-500/40 flex flex-col items-center justify-center cursor-pointer shadow-2xl active:scale-95 transition-all overflow-hidden select-none"
                        >
                          <div
                            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-purple-600 to-indigo-600 opacity-65 transition-all"
                            style={{ height: `${eBrakeProgress}%` }}
                          />
                          <div className="relative z-10 flex flex-col items-center pointer-events-none">
                            <svg
                              viewBox="0 0 160 160"
                              width="104"
                              height="104"
                              fill="none"
                              className={isEBrakePressed ? 'animate-spin' : ''}
                            >
                              <circle cx="80" cy="80" r="54" stroke="#C4B5FD" strokeWidth="2.5" strokeDasharray="8 6" />
                              <circle cx="80" cy="80" r="42" fill="#6D28D9" fillOpacity="0.3" stroke="#8B5CF6" strokeWidth="1.5" />
                              <polygon points="80,62 92,75 80,88 68,75" fill="#8B5CF6" />
                            </svg>
                            <span className="text-white font-extrabold text-[11px] uppercase tracking-widest mt-1">
                              {isEBrakePressed ? `Freezing ${eBrakeProgress}%` : 'Hold Thumb Here'}
                            </span>
                          </div>
                        </div>
                      )}

                      {bulletState === 2 && (
                        <div className="w-full rounded-3xl bg-[#00121d] border border-[#00344d] p-4 flex flex-col items-center">
                          <svg viewBox="0 0 240 130" width="210" height="115" fill="none">
                            <polygon points="120,10 220,60 120,110 20,60" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
                            <polygon points="20,60 120,110 120,122 20,72" fill="#0F172A" />
                            <polygon points="220,60 120,110 120,122 220,72" fill="#1E293B" />
                            <ellipse cx="120" cy="60" rx="20" ry="10" fill="#7C3AED" fillOpacity="0.45" stroke="#A78BFA" strokeWidth="1.5" />
                            <circle cx="120" cy="55" r="5" fill="#FBBF24" />
                          </svg>
                          <span className="text-[10px] font-mono text-purple-300 mt-1">Spatial Zoom: 40% Perspective</span>
                        </div>
                      )}

                      {bulletState === 3 && (
                        <div className="w-full space-y-2">
                          {[
                            {
                              id: 'surge',
                              tag: 'Bodily Surge',
                              title: 'Heart rate spiked, but you are physically safe right now.',
                              freq: 440
                            },
                            {
                              id: 'trigger',
                              tag: 'Prompting Fact',
                              title: 'Reality clashed with an expectation. Pause before responding.',
                              freq: 528
                            },
                            {
                              id: 'mirage',
                              tag: 'Emotional Mirage',
                              title: 'Impulsive reaction promises quick relief, but creates regret.',
                              freq: 639
                            }
                          ].map((node) => {
                            const isRevealed = spotlightNodesRevealed.includes(node.id);
                            return (
                              <div
                                key={node.id}
                                onClick={() => {
                                  triggerHaptic();
                                  if (soundEnabled) audioEngine.playTone(node.freq, 0.8, 'triangle', 0.08);
                                  setSpotlightNodesRevealed((prev) =>
                                    prev.includes(node.id) ? prev : [...prev, node.id]
                                  );
                                }}
                                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                                  isRevealed
                                    ? 'bg-purple-950/60 border-purple-400'
                                    : 'bg-[#001e2e] border-[#00344d]'
                                }`}
                              >
                                <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-0.5">
                                  <span className={isRevealed ? 'text-purple-300' : 'text-[#719bb0]'}>{node.tag}</span>
                                  <span className="text-purple-300">{isRevealed ? 'Illuminated ✓' : 'Tap 🔦'}</span>
                                </div>
                                <p className={`text-xs ${isRevealed ? 'text-white' : 'text-slate-400 blur-[2px]'}`}>
                                  {node.title}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {bulletState === 4 && (
                        <div className="p-3.5 bg-[#001e2e] rounded-2xl border border-[#00344d] w-full space-y-3">
                          <svg viewBox="0 0 280 90" width="100%" height="84" fill="none">
                            <path
                              d="M20 45 L100 45 L180 25 L260 25"
                              stroke={railSwitchPosition === 'A' ? '#F43F5E' : '#334155'}
                              strokeWidth="3"
                              strokeDasharray="4 4"
                            />
                            <circle cx="260" cy="25" r="6" fill={railSwitchPosition === 'A' ? '#F43F5E' : '#475569'} />
                            <path
                              d="M20 45 L100 45 L180 65 L260 65"
                              stroke={railSwitchPosition === 'B' ? '#26c6da' : '#334155'}
                              strokeWidth="4"
                              strokeLinecap="round"
                            />
                            <circle cx="260" cy="65" r="7" fill={railSwitchPosition === 'B' ? '#26c6da' : '#475569'} />
                            <circle cx="100" cy="45" r="9" fill="#001724" stroke="#ffffff" strokeWidth="2" />
                            <circle cx="100" cy="45" r="4" fill={railSwitchPosition === 'B' ? '#26c6da' : '#F43F5E'} />
                            <text x="165" y="18" fill="#FDA4AF" fontSize="9.5" fontWeight="bold">
                              Track A: Impulsive Reply
                            </text>
                            <text x="165" y="83" fill="#5EEAD4" fontSize="9.5" fontWeight="bold">
                              Track B: 15m Value Pause
                            </text>
                          </svg>

                          <button
                            onClick={() => {
                              triggerHaptic();
                              setRailSwitchPosition('B');
                              if (soundEnabled) audioEngine.playPhaseCue('complete');
                            }}
                            className={`w-full py-2 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              railSwitchPosition === 'B'
                                ? 'bg-[#26c6da] text-[#001724]'
                                : 'bg-[#00121d] border border-[#26c6da]/40 text-[#26c6da]'
                            }`}
                          >
                            {railSwitchPosition === 'B' ? 'Track B Locked In ✓' : 'Flick Switch to Track B'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Footer Action Button */}
                    <div className="pt-2">
                      {bulletState === 0 && (
                        <button
                          onClick={() => {
                            triggerHaptic();
                            setBulletState(1);
                          }}
                          className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-full shadow-lg cursor-pointer"
                        >
                          Engage Somatic Brake →
                        </button>
                      )}
                      {bulletState === 1 && (
                        <span className="text-[11px] text-purple-300 font-semibold">
                          Hold until 100% to freeze the emotional surge
                        </span>
                      )}
                      {bulletState === 2 && (
                        <button
                          onClick={() => {
                            triggerHaptic();
                            setBulletState(3);
                          }}
                          className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-full shadow-md cursor-pointer"
                        >
                          Enter Incident Spotlight →
                        </button>
                      )}
                      {bulletState === 3 && (
                        <button
                          onClick={() => {
                            triggerHaptic();
                            setBulletState(4);
                          }}
                          disabled={spotlightNodesRevealed.length < 2}
                          className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs rounded-full shadow-md cursor-pointer"
                        >
                          Proceed to Values Rail Switch →
                        </button>
                      )}
                      {bulletState === 4 && (
                        <button
                          onClick={() => {
                            triggerHaptic();
                            setIsDbtStopOpen(false);
                          }}
                          disabled={railSwitchPosition !== 'B'}
                          className="w-full py-3.5 bg-[#26c6da] hover:bg-[#20b2c4] disabled:opacity-40 text-[#001724] font-bold text-xs rounded-full shadow-md cursor-pointer"
                        >
                          Complete Grounding & Return
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* ======================================================= */
                /* MOBILE SELF CARE LIBRARY                                */
                /* ======================================================= */
                <div className="flex-1 flex flex-col justify-between bg-[#001724] overflow-hidden text-white">
                  <div className="flex-1 overflow-y-auto px-4 pt-2 pb-6">
                    <SelfCareHub
                      onOpenDbtStop={() => {
                        triggerHaptic();
                        setBulletState(0);
                        setEBrakeProgress(0);
                        setIsEBrakePressed(false);
                        setSpotlightNodesRevealed([]);
                        setRailSwitchPosition('A');
                        setIsDbtStopOpen(true);
                        if (soundEnabled) audioEngine.playSubBassDrop();
                      }}
                      onOpenPmr={() => {
                        triggerHaptic();
                        setPmrStep('pre_checkin');
                        setIsPmrOpen(true);
                      }}
                      onOpenWorryWindow={(mode) => {
                        triggerHaptic();
                        setWorryFlowStep(mode || 'triage');
                        setIsWorryOpen(true);
                        if (soundEnabled) audioEngine.playTone(432, 1.0, 'sine', 0.08);
                      }}
                    />
                  </div>

                  {/* Mobile Bottom Navigation Bar */}
                  <div className="px-6 py-2.5 bg-[#001421] border-t border-[#002538] flex items-center justify-around shrink-0 select-none">
                    <button
                      onClick={triggerHaptic}
                      className="flex flex-col items-center gap-1 text-[#719bb0] hover:text-white transition-colors cursor-pointer"
                    >
                      <Home className="w-5 h-5" />
                      <span className="text-[10px] font-medium">Home</span>
                    </button>
                    <button
                      onClick={triggerHaptic}
                      className="flex flex-col items-center gap-1 text-[#719bb0] hover:text-white transition-colors cursor-pointer"
                    >
                      <Calendar className="w-5 h-5" />
                      <span className="text-[10px] font-medium">Sessions</span>
                    </button>
                    <button
                      onClick={triggerHaptic}
                      className="flex flex-col items-center gap-1 text-[#26c6da] font-semibold cursor-pointer"
                    >
                      <Flower2 className="w-5 h-5 text-[#26c6da]" />
                      <span className="text-[10px]">Self-Care</span>
                    </button>
                    <button
                      onClick={() => {
                        triggerHaptic();
                        setShowWhatsAppChat(true);
                      }}
                      className="flex flex-col items-center gap-1 text-[#719bb0] hover:text-white transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-[10px] font-medium">Menu</span>
                    </button>
                  </div>
                </div>
              )}

              {/* iOS Home Bar Indicator */}
              <div className="h-5 w-full bg-[#001421] shrink-0 flex items-center justify-center">
                <div className="w-32 h-1 bg-slate-700 rounded-full" />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. PROGRESSIVE MUSCLE RELAXATION (PMR) MODAL (WEB VIEW)                   */}
        {/* ========================================================================= */}
        {viewport === 'web' && isPmrOpen && (
          <div className="backdrop-blur-xl bg-slate-950/80 fixed inset-0 flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-300">
            <div className="bg-white rounded-[36px] sm:rounded-[44px] shadow-2xl p-6 sm:p-10 border border-slate-100 max-w-2xl w-full text-slate-900 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
                <div
                  className="h-full bg-[#00A884] transition-all duration-300 ease-out"
                  style={{
                    width:
                      pmrStep === 'pre_checkin'
                        ? '33%'
                        : pmrStep === 'active_player'
                        ? `${33 + ((activeRegionIndex + 1) / activeRegions.length) * 45}%`
                        : '100%'
                  }}
                />
              </div>

              <div className="flex items-center justify-between mb-4 pt-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8F8F2] text-[#00A884] text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#00A884]" />
                  <span>
                    {pmrStep === 'pre_checkin' && 'Step 1 of 3 • Pre-Check-In'}
                    {pmrStep === 'active_player' &&
                      `Step 2 of 3 • Region ${activeRegionIndex + 1} of ${activeRegions.length}`}
                    {pmrStep === 'recalibration' && 'Step 3 of 3 • Recalibration & Notes'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                      soundEnabled ? 'bg-[#E8F8F2] text-[#00A884]' : 'bg-slate-100 text-slate-400'
                    }`}
                    title={soundEnabled ? 'Sound On' : 'Muted'}
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setIsPmrOpen(false);
                      voiceAudioRef.current?.pause();
                      audioEngine.stopAmbientDrone();
                      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                      }
                    }}
                    className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {pmrStep === 'pre_checkin' && (
                <div className="space-y-6 py-2">
                  <div className="text-left">
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      Progressive Muscle Relaxation (PMR)
                    </h2>
                    <p className="text-slate-600 text-sm mt-1">
                      Release somatic tension and activate your body&apos;s restorative relaxation response.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-bold text-slate-800">How tense is your body right now?</label>
                      <span className="text-base font-extrabold text-[#00A884] bg-white px-3 py-1 rounded-xl shadow-xs border border-slate-200">
                        {preTension} / 10
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={preTension}
                      onChange={(e) => setPreTension(Number(e.target.value))}
                      className="w-full accent-[#00A884] cursor-pointer h-2 bg-slate-200 rounded-lg"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
                      <span>1 = Completely relaxed</span>
                      <span>5 = Moderate tightness</span>
                      <span>10 = Severe tightness</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wider">
                      Preset Duration:
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: '5min', title: '5 Min Quick', desc: '4 Core tension nodes' },
                        { id: '10min', title: '10 Min Full', desc: 'All 7 muscle regions' },
                        { id: '15min', title: '15 Min Sleep', desc: 'Extended deep unwind' }
                      ].map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => {
                            triggerHaptic();
                            setSelectedPreset(preset.id as PmrPreset);
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            selectedPreset === preset.id
                              ? 'bg-emerald-50 border-[#00A884] shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="font-bold text-xs text-slate-900">{preset.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{preset.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Release-Only Mode (No tensing, for physical comfort or pain)
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Gentle softening for fibromyalgia, injury, or physical discomfort.
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        triggerHaptic();
                        setReleaseOnlyMode(!releaseOnlyMode);
                      }}
                      className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                        releaseOnlyMode ? 'bg-[#00A884]' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                          releaseOnlyMode ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <button
                    onClick={handleStartPmr}
                    className="w-full py-4 bg-[#00A884] hover:bg-[#009272] active:scale-98 text-white font-bold text-sm rounded-full shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Begin PMR Journey</span>
                  </button>
                </div>
              )}

              {pmrStep === 'active_player' && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-full flex items-center justify-between">
                    <div className="text-left text-xs text-slate-500">
                      <span>
                        Region {activeRegionIndex + 1} of {activeRegions.length}
                      </span>
                      <span className="mx-1.5">·</span>
                      <strong className="text-slate-900 font-bold text-sm">{currentRegion.name}</strong>
                    </div>

                    {currentPhase === 'tense' ? (
                      <div className="border border-[#FBBF24] bg-[#FFFBEB] text-[#B45309] font-bold text-xs uppercase px-4 py-1.5 rounded-full shadow-xs">
                        {releaseOnlyMode ? 'GENTLE FOCUS & SOFTEN' : 'TENSE & HOLD (6 SECONDS)'}
                      </div>
                    ) : (
                      <div className="border border-[#34D399] bg-[#ECFDF5] text-[#065F46] font-bold text-xs uppercase px-4 py-1.5 rounded-full shadow-xs">
                        DEEP SOMATIC RELEASE (12 SECONDS)
                      </div>
                    )}
                  </div>

                  <div className="relative w-72 h-72 sm:w-80 sm:h-80 bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] rounded-[36px] flex items-center justify-center border border-slate-100 overflow-hidden shadow-inner">
                    <div
                      className={`absolute w-56 h-56 rounded-full border transition-all duration-700 pointer-events-none ${
                        currentPhase === 'tense'
                          ? 'border-amber-400/30 bg-amber-400/5 animate-pulse'
                          : 'border-emerald-400/40 bg-emerald-400/5 scale-105'
                      }`}
                    />

                    <svg viewBox="0 0 200 240" className="w-48 h-60 drop-shadow-sm transition-all duration-300">
                      <circle
                        cx="100"
                        cy="38"
                        r="16"
                        fill={
                          currentRegion.id === 'face' ? (currentPhase === 'tense' ? '#F59E0B' : '#00A884') : '#CBD5E1'
                        }
                      />
                      <path
                        d="M84 56 H116 L140 72 C146 76 150 82 150 90 L148 108 H52 L50 90 C50 82 54 76 60 72 Z"
                        fill={
                          currentRegion.id === 'shoulders'
                            ? currentPhase === 'tense'
                              ? '#F59E0B'
                              : '#00A884'
                            : '#CBD5E1'
                        }
                      />
                      <path
                        d="M60 104 H140 L136 136 H64 Z"
                        fill={
                          currentRegion.id === 'chest' ? (currentPhase === 'tense' ? '#F59E0B' : '#00A884') : '#94A3B8'
                        }
                      />
                      <path
                        d="M50 86 L34 130 C32 138 36 144 44 146 L58 148"
                        fill="none"
                        stroke={
                          currentRegion.id === 'arms' ? (currentPhase === 'tense' ? '#F59E0B' : '#00A884') : '#CBD5E1'
                        }
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path d="M48 94 L38 126" stroke="#0F172A" strokeWidth="2.5" opacity="0.3" strokeLinecap="round" />
                      <path
                        d="M150 86 L166 130 C168 138 164 144 156 146 L142 148"
                        fill="none"
                        stroke={
                          currentRegion.id === 'arms' ? (currentPhase === 'tense' ? '#F59E0B' : '#00A884') : '#CBD5E1'
                        }
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path d="M152 94 L162 126" stroke="#0F172A" strokeWidth="2.5" opacity="0.3" strokeLinecap="round" />
                      <path
                        d="M66 136 H134 L130 166 H70 Z"
                        fill={
                          currentRegion.id === 'abdomen' ? (currentPhase === 'tense' ? '#F59E0B' : '#00A884') : '#CBD5E1'
                        }
                      />
                      <rect
                        x="72"
                        y="168"
                        width="24"
                        height="64"
                        rx="4"
                        fill={
                          currentRegion.id === 'legs' ? (currentPhase === 'tense' ? '#F59E0B' : '#00A884') : '#94A3B8'
                        }
                      />
                      <rect
                        x="104"
                        y="168"
                        width="24"
                        height="64"
                        rx="4"
                        fill={
                          currentRegion.id === 'legs' ? (currentPhase === 'tense' ? '#F59E0B' : '#00A884') : '#94A3B8'
                        }
                      />
                      <ellipse
                        cx="84"
                        cy="234"
                        rx="12"
                        ry="5"
                        fill={
                          currentRegion.id === 'feet' ? (currentPhase === 'tense' ? '#F59E0B' : '#00A884') : '#CBD5E1'
                        }
                      />
                      <ellipse
                        cx="116"
                        cy="234"
                        rx="12"
                        ry="5"
                        fill={
                          currentRegion.id === 'feet' ? (currentPhase === 'tense' ? '#F59E0B' : '#00A884') : '#CBD5E1'
                        }
                      />
                    </svg>

                    <div className="absolute bottom-5 right-5 w-12 h-12 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center text-sm font-extrabold text-slate-800">
                      {phaseSecondsLeft}s
                    </div>
                  </div>

                  <div className="text-center px-4 max-w-lg">
                    <h3 className="text-xl font-extrabold text-slate-900">{currentRegion.name}</h3>
                    <p className="text-slate-600 text-xs sm:text-sm mt-1.5 leading-relaxed min-h-[44px]">
                      {releaseOnlyMode && currentPhase === 'tense'
                        ? currentRegion.softenPrompt
                        : currentPhase === 'tense'
                        ? currentRegion.tensePrompt
                        : currentRegion.releasePrompt}
                    </p>
                  </div>

                  <div className="w-full rounded-[24px] bg-[#F8FAFC] border border-slate-200/80 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl text-xs font-bold">
                        <button
                          onClick={() => {
                            triggerHaptic();
                            audioEngine.initContext();
                            setAudioTrackMode('voice');
                            audioEngine.stopAmbientDrone();
                            if (soundEnabled && isPlayerPlaying && voiceAudioRef.current) {
                              voiceAudioRef.current.play().catch(() => {});
                            }
                          }}
                          className={`py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                            audioTrackMode === 'voice'
                              ? 'bg-white text-slate-800 shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          🎙️ Guided Voice Track
                        </button>
                        <button
                          onClick={() => {
                            triggerHaptic();
                            audioEngine.initContext();
                            setAudioTrackMode('ambient');
                            if (voiceAudioRef.current) voiceAudioRef.current.pause();
                            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                              window.speechSynthesis.cancel();
                            }
                            if (soundEnabled && isPlayerPlaying) audioEngine.startAmbientDrone();
                          }}
                          className={`py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                            audioTrackMode === 'ambient'
                              ? 'bg-white text-slate-800 shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          🎵 Ambient Drone (108Hz)
                        </button>
                      </div>

                      <div className="flex items-center gap-2 flex-1 justify-end min-w-[160px] max-w-xs">
                        <span className="text-xs font-mono text-slate-500">{formatAudioTime(audioCurrentTime)}</span>
                        <input
                          type="range"
                          min="0"
                          max={audioDuration || 300}
                          value={audioCurrentTime}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setAudioCurrentTime(val);
                            if (voiceAudioRef.current) voiceAudioRef.current.currentTime = val;
                          }}
                          className="w-full accent-[#00A884] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                        <span className="text-xs font-mono text-slate-500">
                          {formatAudioTime(audioDuration || 300)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={handlePrevRegion}
                        disabled={activeRegionIndex === 0}
                        className="px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Previous Region</span>
                      </button>

                      <button
                        onClick={() => {
                          triggerHaptic();
                          audioEngine.initContext();
                          const nextPlaying = !isPlayerPlaying;
                          setIsPlayerPlaying(nextPlaying);
                          if (nextPlaying && soundEnabled) {
                            if (audioTrackMode === 'voice' && voiceAudioRef.current) {
                              voiceAudioRef.current.play().catch(() => {});
                            } else if (audioTrackMode === 'ambient') {
                              audioEngine.startAmbientDrone();
                            }
                          } else {
                            voiceAudioRef.current?.pause();
                            audioEngine.stopAmbientDrone();
                            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                              window.speechSynthesis.cancel();
                            }
                          }
                        }}
                        className="w-12 h-12 rounded-full bg-[#00A884] text-white flex items-center justify-center shadow-md hover:bg-[#009272] active:scale-95 transition-all cursor-pointer"
                        title={isPlayerPlaying ? 'Pause PMR Session' : 'Play PMR Session'}
                      >
                        {isPlayerPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </button>

                      <button
                        onClick={handleNextRegion}
                        className="px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <span>Next Region</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs pt-2 border-t border-slate-200/60 gap-2">
                      <div className="flex items-center gap-2 text-slate-600">
                        <button
                          onClick={() => {
                            audioEngine.initContext();
                            setSoundEnabled(!soundEnabled);
                          }}
                          className="p-1 hover:bg-slate-200/70 rounded-md transition-colors cursor-pointer text-slate-700"
                          title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
                        >
                          {soundEnabled ? (
                            <Volume2 className="w-4 h-4 text-[#00A884]" />
                          ) : (
                            <VolumeX className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        <span className="text-[11px] font-semibold">{soundEnabled ? 'Volume' : 'Muted'}</span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={soundEnabled ? audioVolume : 0}
                          onChange={(e) => {
                            if (!soundEnabled) setSoundEnabled(true);
                            setAudioVolume(Number(e.target.value));
                          }}
                          className="w-20 accent-[#00A884] cursor-pointer h-1"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        {isPlayerPlaying && soundEnabled && (
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>{audioTrackMode === 'voice' ? '🎙️ Guided Voice Track' : '🎵 108Hz Drone'}</span>
                          </div>
                        )}
                        <span className="text-[11px] font-mono font-bold text-[#00A884]">
                          {currentPhase === 'tense' ? 'TENSE: 6s' : 'RELEASE: 12s'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {pmrStep === 'recalibration' && (
                <div className="space-y-5 py-2">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-full bg-[#D1FAE5] text-[#059669] flex items-center justify-center mx-auto mb-2 shadow-xs">
                      <Check className="w-7 h-7 stroke-[3]" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      Session Completed & Calibrated
                    </h2>
                    <p className="text-slate-600 text-xs mt-1">
                      Check in with your body now that your muscle groups have completed full tension release.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-bold text-slate-800">
                        Re-rate your bodily tension right now:
                      </label>
                      <span className="text-base font-extrabold text-[#00A884] bg-white px-3 py-1 rounded-xl shadow-xs border border-slate-200">
                        {postTension} / 10
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={postTension}
                      onChange={(e) => setPostTension(Number(e.target.value))}
                      className="w-full accent-[#00A884] cursor-pointer h-2 bg-slate-200 rounded-lg"
                    />
                  </div>

                  <div className="p-5 bg-[#ECFDF5] rounded-2xl border border-[#A7F3D0] text-center">
                    <span className="text-[11px] font-bold text-[#065F46] uppercase tracking-wider block">
                      Somatic Relief Summary
                    </span>
                    <div className="text-xl font-extrabold text-[#065F46] mt-1">
                      Tension lowered from {preTension} to {postTension} (
                      {Math.max(0, Math.round(((preTension - postTension) / preTension) * 100))}% Physical Tightness
                      Relief)
                    </div>
                    <p className="text-xs text-[#065F46]/80 mt-1">
                      Your parasympathetic nervous system has been grounded.
                    </p>
                  </div>

                  <div className="pt-2">
                    {savedNotesToast && (
                      <div className="p-3 mb-2 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-semibold flex items-center justify-center gap-2">
                        <Check className="w-4 h-4 text-emerald-700" />
                        <span>Saved to My Clinical Notes successfully!</span>
                      </div>
                    )}
                    <button
                      onClick={handleSavePmrRecord}
                      className="w-full py-4 bg-[#00A884] hover:bg-[#009272] active:scale-98 text-white font-bold text-sm rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save to My Clinical Notes</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. DBT STOP SKILL MODAL (WEB VIEW)                                        */}
        {/* ========================================================================= */}
        {viewport === 'web' && isDbtStopOpen && (
          <div className="backdrop-blur-xl bg-slate-950/90 fixed inset-0 flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-300">
            <div className="bg-white rounded-[36px] sm:rounded-[44px] shadow-2xl p-6 sm:p-8 border border-slate-100 max-w-xl w-full text-slate-900 relative overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 text-purple-900 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                  <span>
                    {bulletState === 0 && 'Emergency Breaker · Ready'}
                    {bulletState === 1 && 'S — Hard E-Brake (Press & Hold)'}
                    {bulletState === 2 && 'T — Camera Pull-Out & Somatic Breath'}
                    {bulletState === 3 && 'O — Incident Spotlight (Tap & Reveal)'}
                    {bulletState === 4 && 'P — Dual-Track Values Rail'}
                  </span>
                </div>
                <button
                  onClick={() => setIsDbtStopOpen(false)}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {bulletState === 0 && (
                <div className="py-4 text-center space-y-6 flex flex-col items-center">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      Acute Emotional Surge Detected
                    </h2>
                    <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-md">
                      Adrenaline is rushing. Your amygdala wants an instant, destructive reaction. Prepare to pull the
                      emergency brake.
                    </p>
                  </div>

                  <div className="relative w-64 h-64 rounded-3xl bg-slate-950 border border-purple-500/30 flex items-center justify-center overflow-hidden shadow-inner">
                    <div className="absolute w-3 h-3 rounded-full bg-rose-500 animate-ping top-8 left-12" />
                    <div className="absolute w-2 h-2 rounded-full bg-amber-400 animate-bounce bottom-10 right-14" />
                    <div className="absolute w-4 h-4 rounded-full bg-purple-500 animate-pulse top-16 right-10" />
                    <div className="w-32 h-32 rounded-full border-2 border-rose-500/40 animate-spin flex items-center justify-center">
                      <Zap className="w-12 h-12 text-rose-500" />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      triggerHaptic();
                      setBulletState(1);
                      if (soundEnabled) audioEngine.playSubBassDrop();
                    }}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm rounded-full shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Engage Bullet-Time E-Brake →</span>
                  </button>
                </div>
              )}

              {bulletState === 1 && (
                <div className="py-2 text-center space-y-5 flex flex-col items-center select-none">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      Press & Hold to Freeze Time
                    </h2>
                    <p className="text-slate-600 text-xs mt-1 max-w-md">
                      Do not release. Maintain firm pressure until time freezes solid.
                    </p>
                  </div>

                  <div
                    onMouseDown={() => {
                      setIsEBrakePressed(true);
                      triggerHaptic();
                      if (soundEnabled) audioEngine.playTone(396, 3.0, 'sine', 0.12);
                    }}
                    onMouseUp={() => setIsEBrakePressed(false)}
                    onTouchStart={() => {
                      setIsEBrakePressed(true);
                      triggerHaptic();
                      if (soundEnabled) audioEngine.playTone(396, 3.0, 'sine', 0.12);
                    }}
                    onTouchEnd={() => setIsEBrakePressed(false)}
                    className="relative w-64 h-64 rounded-full bg-slate-900 border-4 border-purple-500/40 flex flex-col items-center justify-center cursor-pointer shadow-2xl active:scale-95 transition-all overflow-hidden"
                  >
                    <div
                      className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-purple-600 to-indigo-600 opacity-60 transition-all"
                      style={{ height: `${eBrakeProgress}%` }}
                    />
                    <div className="relative z-10 flex flex-col items-center pointer-events-none">
                      <svg
                        viewBox="0 0 160 160"
                        width="120"
                        height="120"
                        fill="none"
                        className={isEBrakePressed ? 'animate-spin' : ''}
                      >
                        <circle cx="80" cy="80" r="54" stroke="#C4B5FD" strokeWidth="2.5" strokeDasharray="8 6" />
                        <circle cx="80" cy="80" r="42" fill="#6D28D9" fillOpacity="0.3" stroke="#8B5CF6" strokeWidth="1.5" />
                        <polygon points="80,62 92,75 80,88 68,75" fill="#8B5CF6" />
                      </svg>
                      <span className="text-white font-extrabold text-xs uppercase tracking-widest mt-1">
                        {isEBrakePressed ? `Freezing ${eBrakeProgress}%` : 'Hold Here'}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                    Physical resistance breaks the reflex loop
                  </span>
                </div>
              )}

              {bulletState === 2 && (
                <div className="py-2 text-center space-y-5 flex flex-col items-center">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      Camera Pull-Out (Decentering)
                    </h2>
                    <p className="text-slate-600 text-xs mt-1 max-w-md">
                      Notice how the crisis shrinks. What felt like your entire world is just one small tile on a table.
                    </p>
                  </div>

                  <div className="relative w-72 h-64 rounded-3xl bg-slate-900 border border-slate-800 p-4 flex flex-col items-center justify-center overflow-hidden">
                    <svg viewBox="0 0 240 140" width="220" height="130" fill="none">
                      <polygon points="120,10 220,60 120,110 20,60" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
                      <polygon points="20,60 120,110 120,125 20,75" fill="#0F172A" />
                      <polygon points="220,60 120,110 120,125 220,75" fill="#1E293B" />
                      <line x1="70" y1="35" x2="170" y2="85" stroke="#334155" strokeWidth="1" strokeDasharray="2 3" />
                      <line x1="170" y1="35" x2="70" y2="85" stroke="#334155" strokeWidth="1" strokeDasharray="2 3" />
                      <ellipse cx="120" cy="60" rx="20" ry="10" fill="#7C3AED" fillOpacity="0.4" stroke="#8B5CF6" strokeWidth="1.5" />
                      <circle cx="120" cy="55" r="5" fill="#FBBF24" />
                    </svg>
                    <span className="text-[11px] font-mono text-purple-300 mt-1">Spatial Zoom: 40% Perspective</span>
                  </div>

                  <button
                    onClick={() => {
                      triggerHaptic();
                      setBulletState(3);
                      if (soundEnabled) audioEngine.playTone(528, 1.0, 'sine', 0.08);
                    }}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-full shadow-md cursor-pointer"
                  >
                    Enter Incident Spotlight →
                  </button>
                </div>
              )}

              {bulletState === 3 && (
                <div className="py-2 text-center space-y-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Spotlight the Facts</h2>
                    <p className="text-slate-600 text-xs max-w-md mx-auto">
                      Sweep your light across the frozen scene to separate objective truths from emotional illusions:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 max-w-md mx-auto">
                    {[
                      {
                        id: 'surge',
                        tag: 'The Bodily Surge',
                        title: 'Adrenaline is firing; your heart rate spiked. You are physically safe right now.',
                        freq: 440
                      },
                      {
                        id: 'trigger',
                        tag: 'The Prompting Fact',
                        title: 'A message was read, or an event occurred. Reality clashed with an expectation.',
                        freq: 528
                      },
                      {
                        id: 'mirage',
                        tag: 'The Mirage',
                        title:
                          'Your mind insists that burning a bridge or yelling will give you immediate relief. It will not.',
                        freq: 639
                      }
                    ].map((node) => {
                      const isRevealed = spotlightNodesRevealed.includes(node.id);
                      return (
                        <div
                          key={node.id}
                          onClick={() => {
                            triggerHaptic();
                            if (soundEnabled) audioEngine.playTone(node.freq, 0.8, 'triangle', 0.08);
                            setSpotlightNodesRevealed((prev) =>
                              prev.includes(node.id) ? prev : [...prev, node.id]
                            );
                          }}
                          className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                            isRevealed
                              ? 'bg-purple-50 border-purple-500 shadow-xs'
                              : 'bg-slate-50 border-slate-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-0.5">
                            <span className={isRevealed ? 'text-purple-800' : 'text-slate-400'}>{node.tag}</span>
                            <span>{isRevealed ? 'Illuminated ✓' : 'Tap Spotlight 🔦'}</span>
                          </div>
                          <p
                            className={`text-xs font-semibold ${
                              isRevealed ? 'text-slate-900' : 'text-slate-400 filter blur-[2px]'
                            }`}
                          >
                            {node.title}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      triggerHaptic();
                      setBulletState(4);
                      if (soundEnabled) audioEngine.playTone(639, 1.2, 'sine', 0.08);
                    }}
                    disabled={spotlightNodesRevealed.length < 2}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold text-sm rounded-full shadow-md cursor-pointer mt-2"
                  >
                    Proceed to Values Rail Switch →
                  </button>
                </div>
              )}

              {bulletState === 4 && (
                <div className="py-2 text-center space-y-5 flex flex-col items-center">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      Proceed Mindfully (Values Rail)
                    </h2>
                    <p className="text-slate-600 text-xs mt-1 max-w-md">
                      Flick the track switch from Impulsive Reaction (Track A) to Values Alignment (Track B).
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-3xl border border-slate-200 w-full max-w-md">
                    <svg viewBox="0 0 280 90" width="100%" height="90" fill="none">
                      <path
                        d="M20 45 L100 45 L180 25 L260 25"
                        stroke={railSwitchPosition === 'A' ? '#F43F5E' : '#CBD5E1'}
                        strokeWidth="3"
                        strokeDasharray="4 4"
                      />
                      <circle cx="260" cy="25" r="6" fill={railSwitchPosition === 'A' ? '#F43F5E' : '#94A3B8'} />
                      <path
                        d="M20 45 L100 45 L180 65 L260 65"
                        stroke={railSwitchPosition === 'B' ? '#00A884' : '#CBD5E1'}
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      <circle cx="260" cy="65" r="7" fill={railSwitchPosition === 'B' ? '#00A884' : '#94A3B8'} />
                      <circle cx="100" cy="45" r="9" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
                      <circle cx="100" cy="45" r="4" fill={railSwitchPosition === 'B' ? '#00A884' : '#F43F5E'} />
                      <text x="180" y="20" fill="#9F1239" fontSize="10" fontWeight="bold">
                        Track A: Impulsive Reply
                      </text>
                      <text x="180" y="82" fill="#065F46" fontSize="10" fontWeight="bold">
                        Track B: 15m Value Pause
                      </text>
                    </svg>

                    <div className="flex justify-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          triggerHaptic();
                          setRailSwitchPosition('B');
                          if (soundEnabled) audioEngine.playPhaseCue('complete');
                        }}
                        className={`py-2 px-5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          railSwitchPosition === 'B'
                            ? 'bg-[#00A884] text-white shadow-md'
                            : 'bg-white border border-slate-200 text-slate-700'
                        }`}
                      >
                        {railSwitchPosition === 'B' ? 'Track B Locked In ✓' : 'Flick Switch to Track B'}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      triggerHaptic();
                      if (soundEnabled) audioEngine.playPhaseCue('complete');
                      setIsDbtStopOpen(false);
                    }}
                    disabled={railSwitchPosition !== 'B'}
                    className="w-full py-4 bg-[#00A884] hover:bg-[#009272] disabled:opacity-40 text-white font-bold text-sm rounded-full shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Complete Bullet-Time Grounding</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. WORRY WINDOW & SORTING MODAL (WEB VIEW - 2-COLUMN TRIAGE & VAULT)      */}
        {/* ========================================================================= */}
        {viewport === 'web' && isWorryOpen && (
          <div className="backdrop-blur-xl bg-slate-950/85 fixed inset-0 flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-300">
            <div className="bg-[#001724] border border-[#00344d] rounded-[36px] sm:rounded-[44px] shadow-2xl p-6 sm:p-8 max-w-4xl w-full text-white relative overflow-hidden flex flex-col max-h-[92vh]">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#00344d] mb-4 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-400/20 border border-teal-400/40 flex items-center justify-center text-teal-300 font-bold shadow-xs">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-base font-bold text-white tracking-tight">Worry Window &amp; Sorting</h2>
                    <p className="text-[11px] text-[#93c5d6]">Sensory Grounding &amp; Cognitive Postponement</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="flex items-center bg-[#00121d] border border-[#00344d] rounded-xl p-0.5 text-xs font-semibold">
                    <button
                      onClick={() => {
                        triggerHaptic();
                        setWorryFlowStep('triage');
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        worryFlowStep === 'triage'
                          ? 'bg-[#26c6da] text-[#001724] font-extrabold shadow-xs'
                          : 'text-[#93c5d6] hover:text-white'
                      }`}
                    >
                      <span>✍️ Triage</span>
                    </button>
                    <button
                      onClick={() => {
                        triggerHaptic();
                        setWorryFlowStep('vault');
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        worryFlowStep === 'vault'
                          ? 'bg-[#26c6da] text-[#001724] font-extrabold shadow-xs'
                          : 'text-[#93c5d6] hover:text-white'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Vault &amp; Review ({activeWorries.length})</span>
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      triggerHaptic();
                      setIsWorryOpen(false);
                    }}
                    className="p-2 rounded-xl text-[#719bb0] hover:text-white hover:bg-[#002a3d] transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body: Triage (2-Column Web Workspace) vs Vault */}
              <div className="flex-1 overflow-y-auto pr-1">
                {worryFlowStep === 'triage' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column: 3-Step Triage Pipeline */}
                    <div className="lg:col-span-7 space-y-5">
                      <div className="relative px-4 pt-3 pb-3 bg-[#001420]/80 border border-[#002b3d] rounded-2xl backdrop-blur-sm">
                        <div className="absolute top-[28px] left-12 right-12 h-1.5 bg-[#002233] rounded-full z-0 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#10b981] via-[#26c6da] to-[#26c6da] transition-all duration-500 ease-out"
                            style={{
                              width: worryStep === 1 ? '0%' : worryStep === 2 ? '50%' : '100%'
                            }}
                          />
                        </div>

                        <div className="relative flex items-center justify-between z-10">
                          {[
                            { step: 1, title: 'Step 1', label: 'Capture' },
                            { step: 2, title: 'Step 2', label: 'Classify' },
                            { step: 3, title: 'Step 3', label: 'Secure' }
                          ].map((item) => {
                            const isDone = worryStep > item.step;
                            const isCurrent = worryStep === item.step;
                            return (
                              <div key={item.step} className="flex flex-col items-center">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                                    isDone
                                      ? 'bg-[#032e29] border-2 border-[#10b981] text-[#34d399] ring-2 ring-[#10b981]/30'
                                      : isCurrent
                                      ? 'bg-[#26c6da] border-2 border-white text-[#001724] ring-4 ring-[#26c6da]/35 scale-110 font-extrabold'
                                      : 'bg-[#001724] border border-[#00384f] text-[#558198]'
                                  }`}
                                >
                                  {isDone ? (
                                    <Check className="w-5 h-5 stroke-[3] text-[#34d399]" />
                                  ) : (
                                    <span>{item.step}</span>
                                  )}
                                </div>
                                <span
                                  className={`mt-1.5 text-[10px] font-extrabold tracking-wider uppercase ${
                                    isDone ? 'text-[#34d399]' : isCurrent ? 'text-[#26c6da]' : 'text-[#487186]'
                                  }`}
                                >
                                  {item.title}
                                </span>
                                <span
                                  className={`text-xs font-semibold ${
                                    isDone ? 'text-[#a7f3d0]' : isCurrent ? 'text-white' : 'text-[#558198]'
                                  }`}
                                >
                                  {item.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Step 1: Capture */}
                      {worryStep === 1 && (
                        <div className="space-y-4 text-left animate-in fade-in">
                          <div className="p-4 bg-[#001724] rounded-2xl border border-[#002d40]">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 rounded-full bg-[#26c6da]/15 border border-[#26c6da]/40 text-[#26c6da] text-[10px] font-extrabold tracking-wider uppercase">
                                Step 1 of 3
                              </span>
                              <span className="text-xs font-semibold text-[#82abbf]">
                                Express &amp; Externalize Concern
                              </span>
                            </div>
                            <h3 className="text-2xl font-black text-white tracking-tight">What is on your mind?</h3>
                            <p className="text-xs text-[#93c5d6] mt-0.5 leading-relaxed">
                              Be direct. Name the intrusive thought or worry loop you are experiencing:
                            </p>
                          </div>

                          <textarea
                            value={worryInput}
                            onChange={(e) => setWorryInput(e.target.value)}
                            placeholder="e.g. What if I completely blank out during my presentation tomorrow?"
                            rows={3}
                            autoFocus
                            className="w-full p-4 rounded-2xl border border-[#00344d] text-sm text-white placeholder-[#5d8599] focus:outline-none focus:border-[#26c6da] focus:ring-1 focus:ring-[#26c6da] bg-[#00121d] leading-relaxed transition-all shadow-inner"
                          />

                          <div className="flex flex-wrap gap-1.5">
                            {WORRY_CAPTURE_CHIPS.map((chip) => (
                              <button
                                key={chip}
                                type="button"
                                onClick={() => {
                                  triggerHaptic();
                                  setWorryInput(chip);
                                }}
                                className="px-2.5 py-1 rounded-full bg-[#001e2e] hover:bg-[#002c42] border border-[#00384f] text-[11px] text-[#93c5d6] hover:text-white transition cursor-pointer"
                              >
                                + {chip}
                              </button>
                            ))}
                          </div>

                          <div className="pt-2 flex items-center justify-end">
                            <button
                              onClick={() => {
                                if (!worryInput.trim()) return;
                                triggerHaptic();
                                setWorryStep(2);
                              }}
                              disabled={!worryInput.trim()}
                              className="px-6 py-3 rounded-full bg-[#26c6da] hover:bg-[#20b2c4] disabled:opacity-40 text-[#001724] font-extrabold text-xs cursor-pointer transition-all flex items-center gap-2 shadow-lg shadow-teal-950/40"
                            >
                              <span>Continue to Step 2: Classify</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Classify */}
                      {worryStep === 2 && (
                        <div className="space-y-4 text-left animate-in fade-in">
                          <div className="p-4 bg-[#001724] rounded-2xl border border-[#002d40]">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 rounded-full bg-[#26c6da]/15 border border-[#26c6da]/40 text-[#26c6da] text-[10px] font-extrabold tracking-wider uppercase">
                                Step 2 of 3
                              </span>
                              <span className="text-xs font-semibold text-[#82abbf]">Sphere of Control</span>
                            </div>
                            <h3 className="text-2xl font-black text-white tracking-tight">Can you act on this today?</h3>
                            <p className="text-xs text-[#93c5d6] mt-0.5 leading-relaxed">
                              Differentiate between direct actionable control and hypothetical uncertainty:
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <button
                              onClick={() => {
                                triggerHaptic();
                                setWorryTriageChoice('actionable');
                              }}
                              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                                worryTriageChoice === 'actionable'
                                  ? 'bg-[#032e29] border-2 border-[#10b981] text-white ring-2 ring-[#10b981]/30'
                                  : 'bg-[#001e2e] border-[#00344d] text-slate-300 hover:border-[#004e75]'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-emerald-300 font-extrabold text-sm">⚡ Yes, Actionable</span>
                                {worryTriageChoice === 'actionable' && (
                                  <span className="px-2 py-0.5 rounded-full bg-[#10b981]/25 text-[#34d399] text-[10px] font-bold">
                                    Selected
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] font-normal text-[#a7f3d0]/90 leading-relaxed block">
                                I have direct control and can execute one micro-step today.
                              </span>
                            </button>

                            <button
                              onClick={() => {
                                triggerHaptic();
                                setWorryTriageChoice('hypothetical');
                              }}
                              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                                worryTriageChoice === 'hypothetical'
                                  ? 'bg-[#002636] border-2 border-[#26c6da] text-white ring-2 ring-[#26c6da]/30'
                                  : 'bg-[#001e2e] border-[#00344d] text-slate-300 hover:border-[#004e75]'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[#26c6da] font-extrabold text-sm">🌀 No, Hypothetical</span>
                                {worryTriageChoice === 'hypothetical' && (
                                  <span className="px-2 py-0.5 rounded-full bg-[#26c6da]/25 text-[#26c6da] text-[10px] font-bold">
                                    Selected
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] font-normal text-[#93c5d6] leading-relaxed block">
                                Uncertainty out of my hands. Park into vault for review window.
                              </span>
                            </button>
                          </div>

                          {worryTriageChoice === 'actionable' && (
                            <div className="p-4 bg-[#032e29]/70 border-2 border-[#10b981]/60 rounded-2xl space-y-2 animate-in fade-in">
                              <label className="text-xs font-bold text-[#34d399] flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Define 1 micro-step (under 5 minutes):</span>
                              </label>
                              <input
                                type="text"
                                value={actionStepInput}
                                onChange={(e) => setActionStepInput(e.target.value)}
                                placeholder="e.g. Draft 1 email or open syllabus outline"
                                className="w-full p-3 bg-[#00121d] rounded-xl border border-[#10b981]/50 text-xs text-white placeholder-[#5d8599] focus:outline-none focus:border-[#26c6da]"
                              />
                              <div className="flex flex-wrap gap-1.5">
                                {MICRO_STEP_CHIPS.map((chip) => (
                                  <button
                                    key={chip}
                                    type="button"
                                    onClick={() => {
                                      triggerHaptic();
                                      setActionStepInput(chip);
                                    }}
                                    className="px-2.5 py-0.5 rounded-full bg-[#001e2e] border border-[#10b981]/40 text-[10px] text-emerald-200 hover:bg-emerald-900/40 cursor-pointer"
                                  >
                                    + {chip}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="pt-2 flex items-center justify-between gap-2">
                            <button
                              onClick={() => {
                                triggerHaptic();
                                setWorryStep(1);
                              }}
                              className="px-4 py-2.5 rounded-full border border-[#00344d] bg-[#001a24] text-xs font-semibold text-[#93c5d6] hover:text-white cursor-pointer"
                            >
                              ← Back to Step 1
                            </button>
                            <button
                              onClick={() => {
                                if (!worryTriageChoice) return;
                                if (worryTriageChoice === 'actionable' && !actionStepInput.trim()) return;
                                triggerHaptic();
                                setWorryStep(3);
                              }}
                              disabled={
                                !worryTriageChoice || (worryTriageChoice === 'actionable' && !actionStepInput.trim())
                              }
                              className="px-6 py-3 rounded-full bg-[#26c6da] hover:bg-[#20b2c4] disabled:opacity-40 text-[#001724] font-extrabold text-xs cursor-pointer transition-all flex items-center gap-2 shadow-lg shadow-teal-950/40"
                            >
                              <span>Proceed to Step 3: Vault</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Step 3: Mechanical Vault Lock-In */}
                      {worryStep === 3 && (
                        <div className="text-center animate-in fade-in">
                          <div className="mb-2">
                            <span className="text-[10px] font-bold tracking-widest text-[#26c6da] uppercase">
                              03 / 03 • SECURE IN VAULT
                            </span>
                            <h3 className="text-xl font-black text-white tracking-tight mt-0.5">
                              Seal Concern into Vault
                            </h3>
                          </div>

                          <MechanicalVaultVisualizer
                            phase={vaultAnimPhase}
                            worryText={worryInput}
                            worryType={worryTriageChoice}
                            scheduledTime={worryWindowTime}
                            onLockTrigger={handleTriggerVaultLock}
                            onTumblerClick={() => soundEnabled && audioEngine.playTumblerClick()}
                          />

                          {vaultAnimPhase === 'locked' && (
                            <div className="pt-3 space-y-2 max-w-sm mx-auto animate-in fade-in">
                              <button
                                onClick={() => {
                                  triggerHaptic();
                                  setWorryInput('');
                                  setActionStepInput('');
                                  setWorryTriageChoice(null);
                                  setWorryStep(1);
                                  setVaultAnimPhase('ready');
                                  setWorryFlowStep('vault');
                                }}
                                className="w-full py-3 bg-[#26c6da] hover:bg-[#20b2c4] text-[#001724] font-bold text-xs rounded-full shadow-md cursor-pointer transition-all uppercase tracking-wider"
                              >
                                View Stored Worries in Vault ({activeWorries.length})
                              </button>
                              <button
                                onClick={() => {
                                  triggerHaptic();
                                  setWorryInput('');
                                  setActionStepInput('');
                                  setWorryTriageChoice(null);
                                  setWorryStep(1);
                                  setVaultAnimPhase('ready');
                                  setIsWorryOpen(false);
                                }}
                                className="w-full py-2.5 bg-[#001e2e] hover:bg-[#00283d] text-[#93c5d6] hover:text-white font-semibold text-xs rounded-full border border-[#00344d] cursor-pointer transition-all"
                              >
                                Return to Self-Care Library
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Column: Containment & Grounding Monitor (Desktop Differentiation) */}
                    <div className="lg:col-span-5 bg-[#00121d] border border-[#002d40] rounded-3xl p-5 text-left space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold tracking-widest text-[#26c6da] uppercase">
                          CONTAINMENT PREVIEW
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#002436] text-[#93c5d6] text-[10px] font-mono">
                          Unlocks {worryWindowTime}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-[#001926] border border-[#00344d] space-y-2">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-[#719bb0] font-semibold">ACTIVE THOUGHT CAPSULE</span>
                          {worryTriageChoice && (
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                                worryTriageChoice === 'actionable'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-teal-500/20 text-[#26c6da]'
                              }`}
                            >
                              {worryTriageChoice === 'actionable' ? '⚡ Actionable' : '🌀 Hypothetical'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white italic leading-relaxed min-h-[38px]">
                          {worryInput.trim()
                            ? `"${worryInput.trim()}"`
                            : 'Type or tap a prompt on the left to externalize your thought loop...'}
                        </p>
                        {worryTriageChoice === 'actionable' && actionStepInput.trim() && (
                          <div className="pt-1.5 border-t border-[#002a3d] text-[11px] text-emerald-300 font-semibold">
                            Next step: <span className="font-normal text-emerald-100">{actionStepInput}</span>
                          </div>
                        )}
                      </div>

                      {/* Procedural Brown Noise Grounding Bed */}
                      <div className="p-3.5 rounded-2xl bg-[#001926] border border-[#00344d] flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              brownNoiseActive ? 'bg-[#26c6da] text-[#001724]' : 'bg-[#002436] text-[#26c6da]'
                            }`}
                          >
                            <Waves className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">Somatic Brown Noise</div>
                            <div className="text-[10px] text-[#719bb0]">Low-pass 280Hz focus bed</div>
                          </div>
                        </div>
                        <button
                          onClick={toggleBrownNoise}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                            brownNoiseActive
                              ? 'bg-[#26c6da] text-[#001724]'
                              : 'bg-[#002436] text-[#26c6da] hover:bg-[#00324a]'
                          }`}
                        >
                          {brownNoiseActive ? 'On' : 'Play'}
                        </button>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-[#001724] border border-[#002638] space-y-1.5">
                        <div className="text-[11px] font-bold text-white">Why Postponement Works</div>
                        <p className="text-[11px] text-[#82abbf] leading-relaxed">
                          Sealing intrusive thoughts until <strong className="text-white">{worryWindowTime}</strong>{' '}
                          breaks mid-study rumination loops while assuring your brain the concern will be reviewed.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ======================================================= */
                  /* SCHEDULED VAULT: TWO DISTINCT COLUMNS (WEB VIEW)        */
                  /* ======================================================= */
                  <div className="space-y-5 text-left">
                    {shredToast && (
                      <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-semibold text-center animate-in fade-in">
                        🗑️ {shredToast}
                      </div>
                    )}

                    {/* Clinical Adherence Progress Banner */}
                    <div className="p-4 bg-linear-to-r from-[#002433] via-[#001e2e] to-[#001724] rounded-2xl border border-[#26c6da]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🔥</span>
                          <span className="text-sm font-black text-white tracking-tight">
                            {vaultStreak}-Day Postponement Adherence Streak
                          </span>
                        </div>
                        <p className="text-xs text-[#93c5d6]">
                          By sealing intrusive thoughts until this dedicated window, you avoided rumination spirals
                          during active study hours.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="px-3 py-2 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-200 font-bold text-xs">
                          🗑️ {shreddedCount} Defused
                        </div>
                        <div className="px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-emerald-400" />
                          <span>⏱️ {minutesSavedTotal}+ Mins Reclaimed Today</span>
                        </div>
                      </div>
                    </div>

                    {/* Top Review Window Live Countdown Timer & Scheduler */}
                    <div className="p-4 bg-[#001a27] rounded-2xl border border-[#00344d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
                          <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="15" fill="none" stroke="#002b3d" strokeWidth="3" />
                            <circle
                              cx="18"
                              cy="18"
                              r="15"
                              fill="none"
                              stroke={
                                worryWindowSecondsLeft <= 300 && worryWindowSecondsLeft > 0 ? '#fbbf24' : '#26c6da'
                              }
                              strokeWidth="3"
                              strokeDasharray={94.2}
                              strokeDashoffset={94.2 - (94.2 * timerProgressPct) / 100}
                              strokeLinecap="round"
                            />
                          </svg>
                          <Clock className="w-4 h-4 text-[#26c6da] absolute" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold text-[#26c6da] uppercase tracking-wider block">
                              Guided 15-Min Worry Window
                            </span>
                            {worryWindowTimerActive && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-bold">
                                Running
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-mono font-bold text-white block mt-0.5">
                            {formatAudioTime(worryWindowSecondsLeft)} Remaining
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-center">
                        <button
                          onClick={handleStartWorryTimer}
                          className={`px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all shadow-xs ${
                            worryWindowTimerActive
                              ? 'bg-amber-400 hover:bg-amber-300 text-[#001724]'
                              : 'bg-[#26c6da] hover:bg-[#20b2c4] text-[#001724]'
                          }`}
                        >
                          {worryWindowTimerActive ? 'Pause Window' : 'Start 15m Window'}
                        </button>
                        <button
                          onClick={() => {
                            triggerHaptic();
                            setWorryWindowTimerActive(false);
                            setWorryWindowSecondsLeft(900);
                          }}
                          className="px-2.5 py-2 rounded-xl bg-[#00121d] border border-[#00344d] text-[#719bb0] hover:text-white text-xs cursor-pointer"
                          title="Reset to 15:00"
                        >
                          ↺ Reset
                        </button>

                        <div className="h-6 w-px bg-[#002d40] mx-1 hidden sm:block" />

                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-[#719bb0]">Scheduled:</span>
                          <input
                            type="time"
                            value={worryWindowTime}
                            onChange={(e) => setWorryWindowTime(e.target.value)}
                            className="bg-[#00121d] px-2.5 py-1.5 rounded-xl border border-[#00344d] text-xs font-bold text-teal-300 cursor-pointer focus:outline-none focus:border-[#26c6da]"
                          />
                        </div>

                        <button
                          onClick={() => {
                            triggerHaptic();
                            setWorryStep(1);
                            setWorryFlowStep('triage');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#002636] hover:bg-[#00354a] border border-[#26c6da]/30 text-[#26c6da] font-bold text-xs cursor-pointer transition-all"
                        >
                          + Park Worry
                        </button>
                      </div>
                    </div>

                    {/* TWO DISTINCT VISUAL COLUMNS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Column 1: Actionable Worries */}
                      <div className="bg-[#001421] border border-emerald-500/30 rounded-2xl p-4 flex flex-col">
                        <div className="flex items-center justify-between pb-3 border-b border-[#002a3d] mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <h4 className="text-xs font-black tracking-wider text-emerald-300 uppercase">
                              Actionable Tasks
                            </h4>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            {activeWorries.filter((w) => w.type === 'actionable').length}
                          </span>
                        </div>

                        <p className="text-[11px] text-[#719bb0] mb-3">
                          Direct concerns with a scheduled micro-step to execute.
                        </p>

                        <div className="space-y-3 flex-1 max-h-72 overflow-y-auto pr-1">
                          {activeWorries.filter((w) => w.type === 'actionable').length === 0 ? (
                            <div className="text-center py-8 text-[#5d8599] text-xs border border-dashed border-[#002a3d] rounded-xl p-4">
                              No active actionable tasks.
                            </div>
                          ) : (
                            activeWorries
                              .filter((w) => w.type === 'actionable')
                              .map((w) => (
                                <div
                                  key={w.id}
                                  className="p-3.5 rounded-xl border bg-[#001e2e] border-emerald-500/35 hover:border-emerald-500/60 transition-all"
                                >
                                  <div className="flex items-start gap-2.5">
                                    <button
                                      onClick={() => toggleWorryResolved(w.id)}
                                      className="mt-0.5 w-4 h-4 rounded-md border border-emerald-500/50 hover:border-emerald-400 flex items-center justify-center shrink-0 cursor-pointer"
                                      title="Mark executed"
                                    />
                                    <div className="flex-1 text-xs text-left">
                                      <p className="font-semibold text-white">{w.text}</p>
                                      {w.actionStep && (
                                        <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[10px] text-emerald-300 font-medium">
                                          <span>Next Step:</span>
                                          <span className="font-bold">{w.actionStep}</span>
                                        </div>
                                      )}
                                      <span className="text-[9px] text-[#719bb0] block mt-1">{w.timestamp}</span>
                                    </div>
                                    <button
                                      onClick={() => deleteWorry(w.id)}
                                      className="text-[#719bb0] hover:text-rose-400 p-1 cursor-pointer transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  <button
                                    onClick={() => {
                                      triggerHaptic();
                                      setActiveReviewWorry(w);
                                    }}
                                    className="mt-2.5 w-full py-1.5 px-3 rounded-xl bg-[#001421] hover:bg-[#00273a] border border-[#26c6da]/35 text-[#26c6da] hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                  >
                                    <Sparkles className="w-3 h-3 text-[#26c6da]" />
                                    <span>Review &amp; Resolve →</span>
                                  </button>
                                </div>
                              ))
                          )}
                        </div>
                      </div>

                      {/* Column 2: Hypothetical Worries */}
                      <div className="bg-[#001421] border border-[#00344d] rounded-2xl p-4 flex flex-col">
                        <div className="flex items-center justify-between pb-3 border-b border-[#002a3d] mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#26c6da]" />
                            <h4 className="text-xs font-black tracking-wider text-[#26c6da] uppercase">
                              Hypothetical Uncertainty
                            </h4>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold">
                            {activeWorries.filter((w) => w.type === 'hypothetical').length}
                          </span>
                        </div>

                        <p className="text-[11px] text-[#719bb0] mb-3">
                          Postponed loops safely locked until your daily window.
                        </p>

                        <div className="space-y-3 flex-1 max-h-72 overflow-y-auto pr-1">
                          {activeWorries.filter((w) => w.type === 'hypothetical').length === 0 ? (
                            <div className="text-center py-8 text-[#5d8599] text-xs border border-dashed border-[#002a3d] rounded-xl p-4">
                              No active hypothetical worries.
                            </div>
                          ) : (
                            activeWorries
                              .filter((w) => w.type === 'hypothetical')
                              .map((w) => (
                                <div
                                  key={w.id}
                                  className="p-3.5 rounded-xl border bg-[#001e2e] border-[#00344d] hover:border-[#26c6da]/50 transition-all"
                                >
                                  <div className="flex items-start gap-2.5">
                                    <button
                                      onClick={() => toggleWorryResolved(w.id)}
                                      className="mt-0.5 w-4 h-4 rounded-md border border-[#004e75] hover:border-[#26c6da] flex items-center justify-center shrink-0 cursor-pointer"
                                      title="Mark resolved"
                                    />
                                    <div className="flex-1 text-xs text-left">
                                      <p className="font-semibold text-white">{w.text}</p>
                                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-500/15 border border-[#26c6da]/30 text-[10px] text-[#26c6da] font-medium">
                                        <Lock className="w-3 h-3" />
                                        <span>Locked until {worryWindowTime}</span>
                                      </div>
                                      <span className="text-[9px] text-[#719bb0] block mt-1">{w.timestamp}</span>
                                    </div>
                                    <button
                                      onClick={() => deleteWorry(w.id)}
                                      className="text-[#719bb0] hover:text-rose-400 p-1 cursor-pointer transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  <button
                                    onClick={() => {
                                      triggerHaptic();
                                      setActiveReviewWorry(w);
                                    }}
                                    className="mt-2.5 w-full py-1.5 px-3 rounded-xl bg-[#001421] hover:bg-[#00273a] border border-[#26c6da]/35 text-[#26c6da] hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                  >
                                    <Sparkles className="w-3 h-3 text-[#26c6da]" />
                                    <span>Review &amp; Resolve →</span>
                                  </button>
                                </div>
                              ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Resolved Today Section */}
                    {resolvedWorries.length > 0 && (
                      <div className="rounded-2xl border border-[#002a3d] bg-[#00121d]/85 overflow-hidden">
                        <button
                          onClick={() => setShowResolvedDrawer((v) => !v)}
                          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-[#93c5d6] hover:text-white cursor-pointer"
                        >
                          <span>✓ Resolved &amp; Reframed Today ({resolvedWorries.length})</span>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${showResolvedDrawer ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {showResolvedDrawer && (
                          <div className="px-4 pb-3 pt-2 border-t border-[#002233] grid grid-cols-1 md:grid-cols-2 gap-3">
                            {resolvedWorries.map((w) => (
                              <div
                                key={w.id}
                                className="p-3 rounded-xl bg-[#001724] border border-[#002a3d] opacity-85 text-xs"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <p className="line-through text-slate-400 font-medium">{w.text}</p>
                                  <button
                                    onClick={() => toggleWorryResolved(w.id)}
                                    className="text-[10px] text-[#26c6da] hover:underline shrink-0 cursor-pointer"
                                  >
                                    Reopen
                                  </button>
                                </div>
                                {w.cbtReframe && (
                                  <div className="mt-2 p-2 rounded-xl bg-[#032e29] border border-[#10b981]/40 text-[11px] text-emerald-200">
                                    <span className="font-bold text-[#34d399] block mb-0.5">🧠 Reframed Thought:</span>
                                    &ldquo;{w.cbtReframe.balancedThought}&rdquo;
                                  </div>
                                )}
                                {w.resolutionType === 'micro_action' && (
                                  <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-[10px] text-emerald-300 font-bold">
                                    <span>⚡ Micro-Action Executed</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          triggerHaptic();
                          setIsWorryOpen(false);
                        }}
                        className="w-full py-3 bg-[#26c6da] hover:bg-[#20b2c4] text-[#001724] font-bold text-xs rounded-full shadow-md cursor-pointer transition-all uppercase tracking-wider"
                      >
                        Close Vault &amp; Return to Mindful Focus
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 8. FLOATING WHATSAPP CHAT CONCIERGE & BUTTON              */}
        {/* ========================================================= */}
        {showWhatsAppChat && (
          <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5">
            <div className="bg-[#075E54] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs">Mannkaa Care Concierge</h4>
                  <p className="text-[10px] text-emerald-200">Online · Student Wellness Support</p>
                </div>
              </div>
              <button
                onClick={() => setShowWhatsAppChat(false)}
                className="p-1 rounded-full text-white/80 hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 max-h-64 overflow-y-auto space-y-2.5 text-xs">
              {chatHistory.map((m, idx) => (
                <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[82%] p-3 rounded-2xl ${
                      m.sender === 'user'
                        ? 'bg-[#E7FFDB] text-slate-900 rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
                    }`}
                  >
                    <p className="leading-relaxed">{m.text}</p>
                    <span className="text-[9px] text-slate-400 block text-right mt-1">{m.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && chatMessage.trim()) {
                    setChatHistory((prev) => [...prev, { sender: 'user', text: chatMessage, time: 'Just now' }]);
                    setChatMessage('');
                    setTimeout(() => {
                      setChatHistory((prev) => [
                        ...prev,
                        {
                          sender: 'care',
                          text: 'Thank you for reaching out. A licensed counsellor has been notified. Take a slow, gentle breath.',
                          time: 'Just now'
                        }
                      ]);
                    }, 1000);
                  }
                }}
                placeholder="Message care counsellors..."
                className="flex-1 bg-slate-100 rounded-full px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-900"
              />
              <button
                onClick={() => {
                  if (!chatMessage.trim()) return;
                  setChatHistory((prev) => [...prev, { sender: 'user', text: chatMessage, time: 'Just now' }]);
                  setChatMessage('');
                  setTimeout(() => {
                    setChatHistory((prev) => [
                      ...prev,
                      {
                        sender: 'care',
                        text: 'Thank you for reaching out. A licensed counsellor has been notified. Take a slow, gentle breath.',
                        time: 'Just now'
                      }
                    ]);
                  }, 1000);
                }}
                className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:bg-[#1EBE5D] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowWhatsAppChat((v) => !v)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          title="Connect with Mannkaa on WhatsApp"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z" />
          </svg>
        </button>

        {/* Clinical Worry Resolution 3-Way Action Modal */}
        {activeReviewWorry && (
          <WorryResolutionModal
            worry={activeReviewWorry}
            isOpen={!!activeReviewWorry}
            onClose={() => setActiveReviewWorry(null)}
            onExecuteMicroAction={handleExecuteMicroAction}
            onNavigateToCbt={handleStartCbtReframe}
            onShredWorry={handleShredWorry}
            onPaperTearSound={() => soundEnabled && audioEngine.playPaperShredSound()}
          />
        )}

        {/* In-App CBT Thought Record Experience */}
        {isCbtReframeActive && (
          <ThoughtRecordForm
            isOpen={true}
            initialAutomaticThought={parkedWorries.find((w) => w.id === cbtReframeWorryId)?.text}
            onClose={() => {
              setIsCbtReframeActive(false);
              if (wasTimerRunningBeforeCbt && worryWindowSecondsLeft > 0) {
                setWorryWindowTimerActive(true);
              }
            }}
            onBack={() => {
              setIsCbtReframeActive(false);
              if (wasTimerRunningBeforeCbt && worryWindowSecondsLeft > 0) {
                setWorryWindowTimerActive(true);
              }
            }}
            onSaveReframeResult={handleCompleteCbtReframe}
          />
        )}
      </main>
    </div>
  );
}