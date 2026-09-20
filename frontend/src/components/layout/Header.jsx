import React, { useState } from 'react';
import { Bell, ChevronDown, User, ShieldCheck, Plus, Building2, UserCheck } from 'lucide-react';

export const PRESET_PROFILES = [
  {
    id: "citizen",
    name: "Priya Sharma",
    role: "Citizen",
    email: "priya.sharma@parivar.gujarat.gov.in",
    family_id: "GJ12345678"
  },
  {
    id: "officer-health",
    name: "Dr. K. Mehta",
    role: "Officer",
    email: "health.officer@gujarat.gov.in",
    dept_id: 6,
    department_name: "Health & Family Welfare"
  },
  {
    id: "officer-education",
    name: "Shri R. Trivedi",
    role: "Officer",
    email: "education.officer@gujarat.gov.in",
    dept_id: 7,
    department_name: "Education Department"
  },
  {
    id: "officer-msme",
    name: "Smt. N. Patel",
    role: "Officer",
    email: "msme.officer@gujarat.gov.in",
    dept_id: 8,
    department_name: "Industries & MSME"
  },
  {
    id: "verifier",
    name: "Shri V.K. Joshi",
    role: "Verifier",
    email: "talati.gandhinagar@gujarat.gov.in"
  }
];

export default function Header({ 
  currentProfile = PRESET_PROFILES[0], 
  onProfileChange = () => {}, 
  onOpenRegisterModal = () => {},
  unreadCount = 3 
}) {
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
        <div className="hidden md:block h-9 w-[1px] bg-slate-300" />

        {/* ParivarSetu Logo & Tagline */}
        <div className="hidden sm:flex items-center space-x-3">
          <div className="w-10 h-10 rounded-none bg-gradient-to-tr from-orange-600 via-amber-600 to-teal-500 p-0.5 shadow-xs flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-none flex items-center justify-center">
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

      {/* Right: Actions & Role Switcher */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Quick Family Register Button (for citizen demonstration) */}
        <button
          onClick={onOpenRegisterModal}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-none cursor-pointer transition"
        >
          <Plus className="w-3.5 h-3.5 text-amber-800" />
          Enroll New Family
        </button>

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

        {/* Role Switcher & Profile Card */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2.5 px-3 py-1.5 rounded-none border border-slate-300 hover:border-orange-500 hover:bg-orange-50/30 transition cursor-pointer"
          >
            <div className={`w-7 h-7 rounded-none text-white flex items-center justify-center font-bold text-xs ${
              currentProfile.role === "Officer" ? 'bg-indigo-700' :
              currentProfile.role === "Verifier" ? 'bg-teal-700' : 'bg-orange-700'
            }`}>
              {currentProfile.name.charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {currentProfile.name}
              </div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase flex items-center gap-1">
                <span>{currentProfile.role}</span>
                {currentProfile.department_name && (
                  <span className="text-orange-700">&bull; {currentProfile.department_name.split(' ')[0]}</span>
                )}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>

          {/* Interactive Actor Switcher Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-64 bg-white rounded-none shadow-xl border border-slate-300 py-1 z-50 text-xs text-slate-700">
              <div className="px-3 py-2 border-b border-slate-200 font-bold text-slate-500 uppercase text-[10px] bg-slate-50">
                Switch Role / Portal Persona (Demo)
              </div>
              
              {PRESET_PROFILES.map((p) => {
                const isSelected = currentProfile.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      onProfileChange(p);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 transition flex items-center justify-between cursor-pointer ${
                      isSelected ? 'bg-orange-50 font-bold text-orange-900 border-l-4 border-l-orange-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{p.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {p.role} {p.department_name && `(${p.department_name})`}
                      </div>
                    </div>
                    {isSelected && <span className="text-[10px] font-bold text-orange-700">Active</span>}
                  </button>
                );
              })}

              <div className="border-t border-slate-200 mt-1 p-2">
                <button 
                  onClick={() => {
                    onOpenRegisterModal();
                    setDropdownOpen(false);
                  }}
                  className="w-full text-center py-1 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 cursor-pointer"
                >
                  + Enroll New Family
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
