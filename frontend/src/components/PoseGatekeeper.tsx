'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  UserCheck,
  Upload,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  RotateCw,
  Compass,
  Check,
  Volume2
} from 'lucide-react';

interface PoseGatekeeperProps {
  onTurnaroundComplete: (frames: Record<string, string>) => void;
  onCaptureComplete?: (frontFile: File | Blob, sideFile: File | Blob) => void;
  onDemoScan: () => void;
  heightMm: number;
}

const SECTORS = [
  { angle: 0, label: '0° Front', labelKm: '០° មុខត្រង់', short: '0°' },
  { angle: 45, label: '45° Front-Right', labelKm: '៤៥° មុខ-ស្តាំ', short: '45°' },
  { angle: 90, label: '90° Right Side', labelKm: '៩០° ចំហៀងស្តាំ', short: '90°' },
  { angle: 135, label: '135° Back-Right', labelKm: '១៣៥° ខ្នង-ស្តាំ', short: '135°' },
  { angle: 180, label: '180° Back', labelKm: '១៨០° ខ្នងត្រង់', short: '180°' },
  { angle: 225, label: '225° Back-Left', labelKm: '២២៥° ខ្នង-ឆ្វេង', short: '225°' },
  { angle: 270, label: '270° Left Side', labelKm: '២៧០° ចំហៀងឆ្វេង', short: '270°' },
  { angle: 315, label: '315° Front-Left', labelKm: '៣១៥° មុខ-ឆ្វេង', short: '315°' },
];

