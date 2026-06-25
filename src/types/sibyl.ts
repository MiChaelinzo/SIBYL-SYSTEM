export interface Citizen {
  id: string;
  citizen_id: string;
  name: string;
  age: number | null;
  occupation: string | null;
  location: string | null;
  current_crime_coefficient: number;
  current_hue: string;
  threat_level: string;
  scan_count: number;
  last_scan_at: string | null;
  career_suggestions: any;
  is_criminally_asymptomatic: boolean;
  created_at: string;
}

export interface Scan {
  id: string;
  citizen_id: string;
  crime_coefficient: number;
  hue: string;
  threat_level: string;
  mental_state_description: string;
  scan_location: string | null;
  scan_type: string;
  agent_id: string;
  created_at: string;
}

export interface Case {
  id: string;
  case_number: string;
  title: string;
  description: string | null;
  citizen_id: string | null;
  status: string;
  threat_assessment: any;
  assigned_inspector: string | null;
  assigned_enforcer: string | null;
  evidence: any;
  investigation_timeline: any;
  sibyl_decision: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface AgentLog {
  id: string;
  agent_name: string;
  agent_role: string;
  action: string;
  target_citizen_id: string | null;
  case_id: string | null;
  message: string;
  severity: string;
  metadata: any;
  created_at: string;
}

export interface DominatorEvent {
  id: string;
  citizen_id: string;
  case_id: string | null;
  mode: string;
  crime_coefficient: number;
  hue: string;
  authorized_by: string;
  authorization_reason: string;
  status: string;
  executed_at: string | null;
  created_at: string;
}

export interface BiometricReading {
  id: string;
  citizen_id: string;
  bpm: number | null;
  stress_level: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  spo2: number | null;
  skin_conductance: number | null;
  body_temperature: number | null;
  reading_source: 'manual' | 'smartwatch' | 'sensor';
  created_at: string;
}

export interface BiometricValues {
  bpm: string;
  stress_level: string;
  blood_pressure_systolic: string;
  blood_pressure_diastolic: string;
  spo2: string;
  skin_conductance: string;
  body_temperature: string;
}

export const BIOMETRIC_DEFAULTS: BiometricValues = {
  bpm: '',
  stress_level: '',
  blood_pressure_systolic: '',
  blood_pressure_diastolic: '',
  spo2: '',
  skin_conductance: '',
  body_temperature: '',
};

export interface PsychoPassResult {
  crime_coefficient: number;
  hue: string;
  threat_level: string;
  mental_state_description: string;
  reasoning: string;
}

export const HUE_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  blue: { bg: 'bg-blue-900/30', text: 'text-blue-400', border: 'border-blue-500/50', glow: 'shadow-blue-500/30' },
  green: { bg: 'bg-emerald-900/30', text: 'text-emerald-400', border: 'border-emerald-500/50', glow: 'shadow-emerald-500/30' },
  yellow: { bg: 'bg-yellow-900/30', text: 'text-yellow-400', border: 'border-yellow-500/50', glow: 'shadow-yellow-500/30' },
  orange: { bg: 'bg-orange-900/30', text: 'text-orange-400', border: 'border-orange-500/50', glow: 'shadow-orange-500/30' },
  red: { bg: 'bg-red-900/30', text: 'text-red-400', border: 'border-red-500/50', glow: 'shadow-red-500/30' },
};

export const THREAT_LABELS: Record<string, string> = {
  law_abiding: 'Law Abiding',
  latent_criminal: 'Latent Criminal',
  severe_threat: 'Severe Threat',
};

export const AGENT_STATUS_COLORS: Record<string, string> = {
  active: 'text-emerald-400',
  idle: 'text-gray-400',
  critical: 'text-red-400',
  warning: 'text-yellow-400',
};
