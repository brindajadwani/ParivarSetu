import React, { useState } from 'react';
import { Bell, ChevronDown, User, ShieldCheck } from 'lucide-react';

export default function Header({ user = { name: "Priya Sharma", role: "Citizen" }, unreadCount = 3 }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-orange-500 shadow-xs px-6 py-2.5 flex items-center justify-between">
      {/* Left: Gujarat Government Emblem & Brand */}
      <div className="flex items-center space-x-6">
        {/* Gujarat Emblem & Gov Text */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-none border border-amber-600/40 p-0.5 bg-amber-50/50 flex items-center justify-center shadow-xs">
            <svg viewBox="0 0 100 100" className="w-8 h-8 text-amber-900" fill="currentColor">
              <circle cx="50" cy="50" r="46" fill="none" stroke="#b45309" strokeWidth="3" />
              <path d="M50 15 L58 32 L75 35 L62 48 L66 65 L50 56 L34 65 L38 48 L25 35 L42 32 Z" fill="#b45309" opacity="0.8" />
              <circle cx="50" cy="74" r="8" fill="#1e3a8a" />
              <path d="M30 84 Q50 90 70 84" stroke="#b45309" strokeWidth="4" fill="none" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 tracking-wide">
              ગુજરાત સરકાર
            </div>
            <div className="text-[11px] font-semibold text-amber-800 tracking-wider">
              GOVERNMENT OF GUJARAT
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="hidden sm:block h-9 w-[1px] bg-slate-300" />

        {/* ParivarSetu Logo & Tagline */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-none bg-gradient-to-tr from-orange-600 via-amber-600 to-teal-500 p-0.5 shadow-xs flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-none flex items-center justify-center">
              {/* Family nodes icon */}
              <svg viewBox="0 0 40 40" className="w-7 h-7">
                <circle cx="20" cy="13" r="4.5" fill="#ea580c" />
                <circle cx="12" cy="22" r="3.5" fill="#0284c7" />
                <circle cx="28" cy="22" r="3.5" fill="#7c3aed" />
                <circle cx="20" cy="28" r="3.5" fill="#059669" />
                <path d="M12 22 L20 13 L28 22 M12 22 L20 28 L28 22" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <div>
            <div className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>પરિવાર સેતુ</span>
              <span className="text-xs font-bold text-orange-700 bg-orange-50 px-1.5 py-0.2 rounded-none border border-orange-300">
                ParivarSetu
              </span>
            </div>
            <div className="text-[10.5px] font-semibold text-slate-600">
              એક પરિવાર એક ઓળખ &bull; One Family &ndash; One ID
            </div>
          </div>
        </div>
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <button 
          aria-label="Notifications" 
          className="relative p-2 rounded-none text-slate-700 hover:text-orange-700 hover:bg-slate-100 transition cursor-pointer border border-transparent hover:border-slate-200"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-none flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Profile Card */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-3 px-3 py-1.5 rounded-none border border-slate-300 hover:border-orange-500 hover:bg-orange-50/30 transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-none bg-orange-700 text-white flex items-center justify-center font-bold text-xs">
              PS
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {user.name}
              </div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase">
                {user.role}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>

          {/* Profile Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-52 bg-white rounded-none shadow-lg border border-slate-300 py-1 z-50 text-xs text-slate-700">
              <div className="px-3 py-2 border-b border-slate-200 font-medium text-slate-600 bg-slate-50">
                Signed in as <span className="font-bold text-slate-900">priya.sharma</span>
              </div>
              <a href="#profile" className="flex items-center gap-2 px-3 py-2 hover:bg-orange-50 hover:text-orange-700">
                <User className="w-4 h-4" /> My Profile
              </a>
              <a href="#family" className="flex items-center gap-2 px-3 py-2 hover:bg-orange-50 hover:text-orange-700">
                <ShieldCheck className="w-4 h-4" /> Verification Status
              </a>
              <div className="border-t border-slate-200 mt-1 pt-1">
                <button className="w-full text-left px-3 py-2 text-red-700 font-semibold hover:bg-red-50">
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
