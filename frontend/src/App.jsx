import React, { useState } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import CitizenDashboard from './pages/CitizenDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      {/* 1. Header (Government of Gujarat & ParivarSetu branding) */}
      <Header 
        user={{ name: "Priya Sharma", role: "Citizen" }} 
        unreadCount={3} 
      />

      {/* 2. Main Body with Sidebar + Content */}
      <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
        {/* Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          notificationCount={3} 
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-5 md:p-7 overflow-y-auto max-w-full">
          {activeTab === 'dashboard' && <CitizenDashboard />}
          {activeTab !== 'dashboard' && (
            <div className="bg-white rounded-none p-8 border border-slate-200 border-t-3 border-t-orange-600 shadow-xs text-center">
              <h2 className="text-xl font-bold text-slate-800 capitalize">
                {activeTab.replace('-', ' ')}
              </h2>
              <p className="text-sm text-slate-600 mt-2 font-medium">
                This module is structured and ready for Phase 1 &ndash; 4 expansion.
              </p>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="mt-4 px-4 py-2 bg-orange-700 hover:bg-orange-800 text-white text-xs font-bold rounded-none shadow-xs transition uppercase tracking-wider"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
