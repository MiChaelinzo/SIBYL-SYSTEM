import React from 'react';
import { Brain, Search, Swords, Activity } from 'lucide-react';
import { useAgentLogs } from '@/hooks/useSibylData';

interface AgentStatus {
  name: string;
  role: string;
  status: string;
  currentTask: string;
  load: string;
  icon: React.ReactNode;
  color: string;
}

export const AgentStatusPanel: React.FC = () => {
  const { logs, loading } = useAgentLogs(20);

  const agents: AgentStatus[] = [
    {
      name: 'Sibyl Hive Mind',
      role: 'orchestrator',
      status: 'active',
      currentTask: 'Monitoring 247 brain nodes',
      load: 'normal',
      icon: <Brain className="w-5 h-5" />,
      color: 'text-cyan-400',
    },
    {
      name: 'Inspector Agent',
      role: 'inspector',
      status: 'active',
      currentTask: logs.find(l => l.agent_name === 'Inspector Agent')?.message?.substring(0, 50) || 'Idle',
      load: logs.filter(l => l.agent_name === 'Inspector Agent' && l.severity !== 'info').length > 2 ? 'high' : 'normal',
      icon: <Search className="w-5 h-5" />,
      color: 'text-blue-400',
    },
    {
      name: 'Enforcer Agent',
      role: 'enforcer',
      status: 'active',
      currentTask: logs.find(l => l.agent_name === 'Enforcer Agent')?.message?.substring(0, 50) || 'Patrol',
      load: logs.filter(l => l.agent_name === 'Enforcer Agent' && l.severity === 'critical').length > 0 ? 'critical' : 'normal',
      icon: <Swords className="w-5 h-5" />,
      color: 'text-red-400',
    },
  ];

  return (
    <div className="space-y-4">
      {agents.map((agent) => (
        <div
          key={agent.name}
          className="rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={`${agent.color}`}>{agent.icon}</div>
              <div>
                <h4 className="text-white font-semibold text-sm">{agent.name}</h4>
                <span className="text-xs text-gray-500 uppercase">{agent.role}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Activity className={`w-4 h-4 ${agent.load === 'critical' ? 'text-red-500 animate-pulse' : agent.load === 'high' ? 'text-yellow-500' : 'text-emerald-500'}`} />
              <span className={`text-xs ${agent.load === 'critical' ? 'text-red-400' : agent.load === 'high' ? 'text-yellow-400' : 'text-emerald-400'}`}>
                {agent.load}
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-400 truncate">
            {agent.currentTask}
          </div>
        </div>
      ))}

      {/* Recent Agent Activity */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 mt-4">
        <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          Recent Agent Activity
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {loading ? (
            <div className="text-gray-500 text-xs">Loading...</div>
          ) : (
            logs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className={`text-xs p-2 rounded border-l-2 ${
                  log.severity === 'critical'
                    ? 'border-red-500 bg-red-900/10'
                    : log.severity === 'warning'
                    ? 'border-yellow-500 bg-yellow-900/10'
                    : 'border-blue-500 bg-blue-900/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-300">{log.agent_name}</span>
                  <span className="text-gray-600">|</span>
                  <span className="text-gray-500">{log.action}</span>
                </div>
                <div className="text-gray-400 truncate">{log.message}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
