import { Moon, Sun, Bot } from 'lucide-react';

export default function Header({ darkMode, toggleDarkMode }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 select-none z-20 relative">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md">
          <Bot size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 leading-tight">
            MoE Router
          </h1>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold tracking-wider">
            INTELLIGENT AI ENGINE
          </p>
        </div>
      </div>
      <button
        onClick={toggleDarkMode}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Toggle Dark Mode"
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </header>
  );
}
