import React from 'react';
import { 
  Home, 
  Users, 
  Briefcase, 
  FileText, 
  Bell, 
  MessageSquare, 
  User 
} from 'lucide-react';

export default function Sidebar({ activeTab = "dashboard", setActiveTab = () => {}, notificationCount = 3 }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "my-family", label: "My Family", icon: Users },
    { id: "schemes", label: "Schemes", icon: Briefcase },
    { id: "my-applications", label: "My Applications", icon: FileText },
    { id: "notifications", label: "Notifications", icon: Bell, badge: notificationCount },
    { id: "complaints", label: "Complaints", icon: MessageSquare },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <aside className="w-56 shrink-0 min-h-[calc(100vh-61px)] bg-white border-r border-slate-100 flex flex-col justify-between py-4 select-none">
      <nav className="space-y-1.5 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                isActive
                  ? 'bg-orange-50 text-orange-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-orange-600' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Gujarat Cultural Heritage Outline Motif at Bottom of Sidebar */}
      <div className="px-4 pt-6 pb-2 opacity-25">
        <svg viewBox="0 0 160 90" className="w-full h-auto text-amber-900" fill="currentColor">
          {/* Stylized Gujarat temple / Torana / Heritage architecture */}
          <path d="M20 90 L20 45 L35 25 L50 45 L50 90 Z" />
          <path d="M50 90 L50 35 L65 15 L80 35 L80 90 Z" />
          <path d="M80 90 L80 20 L95 5 L110 20 L110 90 Z" />
          <path d="M110 90 L110 40 L125 25 L140 40 L140 90 Z" />
          <circle cx="95" cy="4" r="2.5" />
          <line x1="10" y1="88" x2="150" y2="88" stroke="currentColor" strokeWidth="3" />
        </svg>
        <div className="text-[10px] text-center text-amber-900 font-medium mt-1">
          Government of Gujarat
        </div>
      </div>
    </aside>
  );
}
