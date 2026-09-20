import React from 'react';
import { CheckCircle2, Info, Bell, AlertCircle } from 'lucide-react';

export default function NotificationsCard({ notifications = [] }) {
  const defaultNotifs = [
    {
      id: 1,
      message: "Your MA Amrutam health application has been approved.",
      timestamp: "12 Aug 2025 \u2022 10:30 AM",
      icon: CheckCircle2,
      iconBg: "bg-emerald-100 text-emerald-600"
    },
    {
      id: 2,
      message: "New scheme available: Gujarat Startup & Innovation Assistance.",
      timestamp: "05 Aug 2025 \u2022 02:15 PM",
      icon: Info,
      iconBg: "bg-sky-100 text-sky-600"
    },
    {
      id: 3,
      message: "Your application for MYSY Scholarship is under review.",
      timestamp: "28 Aug 2025 \u2022 11:20 AM",
      icon: Bell,
      iconBg: "bg-amber-100 text-amber-600"
    },
    {
      id: 4,
      message: "Complaint #CP0001234 has been resolved.",
      timestamp: "20 Aug 2025 \u2022 09:45 AM",
      icon: AlertCircle,
      iconBg: "bg-rose-100 text-rose-600"
    }
  ];

  const items = notifications.length > 0 ? notifications : defaultNotifs;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900">
          Recent Notifications
        </h3>
        <a 
          href="#notifications" 
          className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-0.5"
        >
          View All &rarr;
        </a>
      </div>

      <div className="space-y-3.5">
        {items.map((item) => {
          const Icon = item.icon || Info;
          return (
            <div 
              key={item.id} 
              className="flex items-start space-x-3.5 p-2 rounded-xl hover:bg-slate-50 transition cursor-pointer"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${item.iconBg || 'bg-slate-100 text-slate-600'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-slate-800 leading-snug">
                  {item.message}
                </div>
                <div className="text-[10.5px] text-slate-400 mt-1 font-normal">
                  {item.timestamp}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
