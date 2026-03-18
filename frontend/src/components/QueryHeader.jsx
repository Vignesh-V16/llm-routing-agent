import React, { useState } from 'react';
import { Mic, Send, Bot, Sparkles } from 'lucide-react';

export default function QueryHeader({ onSendMessage, isLoading }) {
  const [inputText, setInputText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText);
      setInputText("");
    }
  };

  return (
    <div className="w-full flex justify-center py-6 px-4 z-10">
      <div className="w-full max-w-4xl glass-panel neon-border-cyan rounded-2xl p-2 relative overflow-hidden transition-all duration-300">
        <form onSubmit={handleSubmit} className="relative flex items-center bg-gray-900/50 rounded-xl px-4 py-2">
          <div className="text-cyan-400 mr-3">
            <Bot size={20} />
          </div>
          <input
            type="text"
            className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 focus:outline-none text-lg py-2"
            placeholder="Ask the routing agent anything..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
          />
          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
              disabled={isLoading}
            >
              <Mic size={20} />
            </button>
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className={`p-2 rounded-lg transition-all ${
                inputText.trim() && !isLoading
                  ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                  : 'text-gray-600'
              }`}
            >
              <Send size={20} className={isLoading ? 'animate-pulse' : ''} />
            </button>
          </div>
        </form>
        {isLoading && (
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse" />
        )}
      </div>
    </div>
  );
}
