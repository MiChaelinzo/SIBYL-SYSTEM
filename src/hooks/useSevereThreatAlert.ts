import { useEffect, useRef } from 'react';
import type { Citizen } from '@/types/sibyl';

const SEVERE_THRESHOLD = 300;

/** Play a short synthesized alert tone via Web Audio API */
function playThreatBeep() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AudioCtx: any =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx: any = new AudioCtx();

    const now = ctx.currentTime;

    // Two-tone rising alert: 880 Hz → 1320 Hz
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.linearRampToValueAtTime(1320, now + 0.18);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(440, now);
    osc2.frequency.linearRampToValueAtTime(660, now + 0.18);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);

    // Clean up context after tone completes
    setTimeout(() => { ctx.close(); }, 500);
  } catch {
    // AudioContext unavailable — silent fail
  }
}

/**
 * Watches the citizens array and fires an audio alert whenever a citizen
 * newly crosses the severe threat threshold (CC ≥ 300).
 * Does NOT alert on the initial data load — only on transitions.
 */
export function useSevereThreatAlert(citizens: Citizen[]) {
  // Map of citizen id → was severe on previous render
  const prevSevereRef = useRef<Map<string, boolean>>(new Map());
  // Track whether initial load has been processed
  const initializedRef = useRef(false);

  useEffect(() => {
    if (citizens.length === 0) return;

    const currentSevere = new Map<string, boolean>();
    citizens.forEach((c) => {
      currentSevere.set(c.id, c.current_crime_coefficient >= SEVERE_THRESHOLD);
    });

    if (!initializedRef.current) {
      // First load — snapshot state without alerting
      prevSevereRef.current = currentSevere;
      initializedRef.current = true;
      return;
    }

    // Check for newly-severe citizens
    let newThreat = false;
    currentSevere.forEach((isSevere, id) => {
      const wasSevere = prevSevereRef.current.get(id) ?? false;
      if (isSevere && !wasSevere) {
        newThreat = true;
      }
    });

    if (newThreat) {
      playThreatBeep();
    }

    prevSevereRef.current = currentSevere;
  }, [citizens]);
}
