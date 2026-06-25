import React from 'react';
import { Heart, Activity, Wind, Thermometer, Zap, TrendingUp, Clock } from 'lucide-react';
import type { BiometricReading } from '@/types/sibyl';

interface Props {
  latest: BiometricReading | null;
  history: BiometricReading[];
}

interface VitalConfig {
  key: keyof BiometricReading;
  label: string;
  unit: string;
  icon: React.ReactNode;
  format?: (v: number) => string;
  thresholds: { warn: number; danger: number; dir: 'above' | 'below' };
}

const VITALS: VitalConfig[] = [
  {
    key: 'bpm',
    label: 'Heart Rate',
    unit: 'BPM',
    icon: <Heart className="w-4 h-4" />,
    thresholds: { warn: 100, danger: 120, dir: 'above' },
  },
  {
    key: 'stress_level',
    label: 'Stress Level',
    unit: '/100',
    icon: <TrendingUp className="w-4 h-4" />,
    thresholds: { warn: 60, danger: 80, dir: 'above' },
  },
  {
    key: 'blood_pressure_systolic',
    label: 'Blood Pressure',
    unit: 'mmHg',
    icon: <Activity className="w-4 h-4" />,
    format: (v) => `${v} sys`,
    thresholds: { warn: 130, danger: 140, dir: 'above' },
  },
  {
    key: 'spo2',
    label: 'SpO₂',
    unit: '%',
    icon: <Wind className="w-4 h-4" />,
    thresholds: { warn: 95, danger: 90, dir: 'below' },
  },
  {
    key: 'skin_conductance',
    label: 'Skin Conductance',
    unit: 'μS',
    icon: <Zap className="w-4 h-4" />,
    thresholds: { warn: 15, danger: 18, dir: 'above' },
  },
  {
    key: 'body_temperature',
    label: 'Body Temp',
    unit: '°C',
    icon: <Thermometer className="w-4 h-4" />,
    thresholds: { warn: 37.5, danger: 38.5, dir: 'above' },
  },
];

function getColor(val: number | null, cfg: VitalConfig): { text: string; bg: string; border: string } {
  if (val === null) return { text: 'text-gray-500', bg: 'bg-slate-800/30', border: 'border-slate-700/40' };
  const { warn, danger, dir } = cfg.thresholds;
  const isDanger = dir === 'above' ? val >= danger : val <= danger;
  const isWarn  = dir === 'above' ? val >= warn   : val <= warn;
  if (isDanger) return { text: 'text-red-400',    bg: 'bg-red-950/20',    border: 'border-red-500/30' };
  if (isWarn)   return { text: 'text-yellow-400', bg: 'bg-yellow-950/20', border: 'border-yellow-500/30' };
  return         { text: 'text-emerald-400', bg: 'bg-emerald-950/20', border: 'border-emerald-500/30' };
}

const BiometricVitalsPanel: React.FC<Props> = ({ latest, history }) => {
  if (!latest) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          Biometric Vitals
        </h3>
        <p className="text-gray-500 text-sm">No biometric readings recorded for this citizen.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          Biometric Vitals
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock className="w-3.5 h-3.5" />
          <span>Last: {new Date(latest.created_at).toLocaleString()}</span>
          <span className="ml-1 px-1.5 py-0.5 rounded border border-slate-600/40 bg-slate-800/40 text-gray-400">
            {latest.reading_source}
          </span>
        </div>
      </div>

      {/* Vitals grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {VITALS.map((cfg) => {
          const raw = latest[cfg.key] as number | null;
          const colors = getColor(raw, cfg);
          const display = raw === null ? '—' : cfg.format ? cfg.format(raw) : raw.toString();
          return (
            <div key={cfg.key} className={`rounded-xl border p-3 ${colors.bg} ${colors.border}`}>
              <div className={`flex items-center gap-1.5 mb-1 ${colors.text}`}>
                {cfg.icon}
                <span className="text-xs font-medium">{cfg.label}</span>
              </div>
              <div className={`text-xl font-bold ${colors.text}`}>{display}</div>
              <div className="text-xs text-gray-600">{cfg.unit}</div>
            </div>
          );
        })}
      </div>

      {/* Recent readings list */}
      {history.length > 1 && (
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-2">Reading History</h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {history.slice(1, 8).map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/30 border border-slate-700/30 text-xs">
                <span className="text-gray-600 shrink-0">{new Date(r.created_at).toLocaleTimeString()}</span>
                <span className="text-gray-400">BPM <span className="text-white">{r.bpm ?? '—'}</span></span>
                <span className="text-gray-400">Stress <span className="text-white">{r.stress_level ?? '—'}</span></span>
                <span className="text-gray-400">SpO₂ <span className="text-white">{r.spo2 ?? '—'}%</span></span>
                <span className="ml-auto shrink-0 text-gray-600 px-1.5 py-0.5 rounded border border-slate-700/30">{r.reading_source}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BiometricVitalsPanel;
