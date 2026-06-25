import React, { useState, useEffect } from 'react';
import { Crosshair, Lock, Zap, Skull, Bomb, X, ChevronDown } from 'lucide-react';
import { PsychoPassGauge } from './PsychoPassGauge';
import { authorizeDominator } from '@/hooks/useSibylData';
import type { Citizen, Case } from '@/types/sibyl';

interface DominatorOverlayProps {
  citizen: Citizen;
  activeCase?: Case;
  onClose: () => void;
}

export const DominatorOverlay: React.FC<DominatorOverlayProps> = ({
  citizen,
  activeCase,
  onClose,
}) => {
  const [status, setStatus] = useState<'scanning' | 'analyzing' | 'authorized' | 'denied' | 'executed'>('scanning');
  const [mode, setMode] = useState<string>('locked');
  const [message, setMessage] = useState('Initializing Dominator...');
  const [authorizing, setAuthorizing] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setStatus('analyzing');
      setMessage('Analyzing Psycho-Pass…');
      const t2 = setTimeout(() => {
        if (citizen.is_criminally_asymptomatic) {
          setStatus('denied');
          setMode('locked');
          setMessage('ERROR: Target is criminally asymptomatic. Dominator cannot lock on.');
        } else if (citizen.current_crime_coefficient < 100) {
          setStatus('denied');
          setMode('locked');
          setMessage('Target does not qualify as a threat. Weapon locked.');
        } else if (citizen.current_crime_coefficient < 300) {
          setStatus('authorized');
          setMode('paralyzer');
          setMessage('Non-Lethal Paralyzer mode active. Authorization granted.');
        } else {
          setStatus('authorized');
          setMode(citizen.current_crime_coefficient > 500 ? 'decomposer' : 'eliminator');
          setMessage(
            `Lethal ${citizen.current_crime_coefficient > 500 ? 'Decomposer' : 'Eliminator'} mode. Human checkpoint required.`
          );
        }
      }, 1500);
      return () => clearTimeout(t2);
    }, 1000);
    return () => clearTimeout(t1);
  }, [citizen]);

  const handleAuthorize = async () => {
    if (!activeCase) return;
    setAuthorizing(true);
    try {
      const result = await authorizeDominator(
        citizen.citizen_id,
        activeCase.id,
        mode === 'eliminator' || mode === 'decomposer' ? 'human_approved' : undefined
      );
      if (result.authorized) {
        setStatus('executed');
        setMessage(`ENFORCEMENT EXECUTED. Mode: ${result.mode.toUpperCase()}.`);
      } else {
        setStatus('denied');
        setMessage(result.reason);
      }
    } catch {
      setStatus('denied');
      setMessage('Authorization system error.');
    }
    setAuthorizing(false);
  };

  const getModeIcon = (size = 'w-8 h-8') => {
    switch (mode) {
      case 'paralyzer':  return <Zap  className={`${size} text-yellow-400`} />;
      case 'eliminator': return <Skull className={`${size} text-red-500`} />;
      case 'decomposer': return <Bomb  className={`${size} text-red-600`} />;
      default:           return <Lock  className={`${size} text-gray-500`} />;
    }
  };

  const modeColor = {
    paralyzer:  'border-yellow-500/50 bg-yellow-900/20 text-yellow-400',
    eliminator: 'border-red-500/50 bg-red-900/20 text-red-400',
    decomposer: 'border-red-600/50 bg-red-950/30 text-red-500',
    locked:     'border-gray-600 bg-gray-900/50 text-gray-400',
  }[mode] ?? 'border-gray-600 bg-gray-900/50 text-gray-400';

  const btnClass = mode === 'paralyzer'
    ? 'bg-yellow-600 hover:bg-yellow-500 active:bg-yellow-700 text-white'
    : 'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white';

  return (
    /* Full-screen on mobile, centered card on md+ */
    <div className="fixed inset-0 z-50 flex flex-col md:items-center md:justify-center bg-black/90 backdrop-blur-md overflow-y-auto">
      {/* Mobile: full-height scroll container; Desktop: bounded card */}
      <div className="relative w-full md:max-w-lg md:mx-4 flex flex-col">

        {/* Corner reticle — hidden on very small so it doesn't crowd */}
        <div className="absolute inset-0 pointer-events-none hidden sm:block">
          <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-cyan-500/40" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-cyan-500/40" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-cyan-500/40" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-cyan-500/40" />
        </div>

        <div className="bg-slate-950/95 md:border md:border-slate-700 md:rounded-2xl backdrop-blur-xl flex flex-col min-h-screen md:min-h-0 px-4 py-5 md:p-6">

          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 min-w-0">
              <Crosshair className="w-5 h-5 text-cyan-400 shrink-0" />
              <div className="min-w-0">
                <h2 className="text-cyan-400 font-bold text-base tracking-widest">DOMINATOR</h2>
                <p className="text-xs text-gray-500 hidden sm:block truncate">Ministry of Welfare Public Safety Bureau</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close Dominator"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Target Info ── */}
          <div className="text-center mb-4">
            <p className="text-gray-500 text-xs tracking-widest mb-1">TARGET ACQUIRED</p>
            <h3 className="text-white text-xl md:text-2xl font-bold text-balance">{citizen.name}</h3>
            <p className="text-cyan-400 text-sm">{citizen.citizen_id}</p>
            {citizen.location && (
              <p className="text-gray-500 text-xs mt-0.5">{citizen.location}</p>
            )}
          </div>

          {/* ── Psycho-Pass Gauge ── */}
          <div className="flex justify-center mb-4">
            <PsychoPassGauge
              crimeCoefficient={citizen.current_crime_coefficient}
              hue={citizen.current_hue}
              size="lg"
            />
          </div>

          {/* ── Mode Display ── */}
          <div className={`rounded-xl border p-4 mb-5 text-center ${modeColor}`}>
            <div className="flex items-center justify-center gap-3 mb-2">
              {getModeIcon()}
              <span className="text-lg md:text-xl font-bold uppercase tracking-wider">
                {mode === 'locked' ? 'WEAPON LOCKED' : `${mode} MODE`}
              </span>
            </div>
            <p className="text-sm opacity-80 text-pretty">{message}</p>
          </div>

          {/* ── Scanning / Analyzing indicator ── */}
          {(status === 'scanning' || status === 'analyzing') && (
            <div className="flex items-center justify-center gap-2 py-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-cyan-400 text-sm font-medium tracking-wider">
                {status === 'scanning' ? 'INITIALIZING…' : 'ANALYZING PSYCHO-PASS…'}
              </span>
            </div>
          )}

          {/* ── Action Button ── push to bottom on mobile with mt-auto ── */}
          <div className="mt-auto pt-2 space-y-3">
            {status === 'authorized' && (
              <button
                onClick={handleAuthorize}
                disabled={authorizing}
                className={`w-full py-5 md:py-4 rounded-xl font-bold text-base md:text-lg uppercase tracking-wider
                  transition-colors disabled:opacity-50 ${btnClass}
                  ${mode !== 'paralyzer' ? 'animate-pulse disabled:animate-none' : ''}`}
              >
                {authorizing
                  ? 'PROCESSING…'
                  : mode === 'paralyzer'
                  ? 'ACTIVATE PARALYZER'
                  : 'REQUEST LETHAL AUTHORIZATION'}
              </button>
            )}

            {status === 'executed' && (
              <div className="rounded-xl bg-slate-800 border border-slate-600 py-5 text-center">
                <p className="text-white font-bold text-base">ACTION COMPLETE</p>
                <p className="text-gray-400 text-sm mt-1">Logged to Sibyl System</p>
              </div>
            )}

            {/* Close shortcut on mobile when denied */}
            {(status === 'denied') && (
              <button
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl
                  border border-slate-700 bg-slate-800/50 text-gray-400 text-sm font-medium
                  hover:text-white transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
