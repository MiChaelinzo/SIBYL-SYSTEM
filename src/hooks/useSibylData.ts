import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/db/supabase';
import type { Citizen, Scan, Case, AgentLog, DominatorEvent, BiometricReading, BiometricValues } from '@/types/sibyl';

export function useBiometrics(citizenId: string, limit = 20) {
  const [readings, setReadings] = useState<BiometricReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!citizenId) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('biometric_readings')
        .select('*')
        .eq('citizen_id', citizenId)
        .order('created_at', { ascending: false })
        .limit(limit);
      setReadings(data || []);
      setLoading(false);
    };
    fetch();

    const channel = supabase
      .channel(`biometrics_${citizenId}_${Math.random()}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'biometric_readings', filter: `citizen_id=eq.${citizenId}` },
        (payload) => setReadings((prev) => [payload.new as BiometricReading, ...prev].slice(0, limit))
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [citizenId, limit]);

  return { readings, loading };
}

export async function saveBiometricReading(citizenId: string, values: BiometricValues, source: 'manual' | 'smartwatch' = 'manual') {
  const payload = {
    citizen_id: citizenId,
    bpm: values.bpm ? parseInt(values.bpm) : null,
    stress_level: values.stress_level ? parseInt(values.stress_level) : null,
    blood_pressure_systolic: values.blood_pressure_systolic ? parseInt(values.blood_pressure_systolic) : null,
    blood_pressure_diastolic: values.blood_pressure_diastolic ? parseInt(values.blood_pressure_diastolic) : null,
    spo2: values.spo2 ? parseFloat(values.spo2) : null,
    skin_conductance: values.skin_conductance ? parseFloat(values.skin_conductance) : null,
    body_temperature: values.body_temperature ? parseFloat(values.body_temperature) : null,
    reading_source: source,
  };
  const { error } = await supabase.from('biometric_readings').insert(payload);
  if (!error) {
    // Update latest_biometrics on the citizen row
    await supabase.from('citizens').update({ latest_biometrics: payload }).eq('citizen_id', citizenId);
  }
  return { error };
}

export function useCitizens() {
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCitizens = async () => {
      const { data } = await supabase
        .from('citizens')
        .select('*')
        .order('current_crime_coefficient', { ascending: false });
      setCitizens(data || []);
      setLoading(false);
    };
    fetchCitizens();

    const channel = supabase
      .channel(`citizens_${Math.random()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'citizens' }, fetchCitizens)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { citizens, loading };
}

export function useCitizen(citizenId: string) {
  const [citizen, setCitizen] = useState<Citizen | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!citizenId) return;

    const fetchData = async () => {
      const [{ data: citizenData }, { data: scanData }] = await Promise.all([
        supabase.from('citizens').select('*').eq('citizen_id', citizenId).single(),
        supabase.from('scans').select('*').eq('citizen_id', citizenId).order('created_at', { ascending: false }),
      ]);
      setCitizen(citizenData);
      setScans(scanData || []);
      setLoading(false);
    };
    fetchData();

    // Realtime: prepend new scans as they are inserted for this citizen
    const channel = supabase
      .channel(`scans_citizen_${citizenId}_${Math.random()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'scans',
          filter: `citizen_id=eq.${citizenId}`,
        },
        (payload) => {
          setScans((prev) => [payload.new as Scan, ...prev]);
          // Also refresh citizen row to pick up updated CC / hue
          supabase
            .from('citizens')
            .select('*')
            .eq('citizen_id', citizenId)
            .single()
            .then(({ data }) => { if (data) setCitizen(data); });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [citizenId]);

  return { citizen, scans, loading };
}

export function useCases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      const { data } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });
      setCases(data || []);
      setLoading(false);
    };
    fetchCases();

    const channel = supabase
      .channel(`cases_${Math.random()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, fetchCases)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { cases, loading };
}

export function useAgentLogs(limit = 50) {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('agent_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      setLogs(data || []);
      setLoading(false);
    };
    fetchLogs();

    const channel = supabase
      .channel(`agent_logs_${Math.random()}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_logs' }, (payload) => {
        setLogs((prev) => [payload.new as AgentLog, ...prev].slice(0, limit));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [limit]);

  return { logs, loading };
}

export function useDominatorEvents(limit = 10) {
  const [events, setEvents] = useState<DominatorEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('dominator_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      setEvents(data || []);
      setLoading(false);
    };
    fetchEvents();

    // Realtime: prepend new dominator events, cap at limit
    const channel = supabase
      .channel(`dominator_events_${Math.random()}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'dominator_events' },
        (payload) => {
          setEvents((prev) => [payload.new as DominatorEvent, ...prev].slice(0, limit));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [limit]);

  return { events, loading };
}

export function useStats() {
  const [stats, setStats] = useState({
    total: 0,
    lawAbiding: 0,
    latentCriminal: 0,
    severeThreat: 0,
    activeCases: 0,
    recentScans: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: citizens } = await supabase.from('citizens').select('threat_level');
      const { data: activeCases } = await supabase.from('cases').select('id').in('status', ['under_investigation', 'pending_authorization']);
      const { data: recentScans } = await supabase.from('scans').select('id').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const counts = (citizens || []).reduce(
        (acc, c) => {
          acc.total++;
          if (c.threat_level === 'law_abiding') acc.lawAbiding++;
          else if (c.threat_level === 'latent_criminal') acc.latentCriminal++;
          else if (c.threat_level === 'severe_threat') acc.severeThreat++;
          return acc;
        },
        { total: 0, lawAbiding: 0, latentCriminal: 0, severeThreat: 0 }
      );

      setStats({
        ...counts,
        activeCases: activeCases?.length || 0,
        recentScans: recentScans?.length || 0,
      });
    };
    fetchStats();
  }, []);

  return stats;
}

export async function performScan(citizenId: string, mentalState: string, location = 'Tokyo Sector 1') {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sibyl-scan`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        citizen_id: citizenId,
        mental_state: mentalState,
        scan_location: location,
        scan_type: 'routine',
      }),
    }
  );
  return response.json();
}

export async function getAgentStatus() {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sibyl-agent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ action: 'get_status' }),
    }
  );
  return response.json();
}

export async function authorizeDominator(citizenId: string, caseId: string, decision?: string) {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sibyl-agent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'dominator_authorize',
        citizen_id: citizenId,
        case_id: caseId,
        decision,
      }),
    }
  );
  return response.json();
}

export async function resolveConflict(caseId: string, notes?: string) {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sibyl-agent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'resolve_conflict',
        case_id: caseId,
        notes,
      }),
    }
  );
  return response.json();
}

export async function checkpointDecision(caseId: string, decision: 'approve' | 'deny') {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sibyl-agent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'checkpoint_decision',
        case_id: caseId,
        decision,
      }),
    }
  );
  return response.json();
}
