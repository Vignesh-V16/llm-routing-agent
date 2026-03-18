import React from 'react';
import { Box, Cpu, Server, Zap, CheckCircle2, Sliders } from 'lucide-react';

export default function ModelsView() {
  const models = [
    { id: 'groq', name: 'Groq / Llama 3 70B', provider: 'Groq Inc.', latency: 'fast', cost: '$0.00/1K', desc: 'Ultra low latency inference LPU for high speed reasoning.', icon: <Zap size={18} className="text-yellow-400" />, active: true },
    { id: 'claude', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', latency: 'medium', cost: '$3.00/1K', desc: 'Prioritized for coding queries, analytical context, and multi-step reasoning.', icon: <Cpu size={18} className="text-purple-400" />, active: true },
    { id: 'gemini', name: 'Gemini 1.5 Pro', provider: 'Google', latency: 'slow', cost: '$1.50/1K', desc: 'Giant context window up to 2M tokens for deep document understanding.', icon: <Server size={18} className="text-blue-400" />, active: true },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col h-full bg-[#0d1326]/50 rounded-2xl border border-white/5 overflow-hidden z-10">
      <div className="px-6 py-5 border-b border-white/5 bg-white/5 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-100 tracking-wide">Connected AI Models</h2>
          <p className="text-sm text-gray-400 mt-1">Configured mixture-of-experts routing targets</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {models.map(model => (
          <div key={model.id} className="relative p-6 rounded-2xl border border-white/10 bg-gray-900/60 flex flex-col md:flex-row justify-between md:items-center">
            <div className="flex items-start space-x-4 mb-4 md:mb-0">
               <div className="p-3 rounded-xl bg-gray-800 shrink-0 border border-gray-700">
                  {model.icon}
               </div>
               <div>
                  <h3 className="text-xl font-bold text-gray-100 tracking-wide flex items-center space-x-2">
                     <span>{model.name}</span>
                     <CheckCircle2 size={16} className="text-green-500" />
                  </h3>
                  <p className="text-gray-400 mt-1 max-w-md text-sm leading-relaxed">{model.desc}</p>
                  <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500 font-medium tracking-widest uppercase">
                     <span>{model.provider}</span>
                     <span>•</span>
                     <span className={`${model.latency === 'fast' ? 'text-green-400' : 'text-yellow-400'}`}>Latency: {model.latency}</span>
                     <span>•</span>
                     <span>Cost: {model.cost}</span>
                  </div>
               </div>
            </div>
            <div className="flex flex-col space-y-3 shrink-0">
               <button className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2 border border-gray-700">
                  <Sliders size={16} />
                  <span>Configure Parameters</span>
               </button>
               <button className="px-4 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors text-sm font-medium border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                  Route Active
               </button>
            </div>
          </div>
        ))}
        
        <div className="mt-8 p-6 rounded-2xl border border-dashed border-white/20 bg-transparent flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 transition-colors">
           <Box size={32} className="text-gray-500 mb-3" />
           <h4 className="text-gray-300 font-semibold mb-1">Add New Model</h4>
           <p className="text-gray-500 text-sm max-w-sm">Connect Anthropic, Local LLMs, or custom HuggingFace endpoints.</p>
        </div>
      </div>
    </div>
  );
}
