import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, Copy, Navigation, User } from 'lucide-react';

export default function ResponsePanel({ aiMessage, userMessage }) {
  const hasResponse = aiMessage && aiMessage.text;

  const handleCopy = () => {
    if (hasResponse) {
      navigator.clipboard.writeText(aiMessage.text);
    }
  };

  return (
    <div className="h-full w-full glass-panel rounded-2xl border border-white/5 flex flex-col overflow-hidden relative min-h-0">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/5 shrink-0">
        <div className="flex items-center space-x-2">
          <Bot size={18} className="text-cyan-400" />
          <h3 className="text-gray-200 font-medium tracking-wide">Synthesized Response</h3>
        </div>
        <div className="flex space-x-2">
          {aiMessage?.modelUsed && (
            <span className="px-2 py-1 text-[10px] font-bold tracking-wider rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {aiMessage.modelUsed}
            </span>
          )}
          {hasResponse && (
            <button onClick={handleCopy} className="p-1 text-gray-400 hover:text-white transition-colors" title="Copy text">
              <Copy size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex-1 overflow-y-auto min-h-0 custom-scrollbar flex flex-col space-y-6">
        {userMessage && (
          <div className="flex flex-col space-y-2 pb-6 border-b border-white/10 shrink-0">
             <div className="flex items-center space-x-2 text-gray-400 mb-1">
               <User size={16} />
               <span className="text-xs uppercase tracking-widest font-semibold text-cyan-400/70">User Query</span>
             </div>
             <p className="text-gray-200 text-base leading-relaxed italic border-l-2 border-cyan-500/30 pl-3">"{userMessage.text}"</p>
          </div>
        )}

        {hasResponse ? (
          <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-gray-100 prose-a:text-cyan-400 max-w-none text-sm md:text-base leading-relaxed break-words pb-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {aiMessage.text}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
            <Navigation size={40} className="opacity-20" />
            <p className="text-sm font-medium tracking-wide">Awaiting routing transmission...</p>
          </div>
        )}
      </div>
    </div>
  );
}
