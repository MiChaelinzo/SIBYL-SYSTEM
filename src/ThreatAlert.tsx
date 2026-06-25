import React from 'react';
import { ShieldAlert, AlertTriangle, Siren } from 'lucide-react';
import type { Citizen } from '@/types/sibyl';

interface ThreatAlertProps {
  citizens: Citizen[];
}

export const ThreatAlert: React.FC<ThreatAlertProps> = ({ citizens }) => {
  const severeThreats = citizens.filter((c) => c.current_crime_coefficient >= 300);
  const latentCriminals = citizens.filter(
    (c) => c.current_crime_coefficient >= 100 && c.current_crime_coefficient < 300
  );

  if (severeThreats.length === 0 && latentCriminals.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-900/10 p-4 flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-emerald-400 text-sm font-medium">All Systems Normal. Population Stable.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {severeThreats.map((citizen) => (
        <div
          key={citizen.id}
          className="rounded-xl border border-red-500/50 bg-red-900/20 p-4 flex items-center gap-3 animate-pulse"
        >
          <Siren className="w-6 h-6 text-red-500" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-red-400 font-bold text-sm">SEVERE THREAT DETECTED</span>
              <span className="text-red-500 text-xs">CRIME COEFFICIENT: {citizen.current_crime_coefficient}</span>
            </div>
            <div className="text-white text-sm">
              {citizen.name} ({citizen.citizen_id}) — {citizen.location || 'Unknown Location'}
            </div>
          </div>
          <ShieldAlert className="w-5 h-5 text-red-500" />
        </div>
      ))}

      {latentCriminals.map((citizen) => (
        <div
          key={citizen.id}
          className="rounded-xl border border-yellow-500/30 bg-yellow-900/10 p-4 flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 font-semibold text-sm">LATENT CRIMINAL</span>
              <span className="text-yellow-500 text-xs">CC: {citizen.current_crime_coefficient}</span>
            </div>
            <div className="text-gray-300 text-sm">
              {citizen.name} ({citizen.citizen_id}) — {citizen.location || 'Unknown'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
