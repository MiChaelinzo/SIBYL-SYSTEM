import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ScanLine, Loader2, Brain, Mic, MicOff, AlertCircle, Heart, Activity, Wind, Thermometer, Zap, Watch, Lock } from 'lucide-react';
import { performScan, saveBiometricReading } from '@/hooks/useSibylData';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { HUE_COLORS, BIOMETRIC_DEFAULTS } from '@/types/sibyl';
import type { PsychoPassResult, BiometricValues } from '@/types/sibyl';

// ── Smartwatch simulation helpers ─────────────────────────────────────────────
function randBetween(min: number, max: number, decimals = 0) {
  const v = Math.random() * (max - min) + min;
  return decimals ? parseFloat(v.toFixed(decimals)) : Math.round(v);
}
function fluctuate(base: number, delta: number, min: number, max: number, dec = 0) {
  const next = base + (Math.random() * 2 - 1) * delta;
  return dec ? parseFloat(Math.min(max, Math.max(min, next)).toFixed(dec)) : Math.min(max, Math.max(min, Math.round(next)));
}

const BIOMETRIC_FIELDS: { key: keyof BiometricValues; label: string; unit: string; icon: React.ReactNode; min: number; max: number; step: string }[] = [
  { key: 'bpm',                     label: 'Heart Rate',       unit: 'BPM',  icon: <Heart className="w-3.5 h-3.5" />,       min: 30,   max: 220,  step: '1'   },
  { key: 'stress_level',            label: 'Stress Level',     unit: '/100', icon: <Activity className="w-3.5 h-3.5" />,    min: 0,    max: 100,  step: '1'   },
  { key: 'blood_pressure_systolic', label: 'BP Systolic',      unit: 'mmHg', icon: <Activity className="w-3.5 h-3.5" />,    min: 70,   max: 200,  step: '1'   },
  { key: 'blood_pressure_diastolic',label: 'BP Diastolic',     unit: 'mmHg', icon: <Activity className="w-3.5 h-3.5" />,    min: 40,   max: 130,  step: '1'   },
  { key: 'spo2',                    label: 'SpO₂',             unit: '%',    icon: <Wind className="w-3.5 h-3.5" />,         min: 80,   max: 100,  step: '0.1' },
  { key: 'skin_conductance',        label: 'Skin Conductance', unit: 'μS',   icon: <Zap className="w-3.5 h-3.5" />,          min: 0.1,  max: 30,   step: '0.1' },
  { key: 'body_temperature',        label: 'Body Temp',        unit: '°C',   icon: <Thermometer className="w-3.5 h-3.5" />, min: 34,   max: 42,   step: '0.1' },
];

