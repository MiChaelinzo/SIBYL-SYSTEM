import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, CameraOff, ScanLine, User, Zap, RefreshCw } from 'lucide-react';
import { useCitizens } from '@/hooks/useSibylData';
import { HUE_COLORS, THREAT_LABELS } from '@/types/sibyl';
import type { Citizen } from '@/types/sibyl';

type ScanStatus = 'idle' | 'scanning' | 'identified' | 'no_match' | 'error';

interface MatchResult {
  citizen: Citizen;
  confidence: number;
}

const FacialRecognition: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { citizens } = useCitizens();
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [capturedFrame, setCapturedFrame] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [overlayAngle, setOverlayAngle] = useState(0);

  // Animate scanning overlay
  useEffect(() => {
    const id = setInterval(() => setOverlayAngle((a) => (a + 2) % 360), 30);
    return () => clearInterval(id);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (e: unknown) {
      const err = e as { name?: string };
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera access denied. Please allow camera permissions in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera device found. Please connect a camera.');
      } else {
        setCameraError('Unable to access camera. Please check your device settings.');
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
    setScanStatus('idle');
    setMatch(null);
    setCapturedFrame(null);
  }, []);

  useEffect(() => () => { stopCamera(); }, [stopCamera]);

  const simulateRecognition = useCallback(() => {
    if (!citizens.length) return;
    // Weighted random: prefer severe threats for dramatic effect
    const pool = [...citizens.filter((c) => c.current_crime_coefficient >= 100), ...citizens];
    const candidate = pool[Math.floor(Math.random() * pool.length)];
    const confidence = Math.floor(Math.random() * 25) + 74; // 74–98%
    return confidence >= 75 ? { citizen: candidate, confidence } : null;
  }, [citizens]);

  const handleCapture = useCallback(() => {
    if (!cameraActive || scanStatus === 'scanning') return;

    // Freeze frame to canvas
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      setCapturedFrame(canvas.toDataURL('image/jpeg', 0.85));
    }

    setScanStatus('scanning');
    setScanProgress(0);
    setMatch(null);

    // Animate progress bar then reveal result
    let progress = 0;
    scanTimerRef.current = setInterval(() => {
      progress += 4;
      setScanProgress(Math.min(progress, 100));
      if (progress >= 100) {
        clearInterval(scanTimerRef.current!);
        const result = simulateRecognition();
        if (result) {
          setMatch(result);
          setScanStatus('identified');
        } else {
          setScanStatus('no_match');
        }
      }
    }, 50);
  }, [cameraActive, scanStatus, simulateRecognition]);

  const handleReset = useCallback(() => {
    if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    setScanStatus('idle');
    setMatch(null);
    setCapturedFrame(null);
    setScanProgress(0);
  }, []);

  const matchColors = match ? (HUE_COLORS[match.citizen.current_hue] || HUE_COLORS.green) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Camera className="w-5 h-5 text-cyan-400 shrink-0" />
          <h1 className="text-base font-bold text-white truncate">Facial Recognition Scanner</h1>
          <span className="ml-auto shrink-0 flex items-center gap-1.5 text-xs text-yellow-400 border border-yellow-500/30 bg-yellow-950/20 px-2 py-1 rounded-full">
            <Zap className="w-3 h-3" />
            SIBYL ID SCAN
          </span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-4 md:py-6 space-y-4">

        {/* Camera viewport */}
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 md:p-6">
          <div className="relative w-full aspect-[4/3] md:aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-700/40">

            {/* Live video */}
            <video
              ref={videoRef}
              className={`w-full h-full object-cover ${capturedFrame ? 'hidden' : 'block'}`}
              muted
              playsInline
              autoPlay
            />

            {/* Captured still */}
            {capturedFrame && (
              <img src={capturedFrame} alt="Captured frame" className="w-full h-full object-cover" />
            )}

            {/* Idle placeholder */}
            {!cameraActive && !cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-600">
                <CameraOff className="w-12 h-12" />
                <p className="text-sm">Camera offline</p>
              </div>
            )}

            {/* Error placeholder */}
            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                <CameraOff className="w-10 h-10 text-red-400" />
                <p className="text-red-400 text-sm">{cameraError}</p>
              </div>
            )}

            {/* Animated scan overlay — shown when camera active */}
            {cameraActive && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Corner brackets */}
                {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx,sy], i) => (
                  <g key={i} transform={`translate(${50 + sx*35},${50 + sy*28}) scale(${sx},${sy})`}>
                    <polyline points="0,8 0,0 8,0" fill="none" stroke="#22d3ee" strokeWidth="0.8" strokeLinecap="round" />
                  </g>
                ))}
                {/* Rotating scan ring */}
                <circle cx="50" cy="50" r="20" fill="none" stroke="#22d3ee" strokeWidth="0.4" strokeOpacity="0.3" />
                <circle
                  cx="50" cy="50" r="20" fill="none"
                  stroke="#22d3ee" strokeWidth="0.8" strokeDasharray="15 47"
                  strokeLinecap="round"
                  transform={`rotate(${overlayAngle} 50 50)`}
                />
                {/* Cross-hairs */}
                <line x1="50" y1="28" x2="50" y2="34" stroke="#22d3ee" strokeWidth="0.4" strokeOpacity="0.5" />
                <line x1="50" y1="66" x2="50" y2="72" stroke="#22d3ee" strokeWidth="0.4" strokeOpacity="0.5" />
                <line x1="28" y1="50" x2="34" y2="50" stroke="#22d3ee" strokeWidth="0.4" strokeOpacity="0.5" />
                <line x1="66" y1="50" x2="72" y2="50" stroke="#22d3ee" strokeWidth="0.4" strokeOpacity="0.5" />
                {/* Scan sweep line */}
                {scanStatus === 'scanning' && (
                  <line
                    x1="10" y1={10 + (scanProgress * 0.8)}
                    x2="90" y2={10 + (scanProgress * 0.8)}
                    stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.6"
                  />
                )}
              </svg>
            )}

            {/* Status badge */}
            {cameraActive && (
              <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-950/70 text-xs">
                <span className={`w-1.5 h-1.5 rounded-full ${scanStatus === 'scanning' ? 'bg-yellow-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
                <span className={scanStatus === 'scanning' ? 'text-yellow-400' : 'text-emerald-400'}>
                  {scanStatus === 'scanning' ? 'ANALYZING…' : 'LIVE'}
                </span>
              </div>
            )}

            {/* Progress bar during scan */}
            {scanStatus === 'scanning' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                <div
                  className="h-full bg-cyan-400 transition-all duration-75"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            )}
          </div>

          {/* Camera controls */}
          <div className="flex gap-3 mt-4 flex-wrap">
            {!cameraActive ? (
              <button
                onClick={startCamera}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg
                  bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium
                  hover:bg-cyan-500/20 transition-all min-h-[44px]"
              >
                <Camera className="w-4 h-4" />
                Activate Camera
              </button>
            ) : (
              <>
                <button
                  onClick={handleCapture}
                  disabled={scanStatus === 'scanning'}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg
                    bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium
                    hover:bg-cyan-500/20 transition-all min-h-[44px] disabled:opacity-50"
                >
                  <ScanLine className="w-4 h-4" />
                  {scanStatus === 'scanning' ? 'Analyzing…' : 'Capture & Identify'}
                </button>
                {(scanStatus === 'identified' || scanStatus === 'no_match') && (
                  <button
                    onClick={handleReset}
                    className="px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700
                      text-gray-300 text-sm font-medium hover:text-white transition-all min-h-[44px]"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={stopCamera}
                  className="px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30
                    text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all min-h-[44px]"
                >
                  <CameraOff className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Identification results */}
        {scanStatus === 'identified' && match && matchColors && (
          <div className={`rounded-2xl border p-5 ${matchColors.bg} ${matchColors.border}`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${matchColors.border} ${matchColors.bg}`}>
                <User className={`w-6 h-6 ${matchColors.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h2 className={`text-xl font-bold ${matchColors.text}`}>{match.citizen.name}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded border font-medium ${matchColors.text} ${matchColors.border}`}>
                    {THREAT_LABELS[match.citizen.threat_level]}
                  </span>
                </div>
                <p className="text-gray-400 text-xs mb-3 font-mono">{match.citizen.citizen_id} · {match.citizen.location || 'Unknown'}</p>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="rounded-lg border border-slate-700/40 bg-slate-900/60 p-2.5 text-center">
                    <p className="text-xs text-gray-500 mb-0.5">Crime Coefficient</p>
                    <p className={`text-lg font-bold ${matchColors.text}`}>{match.citizen.current_crime_coefficient}</p>
                  </div>
                  <div className="rounded-lg border border-slate-700/40 bg-slate-900/60 p-2.5 text-center">
                    <p className="text-xs text-gray-500 mb-0.5">Hue</p>
                    <p className={`text-lg font-bold uppercase ${matchColors.text}`}>{match.citizen.current_hue}</p>
                  </div>
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-2.5 text-center">
                    <p className="text-xs text-gray-500 mb-0.5">Confidence</p>
                    <p className="text-lg font-bold text-emerald-400">{match.confidence}%</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/citizen/${match.citizen.citizen_id}`)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all
                    ${matchColors.bg} ${matchColors.border} ${matchColors.text}
                    hover:opacity-80`}
                >
                  View Full Profile →
                </button>
              </div>
            </div>
          </div>
        )}

        {scanStatus === 'no_match' && (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 text-center">
            <User className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-semibold mb-1">No Match Found</p>
            <p className="text-gray-600 text-sm">Confidence below identification threshold (75%). Please retry.</p>
          </div>
        )}

        {/* Hidden canvas for frame capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default FacialRecognition;
