import React from 'react';
import { Terminal, Cpu, User, AlertCircle, ArrowRight } from 'lucide-react';

export default function LogsView({ sessions }) {
  // Flatten events
  const logs = [];
  sessions.forEach(session => {
    session.messages.forEach(msg => {
      logs.push({
         id: msg.id + Math.random(), // guarantee uniqueness
         type: msg.role.toUpperCase(),
         text: msg.text,
         model: msg.modelUsed,
         latency: msg.latencyMs,
         time: new Date(parseInt(msg.id)).toLocaleTimeString(), // fallback approx
         rawDate: parseInt(msg.id),
         sessionId: session.id
      });
    });
  });
  
  logs.sort((a,b) => b.rawDate - a.rawDate); // newest first

  if (logs.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
        <Terminal size={48} className="mb-4 opacity-50" />
        <h3 className="text-xl font-semibold mb-2 text-gray-300">System Logs Empty</h3>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col h-full bg-[#0a0f1c] rounded-2xl border border-white/5 overflow-hidden font-mono text-sm leading-relaxed tracking-wider shadow-2xl z-10">
      <div className="px-6 py-4 border-b border-white/5 bg-[#0d1326] flex items-center justify-between shrink-0 font-sans">
        <div className="flex items-center space-x-3 text-gray-300">
          <Terminal size={18} className="text-purple-400" />
          <h2 className="font-semibold tracking-wide">System Firehose Logs</h2>
        </div>
        <div className="flex space-x-2">
            <span className="flex items-center space-x-2 px-2 py-1 bg-green-500/10 text-green-400 rounded-md text-[10px] uppercase font-bold">
               <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
               <span>Live Sync</span>
            </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[rgba(5,10,20,0.8)]">
         {logs.map((log) => (
            <div key={log.id} className="flex flex-col md:flex-row md:items-start space-y-2 md:space-y-0 text-gray-400 border-b border-white/5 pb-4 break-words">
                <div className="flex items-center space-x-4 w-48 shrink-0">
                   <span className="text-gray-500 text-xs shrink-0">[{log.time}]</span>
                   {log.type === 'USER' ? (
                      <span className="text-cyan-400 flex items-center shrink-0"><User size={14} className="mr-1"/> USER_REQ</span>
                   ) : log.model === 'SYSTEM_FAULT' ? (
                      <span className="text-red-400 flex items-center shrink-0"><AlertCircle size={14} className="mr-1"/> SYS_ERR</span>
                   ) : (
                      <span className="text-purple-400 flex items-center shrink-0"><Cpu size={14} className="mr-1"/> {log.model || 'SYNTHESIS'}</span>
                   )}
                </div>
                <div className="flex-1 flex items-start space-x-3 min-w-0">
                   <ArrowRight size={14} className="text-gray-600 mt-1 shrink-0" />
                   <span className={`break-words ${log.type === 'USER' ? 'text-gray-300' : log.model === 'SYSTEM_FAULT' ? 'text-red-300' : 'text-gray-400'}`}>
                      {log.text.length > 250 ? log.text.substring(0, 250) + '...' : log.text}
                   </span>
                </div>
                {log.type === 'AI' && log.latency > 0 && (
                   <div className="shrink-0 text-gray-500 text-xs ml-4 font-mono w-20 text-right">
                      {log.latency}ms
                   </div>
                )}
            </div>
         ))}
      </div>
    </div>
  );
}
