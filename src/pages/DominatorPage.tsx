import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crosshair, Search, User, AlertTriangle, Zap, Radio } from 'lucide-react';
import { useCitizens, useDominatorEvents } from '@/hooks/useSibylData';
import { DominatorOverlay } from '@/components/DominatorOverlay';
import { PsychoPassGauge } from '@/components/PsychoPassGauge';
import type { Citizen } from '@/types/sibyl';

const MODE_STYLES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  lethal_eliminator: { label: 'LETHAL', bg: 'bg-red-950/20',    text: 'text-red-400',    border: 'border-red-500/30' },
  paralyzer:         { label: 'PARALYZE', bg: 'bg-yellow-950/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  stun:              { label: 'STUN',    bg: 'bg-blue-950/20',   text: 'text-blue-400',   border: 'border-blue-500/30' },
};
const defaultMode = { label: 'DEPLOY', bg: 'bg-slate-800/40', text: 'text-gray-400', border: 'border-slate-700/40' };

const DominatorPage: React.FC = () => {
  const navigate = useNavigate();
  const { citizens, loading } = useCitizens();
  const { events, loading: eventsLoading } = useDominatorEvents(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);

  const filteredCitizens = citizens.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.citizen_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort: severe threats first
  const sorted = [...filteredCitizens].sort(
    (a, b) => b.current_crime_coefficient - a.current_crime_coefficient
  );

  const severeCount = citizens.filter((c) => c.current_crime_coefficient >= 300).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Crosshair className="w-5 h-5 text-red-400 shrink-0" />
          <h1 className="text-base font-bold text-white truncate">Dominator Weapon System</h1>
          {severeCount > 0 && (
            <span className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full
              bg-red-900/30 border border-red-500/30 text-red-400 text-xs font-medium shrink-0">
              <AlertTriangle className="w-3.5 h-3.5" />
              {severeCount} lethal
            </span>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4 md:py-6 space-y-4">

        {/* Warning Banner */}
        <div className="rounded-xl border border-red-800/40 bg-red-950/20 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-red-400 font-semibold text-sm">RESTRICTED ACCESS — DOMINATOR SYSTEM</p>
            <p className="text-red-400/70 text-xs mt-0.5 text-pretty">
              Weapon discharge requires Sibyl System authorization. All actions are recorded and logged.
            </p>
          </div>
        </div>

        {/* Target Selection Card */}
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <Crosshair className="w-5 h-5 text-red-400 shrink-0" />
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-white">Target Selection</h2>
              <p className="text-xs text-gray-500">Select a citizen to engage the Dominator</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or citizen ID…"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3
                text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50
                transition-colors text-base"
            />
          </div>

          {/* Citizen List */}
          {loading ? (
            <div className="text-center py-10 text-gray-500 text-sm">Loading targets…</div>
          ) : (
            <div className="space-y-2 max-h-[55vh] md:max-h-96 overflow-y-auto">
              {sorted.map((citizen) => {
                const isSevere  = citizen.current_crime_coefficient >= 300;
                const isLatent  = citizen.current_crime_coefficient >= 100 && !isSevere;
                return (
                  <button
                    key={citizen.id}
                    onClick={() => setSelectedCitizen(citizen)}
                    className={`w-full text-left rounded-xl border p-3 transition-all
                      flex items-center gap-3 min-h-[60px]
                      ${isSevere
                        ? 'border-red-700/40 bg-red-950/10 hover:bg-red-950/20 active:bg-red-950/30'
                        : isLatent
                        ? 'border-yellow-700/30 bg-slate-800/30 hover:bg-slate-800/60'
                        : 'border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/60'
                      }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-white text-sm font-medium truncate">{citizen.name}</span>
                        {isSevere && (
                          <span className="shrink-0 text-xs px-1.5 py-0.5 rounded
                            bg-red-900/40 border border-red-500/30 text-red-400">
                            LETHAL
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500 font-mono">{citizen.citizen_id}</span>
                        <span className="text-gray-700">·</span>
                        <span className="text-xs text-gray-500 truncate">{citizen.location || 'Unknown'}</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <PsychoPassGauge
                        crimeCoefficient={citizen.current_crime_coefficient}
                        hue={citizen.current_hue}
                        size="sm"
                        showLabel={false}
                      />
                    </div>
                  </button>
                );
              })}
              {sorted.length === 0 && (
                <div className="text-center py-10 text-gray-500 text-sm">No citizens found.</div>
              )}
            </div>
          )}
        </div>

        {/* ── Realtime Dominator Event Feed ── */}
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <Radio className="w-5 h-5 text-red-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-white">Recent Dominator Actions</h2>
              <p className="text-xs text-gray-500">Live feed — last 10 discharge events</p>
            </div>
            {/* live indicator */}
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </div>

          {eventsLoading ? (
            <div className="text-center py-6 text-gray-500 text-sm">Loading events…</div>
          ) : events.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm">
              No Dominator discharge events recorded yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {events.map((ev) => {
                const ms = MODE_STYLES[ev.mode] ?? defaultMode;
                return (
                  <div
                    key={ev.id}
                    className={`rounded-xl border p-3 flex items-start gap-3 ${ms.bg} ${ms.border}`}
                  >
                    <Zap className={`w-4 h-4 mt-0.5 shrink-0 ${ms.text}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${ms.text} ${ms.border}`}>
                          {ms.label}
                        </span>
                        <span className="text-white text-sm font-medium truncate">{ev.citizen_id}</span>
                        <span className={`text-xs font-mono ${ms.text}`}>CC {ev.crime_coefficient}</span>
                        <span className={`ml-auto shrink-0 text-xs px-1.5 py-0.5 rounded border
                          ${ev.status === 'executed'
                            ? 'text-red-400 border-red-500/30 bg-red-950/20'
                            : ev.status === 'authorized'
                            ? 'text-yellow-400 border-yellow-500/30 bg-yellow-950/20'
                            : 'text-gray-400 border-slate-600/30 bg-slate-800/30'
                          }`}>
                          {ev.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        Auth: {ev.authorized_by} · {ev.authorization_reason}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {new Date(ev.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedCitizen && (
        <DominatorOverlay
          citizen={selectedCitizen}
          onClose={() => setSelectedCitizen(null)}
        />
      )}
    </div>
  );
};

export default DominatorPage;
