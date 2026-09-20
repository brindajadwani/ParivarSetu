import React from 'react';
import { CheckCircle2, Info, Bell, AlertCircle } from 'lucide-react';

export default function NotificationsCard({ notifications = [] }) {
  const defaultNotifs = [
    {
      id: 1,
      message: "Your MA Amrutam health application has been approved.",
      timestamp: "12 Aug 2025 \u2022 10:30 AM",
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 text-emerald-700 border border-emerald-200"
    },
    {
      id: 2,
      message: "New scheme available: Gujarat Startup & Innovation Assistance.",
      timestamp: "05 Aug 2025 \u2022 02:15 PM",
      icon: Info,
      iconBg: "bg-sky-50 text-sky-700 border border-sky-200"
    },
    {
      id: 3,
      message: "Your application for MYSY Scholarship is under review.",
      timestamp: "28 Aug 2025 \u2022 11:20 AM",
      icon: Bell,
      iconBg: "bg-amber-50 text-amber-700 border border-amber-200"
    },
    {
      id: 4,
      message: "Complaint #CP0001234 has been resolved.",
      timestamp: "20 Aug 2025 \u2022 09:45 AM",
      icon: AlertCircle,
      iconBg: "bg-rose-50 text-rose-700 border border-rose-200"
    }
  ];

  const items = notifications.length > 0 ? notifications : defaultNotifs;

  return (
    <div className="bg-white rounded-none p-5 border border-slate-200 border-t-3 border-t-sky-600 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">
          Recent Notifications
        </h3>
        <a 
          href="#notifications" 
          className="text-xs font-semibold text-orange-700 hover:text-orange-900 flex items-center gap-0.5"
        >
          View All &rarr;
        </a>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => {
          const Icon = item.icon || Info;
          return (
            <div 
              key={item.id} 
              className="flex items-start space-x-3 p-2.5 rounded-none bg-slate-50/70 hover:bg-slate-100/90 transition cursor-pointer border border-slate-200"
            >
              <div className={`w-7 h-7 rounded-none flex items-center justify-center shrink-0 mt-0.5 ${item.iconBg || 'bg-slate-100 text-slate-600'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-800 leading-snug">
                  {item.message}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 font-medium">
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
