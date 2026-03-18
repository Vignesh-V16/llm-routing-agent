import React, { useState, useEffect } from 'react';
import { Mic, Send, Bot, MicOff } from 'lucide-react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

export default function QueryHeader({ onSendMessage, isLoading }) {
  const [inputText, setInputText] = useState("");

  const handleSpeechResult = (finalTranscript, interimTranscript) => {
    // We update the input text with whatever the user is saying
    setInputText(finalTranscript || interimTranscript);
  };

  const { isListening, isSupported, startListening, stopListening } = useSpeechRecognition(handleSpeechResult);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      if (isListening) stopListening();
      onSendMessage(inputText);
      setInputText("");
    }
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="w-full flex justify-center py-6 px-4 z-10">
      <div className={`w-full max-w-4xl glass-panel rounded-2xl p-2 relative overflow-hidden transition-all duration-300 ${isListening ? 'neon-border-purple border-purple-500' : 'neon-border-cyan'}`}>
        <form onSubmit={handleSubmit} className="relative flex items-center bg-gray-900/50 rounded-xl px-4 py-2">
          <div className={`${isListening ? 'text-purple-400' : 'text-cyan-400'} mr-3 transition-colors`}>
            <Bot size={20} />
          </div>
          <input
            type="text"
            className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 focus:outline-none text-lg py-2"
            placeholder={isListening ? "Listening... Speak now" : "Ask the routing agent anything..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
          />
          <div className="flex items-center space-x-2">
            {isSupported && (
              <button
                type="button"
                onClick={toggleMic}
                className={`p-2 transition-colors rounded-lg ${isListening ? 'text-purple-400 bg-purple-500/20' : 'text-gray-400 hover:text-cyan-400'}`}
                disabled={isLoading}
                title="Voice Chat"
              >
                {isListening ? <MicOff size={20} className="animate-pulse" /> : <Mic size={20} />}
              </button>
            )}
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
