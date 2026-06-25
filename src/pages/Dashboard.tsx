import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Users, FileWarning, Scan, Zap, Menu, Camera, FileSpreadsheet, MessageSquare } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCitizens, useCases, useStats } from '@/hooks/useSibylData';
import { useSevereThreatAlert } from '@/hooks/useSevereThreatAlert';
import { CitizenCard } from '@/components/CitizenCard';
import { AgentStatusPanel } from '@/components/AgentStatusPanel';
import { ThreatAlert } from '@/components/ThreatAlert';
import ThreatMap from '@/components/ThreatMap';
import { HUE_COLORS } from '@/types/sibyl';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { citizens, loading } = useCitizens();
  const { cases } = useCases();
  const stats = useStats();
  const [filter, setFilter] = useState<'all' | 'threats' | 'severe'>('all');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Audio alert whenever a citizen newly crosses the severe threat threshold
  useSevereThreatAlert(citizens);

  const filteredCitizens = citizens.filter((c) => {
    if (filter === 'threats') return c.current_crime_coefficient >= 100;
    if (filter === 'severe') return c.current_crime_coefficient >= 300;
    return true;
  });

  const severeCount = citizens.filter((c) => c.current_crime_coefficient >= 300).length;
  const latentCount = citizens.filter(
    (c) => c.current_crime_coefficient >= 100 && c.current_crime_coefficient < 300
  ).length;

  const navLinks = [
    { label: 'New Cymatic Scan',    icon: <Scan className="w-4 h-4" />,            to: '/scan',               color: 'text-cyan-400'   },
    { label: 'Dominator Interface', icon: <Zap className="w-4 h-4" />,             to: '/dominator',          color: 'text-red-400'    },
    { label: 'Sibyl Oracle AI',     icon: <MessageSquare className="w-4 h-4" />,   to: '/sibyl-ai',           color: 'text-violet-400' },
    { label: 'Facial Recognition',  icon: <Camera className="w-4 h-4" />,          to: '/facial-recognition', color: 'text-purple-400' },
    { label: 'Bulk Import',         icon: <FileSpreadsheet className="w-4 h-4" />, to: '/import',             color: 'text-emerald-400'},
    { label: 'Agent Communications',icon: <Brain className="w-4 h-4" />,           to: '/agents',             color: 'text-gray-300'   },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden text-gray-400 hover:text-white p-1 shrink-0" aria-label="Open navigation">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-slate-900 border-slate-700 p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 p-5 border-b border-slate-800">
                    <Brain className="w-7 h-7 text-cyan-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-cyan-400 font-bold tracking-wider text-sm">SIBYL SYSTEM</p>
                      <p className="text-xs text-gray-500 truncate">Public Safety Bureau</p>
                    </div>
                  </div>
                  <nav className="flex-1 p-4 space-y-1">
                    {navLinks.map((l) => (
                      <button
                        key={l.to}
                        onClick={() => { navigate(l.to); setMobileOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium
                          bg-slate-800/50 hover:bg-slate-800 transition-all min-h-12 ${l.color}`}
                      >
                        {l.icon}{l.label}
                      </button>
                    ))}
                  </nav>
                  <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <span className="text-emerald-400 text-xs font-medium">SYSTEM OPERATIONAL</span>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Brain className="w-7 h-7 text-cyan-400 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-base md:text-xl font-bold tracking-wider text-cyan-400 truncate">SIBYL SYSTEM</h1>
              <p className="text-xs text-gray-500 hidden md:block">Ministry of Welfare Public Safety Bureau</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-2">
              {navLinks.map((l) => (
                <button
                  key={l.to}
                  onClick={() => navigate(l.to)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                    bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all ${l.color}`}
                >
                  {l.icon}
                  <span className="hidden xl:inline">{l.label}</span>
                </button>
              ))}
            </nav>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500">System Status</p>
              <p className="text-emerald-400 text-xs font-medium flex items-center gap-1 justify-end">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                OPERATIONAL
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        {/* Stats Grid — 3 cols on mobile, 6 on desktop */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4 mb-4 md:mb-6">
          <StatCard icon={<Users className="w-4 h-4" />} label="Monitored" value={stats.total} color="text-cyan-400" />
          <StatCard icon={<Users className="w-4 h-4" />} label="Law Abiding" value={stats.lawAbiding} color="text-emerald-400" />
          <StatCard icon={<FileWarning className="w-4 h-4" />} label="Latent" value={stats.latentCriminal} color="text-yellow-400" />
          <StatCard icon={<Zap className="w-4 h-4" />} label="Severe" value={stats.severeThreat} color="text-red-400" />
          <StatCard icon={<FileWarning className="w-4 h-4" />} label="Cases" value={stats.activeCases} color="text-orange-400" />
          <StatCard icon={<Scan className="w-4 h-4" />} label="24h Scans" value={stats.recentScans} color="text-blue-400" />
        </div>

        {/* Threat Alerts */}
        <div className="mb-4 md:mb-6">
          <ThreatAlert citizens={citizens} />
        </div>

        {/* Threat Map */}
        <div className="mb-4 md:mb-6">
          <ThreatMap citizens={citizens} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main — Citizens + Cases */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-white flex items-center gap-2 shrink-0">
                <Scan className="w-4 h-4 text-cyan-400" />
                Population Monitor
              </h2>
              <div className="flex gap-1.5 overflow-x-auto">
                {(['all', 'threats', 'severe'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                      filter === f
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-slate-800 text-gray-400 border border-slate-700 hover:text-white'
                    }`}
                  >
                    {f === 'all' ? 'All' : f === 'threats' ? `Threats${latentCount > 0 ? ` (${latentCount})` : ''}` : `Severe${severeCount > 0 ? ` (${severeCount})` : ''}`}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500 text-sm">Loading population data...</div>
            ) : (
              <div className="space-y-3">
                {filteredCitizens.map((citizen) => (
                  <CitizenCard key={citizen.id} citizen={citizen} />
                ))}
                {filteredCitizens.length === 0 && (
                  <div className="text-center py-12 text-gray-500 text-sm">No citizens match the selected filter.</div>
                )}
              </div>
            )}

            {/* Active Cases */}
            <div className="mt-6">
              <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-3">
                <FileWarning className="w-4 h-4 text-orange-400" />
                Active Cases
              </h2>
              <div className="space-y-3">
                {cases
                  .filter((c) => c.status !== 'resolved')
                  .map((c) => (
                    <div
                      key={c.id}
                      onClick={() => navigate(`/case/${c.id}`)}
                      className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 cursor-pointer hover:border-slate-600 transition-all"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-cyan-400 text-sm font-mono truncate">{c.case_number}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                            c.status === 'pending_authorization'
                              ? 'bg-red-900/30 text-red-400 border border-red-500/30'
                              : 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
                          }`}
                        >
                          {c.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-white font-medium text-sm mb-1 text-balance">{c.title}</h3>
                      <p className="text-gray-500 text-xs mb-2 text-pretty">{c.description?.substring(0, 120)}…</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                        <span>Inspector: {c.assigned_inspector}</span>
                        <span>Enforcer: {c.assigned_enforcer}</span>
                      </div>
                    </div>
                  ))}
                {cases.filter((c) => c.status !== 'resolved').length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">No active cases.</div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar — visible on lg+, collapsed inside Sheet on mobile (accessed via header menu) */}
          <div className="hidden lg:block space-y-4">
            <AgentStatusPanel />
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
              <h3 className="text-white font-semibold text-sm mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {navLinks.map((l) => (
                  <button
                    key={l.to}
                    onClick={() => navigate(l.to)}
                    className={`w-full py-2.5 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2
                      ${l.to === '/scan'
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                        : l.to === '/dominator'
                        ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                        : 'bg-slate-800 border-slate-700 text-gray-300 hover:text-white'
                      }`}
                  >
                    {l.icon}{l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Agent Panel — shown below main content on small screens */}
        <div className="lg:hidden mt-6">
          <AgentStatusPanel />
        </div>
      </div>

      {/* Floating Sibyl Oracle chat button */}
      <button
        onClick={() => navigate('/sibyl-ai')}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full
          bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40
          border border-violet-400/30 transition-all hover:scale-105 active:scale-95"
        aria-label="Open Sibyl Oracle AI"
      >
        <MessageSquare className="w-5 h-5 shrink-0" />
        <span className="text-sm font-semibold hidden sm:inline">Sibyl Oracle</span>
      </button>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string }> = ({
  icon,
  label,
  value,
  color,
}) => (
  <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-3">
    <div className={`${color} mb-1`}>{icon}</div>
    <div className={`text-xl font-bold ${color}`}>{value}</div>
    <div className="text-xs text-gray-500 truncate">{label}</div>
  </div>
);

export default Dashboard;
