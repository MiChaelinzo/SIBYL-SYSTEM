import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import type { Citizen } from '@/types/sibyl';

interface ThreatMapProps {
  citizens: Citizen[];
}

// Tokyo sector grid layout (3 cols × 3 rows, sector 9 is center "restricted")
const SECTORS: { id: number; label: string; col: number; row: number; x: number; y: number; w: number; h: number }[] = [
  { id: 1, label: 'Sector 1', col: 0, row: 0, x: 40,  y: 40,  w: 180, h: 130 },
  { id: 2, label: 'Sector 2', col: 1, row: 0, x: 240, y: 40,  w: 180, h: 130 },
  { id: 3, label: 'Sector 3', col: 2, row: 0, x: 440, y: 40,  w: 180, h: 130 },
  { id: 4, label: 'Sector 4', col: 0, row: 1, x: 40,  y: 190, w: 180, h: 130 },
  { id: 5, label: 'Sector 5', col: 1, row: 1, x: 240, y: 190, w: 180, h: 130 },
  { id: 6, label: 'Sector 6', col: 2, row: 1, x: 440, y: 190, w: 180, h: 130 },
  { id: 7, label: 'Sector 7', col: 0, row: 2, x: 40,  y: 340, w: 180, h: 130 },
  { id: 8, label: 'Sector 8', col: 1, row: 2, x: 240, y: 340, w: 180, h: 130 },
];

const HUE_SVG_COLORS: Record<string, string> = {
  blue:   '#3b82f6',
  green:  '#22c55e',
  yellow: '#eab308',
  orange: '#f97316',
  red:    '#ef4444',
};

function parseSector(location: string | null): number {
  if (!location) return 5; // default centre
  const match = location.match(/Sector\s*(\d+)/i);
  if (match) {
    const n = parseInt(match[1]);
    return n >= 1 && n <= 8 ? n : 5;
  }
  return 5;
}

// Deterministic spread within a sector so markers don't all stack
function spread(citizenId: string, index: number): { dx: number; dy: number } {
  const seed = citizenId.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + index * 37;
  const dx = ((seed * 13) % 100) - 50;
  const dy = ((seed * 7)  % 60)  - 30;
  return { dx, dy };
}

