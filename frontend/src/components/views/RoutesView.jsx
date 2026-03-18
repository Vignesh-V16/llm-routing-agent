import React from 'react';
import { MessageSquare, Trash2, ChevronRight, Clock } from 'lucide-react';

export default function RoutesView({ sessions, onSelectSession, onDeleteSession, setView }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
        <MessageSquare size={48} className="mb-4 opacity-50" />
        <h3 className="text-xl font-semibold mb-2 text-gray-300">No Routing History</h3>
        <p className="max-w-md text-center">Your interaction graph is empty. Return to the dashboard to initiate a new routing sequence.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col h-full bg-[#0d1326]/50 rounded-2xl border border-white/5 overflow-hidden z-10">
      <div className="px-6 py-5 border-b border-white/5 bg-white/5 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-100 tracking-wide">Route History</h2>
          <p className="text-sm text-gray-400 mt-1">Previous semantic queries and MoE traversals</p>
        </div>
        <div className="text-cyan-400 font-semibold px-3 py-1 bg-cyan-500/10 rounded-lg text-sm border border-cyan-500/20">
          {sessions.length} Routes
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {sessions.map((session) => {
          const firstMessage = session.messages.find(m => m.role === 'user');
          const aiMessage = [...session.messages].reverse().find(m => m.role === 'ai');
          
          return (
            <div key={session.id} className="group relative flex items-center justify-between p-4 rounded-xl border border-white/5 bg-gray-900/40 hover:bg-gray-800/60 hover:border-cyan-500/30 transition-all cursor-pointer" onClick={() => { onSelectSession(session.id); setView('Dashboard'); }}>
              <div className="flex items-start space-x-4 overflow-hidden">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                  <Clock size={20} />
                </div>
                <div className="flex flex-col truncate">
                  <h3 className="text-gray-200 font-medium truncate w-full">{session.title || firstMessage?.text || "Empty Route"}</h3>
                  <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                       <span className={`w-2 h-2 rounded-full ${aiMessage ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                       <span>{aiMessage ? 'Completed' : 'Pending'}</span>
                    </span>
                    {aiMessage?.modelUsed && <span>• {aiMessage.modelUsed}</span>}
                    {aiMessage?.cost !== undefined && <span>• ${aiMessage.cost.toFixed(4)}</span>}
                    <span>• {session.messages.length} ops</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete Route">
                   <Trash2 size={18} />
                 </button>
                 <div className="p-2 text-cyan-400">
                   <ChevronRight size={20} />
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
