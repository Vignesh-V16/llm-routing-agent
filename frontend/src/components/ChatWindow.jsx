import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { Bot } from 'lucide-react';

export default function ChatWindow({ messages, isLoading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 scroll-smooth bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto flex flex-col justify-end min-h-full">
        
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center opacity-70 dark:opacity-50 my-auto pb-20">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 flex items-center justify-center text-blue-600 dark:text-indigo-400 mb-6 shadow-sm border border-white dark:border-gray-800">
              <Bot size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2 tracking-tight">MoE Router Engine</h2>
            <p className="text-[15px] text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
              Intelligently routing your queries across OpenAI, Claude, Gemini, and HuggingFace execution models.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}

        {isLoading && (
          <div className="flex w-full justify-start mb-6">
            <div className="flex items-end gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 flex items-center justify-center shadow-sm">
                <Bot size={18} />
              </div>
              <div className="px-5 py-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-bl-sm flex items-center gap-1.5 h-[46px]">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-4"></div>
      </div>
    </div>
  );
}
