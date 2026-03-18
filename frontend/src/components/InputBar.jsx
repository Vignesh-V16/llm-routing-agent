import { Mic, Send, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

export default function InputBar({ onSendMessage, isLoading }) {
  const [text, setText] = useState('');
  const [interimText, setInterimText] = useState('');
  const textareaRef = useRef(null);

  const handleSpeechResult = (finalTranscript, interimTranscript) => {
    if (finalTranscript) {
      setText((prev) => (prev ? prev + ' ' : '') + finalTranscript);
      setInterimText('');
    } else {
      setInterimText(interimTranscript);
    }
  };

  const { isListening, isSupported, startListening, stopListening } = useSpeechRecognition(handleSpeechResult);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [text, interimText]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (text.trim() && !isLoading) {
      onSendMessage(text.trim());
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-6 pt-2">
      <form 
        onSubmit={handleSubmit}
        className={`relative flex items-end gap-2 bg-white dark:bg-gray-800 p-2 rounded-3xl shadow-lg border transition-all duration-200 ${
          isListening ? 'border-red-400 dark:border-red-500/50 ring-2 ring-red-100 dark:ring-red-900/30' : 'border-gray-200 dark:border-gray-700/80 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
      >
        {isListening && (
          <div className="absolute -top-10 left-6 text-xs font-semibold text-red-500 flex items-center animate-pulse bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow border border-red-100 dark:border-red-900/30">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-2 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
            Listening...
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={text + (isListening && interimText ? ` ${interimText}` : '')}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isSupported ? "Message MoE Router... (or use voice)" : "Message MoE Router..."}
          className="flex-1 max-h-[150px] min-h-[44px] bg-transparent resize-none outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 py-3 pl-4 pr-2 text-[15px] leading-relaxed"
          rows={1}
          disabled={isLoading || (isListening && !interimText)}
        />

        <div className="flex items-center pr-1 pb-1 gap-1">
          {isSupported && (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading}
              className={`p-3 rounded-full transition-all flex-shrink-0 ${
                isListening 
                  ? 'bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 shadow-inner' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <Mic size={20} className={isListening ? 'animate-pulse' : ''} />
            </button>
          )}

          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            className={`p-3 rounded-full transition-all flex-shrink-0 ${
              text.trim() && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md transform hover:scale-[1.02] active:scale-95'
                : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin text-blue-500 dark:text-blue-400" /> : <Send size={20} className="ml-0.5" />}
          </button>
        </div>
      </form>
    </div>
  );
}
