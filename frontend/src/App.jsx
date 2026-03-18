import { useState, useEffect } from 'react';
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

  const updateCurrentSessionMessages = (newMessages, newTitle = null) => {
    setSessions(prevSessions => {
      if (!currentSessionId) {
        const newId = Date.now().toString();
        setCurrentSessionId(newId);
        return [{ id: newId, title: newTitle || 'New Query Route', messages: newMessages }, ...prevSessions];
      }
      return prevSessions.map(s => {
        if (s.id === currentSessionId) {
          return { ...s, messages: newMessages, title: newTitle || s.title };
        }
        return s;
      });
    });
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    
    const userMsgId = Date.now().toString();
    const userMessage = { id: userMsgId, role: 'user', text };
    
    const sessionTitle = messages.length === 0 ? text.slice(0, 30) + (text.length > 30 ? '...' : '') : null;
    const optimisticMessages = [...messages, userMessage];
    
    updateCurrentSessionMessages(optimisticMessages, sessionTitle);
    
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
      
      updateCurrentSessionMessages([...optimisticMessages, aiMessage]);
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
      updateCurrentSessionMessages([...optimisticMessages, errorMessage]);
    } finally {
      setIsRouting(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-dashboard font-sans text-gray-100 overflow-hidden">
      
      {/* Left Sidebar Partition */}
      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewSession={startNewSession}
        onClearHistory={handleClearHistory}
      />

      {/* Main Dashboard Partition */}
      <main className="flex-1 flex flex-col items-center relative overflow-y-auto w-full scroll-smooth">
        
        {/* Top Input Bar */}
        <QueryHeader onSendMessage={handleSendMessage} isLoading={isRouting} />
        
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

      </main>
    </div>
  );
}
