import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, AlertTriangle, ShieldAlert } from 'lucide-react';
import { PsychoPassGauge } from './PsychoPassGauge';
import { HUE_COLORS, THREAT_LABELS } from '@/types/sibyl';
import type { Citizen } from '@/types/sibyl';

interface CitizenCardProps {
  citizen: Citizen;
}

export const CitizenCard: React.FC<CitizenCardProps> = ({ citizen }) => {
  const navigate = useNavigate();
  const colors = HUE_COLORS[citizen.current_hue] || HUE_COLORS.green;
  const isSevere = citizen.current_crime_coefficient >= 300;
  const isThreat = citizen.current_crime_coefficient >= 100;

  return (
    <div
      className={`relative rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-hidden
        ${colors.bg} ${colors.border} hover:shadow-lg hover:${colors.glow}`}
      onClick={() => navigate(`/citizen/${citizen.citizen_id}`)}
    >
      {isSevere && (
        <div className="absolute top-2 right-2">
          <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
        </div>
      )}
      {isThreat && !isSevere && (
        <div className="absolute top-2 right-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
        </div>
      )}

      <div className="p-4 flex items-center gap-4">
        <PsychoPassGauge
          crimeCoefficient={citizen.current_crime_coefficient}
          hue={citizen.current_hue}
          size="sm"
          showLabel={false}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-semibold truncate">{citizen.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${colors.text} ${colors.border}`}>
              {citizen.citizen_id}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <span>{citizen.occupation || 'Unknown'}</span>
            <span className="text-gray-600">|</span>
            <span>{citizen.location || 'Unknown'}</span>
            {citizen.age && (
              <>
                <span className="text-gray-600">|</span>
                <span>Age {citizen.age}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 mt-2">
            <span className={`text-xs font-medium uppercase tracking-wide ${colors.text}`}>
              {THREAT_LABELS[citizen.threat_level] || citizen.threat_level}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded ${colors.bg} ${colors.text} border ${colors.border}`}>
              Hue: {citizen.current_hue.toUpperCase()}
            </span>
            <span className="text-xs text-gray-500">
              Scans: {citizen.scan_count}
            </span>
          </div>
        </div>

        <Eye className="w-5 h-5 text-gray-500 hover:text-white transition-colors" />
      </div>
    </div>
  );
};