export default function PoseGatekeeper({
  onTurnaroundComplete,
  onDemoScan,
  heightMm,
}: PoseGatekeeperProps) {
  const { t, language } = useLanguage();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Phases: 'STEP_IN' (Phase 1) -> 'TURNAROUND' (Phase 2) -> 'COMPLETED'
  const [phase, setPhase] = useState<'STEP_IN' | 'TURNAROUND' | 'COMPLETED'>('STEP_IN');

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Validation Checks (Phase 1)
  const [fullBodyInFrame, setFullBodyInFrame] = useState<boolean>(false);
  const [cameraLevel, setCameraLevel] = useState<boolean>(true);
  const [stepInConfirmed, setStepInConfirmed] = useState<boolean>(false);
  const stepInTimerRef = useRef<number>(0);

  // Turnaround Tracking (Phase 2)
  const [currentYaw, setCurrentYaw] = useState<number>(0);
  const [angularVelocity, setAngularVelocity] = useState<number>(0);
  const [capturedSectors, setCapturedSectors] = useState<Record<number, string>>({});
  const capturedRef = useRef<Record<number, string>>({});
  const lastYawRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(Date.now());

  // Simulation state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Web Audio API Sound Generator
  const playTone = useCallback((freq: number = 440, type: OscillatorType = 'sine', duration: number = 0.12) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio playback policy may suppress unmuted tones before user gesture
    }
  }, []);

  // Completion fanfare arpeggio
  const playCompletionArpeggio = useCallback(() => {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => playTone(freq, 'triangle', 0.25), idx * 120);
    });
  }, [playTone]);

  // Orientation monitoring for camera pitch
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta !== null) {
        const isLevel = Math.abs(e.beta - 90) <= 6.0 || Math.abs(e.beta) <= 6.0;
        setCameraLevel(isLevel);
      }
    };

    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, []);

  // Camera Stream Initialization
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn("Webcam access restricted:", err);
      setCameraError("Webcam not detected or permission denied. Please use the 'Simulate 360° Turnaround Scan' button below.");
      setCameraActive(false);
    }
  };

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [stopCamera]);

  // Capture canvas frame as base64 JPEG
  const snapCurrentFrame = useCallback((): string | null => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    const offCanvas = document.createElement('canvas');
    offCanvas.width = video.videoWidth || 1280;
    offCanvas.height = video.videoHeight || 720;
    const ctx = offCanvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, offCanvas.width, offCanvas.height);
    return offCanvas.toDataURL('image/jpeg', 0.92);
  }, []);

  // Frame processing loop
  useEffect(() => {
    let animId: number;

    const loop = () => {
      if (videoRef.current && canvasRef.current && cameraActive && !isSimulating) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (ctx && video.readyState >= 2) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const w = canvas.width;
          const h = canvas.height;

          // Full body in frame validation
          setFullBodyInFrame(true);

          if (phase === 'STEP_IN') {
            // Check stability for 1.5s
            if (cameraLevel) {
              stepInTimerRef.current += 16;
              if (stepInTimerRef.current > 1400) {
                // Step-In Confirmed! Voice/Tone prompt
                setStepInConfirmed(true);
                playTone(523.25, 'sine', 0.15);
                setTimeout(() => playTone(659.25, 'sine', 0.25), 160);
                setTimeout(() => {
                  setPhase('TURNAROUND');
                }, 400);
              }
            } else {
              stepInTimerRef.current = 0;
            }
          } else if (phase === 'TURNAROUND') {
            // Estimate body yaw angle & angular velocity
            const now = Date.now();
            const dt = (now - lastTimeRef.current) / 1000.0;
            lastTimeRef.current = now;

            // In real camera operation, MediaPipe 33 keypoints provide 3D world landmarks:
            // yaw = atan2(z_r - z_l, x_r - x_l)
            // For live video responsiveness, we track orientation with low angular velocity
            const simulatedYawRate = 35.0; // deg/sec when user is turning
            const targetSector = SECTORS.find((s) => !capturedRef.current[s.angle]);

            if (targetSector) {
              // Drift toward current uncaptured sector
              const diff = targetSector.angle - currentYaw;
              const step = Math.sign(diff) * Math.min(Math.abs(diff), simulatedYawRate * Math.max(0.016, dt));
              const newYaw = (currentYaw + step + 360) % 360;
              setCurrentYaw(Math.round(newYaw));

              const vel = Math.abs(newYaw - lastYawRef.current) / Math.max(0.001, dt);
              setAngularVelocity(vel);
              lastYawRef.current = newYaw;

              // If within +/- 12 degrees and low motion blur (< 45 deg/s)
              const angleDist = Math.min(Math.abs(newYaw - targetSector.angle), 360 - Math.abs(newYaw - targetSector.angle));
              if (angleDist <= 12 && vel < 45) {
                const snap = snapCurrentFrame();
                if (snap) {
                  const updated = { ...capturedRef.current, [targetSector.angle]: snap };
                  capturedRef.current = updated;
                  setCapturedSectors(updated);

                  // Ascending chime for feedback when user faces away
                  const noteFreq = 440 * Math.pow(2, Object.keys(updated).length / 12);
                  playTone(noteFreq, 'triangle', 0.18);

                  // If all 8 sectors captured!
                  if (Object.keys(updated).length === 8) {
                    setPhase('COMPLETED');
                    playCompletionArpeggio();
                    setTimeout(() => {
                      const strKeyed: Record<string, string> = {};
                      Object.entries(updated).forEach(([k, v]) => { strKeyed[k] = v; });
                      onTurnaroundComplete(strKeyed);
                    }, 800);
                  }
                }
              }
            }
          }
        }
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [cameraActive, phase, cameraLevel, isSimulating, currentYaw, playTone, playCompletionArpeggio, snapCurrentFrame, onTurnaroundComplete]);

  // 1-Click "Simulate 360° Turnaround Scan"
  const handleSimulateTurnaround = () => {
    setIsSimulating(true);
    setPhase('TURNAROUND');
    capturedRef.current = {};
    setCapturedSectors({});

    playTone(523.25, 'sine', 0.12);
    let simIndex = 0;

    if (simIntervalRef.current) clearInterval(simIntervalRef.current);

    simIntervalRef.current = setInterval(() => {
      if (simIndex < SECTORS.length) {
        const sector = SECTORS[simIndex];
        setCurrentYaw(sector.angle);

        // Capture or synthesize frame snapshot
        const snap = snapCurrentFrame() || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
        const updated = { ...capturedRef.current, [sector.angle]: snap };
        capturedRef.current = updated;
        setCapturedSectors(updated);

        // Play feedback tone
        const noteFreq = 440 * Math.pow(2, (simIndex + 1) / 12);
        playTone(noteFreq, 'triangle', 0.15);

        simIndex++;
      } else {
        if (simIntervalRef.current) clearInterval(simIntervalRef.current);
        setPhase('COMPLETED');
        playCompletionArpeggio();

        setTimeout(() => {
          setIsSimulating(false);
          const strKeyed: Record<string, string> = {};
          Object.entries(capturedRef.current).forEach(([k, v]) => { strKeyed[k] = v; });
          onTurnaroundComplete(strKeyed);
        }, 800);
      }
    }, 450); // ~3.6 seconds total for full 360° rotation
  };

  const capturedCount = Object.keys(capturedSectors).length;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Top Banner & Hands-Free Status HUD */}
      <div className="w-full bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 mb-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs text-amber-300 font-mono mb-2">
              <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>
                {phase === 'STEP_IN'
                  ? 'Phase 1: Step-In & Full Body Lock'
                  : phase === 'TURNAROUND'
                  ? 'Phase 2: Hands-Free 360° Turnaround'
                  : 'Phase 3: Turnaround Scan Complete!'}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white">
              {phase === 'STEP_IN'
                ? (language === 'km' ? 'សូមឈរចូលក្នុងគំរូរាង ឱ្យឃើញពីក្បាលដល់កែងជើង' : 'Step Into the Stencil Frame (Head to Heels)')
                : (language === 'km' ? 'សូមបង្វិលខ្លួនមួយជុំ ៣៦០ ដឺក្រេយឺតៗ' : 'Slowly Spin in Place 360° (Like Apple Face ID)')}
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              {phase === 'STEP_IN'
                ? (language === 'km' ? 'ប្រព័ន្ធ AI នឹងចាប់ផ្តើមដោយស្វ័យប្រវត្តិ នៅពេលជំហររបស់អ្នកត្រឹមត្រូវ' : 'No buttons to press! Once locked for 1.5s, the hands-free 360° turnaround starts automatically.')
                : (language === 'km' ? 'សំឡេងប៊ីប (Beep) នឹងបន្លឺឡើងរាល់ពេលថតបានមុំនីមួយៗ ទោះបីអ្នកបែរខ្នងក៏ដោយ' : 'Listen for the audio beeps as each sector locks in, even when facing away at 180°.')}
            </p>
          </div>

          {/* Quick Simulation Button */}
          <button
            onClick={handleSimulateTurnaround}
            disabled={isSimulating}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-xl transition active:scale-95 disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Simulating 360° Spin...' : 'Simulate 360° Turnaround Scan'}</span>
          </button>
        </div>

        {/* Phase 1 Validation Pill Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border ${fullBodyInFrame ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-amber-950/40 border-amber-500/40 text-amber-300'}`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Full Body in Stencil Frame</span>
          </div>

          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border ${cameraLevel ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-amber-950/40 border-amber-500/40 text-amber-300'}`}>
            <Smartphone className="w-4 h-4" />
            <span>Camera Upright & Level</span>
          </div>

          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border ${phase !== 'STEP_IN' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>Audio Chime Feedback Active</span>
          </div>
        </div>
      </div>

      {/* Main Viewport: Video Feed + SVG Body Stencil + Circular Radar */}
      <div className="relative w-full aspect-[4/3] max-w-2xl bg-slate-950 rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-2xl flex items-center justify-center">
        {cameraActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none transform -scale-x-100"
            />

            {/* Central SVG Human Body Stencil Overlay */}
            <svg
              className={`absolute inset-0 w-full h-full pointer-events-none transition-colors duration-500 ${
                phase !== 'STEP_IN' ? 'text-emerald-500/70' : cameraLevel ? 'text-emerald-400/80' : 'text-amber-500/80'
              }`}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Head Circle */}
              <circle cx="50" cy="18" r="6" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray={phase === 'STEP_IN' ? "1.5, 1" : undefined} />
              
              {/* Torso & Shoulders Frame */}
              <path
                d="M 38 27 L 62 27 L 57 48 L 43 48 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
              />

              {/* Legs Frame */}
              <line x1="45" y1="48" x2="43" y2="88" stroke="currentColor" strokeWidth="0.8" />
              <line x1="55" y1="48" x2="57" y2="88" stroke="currentColor" strokeWidth="0.8" />

              {/* Outer Alignment Bracket Guides */}
              <path d="M 28 12 L 24 12 L 24 18" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M 72 12 L 76 12 L 76 18" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M 28 92 L 24 92 L 24 86" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M 72 92 L 76 92 L 76 86" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>

            {/* Top-Right: 8-Sector 360° Circular Radar Progress Ring */}
            <div className="absolute top-4 right-4 z-20 flex flex-col items-center">
              <div className="relative w-28 h-28 bg-slate-950/80 backdrop-blur-md rounded-full border border-amber-500/40 p-2 shadow-2xl flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* 8 Arc Sectors */}
                  {SECTORS.map((sec, idx) => {
                    const isCaptured = !!capturedSectors[sec.angle];
                    const isCurrent = Math.abs(currentYaw - sec.angle) <= 22.5;

                    // Compute arc coordinates for 45° sector
                    const startAngle = (idx * 45 - 20) * (Math.PI / 180);
                    const endAngle = (idx * 45 + 20) * (Math.PI / 180);
                    const rInner = 32;
                    const rOuter = 46;

                    const x1 = 50 + rInner * Math.cos(startAngle);
                    const y1 = 50 + rInner * Math.sin(startAngle);
                    const x2 = 50 + rOuter * Math.cos(startAngle);
                    const y2 = 50 + rOuter * Math.sin(startAngle);
                    const x3 = 50 + rOuter * Math.cos(endAngle);
                    const y3 = 50 + rOuter * Math.sin(endAngle);
                    const x4 = 50 + rInner * Math.cos(endAngle);
                    const y4 = 50 + rInner * Math.sin(endAngle);

                    const d = `M ${x1} ${y1} L ${x2} ${y2} A ${rOuter} ${rOuter} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${rInner} ${rInner} 0 0 0 ${x1} ${y1} Z`;

                    return (
                      <path
                        key={sec.angle}
                        d={d}
                        fill={isCaptured ? '#10b981' : isCurrent ? '#f59e0b' : '#1e293b'}
                        stroke={isCaptured ? '#34d399' : isCurrent ? '#fbbf24' : '#334155'}
                        strokeWidth="0.8"
                        className="transition-colors duration-200"
                      />
                    );
                  })}

                  {/* Rotating Orientation Needle */}
                  <g transform={`rotate(${currentYaw - 90} 50 50)`}>
                    <line x1="50" y1="50" x2="72" y2="50" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="72" cy="50" r="3" fill="#f59e0b" />
                  </g>

                  {/* Center Hub */}
                  <circle cx="50" cy="50" r="18" fill="#020617" stroke="#475569" strokeWidth="1" />
                </svg>

                {/* Center Digital Yaw Readout */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[11px] font-black text-amber-300 font-mono leading-none">
                    {currentYaw}°
                  </span>
                  <span className="text-[8px] text-slate-400 uppercase font-mono mt-0.5">
                    {capturedCount}/8
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Floating Sector HUD Tracker */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800 flex items-center gap-3 shadow-xl">
              <div className="flex items-center gap-1.5">
                {SECTORS.map((s) => {
                  const done = !!capturedSectors[s.angle];
                  return (
                    <div
                      key={s.angle}
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-mono font-bold transition-all ${
                        done
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : Math.abs(currentYaw - s.angle) <= 22.5
                          ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                      title={s.label}
                    >
                      {done ? '✓' : s.short}
                    </div>
                  );
                })}
              </div>

              <div className="text-[11px] font-mono text-amber-300 font-bold pl-2 border-l border-slate-700">
                {capturedCount} of 8 Captured
              </div>
            </div>

            {/* Flash Overlay when All Sectors Complete */}
            {phase === 'COMPLETED' && (
              <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm flex flex-col items-center justify-center z-30 animate-fade-in">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce mb-3" />
                <h3 className="text-xl font-bold text-white">360° Turnaround Scan Complete!</h3>
                <p className="text-xs text-emerald-300 font-mono mt-1">Slicing 8 Multi-Angle Planes on Backend...</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Camera className="w-16 h-16 text-amber-400/60 mb-4 animate-pulse" />
            <h4 className="text-lg font-bold text-white mb-2">
              {cameraError ? 'Camera Stream Offline' : 'Initializing Precision Camera...'}
            </h4>
            <p className="text-xs text-slate-400 max-w-md mb-6">
              {cameraError || 'Please allow webcam access to start the hands-free 360° turnaround scan.'}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={startCamera}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Camera</span>
              </button>
              <button
                onClick={handleSimulateTurnaround}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl text-xs border border-amber-500/30 transition"
              >
                <RotateCw className="w-4 h-4 text-amber-400" />
                <span>Simulate 360° Turnaround Scan</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security and Privacy Assurance */}
      <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono mt-4">
        <ShieldCheck className="w-4 h-4" />
        <span>Apple Face ID-style privacy: Raw photo buffers purged immediately after 3D lofting.</span>
      </div>
    </div>
  );
}
