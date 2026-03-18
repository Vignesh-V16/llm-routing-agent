import { MessageSquare, Plus, Trash2 } from 'lucide-react';

export default function Sidebar({ sessions, currentSessionId, onSelectSession, onNewSession, onClearHistory }) {
  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full text-gray-200 flex-shrink-0 select-none hidden md:flex">
      
      {/* New Chat Button */}
      <div className="p-4">
        <button 
          onClick={onNewSession}
          className="flex items-center gap-3 w-full border border-gray-700 hover:bg-gray-800 rounded-lg py-3 px-4 transition-all duration-200 Active:scale-95 text-sm font-medium"
        >
          <Plus size={18} />
          <span>New Chat</span>
        </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 scroll-smooth">
        <h3 className="text-xs font-semibold text-gray-500 mb-3 px-2 uppercase tracking-wider">Previous 7 Days</h3>
        <div className="flex flex-col gap-1">
          {sessions.length === 0 ? (
            <p className="text-xs text-gray-600 px-2 italic">No earlier history.</p>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all duration-150 truncate ${
                  currentSessionId === session.id 
                    ? 'bg-gray-800 text-white font-medium shadow-inner' 
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                }`}
              >
                <MessageSquare size={16} className="flex-shrink-0" />
                <span className="truncate text-left w-full">
                  {session.title || 'New Conversation'}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={onClearHistory}
          className="flex items-center gap-3 w-full text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg py-2.5 px-3 transition-colors text-sm"
        >
          <Trash2 size={16} />
          <span>Clear conversations</span>
        </button>
      </div>

    </div>
  );
}
