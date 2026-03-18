import React from 'react';
import { LineChart, BarChart3, Activity, DollarSign, Cpu } from 'lucide-react';

export default function AnalyticsView({ sessions }) {
  // Aggregate mock metrics
  let totalCost = 0;
  let totalOps = 0;
  let totalLatency = 0;
  let successfulOps = 0;
  const modelCounts = {};

  sessions.forEach(s => {
    s.messages.filter(m => m.role === 'ai').forEach(m => {
       totalOps++;
       totalCost += (m.cost || 0);
       if (m.latencyMs > 0) {
          totalLatency += m.latencyMs;
          successfulOps++;
       }
       const mod = m.modelUsed || 'UNKNOWN';
       modelCounts[mod] = (modelCounts[mod] || 0) + 1;
    });
  });

  const avgLatency = successfulOps > 0 ? (totalLatency / successfulOps).toFixed(0) : 0;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col h-full bg-[#0d1326]/50 rounded-2xl border border-white/5 overflow-hidden z-10">
      <div className="px-6 py-5 border-b border-white/5 bg-white/5 shrink-0 flex items-center space-x-3">
         <LineChart size={24} className="text-indigo-400" />
         <div>
            <h2 className="text-xl font-bold text-gray-100 tracking-wide">Usage Analytics</h2>
            <p className="text-sm text-gray-400 mt-1">Cost aggregation & network telemetry</p>
         </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-gray-900/40 border border-white/5 flex flex-col justify-center">
               <div className="flex items-center space-x-2 text-gray-400 mb-4">
                  <DollarSign size={16} />
                  <span className="text-sm tracking-widest uppercase font-semibold">Total Cost</span>
               </div>
               <span className="text-4xl font-bold text-white">${totalCost.toFixed(5)}</span>
            </div>
            <div className="p-6 rounded-2xl bg-gray-900/40 border border-white/5 flex flex-col justify-center">
               <div className="flex items-center space-x-2 text-gray-400 mb-4">
                  <Activity size={16} />
                  <span className="text-sm tracking-widest uppercase font-semibold">Avg Latency</span>
               </div>
               <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-bold text-cyan-400">{avgLatency}</span>
                  <span className="text-gray-500">ms</span>
               </div>
            </div>
            <div className="p-6 rounded-2xl bg-gray-900/40 border border-white/5 flex flex-col justify-center">
               <div className="flex items-center space-x-2 text-gray-400 mb-4">
                  <Cpu size={16} />
                  <span className="text-sm tracking-widest uppercase font-semibold">Total Inferences</span>
               </div>
               <span className="text-4xl font-bold text-purple-400">{totalOps}</span>
            </div>
         </div>

         <div className="p-6 rounded-2xl bg-gray-900/40 border border-white/5">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-white tracking-wide">Usage by Model</h3>
               <BarChart3 size={20} className="text-gray-500" />
            </div>
            <div className="space-y-4">
               {Object.entries(modelCounts).map(([model, count]) => {
                  const percent = totalOps > 0 ? (count / totalOps) * 100 : 0;
                  return (
                     <div key={model} className="flex flex-col space-y-2">
                        <div className="flex justify-between text-sm">
                           <span className="text-gray-300 font-medium">{model}</span>
                           <span className="text-gray-500 font-mono">{count} reqs ({percent.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                           <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${percent}%` }}></div>
                        </div>
                     </div>
                  );
               })}
               {totalOps === 0 && (
                  <div className="text-center text-gray-600 py-4 italic">No analytic data available yet.</div>
               )}
            </div>
         </div>

      </div>
    </div>
  );
}
