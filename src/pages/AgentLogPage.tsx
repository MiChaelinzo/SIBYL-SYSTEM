import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Search, Swords, Activity, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useAgentLogs, useCases } from '@/hooks/useSibylData';
import { resolveConflict, checkpointDecision } from '@/hooks/useSibylData';

const AgentLogPage: React.FC = () => {
  const navigate = useNavigate();
  const { logs, loading } = useAgentLogs(100);
  const { cases } = useCases();

  const pendingCases = cases.filter((c) => c.status === 'pending_authorization');

  const handleResolve = async (caseId: string) => {
    await resolveConflict(caseId);
  };

  const handleCheckpoint = async (caseId: string, decision: 'approve' | 'deny') => {
    await checkpointDecision(caseId, decision);
  };

  const getAgentIcon = (role: string) => {
    switch (role) {
      case 'orchestrator': return <Brain className="w-4 h-4 text-cyan-400" />;
      case 'inspector': return <Search className="w-4 h-4 text-blue-400" />;
      case 'enforcer': return <Swords className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Activity className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-cyan-400" />
            <h1 className="text-lg font-bold text-white">Agent Communications</h1>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Pending Checkpoints */}
        {pendingCases.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Human-in-the-Loop Checkpoints
            </h2>
            <div className="space-y-3">
              {pendingCases.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-red-500/30 bg-red-900/10 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-red-400 font-mono text-sm">{c.case_number}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/30 text-red-400 border border-red-500/30">
                      PENDING AUTHORIZATION
                    </span>
                  </div>
                  <h3 className="text-white font-medium text-sm mb-1">{c.title}</h3>
                  <p className="text-gray-400 text-xs mb-3">{c.description?.substring(0, 150)}...</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-gray-500">Inspector: {c.assigned_inspector}</span>
                    <span className="text-gray-600">|</span>
                    <span className="text-xs text-gray-500">Enforcer: {c.assigned_enforcer}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolve(c.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-gray-300 text-xs hover:text-white transition-all flex items-center gap-1"
                    >
                      <Activity className="w-3 h-3" />
                      Request Sibyl Arbitration
                    </button>
                    <button
                      onClick={() => handleCheckpoint(c.id, 'approve')}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs hover:bg-red-500/20 transition-all flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Approve Lethal Action
                    </button>
                    <button
                      onClick={() => handleCheckpoint(c.id, 'deny')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs hover:bg-emerald-500/20 transition-all flex items-center gap-1"
                    >
                      <XCircle className="w-3 h-3" />
                      Deny — Non-Lethal Only
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agent Logs */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Communication Log
          </h2>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading agent communications...</div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`rounded-xl border p-4 ${
                    log.severity === 'critical'
                      ? 'border-red-500/20 bg-red-900/10'
                      : log.severity === 'warning'
                      ? 'border-yellow-500/20 bg-yellow-900/10'
                      : 'border-slate-700/50 bg-slate-900/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getAgentIcon(log.agent_role)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium text-sm">{log.agent_name}</span>
                        <span className="text-xs text-gray-500">{log.action}</span>
                        {log.severity !== 'info' && (
                          <span className="ml-auto">{getSeverityIcon(log.severity)}</span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm">{log.message}</p>
                      {log.target_citizen_id && (
                        <p className="text-xs text-gray-500 mt-1">Target: {log.target_citizen_id}</p>
                      )}
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-center py-12 text-gray-500">No agent communications found.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentLogPage;
