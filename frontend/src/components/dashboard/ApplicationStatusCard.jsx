import React from 'react';
import { HeartPulse, GraduationCap, Briefcase, Home, ChevronRight } from 'lucide-react';

export default function ApplicationStatusCard({ applications = [] }) {
  const defaultApps = [
    {
      id: 1,
      scheme: "MA Amrutam / PMJAY (Health)",
      appliedDate: "Applied on 12 Aug 2025",
      status: "Approved",
      icon: HeartPulse,
      iconBg: "bg-rose-50 text-rose-700 border border-rose-200",
      statusBg: "bg-emerald-100 text-emerald-800 border border-emerald-300"
    },
    {
      id: 2,
      scheme: "MYSY Scholarship (Education)",
      appliedDate: "Applied on 28 Aug 2025",
      status: "In Progress",
      icon: GraduationCap,
      iconBg: "bg-sky-50 text-sky-700 border border-sky-200",
      statusBg: "bg-sky-100 text-sky-800 border border-sky-300"
    },
    {
      id: 3,
      scheme: "Gujarat Startup & Innovation Assistance",
      appliedDate: "Applied on 02 Sep 2025",
      status: "In Progress",
      icon: Briefcase,
      iconBg: "bg-purple-50 text-purple-700 border border-purple-200",
      statusBg: "bg-sky-100 text-sky-800 border border-sky-300"
    },
    {
      id: 4,
      scheme: "Mukhyamantri Awas Yojana (Housing)",
      appliedDate: "Applied on 15 Jul 2025",
      status: "Not Eligible",
      icon: Home,
      iconBg: "bg-amber-50 text-amber-700 border border-amber-200",
      statusBg: "bg-slate-100 text-slate-700 border border-slate-300"
    }
  ];

  const items = applications.length > 0 ? applications : defaultApps;

  return (
    <div className="bg-white rounded-none p-5 border border-slate-200 border-t-3 border-t-amber-600 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">
          Application Status
        </h3>
        <a 
          href="#applications" 
          className="text-xs font-semibold text-orange-700 hover:text-orange-900 flex items-center gap-0.5"
        >
          View All &rarr;
        </a>
      </div>

      <div className="space-y-2.5">
        {items.map((app) => {
          const Icon = app.icon || HeartPulse;
          return (
            <div 
              key={app.id} 
              className="flex items-center justify-between p-3 rounded-none bg-slate-50/70 hover:bg-slate-100/90 transition cursor-pointer group border border-slate-200"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className={`w-9 h-9 rounded-none flex items-center justify-center shrink-0 ${app.iconBg || 'bg-slate-100 text-slate-600'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate group-hover:text-orange-700 transition">
                    {app.scheme}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5 font-medium">
                    {app.appliedDate}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 ml-3">
                <span className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider ${app.statusBg || 'bg-slate-100 text-slate-700'}`}>
                  {app.status}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
