import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ScanLine, Zap, AlertTriangle } from 'lucide-react';
import { useCitizen } from '@/hooks/useSibylData';
import { useBiometrics } from '@/hooks/useSibylData';
import { PsychoPassGauge } from '@/components/PsychoPassGauge';
import { DominatorOverlay } from '@/components/DominatorOverlay';
import BiometricVitalsPanel from '@/components/BiometricVitalsPanel';
import { HUE_COLORS, THREAT_LABELS } from '@/types/sibyl';

const CitizenProfile: React.FC = () => {
  const { citizenId } = useParams<{ citizenId: string }>();
  const navigate = useNavigate();
  const { citizen, scans, loading } = useCitizen(citizenId || '');
  const { readings: bioReadings } = useBiometrics(citizenId || '');
  const [showDominator, setShowDominator] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-gray-500">
        Accessing Sibyl database...
      </div>
    );
  }

  if (!citizen) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-gray-500">
        Citizen not found in database.
      </div>
    );
  }

  const colors = HUE_COLORS[citizen.current_hue] || HUE_COLORS.green;
  const isAsymptomatic = citizen.is_criminally_asymptomatic;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">Citizen Profile</h1>
            <p className="text-xs text-gray-500">{citizen.citizen_id}</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <PsychoPassGauge
              crimeCoefficient={citizen.current_crime_coefficient}
              hue={citizen.current_hue}
              size="lg"
            />

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-1">{citizen.name}</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
                  {THREAT_LABELS[citizen.threat_level]}
                </span>
                <span className="text-gray-400 text-sm">{citizen.occupation || 'Unknown Occupation'}</span>
                {citizen.age && <span className="text-gray-400 text-sm">Age {citizen.age}</span>}
              </div>
              <div className="text-gray-500 text-sm mb-4">
                {citizen.location || 'Location Unknown'} | Total Scans: {citizen.scan_count}
              </div>

              {isAsymptomatic && (
                <div className="rounded-lg border border-purple-500/30 bg-purple-900/20 p-3 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-400 text-sm font-medium">
                    CRIMINALLY ASYMPTOMATIC — Psycho-Pass cannot be read
                  </span>
                </div>
              )}

              <div className="flex gap-3 justify-center md:justify-start">
                <button
                  onClick={() => setShowDominator(true)}
                  className="px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Dominator
                </button>
                <button
                  onClick={() => navigate('/scan')}
                  className="px-4 py-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 transition-all flex items-center gap-2"
                >
                  <ScanLine className="w-4 h-4" />
                  Re-Scan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Biometric Vitals Panel */}
        <BiometricVitalsPanel
          latest={bioReadings[0] ?? null}
          history={bioReadings}
        />

        {/* Scan History */}
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-cyan-400" />
            Cymatic Scan History
          </h3>

          {scans.length === 0 ? (
            <p className="text-gray-500 text-sm">No scan records found.</p>
          ) : (
            <div className="space-y-3">
              {scans.map((scan) => {
                const scanColors = HUE_COLORS[scan.hue] || HUE_COLORS.green;
                return (
                  <div
                    key={scan.id}
                    className={`rounded-xl border p-4 ${scanColors.bg} ${scanColors.border}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-bold ${scanColors.text}`}>{scan.crime_coefficient}</span>
                        <span className={`text-xs px-2 py-0.5 rounded border ${scanColors.text} ${scanColors.border}`}>
                          {scan.hue.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">{scan.scan_type}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(scan.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{scan.mental_state_description}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      Location: {scan.scan_location || 'Unknown'} | Agent: {scan.agent_id}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showDominator && (
        <DominatorOverlay citizen={citizen} onClose={() => setShowDominator(false)} />
      )}
    </div>
  );
};

export default CitizenProfile;