const ScanSimulator: React.FC = () => {
  const navigate = useNavigate();
  const [citizenId, setCitizenId] = useState('');
  const [mentalState, setMentalState] = useState('');
  const [location, setLocation] = useState('Tokyo Sector 1');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ psycho_pass: PsychoPassResult; agent_actions: string } | null>(null);
  const [error, setError] = useState('');

  // Biometrics state
  const [biometrics, setBiometrics] = useState<BiometricValues>(BIOMETRIC_DEFAULTS);
  const [watchActive, setWatchActive] = useState(false);
  const [locked, setLocked] = useState(false);
  const watchRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Live watch values (used when active + not locked)
  const [liveWatch, setLiveWatch] = useState<BiometricValues>(BIOMETRIC_DEFAULTS);

  const handleTranscript = useCallback((text: string) => {
    setMentalState((prev) => (prev ? `${prev} ${text}` : text));
  }, []);
  const { voiceState, errorMsg: voiceError, isSupported, toggleRecording } = useVoiceInput({ onTranscript: handleTranscript });

  // Start / stop smartwatch simulation
  useEffect(() => {
    if (watchActive && !locked) {
      // Initialize with realistic seed values
      setLiveWatch({
        bpm: String(randBetween(65, 90)),
        stress_level: String(randBetween(20, 50)),
        blood_pressure_systolic: String(randBetween(110, 130)),
        blood_pressure_diastolic: String(randBetween(70, 85)),
        spo2: String(randBetween(97, 100, 1)),
        skin_conductance: String(randBetween(5, 12, 1)),
        body_temperature: String(randBetween(36.2, 37.2, 1)),
      });
      watchRef.current = setInterval(() => {
        setLiveWatch((prev) => ({
          bpm:                      String(fluctuate(Number(prev.bpm),                      3,  30,  220)),
          stress_level:             String(fluctuate(Number(prev.stress_level),             4,   0,  100)),
          blood_pressure_systolic:  String(fluctuate(Number(prev.blood_pressure_systolic),  2,  70,  200)),
          blood_pressure_diastolic: String(fluctuate(Number(prev.blood_pressure_diastolic), 2,  40,  130)),
          spo2:                     String(fluctuate(Number(prev.spo2),                     0.2, 80, 100, 1)),
          skin_conductance:         String(fluctuate(Number(prev.skin_conductance),         0.5, 0.1, 30, 1)),
          body_temperature:         String(fluctuate(Number(prev.body_temperature),         0.1, 34,  42, 1)),
        }));
      }, 2000);
    } else {
      if (watchRef.current) { clearInterval(watchRef.current); watchRef.current = null; }
    }
    return () => { if (watchRef.current) clearInterval(watchRef.current); };
  }, [watchActive, locked]);

  const handleLockReadings = useCallback(() => {
    setBiometrics(liveWatch);
    setLocked(true);
    setWatchActive(false);
  }, [liveWatch]);

  const handleToggleWatch = useCallback(() => {
    if (watchActive) { setWatchActive(false); setLocked(false); }
    else { setWatchActive(true); setLocked(false); setBiometrics(BIOMETRIC_DEFAULTS); }
  }, [watchActive]);

  const activeBiometrics = watchActive && !locked ? liveWatch : biometrics;

  const handleScan = async () => {
    if (!citizenId.trim() || !mentalState.trim()) return;
    setScanning(true);
    setError('');
    setResult(null);

    try {
      // Save biometric reading first if any values are present
      const hasAny = Object.values(activeBiometrics).some((v) => v !== '');
      if (hasAny) {
        await saveBiometricReading(citizenId.trim(), activeBiometrics, locked ? 'smartwatch' : 'manual');
      }

      const response = await performScan(citizenId.trim(), mentalState.trim(), location);
      if (response.error) {
        setError(response.error);
      } else {
        setResult(response);
      }
    } catch (e: unknown) {
      setError((e as Error).message || 'Scan failed. Please try again.');
    }
    setScanning(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <ScanLine className="w-6 h-6 text-cyan-400" />
            <h1 className="text-lg font-bold text-white">Cymatic Scan</h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* ── Core scan form ── */}
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-6 h-6 text-cyan-400" />
            <div>
              <h2 className="text-lg font-semibold text-white">Sibyl Hive Mind Analysis</h2>
              <p className="text-xs text-gray-500">Enter citizen data for AI-powered Psycho-Pass assessment</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Citizen ID</label>
              <input type="text" value={citizenId} onChange={(e) => setCitizenId(e.target.value)}
                placeholder="e.g., C-1001"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Scan Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm text-gray-400">Mental State Description</label>
                {isSupported && (
                  <button type="button" onClick={toggleRecording}
                    title={voiceState === 'recording' ? 'Stop recording' : 'Start voice input'}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all
                      ${voiceState === 'recording'
                        ? 'bg-red-500/10 border-red-500/40 text-red-400 animate-pulse'
                        : 'bg-slate-800 border-slate-700 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/40'}`}>
                    {voiceState === 'recording'
                      ? <><MicOff className="w-3.5 h-3.5" />Stop Recording</>
                      : <><Mic className="w-3.5 h-3.5" />Voice Input</>}
                  </button>
                )}
              </div>
              {voiceState === 'recording' && (
                <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg border border-red-500/30 bg-red-900/10">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-400 text-xs">Recording… speak your assessment</span>
                </div>
              )}
              {(voiceState === 'error' || voiceState === 'unsupported') && voiceError && (
                <div className="flex items-start gap-2 mb-2 px-3 py-2 rounded-lg border border-yellow-500/30 bg-yellow-900/10">
                  <AlertCircle className="w-3.5 h-3.5 text-yellow-400 mt-0.5 shrink-0" />
                  <span className="text-yellow-400 text-xs">{voiceError}</span>
                </div>
              )}
              <textarea value={mentalState} onChange={(e) => setMentalState(e.target.value)}
                placeholder="Describe the citizen's mental state, behavior, stress levels, recent activities…"
                rows={5}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none" />
            </div>
          </div>
        </div>

        {/* ── Biometrics Section ── */}
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Biometric Vitals
            </h3>

            {/* Smartwatch toggle */}
            <button
              type="button"
              onClick={handleToggleWatch}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
                ${watchActive
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/40'}`}
            >
              <Watch className="w-3.5 h-3.5" />
              {watchActive ? 'Smartwatch LIVE' : 'Smartwatch Feed'}
              {watchActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
            </button>
          </div>

          {/* Live watch readings display */}
          {watchActive && !locked && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-3 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-emerald-400 text-xs font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE SMARTWATCH FEED — updating every 2s
                </span>
                <button
                  onClick={handleLockReadings}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-medium hover:bg-cyan-500/20 transition-all"
                >
                  <Lock className="w-3 h-3" /> Lock Readings
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {BIOMETRIC_FIELDS.map((f) => (
                  <div key={f.key} className="text-center rounded-lg bg-slate-900/50 border border-slate-700/30 px-2 py-2">
                    <div className="text-xs text-gray-500 mb-0.5">{f.label}</div>
                    <div className="text-sm font-bold text-emerald-400 tabular-nums">
                      {liveWatch[f.key] || '—'} <span className="text-xs font-normal text-gray-600">{f.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {locked && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-cyan-500/30 bg-cyan-950/10 mb-4 text-xs text-cyan-400">
              <Lock className="w-3.5 h-3.5" />
              Smartwatch readings locked — values will be used in scan
              <button onClick={() => { setLocked(false); setBiometrics(BIOMETRIC_DEFAULTS); }}
                className="ml-auto text-gray-500 hover:text-gray-300 transition-colors">Clear</button>
            </div>
          )}

          {/* Manual input grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {BIOMETRIC_FIELDS.map((f) => (
              <div key={f.key}>
                <label className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <span className="text-gray-600">{f.icon}</span>
                  {f.label}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={f.min}
                    max={f.max}
                    step={f.step}
                    value={activeBiometrics[f.key]}
                    onChange={(e) => {
                      if (watchActive && !locked) return; // disallow when live
                      setBiometrics((prev) => ({ ...prev, [f.key]: e.target.value }));
                    }}
                    readOnly={watchActive && !locked}
                    placeholder="—"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-white text-sm
                      placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors
                      [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-600 pointer-events-none">{f.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Initiate Scan ── */}
        <button
          onClick={handleScan}
          disabled={scanning || !citizenId.trim() || !mentalState.trim()}
          className="w-full py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-medium
            hover:bg-cyan-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {scanning ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Analyzing via Qwen AI...</>
          ) : (
            <><ScanLine className="w-4 h-4" />Initiate Cymatic Scan</>
          )}
        </button>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-900/20 p-4 text-red-400 text-sm">{error}</div>
        )}

        {result && (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-cyan-400" />
              Scan Results
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <ResultCard label="Crime Coefficient" value={result.psycho_pass.crime_coefficient.toString()}
                color={result.psycho_pass.crime_coefficient >= 300 ? 'text-red-400' : result.psycho_pass.crime_coefficient >= 100 ? 'text-yellow-400' : 'text-emerald-400'} />
              <ResultCard label="Hue" value={result.psycho_pass.hue.toUpperCase()}
                color={HUE_COLORS[result.psycho_pass.hue]?.text || 'text-gray-400'} />
              <ResultCard label="Threat Level" value={result.psycho_pass.threat_level.replace('_', ' ')}
                color={result.psycho_pass.threat_level === 'severe_threat' ? 'text-red-400' : result.psycho_pass.threat_level === 'latent_criminal' ? 'text-yellow-400' : 'text-emerald-400'} />
              <ResultCard label="AI Reasoning" value="View Below" color="text-cyan-400" />
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 mb-4">
              <p className="text-sm text-gray-300 mb-2 font-medium">Mental State Assessment:</p>
              <p className="text-sm text-gray-400">{result.psycho_pass.mental_state_description}</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 mb-4">
              <p className="text-sm text-gray-300 mb-2 font-medium">AI Reasoning (Qwen / Alibaba Cloud):</p>
              <p className="text-sm text-gray-400">{result.psycho_pass.reasoning}</p>
            </div>
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-900/10 p-4">
              <p className="text-sm text-cyan-400 font-medium mb-1">Multi-Agent Action:</p>
              <p className="text-sm text-gray-400">{result.agent_actions}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ResultCard: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-3 text-center">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className={`text-lg font-bold ${color}`}>{value}</p>
  </div>
);

export default ScanSimulator;
