import { useState, useEffect } from 'react';
import { Bot, Navigation } from 'lucide-react';
import Sidebar from './components/Sidebar';
import QueryHeader from './components/QueryHeader';
import MoeVisualizer from './components/MoeVisualizer';
import ResponsePanel from './components/ResponsePanel';
import MetricsPanel from './components/MetricsPanel';
import { sendChatQuery } from './services/api';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Persistent Storage Mechanics
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('chat_sessions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentSessionId, setCurrentSessionId] = useState(() => {
    return localStorage.getItem('current_session_id') || null;
  });

  const [activeView, setActiveView] = useState('Dashboard');

  // Derived current state
  const currentSession = sessions.find(s => s.id === currentSessionId) || { messages: [] };
  const messages = currentSession.messages;

  // Find the latest AI message to populate the Dashboard metrics actively
  const latestAiMessage = [...messages].reverse().find(m => m.role === 'ai');

  const [isRouting, setIsRouting] = useState(false);

  // Globally dark mode for the Dashboard
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.add('bg-gray-950');
  }, []);

  useEffect(() => {
    localStorage.setItem('chat_sessions', JSON.stringify(sessions));
    if (currentSessionId) {
      localStorage.setItem('current_session_id', currentSessionId);
    } else {
      localStorage.removeItem('current_session_id');
    }
  }, [sessions, currentSessionId]);

  const startNewSession = () => {
    setCurrentSessionId(null);
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to delete all routing history?")) {
      setSessions([]);
      setCurrentSessionId(null);
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    
    let activeSessionId = currentSessionId;
    if (!activeSessionId) {
      activeSessionId = Date.now().toString();
      setCurrentSessionId(activeSessionId);
    }
    
    const userMsgId = Date.now().toString();
    const userMessage = { id: userMsgId, role: 'user', text };
    
    const sessionTitle = messages.length === 0 ? text.slice(0, 30) + (text.length > 30 ? '...' : '') : null;
    const optimisticMessages = [...messages, userMessage];
    
    const updateSession = (newMessages, newTitle = null) => {
      setSessions(prevSessions => {
        const exists = prevSessions.some(s => s.id === activeSessionId);
        if (exists) {
          return prevSessions.map(s => s.id === activeSessionId ? { ...s, messages: newMessages, title: newTitle || s.title } : s);
        } else {
          return [{ id: activeSessionId, title: newTitle || 'New Query Route', messages: newMessages }, ...prevSessions];
        }
      });
    };
    
    updateSession(optimisticMessages, sessionTitle);
    
    setIsRouting(true);

    try {
      const response = await sendChatQuery(text);
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: response.responseText,
        modelUsed: response.modelUsed,
        latencyMs: response.latencyMs,
        fallbackUsed: response.fallbackUsed,
        cost: response.cost,
        confidenceScore: response.confidenceScore,
      };
      
      updateSession([...optimisticMessages, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: `⚠️ **Network Validation Error:**\n\n${error.message}\n\nPlease verify your API credentials and ensure the Cloud Endpoint is awake.`,
        modelUsed: 'SYSTEM_FAULT',
        latencyMs: 0,
        fallbackUsed: false,
        cost: 0,
        confidenceScore: 0,
      };
      updateSession([...optimisticMessages, errorMessage]);
    } finally {
      setIsRouting(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-dashboard font-sans text-gray-100 overflow-hidden">
      
      {/* Left Sidebar Partition */}
      <Sidebar 
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Main Dashboard Partition */}
      <main className="flex-1 flex flex-col items-center relative overflow-y-auto w-full scroll-smooth">
        
        {/* Top Input Bar ALWAYS visible */}
        <QueryHeader onSendMessage={handleSendMessage} isLoading={isRouting} />
        
        {activeView === 'Dashboard' ? (
          <>
            {/* Core Layout Grid */}
            <div className="w-full max-w-7xl grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 px-6 min-h-[500px] mb-6 z-10">
              
              {/* Node Visualizer (Takes up 2/3 of the screen width) */}
              <div className="xl:col-span-2 relative drop-shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                <MoeVisualizer activeModel={latestAiMessage?.modelUsed} isRouting={isRouting} />
              </div>

              {/* Response markdown (Takes up 1/3 of the screen width) */}
              <div className="xl:col-span-1 relative drop-shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                <ResponsePanel aiMessage={latestAiMessage} />
              </div>

            </div>

            {/* Global System Metrics Panel */}
            <div className="w-full z-10">
              <MetricsPanel 
                latencyMs={latestAiMessage?.latencyMs || 0} 
                cost={latestAiMessage?.cost || 0}
                accuracy={latestAiMessage?.confidenceScore ? Math.round(latestAiMessage.confidenceScore * 100) : 0} 
              />
            </div>
          </>
        ) : (
          <div className="w-full max-w-7xl flex-1 flex flex-col items-center justify-center text-center px-6 z-10">
            <div className="p-8 rounded-full bg-gray-900/50 mb-6 border border-white/5 shadow-2xl">
              <Bot size={64} className="text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-200 tracking-wide mb-3">{activeView} Module</h2>
            <p className="text-gray-500 max-w-md leading-relaxed">
              This advanced capability requires connecting standard OAuth and persistent postgres schemas before instantiation. We intend to release this functionality in version 2.0.
            </p>
          </div>
        )}

      </main>
    </div>
  );
}
