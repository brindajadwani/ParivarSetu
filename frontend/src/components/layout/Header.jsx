import React, { useState } from 'react';
import { 
  Bell, 
  ChevronDown, 
  User, 
  ShieldCheck, 
  Building2, 
  Home, 
  LogOut, 
  Mail, 
  CheckCircle2,
  FileBadge,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';

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
  onExitToLanding = () => {},
  onLogout = () => {},
  notifications = [],
  unreadCount = 0,
  onMarkAllNotificationsRead = () => {},
  onSelectNotification = () => {}
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const handleLogoutClick = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setDropdownOpen(false);
    setNotifDropdownOpen(false);
    if (typeof onLogout === 'function') {
      onLogout();
    }
    if (typeof onExitToLanding === 'function') {
      onExitToLanding();
    }
  };

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

      {/* Right: Actions & User Details */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              setNotifDropdownOpen(!notifDropdownOpen);
              setDropdownOpen(false);
            }}
            aria-label="Notifications" 
            className="relative p-2 rounded-none text-slate-700 hover:text-orange-700 hover:bg-slate-100 transition cursor-pointer border border-transparent hover:border-slate-200"
            title="View Notifications & Department Alerts"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-none flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Interactive Notifications Popover */}
          {notifDropdownOpen && (
            <div className="absolute right-0 mt-1 w-80 sm:w-96 bg-white rounded-none shadow-2xl border-2 border-orange-600 py-0 z-50 text-xs text-slate-700">
              <div className="px-4 py-2.5 border-b border-slate-200 font-bold text-slate-800 uppercase text-[10px] bg-slate-100 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-orange-900 font-black">
                  <Bell className="w-3.5 h-3.5 text-orange-600" />
                  {currentProfile.role === "Citizen" ? "Citizen Notifications" : "Department Priority Alerts"}
                </span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAllNotificationsRead();
                    }}
                    className="text-orange-700 hover:text-orange-900 font-bold text-[10px] uppercase cursor-pointer underline"
                  >
                    Mark All Read
                  </button>
                )}
              </div>

              {/* Notification Items List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-8 px-4 text-center text-slate-500 space-y-1.5">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                    <div className="font-bold text-slate-800 text-xs">No Pending Alerts</div>
                    <div className="text-[11px] text-slate-500">
                      {currentProfile.role === "Citizen"
                        ? "All family welfare scheme applications are up to date."
                        : "No urgent grievances or delayed applications pending in your department queue."}
                    </div>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setNotifDropdownOpen(false);
                        onSelectNotification(item);
                      }}
                      className={`p-3 transition cursor-pointer hover:bg-orange-50/50 flex items-start space-x-2.5 ${
                        !item.read ? 'bg-amber-50/40 border-l-3 border-l-orange-500' : 'bg-white'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {item.type === 'urgent' ? (
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                        ) : item.type === 'warning' ? (
                          <ShieldAlert className="w-4 h-4 text-amber-600" />
                        ) : (
                          <Bell className="w-4 h-4 text-sky-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 text-xs leading-snug">
                          {item.message}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                          <span>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent alert'}</span>
                          {item.targetTab && (
                            <span className="text-orange-700 font-bold flex items-center gap-0.5">
                              Open Queue &rarr;
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Popover Footer */}
              <div className="p-2 border-t border-slate-200 bg-slate-50 text-center">
                <button
                  type="button"
                  onClick={() => setNotifDropdownOpen(false)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Card Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2.5 px-3 py-1.5 rounded-none border border-slate-300 hover:border-orange-500 hover:bg-orange-50/30 transition cursor-pointer bg-white"
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

          {/* Logged In User Profile Details Modal/Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-80 bg-white rounded-none shadow-2xl border-2 border-orange-600 py-0 z-50 text-xs text-slate-700">
              <div className="px-4 py-2.5 border-b border-slate-200 font-bold text-slate-800 uppercase text-[10px] bg-slate-100 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-orange-900 font-black">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Authenticated Profile
                </span>
                <span className="text-emerald-700 font-bold text-[9px] bg-emerald-50 px-1.5 py-0.5 border border-emerald-300">
                  Active Session
                </span>
              </div>

              {/* Logged in User Card */}
              <div className="p-4 space-y-3.5">
                <div className="flex items-center space-x-3">
                  <div className={`w-11 h-11 rounded-none text-white flex items-center justify-center font-black text-base shadow-xs ${
                    currentProfile.role === "Officer" ? 'bg-indigo-700' :
                    currentProfile.role === "Verifier" ? 'bg-teal-700' : 'bg-orange-700'
                  }`}>
                    {currentProfile.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-black text-slate-900 truncate">
                      {currentProfile.name}
                    </div>
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-800 bg-orange-100/70 px-2 py-0.5 mt-0.5">
                      {currentProfile.role}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Official Email:
                    </span>
                    <span className="font-mono font-semibold text-slate-800 text-[10.5px]">
                      {currentProfile.email}
                    </span>
                  </div>

                  {currentProfile.family_id && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <FileBadge className="w-3 h-3" /> Family ID:
                      </span>
                      <span className="font-mono font-black text-orange-800">
                        {currentProfile.family_id}
                      </span>
                    </div>
                  )}

                  {currentProfile.department_name && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> Department:
                      </span>
                      <span className="font-bold text-slate-800 text-right">
                        {currentProfile.department_name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Log Out Button */}
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold text-xs rounded-none cursor-pointer flex items-center justify-center gap-1.5 transition shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-700" />
                  Sign Out / Log Out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Header Direct Log Out Button */}
        <button
          onClick={handleLogoutClick}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-none cursor-pointer transition shadow-xs"
          title="Sign Out of ParivarSetu"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Log Out</span>
        </button>
      </div>
    </header>
  );
}
