/**
 * ============================================================
 * SIBYL SYSTEM - MULTI-AGENT COORDINATION ENDPOINT
 * ============================================================
 * This Edge Function handles inter-agent communication,
 * conflict resolution, and task coordination between the
 * three core Sibyl agents: Hive Mind, Inspector, and Enforcer.
 *
 * KEY CAPABILITIES:
 * - Task decomposition and assignment
 * - Agent conflict arbitration via Sibyl Hive Mind
 * - Human-in-the-loop checkpoint handling
 * - Decision trail logging
 * ============================================================
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.103.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AgentRequest {
  action: 'resolve_conflict' | 'assign_task' | 'checkpoint_decision' | 'get_status' | 'dominator_authorize';
  case_id?: string;
  citizen_id?: string;
  agent_name?: string;
  decision?: string;
  notes?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: AgentRequest = await req.json();

    switch (body.action) {
      case 'get_status': {
        // Get all active agents and their current tasks
        const { data: logs } = await supabase
          .from('agent_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        const { data: activeCases } = await supabase
          .from('cases')
          .select('*')
          .in('status', ['under_investigation', 'pending_authorization'])
          .order('created_at', { ascending: false });

        const agentStatus = {
          sibyl: { status: 'active', current_task: 'Monitoring population', load: 'normal' },
          inspector: { status: 'active', current_task: activeCases?.find(c => c.assigned_inspector)?.title || 'Idle', load: activeCases?.length ? 'high' : 'normal' },
          enforcer: { status: 'active', current_task: activeCases?.find(c => c.status === 'pending_authorization')?.title || 'Patrol', load: activeCases?.find(c => c.status === 'pending_authorization') ? 'critical' : 'normal' },
        };

        return new Response(
          JSON.stringify({ agents: agentStatus, recent_logs: logs, active_cases: activeCases }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'resolve_conflict': {
        const { case_id, notes } = body;
        if (!case_id) {
          return new Response(JSON.stringify({ error: 'case_id required' }), { status: 400, headers: corsHeaders });
        }

        // Simulate Sibyl arbitration with 247 brain nodes
        const { data: caseData } = await supabase
          .from('cases')
          .select('*')
          .eq('id', case_id)
          .single();

        if (!caseData) {
          return new Response(JSON.stringify({ error: 'Case not found' }), { status: 404, headers: corsHeaders });
        }

        // Simulate collective decision from 247 nodes
        const nodesAgree = Math.random() > 0.15; // 85% consensus rate
        const decision = nodesAgree
          ? `Collective decision: ${caseData.threat_assessment?.risk === 'extreme' ? 'Lethal elimination authorized.' : 'Apprehension authorized.'}`
          : 'Consensus not reached. Defaulting to conservative approach: Non-lethal apprehension.';

        await supabase.from('cases').update({
          sibyl_decision: decision,
          status: nodesAgree ? 'pending_authorization' : 'under_investigation',
          updated_at: new Date().toISOString(),
        }).eq('id', case_id);

        await supabase.from('agent_logs').insert({
          agent_name: 'Sibyl Hive Mind',
          agent_role: 'orchestrator',
          action: 'conflict_resolved',
          case_id,
          message: `Arbitration complete. 247 nodes analyzed. ${decision}`,
          severity: 'warning',
          metadata: { nodes_consensus: nodesAgree, notes },
        });

        return new Response(
          JSON.stringify({ success: true, decision, consensus: nodesAgree }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'dominator_authorize': {
        const { citizen_id, case_id, decision } = body;
        if (!citizen_id || !case_id) {
          return new Response(JSON.stringify({ error: 'citizen_id and case_id required' }), { status: 400, headers: corsHeaders });
        }

        const { data: citizen } = await supabase
          .from('citizens')
          .select('*')
          .eq('citizen_id', citizen_id)
          .single();

        if (!citizen) {
          return new Response(JSON.stringify({ error: 'Citizen not found' }), { status: 404, headers: corsHeaders });
        }

        // Check if criminally asymptomatic
        if (citizen.is_criminally_asymptomatic) {
          await supabase.from('dominator_events').insert({
            citizen_id,
            case_id,
            mode: 'locked',
            crime_coefficient: citizen.current_crime_coefficient,
            hue: citizen.current_hue,
            authorized_by: 'sibyl-hive-mind',
            authorization_reason: 'Citizen is criminally asymptomatic. Dominator cannot lock on.',
            status: 'denied',
          });

          await supabase.from('agent_logs').insert({
            agent_name: 'Sibyl Hive Mind',
            agent_role: 'orchestrator',
            action: 'dominator_denied',
            target_citizen_id: citizen_id,
            case_id,
            message: `Dominator authorization DENIED. Citizen ${citizen_id} is criminally asymptomatic. Weapon cannot lock on.`,
            severity: 'critical',
          });

          return new Response(
            JSON.stringify({ authorized: false, reason: 'Criminally asymptomatic - Dominator cannot lock on' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check Crime Coefficient thresholds
        let mode = 'paralyzer';
        let authorized = false;
        let reason = '';

        if (citizen.current_crime_coefficient < 100) {
          authorized = false;
          reason = 'Crime Coefficient below enforcement threshold';
          mode = 'locked';
        } else if (citizen.current_crime_coefficient < 300) {
          authorized = true;
          mode = 'paralyzer';
          reason = 'Non-lethal paralyzer authorized for latent criminal';
        } else {
          // Lethal requires human checkpoint
          if (decision === 'human_approved') {
            authorized = true;
            mode = citizen.current_crime_coefficient > 500 ? 'decomposer' : 'eliminator';
            reason = `Lethal ${mode} authorized after human checkpoint`;
          } else {
            authorized = false;
            mode = 'pending';
            reason = 'Lethal action requires human-in-the-loop checkpoint confirmation';
          }
        }

        await supabase.from('dominator_events').insert({
          citizen_id,
          case_id,
          mode,
          crime_coefficient: citizen.current_crime_coefficient,
          hue: citizen.current_hue,
          authorized_by: 'sibyl-hive-mind',
          authorization_reason: reason,
          status: authorized ? 'authorized' : 'denied',
        });

        await supabase.from('agent_logs').insert({
          agent_name: 'Enforcer Agent',
          agent_role: 'enforcer',
          action: authorized ? 'dominator_authorized' : 'dominator_denied',
          target_citizen_id: citizen_id,
          case_id,
          message: `Dominator ${authorized ? 'AUTHORIZED' : 'DENIED'} for Citizen ${citizen_id}. Mode: ${mode.toUpperCase()}. ${reason}`,
          severity: authorized && mode !== 'paralyzer' ? 'critical' : 'warning',
        });

        return new Response(
          JSON.stringify({ authorized, mode, reason, crime_coefficient: citizen.current_crime_coefficient, hue: citizen.current_hue }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'checkpoint_decision': {
        const { case_id, decision } = body;
        if (!case_id || !decision) {
          return new Response(JSON.stringify({ error: 'case_id and decision required' }), { status: 400, headers: corsHeaders });
        }

        const isApproved = decision === 'approve';

        await supabase.from('cases').update({
          status: isApproved ? 'resolved' : 'under_investigation',
          sibyl_decision: isApproved ? 'Human operator approved lethal action.' : 'Human operator denied lethal action. Conservative approach maintained.',
          updated_at: new Date().toISOString(),
          resolved_at: isApproved ? new Date().toISOString() : null,
        }).eq('id', case_id);

        await supabase.from('agent_logs').insert({
          agent_name: 'Sibyl Hive Mind',
          agent_role: 'orchestrator',
          action: 'checkpoint_processed',
          case_id,
          message: `Human-in-the-loop checkpoint: ${isApproved ? 'APPROVED' : 'DENIED'}. ${isApproved ? 'Lethal authorization granted.' : 'Enforcer instructed to use non-lethal measures.'}`,
          severity: isApproved ? 'critical' : 'warning',
        });

        return new Response(
          JSON.stringify({ success: true, approved: isApproved }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Sibyl Agent Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
