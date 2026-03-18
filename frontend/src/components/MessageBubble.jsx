import { Bot, User, Zap, AlertTriangle, Copy, Check, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useTypingEffect from '../hooks/useTypingEffect';

export default function MessageBubble({ message }) {
  const isAi = message.role === 'ai';
  const [copied, setCopied] = useState(false);
  const [isPlayingText, setIsPlayingText] = useState(false);

  // Invoke simulated typing only for newly appended AI responses
  const { displayedText, isTyping } = useTypingEffect(message.text, message.isNew ? 10 : 0);
  const finalRenderText = message.isNew && isAi ? displayedText : message.text;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeech = () => {
    if (isPlayingText) {
      window.speechSynthesis.cancel();
      setIsPlayingText(false);
    } else {
      window.speechSynthesis.cancel(); // kill existing
      const utterance = new SpeechSynthesisUtterance(message.text);
      utterance.onend = () => setIsPlayingText(false);
      utterance.onerror = () => setIsPlayingText(false);
      setIsPlayingText(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Distinct Badges based on Expert Model
  const getBadgeStyle = (model) => {
    if (!model) return 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
    const m = model.toUpperCase();
    if (m === 'CHATGPT' || m === 'OPENAI') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 ring-1 ring-emerald-500/30';
    if (m === 'CLAUDE') return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 ring-1 ring-orange-500/30';
    if (m === 'GEMINI') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 ring-1 ring-blue-500/30';
    if (m === 'HUGGINGFACE') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 ring-1 ring-yellow-500/30';
    return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 ring-1 ring-purple-500/30';
  };

  return (
    <div className={`flex w-full ${isAi ? 'justify-start' : 'justify-end'} mb-8 group`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] ${isAi ? 'flex-row' : 'flex-row-reverse'} items-end gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
          isAi ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-blue-600 text-white'
        }`}>
          {isAi ? <Bot size={18} /> : <User size={18} />}
        </div>

        {/* Message Content Container */}
        <div className="flex flex-col gap-1.5 w-full overflow-hidden">
          
          {/* Metadata Row (AI Only) */}
          {isAi && (
            <div className="flex flex-wrap items-center gap-2 px-1 mb-0.5">
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow-sm ${getBadgeStyle(message.modelUsed)}`}>
                {message.modelUsed || 'UNKNOWN'}
              </span>
              {message.latencyMs > 0 && (
                <span className="flex items-center text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded shadow-sm border border-gray-200 dark:border-gray-700">
                  <Zap size={10} className="mr-0.5" /> {(message.latencyMs / 1000).toFixed(2)}s
                </span>
              )}
              {message.fallbackUsed && (
                <span className="flex items-center text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-400 px-1.5 py-0.5 rounded shadow-sm ring-1 ring-amber-500/30">
                  <AlertTriangle size={10} className="mr-1" /> FALLBACK
                </span>
              )}
            </div>
          )}

          {/* Bubble wrapper encapsulating markdown */}
          <div className="relative group/bubble">
            <div className={`px-5 py-4 rounded-2xl shadow-sm text-[15px] leading-relaxed break-words transition-colors ${
              isAi 
                ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700/50 rounded-bl-none overflow-x-auto prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-xl prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-code:bg-indigo-50 dark:prose-code:bg-indigo-900/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md'
                : 'bg-blue-600 text-white rounded-br-none whitespace-pre-wrap'
            }`}>
              {isAi ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {finalRenderText}
                </ReactMarkdown>
              ) : (
                finalRenderText
              )}
              
              {/* Fake typing cursor injection */}
              {isTyping && isAi && (
                <span className="inline-block w-1.5 h-4 ml-1 bg-gray-400 dark:bg-gray-500 animate-pulse align-middle"></span>
              )}
            </div>
          </div>
          
          {/* Quick Actions (AI Only, displayed implicitly below block) */}
          {isAi && !isTyping && (
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-1">
              <button 
                onClick={handleCopy}
                className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition"
                title="Copy response"
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
              <button 
                onClick={toggleSpeech}
                className={`p-1.5 rounded transition ${isPlayingText ? 'text-blue-500 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:text-gray-200 dark:hover:bg-gray-700'}`}
                title={isPlayingText ? "Stop speaking" : "Read aloud"}
              >
                {isPlayingText ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
