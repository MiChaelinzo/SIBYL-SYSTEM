import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileWarning, Search, Swords, Brain, CheckCircle } from 'lucide-react';
import { useCases, useAgentLogs } from '@/hooks/useSibylData';

const CaseDetailsPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { cases, loading } = useCases();
  const { logs } = useAgentLogs(100);

  const caseItem = cases.find((c) => c.id === caseId);
  const caseLogs = logs.filter((l) => l.case_id === caseId);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-gray-500">
        Accessing case files...
      </div>
    );
  }

  if (!caseItem) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-gray-500">
        Case not found.
      </div>
    );
  }

  const assessment = caseItem.threat_assessment || {};
  const timeline = caseItem.investigation_timeline || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <FileWarning className="w-6 h-6 text-orange-400" />
            <h1 className="text-lg font-bold text-white">Case Details</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Case Header */}
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-cyan-400 font-mono text-sm">{caseItem.case_number}</span>
            <span
              className={`text-xs px-3 py-1 rounded-full border ${
                caseItem.status === 'resolved'
                  ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30'
                  : caseItem.status === 'pending_authorization'
                  ? 'bg-red-900/30 text-red-400 border-red-500/30'
                  : 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30'
              }`}
            >
              {caseItem.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">{caseItem.title}</h2>
          <p className="text-gray-400 text-sm mb-4">{caseItem.description}</p>

          {/* Threat Assessment */}
          {assessment && (
            <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-4 mb-4">
              <h3 className="text-sm font-medium text-white mb-3">Threat Assessment</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Crime Coefficient</p>
                  <p className={`text-xl font-bold ${assessment.crime_coefficient >= 300 ? 'text-red-400' : assessment.crime_coefficient >= 100 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                    {assessment.crime_coefficient || 'N/A'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Hue</p>
                  <p className="text-xl font-bold text-gray-300">{(assessment.hue || 'Unknown').toUpperCase()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Risk Level</p>
                  <p className={`text-xl font-bold ${assessment.risk === 'extreme' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {(assessment.risk || 'Unknown').toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Assigned Agents */}
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2 rounded-lg bg-blue-900/20 border border-blue-500/20 px-3 py-2">
              <Search className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-xs text-gray-500">Inspector</p>
                <p className="text-sm text-blue-400">{caseItem.assigned_inspector || 'Unassigned'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-red-900/20 border border-red-500/20 px-3 py-2">
              <Swords className="w-4 h-4 text-red-400" />
              <div>
                <p className="text-xs text-gray-500">Enforcer</p>
                <p className="text-sm text-red-400">{caseItem.assigned_enforcer || 'Unassigned'}</p>
              </div>
            </div>
          </div>

          {/* Sibyl Decision */}
          {caseItem.sibyl_decision && (
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-900/10 p-4 flex items-start gap-3">
              <Brain className="w-5 h-5 text-cyan-400 mt-0.5" />
              <div>
                <p className="text-sm text-cyan-400 font-medium mb-1">Sibyl Hive Mind Decision</p>
                <p className="text-sm text-gray-300">{caseItem.sibyl_decision}</p>
              </div>
            </div>
          )}
        </div>

        {/* Investigation Timeline */}
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-cyan-400" />
            Investigation Timeline
          </h3>

          {timeline.length === 0 ? (
            <div className="space-y-3">
              {caseLogs.length === 0 ? (
                <p className="text-gray-500 text-sm">No timeline records available.</p>
              ) : (
                caseLogs.map((log) => (
                  <div key={log.id} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2" />
                    <div className="flex-1 pb-4 border-l border-slate-700 pl-4">
                      <p className="text-xs text-gray-500 mb-1">{new Date(log.created_at).toLocaleString()}</p>
                      <p className="text-sm text-white font-medium">{log.agent_name}</p>
                      <p className="text-sm text-gray-400">{log.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {timeline.map((event: any, index: number) => (
                <div key={index} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2" />
                  <div className="flex-1 pb-4 border-l border-slate-700 pl-4">
                    <p className="text-xs text-gray-500 mb-1">{event.timestamp}</p>
                    <p className="text-sm text-white font-medium">{event.agent}</p>
                    <p className="text-sm text-gray-400">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Evidence */}
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileWarning className="w-5 h-5 text-orange-400" />
            Evidence Records
          </h3>

          {(!caseItem.evidence || caseItem.evidence.length === 0) ? (
            <p className="text-gray-500 text-sm">No evidence has been collected yet.</p>
          ) : (
            <div className="space-y-2">
              {caseItem.evidence.map((item: any, index: number) => (
                <div key={index} className="rounded-lg border border-slate-700 bg-slate-800/30 p-3">
                  <p className="text-sm text-white font-medium">{item.type}</p>
                  <p className="text-xs text-gray-400">{item.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseDetailsPage;
