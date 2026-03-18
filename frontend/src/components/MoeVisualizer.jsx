import React from 'react';
import { motion } from 'framer-motion';
import { User, Server, Cpu, Layers } from 'lucide-react';

const ModelNode = ({ name, isActive, colorClass }) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0.5 }}
    animate={{ 
      scale: isActive ? 1.05 : 0.9, 
      opacity: isActive ? 1 : 0.5,
      y: isActive ? [0, -5, 0] : 0
    }}
    transition={{ y: { repeat: Infinity, duration: 2, ease: "easeInOut" } }}
    className={`px-5 py-3 rounded-xl border flex items-center space-x-3 bg-gray-900/80 backdrop-blur-md relative z-10 ${isActive ? colorClass : 'border-gray-700'}`}
  >
    <Cpu size={18} className={isActive ? 'text-white' : 'text-gray-500'} />
    <span className={`font-semibold tracking-wide ${isActive ? 'text-white neon-text-glow' : 'text-gray-400'}`}>
      {name}
    </span>
  </motion.div>
);

export default function MoeVisualizer({ activeModel, isRouting }) {
  // Derive which model node is strictly active
  const isGPT = activeModel === 'OPENAI' || activeModel === 'CHATGPT';
  const isClaude = activeModel === 'CLAUDE';
  const isGroq = activeModel === 'GROQ';
  const isGemini = activeModel === 'GEMINI';

  return (
    <div className="h-full w-full glass-panel rounded-2xl border border-white/5 p-6 flex flex-col relative overflow-hidden">
      
      {/* Background Starfield / Particle Effect placeholder */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-gray-900/0 to-transparent pointer-events-none"></div>

      <div className="flex justify-between items-center text-xs text-gray-500 font-semibold tracking-widest uppercase mb-12">
        <span>User Query {'>'} Router</span>
        <span>Multiple AI Models</span>
        <span>Synthesis</span>
      </div>

      <div className="flex-1 flex items-center justify-between relative px-4 md:px-12">
        
        {/* Animated Connection Lines Canvas */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
           {isRouting && (
              <svg className="w-full h-full" preserveAspectRatio="none">
                 <line x1="10%" y1="50%" x2="40%" y2="50%" stroke="cyan" strokeWidth="2" strokeDasharray="5,5" className="animate-[dash_1s_linear_infinite]" />
                 
                 {/* Logic paths */}
                 <path d="M 40% 50% Q 50% 50%, 60% 25%" fill="none" stroke={isGPT || isGroq ? "cyan" : "#374151"} strokeWidth={isGPT || isGroq ? "2" : "1"} />
                 <path d="M 40% 50% L 60% 50%" fill="none" stroke={isClaude ? "purple" : "#374151"} strokeWidth={isClaude ? "2" : "1"} />
                 <path d="M 40% 50% Q 50% 50%, 60% 75%" fill="none" stroke={isGemini ? "blue" : "#374151"} strokeWidth={isGemini ? "2" : "1"} />
                 
                 {/* Outbound paths */}
                 <path d="M 80% 25% Q 85% 50%, 90% 50%" fill="none" stroke={isGPT || isGroq ? "cyan" : "#374151"} strokeWidth={isGPT || isGroq ? "2" : "1"} />
                 <path d="M 80% 50% L 90% 50%" fill="none" stroke={isClaude ? "purple" : "#374151"} strokeWidth={isClaude ? "2" : "1"} />
                 <path d="M 80% 75% Q 85% 50%, 90% 50%" fill="none" stroke={isGemini ? "blue" : "#374151"} strokeWidth={isGemini ? "2" : "1"} />
              </svg>
           )}
           <style>{`
             @keyframes dash {
               to { stroke-dashoffset: -20; }
             }
           `}</style>
        </div>

        {/* 1. User Origin */}
        <div className="relative z-10 flex flex-col items-center">
          <div className={`p-4 rounded-full bg-gray-800 border-2 ${isRouting ? 'border-cyan-500 neon-border-cyan' : 'border-gray-700'} transition-all duration-500`}>
            <User className={isRouting ? 'text-cyan-400' : 'text-gray-500'} size={24} />
          </div>
        </div>

        {/* 2. Routing Engine Crossroad */}
        <div className="relative z-10 flex flex-col items-center">
          <div className={`p-4 rounded-full bg-gray-800 border-2 ${isRouting ? 'border-cyan-400 neon-border-cyan' : 'border-gray-700'} transition-all duration-500 animate-[spin_4s_linear_infinite]`}>
            <Layers className={isRouting ? 'text-cyan-400' : 'text-gray-500'} size={24} />
          </div>
        </div>

        {/* 3. The Models Layer */}
        <div className="relative z-10 flex flex-col space-y-6">
          <ModelNode name="Groq / GPT-4o" isActive={isGPT || isGroq} colorClass="neon-border-cyan" />
          <ModelNode name="Claude 3.5 Sonnet" isActive={isClaude} colorClass="neon-border-purple" />
          <ModelNode name="Gemini 1.5 Pro" isActive={isGemini} colorClass="neon-border-blue" />
        </div>

        {/* 4. Synthesized Target */}
        <div className="relative z-10 flex flex-col items-center">
          <div className={`p-5 rounded-full bg-gray-800 border-2 ${activeModel ? 'border-purple-500 neon-border-purple' : 'border-gray-700'} transition-all duration-500`}>
            <Server className={activeModel ? 'text-purple-400' : 'text-gray-500'} size={24} />
          </div>
        </div>

      </div>
    </div>
  );
}
