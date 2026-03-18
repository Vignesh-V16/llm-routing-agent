import React from 'react';
import { motion } from 'framer-motion';
import { Activity, DollarSign, Target } from 'lucide-react';

export default function MetricsPanel({ latencyMs = 0, cost = 0, accuracy = 0 }) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-7xl mx-auto px-6 pb-6">
      
      {/* Latency Card */}
      <motion.div 
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
        className="glass-panel rounded-xl p-5 border border-white/5 relative overflow-hidden group hover:border-blue-500/50 transition-colors"
      >
        <div className="flex justify-between items-center mb-4 text-gray-400">
          <span className="text-sm font-medium uppercase tracking-wider">Latency</span>
          <Activity size={18} className="text-blue-400" />
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-4xl font-light text-white">{latencyMs}</span>
          <span className="text-gray-400 text-sm">ms</span>
        </div>
        {/* Decorative Graph */}
        <div className="absolute bottom-0 left-0 w-full h-12 opacity-30 group-hover:opacity-100 transition-opacity">
           <svg preserveAspectRatio="none" viewBox="0 0 100 10" className="w-full h-full text-blue-500 stroke-current" fill="none" strokeWidth="2">
             <path d="M0 10 Q 10 5, 20 8 T 40 4 T 60 7 T 80 2 T 100 8" />
           </svg>
        </div>
      </motion.div>

      {/* Cost Card */}
      <motion.div 
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
        className="glass-panel rounded-xl p-5 border border-white/5 relative overflow-hidden group hover:border-purple-500/50 transition-colors"
      >
         <div className="flex justify-between items-center mb-4 text-gray-400">
          <span className="text-sm font-medium uppercase tracking-wider">Estimated Cost</span>
          <DollarSign size={18} className="text-purple-400" />
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-4xl font-light text-white">${cost.toFixed(4)}</span>
          <span className="text-gray-400 text-sm">/ req</span>
        </div>
        {/* Decorative Graph */}
        <div className="absolute bottom-0 left-0 w-full h-12 opacity-30 group-hover:opacity-100 transition-opacity">
           <svg preserveAspectRatio="none" viewBox="0 0 100 10" className="w-full h-full text-purple-500 stroke-current" fill="none" strokeWidth="2">
             <path d="M0 10 L 20 8 L 40 9 L 60 3 L 80 5 L 100 2" />
           </svg>
        </div>
      </motion.div>

      {/* Accuracy Card */}
      <motion.div 
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
        className="glass-panel rounded-xl p-5 border border-white/5 relative overflow-hidden group hover:border-cyan-500/50 transition-colors"
      >
         <div className="flex justify-between items-center mb-4 text-gray-400">
          <span className="text-sm font-medium uppercase tracking-wider">Confidence</span>
          <Target size={18} className="text-cyan-400" />
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-4xl font-light text-white">{accuracy}%</span>
        </div>
        {/* Decorative Bar Chart */}
        <div className="absolute bottom-4 right-4 flex items-end space-x-1 opacity-50">
          <div className="w-2 h-4 bg-cyan-500/40 rounded-t-sm"></div>
          <div className="w-2 h-6 bg-cyan-500/60 rounded-t-sm"></div>
          <div className="w-2 h-8 bg-cyan-500/80 rounded-t-sm"></div>
          <div className="w-2 h-10 bg-cyan-500 rounded-t-sm neon-border-cyan"></div>
        </div>
      </motion.div>

    </div>
  );
}