const ThreatMap: React.FC<ThreatMapProps> = ({ citizens }) => {
  const [tooltip, setTooltip] = useState<{ citizen: Citizen; svgX: number; svgY: number } | null>(null);

  // Group citizens by sector
  const bySector: Record<number, Citizen[]> = {};
  citizens.forEach((c) => {
    const s = parseSector(c.location);
    if (!bySector[s]) bySector[s] = [];
    bySector[s].push(c);
  });

  // Build marker positions
  const markers: { citizen: Citizen; cx: number; cy: number; color: string; isSevere: boolean }[] = [];
  SECTORS.forEach((sector) => {
    const group = bySector[sector.id] || [];
    const centerX = sector.x + sector.w / 2;
    const centerY = sector.y + sector.h / 2;
    group.forEach((c, i) => {
      const { dx, dy } = spread(c.citizen_id, i);
      markers.push({
        citizen: c,
        cx: centerX + dx,
        cy: centerY + dy,
        color: HUE_SVG_COLORS[c.current_hue] || HUE_SVG_COLORS.green,
        isSevere: c.current_crime_coefficient >= 300,
      });
    });
  });

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-cyan-400" />
        <h3 className="text-white font-semibold text-sm">Geolocation Threat Map — Tokyo District</h3>
        <span className="ml-auto text-xs text-gray-500">{citizens.length} tracked</span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-3">
        {Object.entries(HUE_SVG_COLORS).map(([hue, color]) => (
          <div key={hue} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-400 capitalize">{hue}</span>
          </div>
        ))}
      </div>

      {/* SVG Map */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox="0 0 660 500"
          className="w-full"
          style={{ minWidth: 280, background: '#050a14' }}
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#0f2040" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="660" height="500" fill="url(#grid)" />

          {/* Sector boxes */}
          {SECTORS.map((s) => {
            const hasThreats = (bySector[s.id] || []).some(c => c.current_crime_coefficient >= 100);
            const hasSevere  = (bySector[s.id] || []).some(c => c.current_crime_coefficient >= 300);
            return (
              <g key={s.id}>
                <rect
                  x={s.x} y={s.y} width={s.w} height={s.h}
                  fill={hasSevere ? 'rgba(239,68,68,0.05)' : hasThreats ? 'rgba(234,179,8,0.04)' : 'rgba(0,229,255,0.03)'}
                  stroke={hasSevere ? '#ef4444' : hasThreats ? '#eab308' : '#00e5ff'}
                  strokeWidth="0.8"
                  strokeOpacity="0.4"
                  rx="2"
                />
                <text
                  x={s.x + 8} y={s.y + 16}
                  fill={hasSevere ? '#ef4444' : '#00e5ff'}
                  fontSize="9"
                  fontFamily="monospace"
                  opacity="0.7"
                >
                  {s.label.toUpperCase()}
                </text>
                <text
                  x={s.x + 8} y={s.y + 27}
                  fill="#334155"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {(bySector[s.id] || []).length} citizen{(bySector[s.id] || []).length !== 1 ? 's' : ''}
                </text>
              </g>
            );
          })}

          {/* Citizen markers */}
          {markers.map(({ citizen, cx, cy, color, isSevere }) => (
            <g
              key={citizen.id}
              className="cursor-pointer"
              onMouseEnter={(e) => {
                const svg = (e.currentTarget as SVGGElement).ownerSVGElement!;
                const pt = svg.createSVGPoint();
                pt.x = e.clientX; pt.y = e.clientY;
                const svgPt = pt.matrixTransform(svg.getScreenCTM()!.inverse());
                setTooltip({ citizen, svgX: svgPt.x, svgY: svgPt.y });
              }}
              onMouseLeave={() => setTooltip(null)}
              onClick={() => setTooltip(tooltip?.citizen.id === citizen.id ? null : { citizen, svgX: cx, svgY: cy - 30 })}
            >
              {/* Severe pulse ring */}
              {isSevere && (
                <>
                  <circle cx={cx} cy={cy} r="14" fill="none" stroke={color} strokeWidth="1" opacity="0.3">
                    <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                  </circle>
                </>
              )}
              {/* Marker */}
              <circle cx={cx} cy={cy} r="6" fill={color} opacity={isSevere ? 1 : 0.85}
                style={{ filter: `drop-shadow(0 0 ${isSevere ? 5 : 3}px ${color})` }}
              />
              {/* CC label for severe */}
              {isSevere && (
                <text x={cx} y={cy - 9} textAnchor="middle" fill={color} fontSize="7" fontFamily="monospace" fontWeight="bold">
                  {citizen.current_crime_coefficient}
                </text>
              )}
            </g>
          ))}

          {/* Tooltip */}
          {tooltip && (() => {
            const { citizen: c, svgX, svgY } = tooltip;
            const bx = Math.min(svgX - 5, 640 - 150);
            const by = Math.max(svgY - 80, 10);
            const col = HUE_SVG_COLORS[c.current_hue] || '#22c55e';
            return (
              <g>
                <rect x={bx} y={by} width={155} height={68} rx="4" fill="#0a1628" stroke={col} strokeWidth="0.8" />
                <text x={bx + 8} y={by + 15} fill={col} fontSize="9" fontFamily="monospace" fontWeight="bold">
                  {c.citizen_id} — {c.name}
                </text>
                <text x={bx + 8} y={by + 28} fill="#94a3b8" fontSize="8" fontFamily="monospace">
                  {c.occupation || 'Unknown'} · {c.location || '?'}
                </text>
                <text x={bx + 8} y={by + 42} fill={col} fontSize="11" fontFamily="monospace" fontWeight="bold">
                  CC: {c.current_crime_coefficient}
                </text>
                <text x={bx + 8} y={by + 57} fill="#94a3b8" fontSize="8" fontFamily="monospace">
                  HUE: {c.current_hue.toUpperCase()} · {c.threat_level.replace('_', ' ').toUpperCase()}
                </text>
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
};

export default ThreatMap;
