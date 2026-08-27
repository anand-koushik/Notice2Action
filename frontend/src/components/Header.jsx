import React from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white text-indigo-700 p-2 rounded-xl shadow-inner flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notice2Action</h1>
            <p className="text-xs text-indigo-100 font-medium">Turn complex notices into simple checklist actions</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="bg-indigo-600 bg-opacity-40 text-xs px-3 py-1 rounded-full border border-indigo-500 text-indigo-100">
            Powered by Groq AI
          </span>
        </div>
      </div>
    </header>
  );
}
