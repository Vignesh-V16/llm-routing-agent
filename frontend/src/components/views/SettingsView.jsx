import React, { useState } from 'react';
import { Settings, Shield, Moon, Trash2, Database, Key } from 'lucide-react';

export default function SettingsView({ onClearHistory }) {
  const [apiKey, setApiKey] = useState('****************');

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-full bg-[#0d1326]/50 rounded-2xl border border-white/5 overflow-hidden z-10">
      <div className="px-6 py-5 border-b border-white/5 bg-white/5 flex items-center space-x-3 shrink-0">
         <Settings size={24} className="text-gray-400" />
         <div>
            <h2 className="text-xl font-bold text-gray-100 tracking-wide">Global Settings</h2>
            <p className="text-sm text-gray-400 mt-1">Application variables and local preferences</p>
         </div>
      </div>
      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
         
         <section>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
               <Shield size={18} className="text-cyan-400" />
               <span>Security & Credentials</span>
            </h3>
            <div className="p-5 rounded-xl bg-gray-900/60 border border-white/5 space-y-4">
               <div>
                  <label className="block text-sm text-gray-400 mb-2 uppercase tracking-widest font-semibold">Router API Key</label>
                  <div className="flex items-center space-x-3">
                     <div className="flex-1 relative">
                        <Key size={16} className="absolute left-3 top-3 text-gray-500" />
                        <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-gray-200 focus:outline-none focus:border-cyan-500 transition-colors" />
                     </div>
                     <button className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors">
                        Update
                     </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Authenticates frontend queries with the deployed cloud backend layer.</p>
               </div>
            </div>
         </section>

         <section>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
               <Database size={18} className="text-purple-400" />
               <span>Local Data Management</span>
            </h3>
            <div className="p-5 rounded-xl bg-gray-900/60 border border-white/5 space-y-4 flex items-center justify-between">
               <div>
                  <h4 className="text-gray-200 font-medium">Purge Routing History</h4>
                  <p className="text-sm text-gray-500 mt-1">Permanently deletes all cached sessions and analytics from browser storage.</p>
               </div>
               <button onClick={onClearHistory} className="px-5 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg font-medium transition-colors flex items-center space-x-2 shrink-0">
                  <Trash2 size={18} />
                  <span>Clear All Data</span>
               </button>
            </div>
         </section>

         <section>
             <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
               <Moon size={18} className="text-yellow-400" />
               <span>Appearance</span>
            </h3>
            <div className="p-5 rounded-xl bg-gray-900/60 border border-white/5 space-y-4">
               <div className="flex items-center justify-between">
                  <div>
                     <h4 className="text-gray-200 font-medium">Dark Mode Locked</h4>
                     <p className="text-sm text-gray-500 mt-1">Dashboard is permanently configured for neon-dark styling.</p>
                  </div>
                  <div className="w-12 h-6 bg-cyan-500 rounded-full relative opacity-50 cursor-not-allowed">
                     <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
               </div>
            </div>
         </section>

      </div>
    </div>
  );
}
