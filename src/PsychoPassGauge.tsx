import React from 'react';
import { HUE_COLORS } from '@/types/sibyl';

interface PsychoPassGaugeProps {
  crimeCoefficient: number;
  hue: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const PsychoPassGauge: React.FC<PsychoPassGaugeProps> = ({
  crimeCoefficient,
  hue,
  size = 'md',
  showLabel = true,
}) => {
  const colors = HUE_COLORS[hue] || HUE_COLORS.green;
  const percentage = Math.min(100, (crimeCoefficient / 999) * 100);

  const sizeClasses = {
    sm: { container: 'w-24 h-24', text: 'text-lg', label: 'text-xs' },
    md: { container: 'w-36 h-36', text: 'text-2xl', label: 'text-sm' },
    lg: { container: 'w-48 h-48', text: 'text-4xl', label: 'text-base' },
  };

  const classes = sizeClasses[size];

  // Calculate color based on coefficient
  const getStrokeColor = () => {
    if (crimeCoefficient < 100) return '#3b82f6'; // blue
    if (crimeCoefficient < 200) return '#22c55e'; // green
    if (crimeCoefficient < 300) return '#eab308'; // yellow
    if (crimeCoefficient < 400) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative ${classes.container} flex items-center justify-center`}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#1e293b"
          strokeWidth="6"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={getStrokeColor()}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${getStrokeColor()})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${classes.text} font-bold ${colors.text} tabular-nums`}>
          {crimeCoefficient}
        </span>
        {showLabel && (
          <span className={`${classes.label} text-gray-400 uppercase tracking-wider`}>
            Crime Coef
          </span>
        )}
      </div>
    </div>
  );
};
