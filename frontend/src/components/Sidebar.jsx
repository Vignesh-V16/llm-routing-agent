import React from 'react';
import { LayoutDashboard, ArrowLeftRight, Box, LineChart, FileText, Settings, Sparkles } from 'lucide-react';

export default function Sidebar({ activeView = 'Dashboard', onViewChange }) {
  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { icon: <ArrowLeftRight size={20} />, label: 'Routes' },
    { icon: <Box size={20} />, label: 'Models' },
    { icon: <LineChart size={20} />, label: 'Analytics' },
    { icon: <FileText size={20} />, label: 'Logs' },
  ];

  return (
    <div className="w-64 h-full bg-[#0a0f1c] border-r border-white/5 flex flex-col pt-8 pb-6 px-4 shrink-0 transition-transform duration-300 z-20">
      
      {/* Brand Logo Area */}
      <div className="flex items-center space-x-3 px-2 mb-10">
        <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-[0_0_15px_rgba(99,102,241,0.4)]">
          <Sparkles size={20} className="text-white" />
        </div>
        <h1 className="text-white font-bold text-lg tracking-wide">Routing Agent</h1>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 flex flex-col space-y-2">
        {navItems.map((item) => {
          const isActive = item.label === activeView;
          return (
            <button
              key={item.label}
              onClick={() => onViewChange && onViewChange(item.label)}
              className={`flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300 w-full text-left font-medium tracking-wide ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-900/40 to-purple-900/40 neon-border-purple text-white' 
                  : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
              }`}
            >
              <span className={isActive ? 'text-cyan-400' : ''}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Settings Footer */}
      <div className="mt-auto pt-6 border-t border-white/5">
        <button 
          onClick={() => onViewChange && onViewChange('Settings')}
          className={`flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300 w-full text-left font-medium tracking-wide ${
            activeView === 'Settings'
              ? 'bg-gradient-to-r from-blue-900/40 to-purple-900/40 neon-border-purple text-white' 
              : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
          }`}
        >
          <span className={activeView === 'Settings' ? 'text-cyan-400' : ''}><Settings size={20} /></span>
          <span>Settings</span>
        </button>
      </div>

    </div>
  );
}
