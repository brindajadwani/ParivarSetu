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
      iconBg: "bg-rose-100 text-rose-600",
      statusBg: "bg-emerald-100 text-emerald-700"
    },
    {
      id: 2,
      scheme: "MYSY Scholarship (Education)",
      appliedDate: "Applied on 28 Aug 2025",
      status: "In Progress",
      icon: GraduationCap,
      iconBg: "bg-sky-100 text-sky-600",
      statusBg: "bg-sky-100 text-sky-700"
    },
    {
      id: 3,
      scheme: "Gujarat Startup & Innovation Assistance",
      appliedDate: "Applied on 02 Sep 2025",
      status: "In Progress",
      icon: Briefcase,
      iconBg: "bg-purple-100 text-purple-600",
      statusBg: "bg-sky-100 text-sky-700"
    },
    {
      id: 4,
      scheme: "Mukhyamantri Awas Yojana (Housing)",
      appliedDate: "Applied on 15 Jul 2025",
      status: "Not Eligible",
      icon: Home,
      iconBg: "bg-amber-100 text-amber-600",
      statusBg: "bg-slate-100 text-slate-600"
    }
  ];

  const items = applications.length > 0 ? applications : defaultApps;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900">
          Application Status
        </h3>
        <a 
          href="#applications" 
          className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-0.5"
        >
          View All &rarr;
        </a>
      </div>

      <div className="space-y-3.5">
        {items.map((app) => {
          const Icon = app.icon || HeartPulse;
          return (
            <div 
              key={app.id} 
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer group border border-transparent hover:border-slate-100"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${app.iconBg || 'bg-slate-100 text-slate-600'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate group-hover:text-orange-600 transition">
                    {app.scheme}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {app.appliedDate}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 ml-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${app.statusBg || 'bg-slate-100 text-slate-700'}`}>
                  {app.status}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
