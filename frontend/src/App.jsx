import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import Sidebar from './components/Sidebar';
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

  // Derived current messages
  const currentSession = sessions.find(s => s.id === currentSessionId) || { messages: [] };
  const messages = currentSession.messages;

  const [isLoading, setIsLoading] = useState(false);

  // Sync state to local storage and document root strictly
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('chat_sessions', JSON.stringify(sessions));
    if (currentSessionId) {
      localStorage.setItem('current_session_id', currentSessionId);
    } else {
      localStorage.removeItem('current_session_id');
    }
  }, [sessions, currentSessionId]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const startNewSession = () => {
    setCurrentSessionId(null); // Wait until first message to formally create it
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to delete all chat history?")) {
      setSessions([]);
      setCurrentSessionId(null);
    }
  };

  const updateCurrentSessionMessages = (newMessages, newTitle = null) => {
    setSessions(prevSessions => {
      // If we don't have an active session, create one
      if (!currentSessionId) {
        const newId = Date.now().toString();
        setCurrentSessionId(newId);
        return [{ id: newId, title: newTitle || 'New Conversation', messages: newMessages }, ...prevSessions];
      }

      // Prepend to array keeping order
      return prevSessions.map(s => {
        if (s.id === currentSessionId) {
          return { ...s, messages: newMessages, title: newTitle || s.title };
        }
        return s;
      });
    });
  };

  const handleSendMessage = async (text) => {
    const userMsgId = Date.now().toString();
    const userMessage = { id: userMsgId, role: 'user', text };
    
    // Set title dynamically based on first user interaction if empty
    const sessionTitle = messages.length === 0 ? text.slice(0, 30) + (text.length > 30 ? '...' : '') : null;
    const optimisticMessages = [...messages, userMessage];
    
    // Mark old AI messages as NOT new instantly to prevent re-typing effects
    const sealedMessages = optimisticMessages.map(m => m.role === 'ai' ? { ...m, isNew: false } : m);
    updateCurrentSessionMessages(sealedMessages, sessionTitle);
    
    setIsLoading(true);

    try {
      const response = await sendChatQuery(text);
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: response.responseText,
        modelUsed: response.modelUsed,
        latencyMs: response.latencyMs,
        fallbackUsed: response.fallbackUsed,
        isNew: true, // triggers typing effect natively
      };
      
      updateCurrentSessionMessages([...sealedMessages, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: `⚠️ **Network Validation Error:**\n\n${error.message}\n\nPlease verify your API credentials and ensure the Cloud Endpoint is awake.`,
        modelUsed: 'SYSTEM_FAULT',
        latencyMs: 0,
        fallbackUsed: false,
        isNew: true,
      };
      updateCurrentSessionMessages([...sealedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans transition-colors duration-200">
      
      {/* Left Sidebar Partition */}
      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewSession={startNewSession}
        onClearHistory={handleClearHistory}
      />

      {/* Main Chat Partition */}
      <div className="flex flex-col flex-1 h-full min-w-0">
        <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        
        <ChatWindow messages={messages} isLoading={isLoading} />
        
        <div className="bg-gradient-to-t from-gray-50 via-gray-50 to-transparent dark:from-gray-900 dark:via-gray-900 pt-2 pb-2 z-10 relative">
          <InputBar onSendMessage={handleSendMessage} isLoading={isLoading} />
          <div className="text-center pb-2 px-4">
            <p className="text-[11px] text-gray-400 dark:text-gray-500 tracking-wide font-medium select-none">
              MoE Router can make dynamically routed mistakes. Architecture is powered by Spring Boot.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
