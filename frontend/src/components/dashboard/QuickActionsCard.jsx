import React from 'react';
import { HeartPulse, GraduationCap, Briefcase, Home, ChevronRight } from 'lucide-react';

export default function QuickActionsCard() {
  const categories = [
    {
      id: "health",
      name: "Health",
      count: "2 schemes",
      icon: HeartPulse,
      bg: "bg-rose-50/70 border-rose-200 hover:border-rose-400",
      iconBg: "bg-rose-700 text-white"
    },
    {
      id: "education",
      name: "Education",
      count: "2 schemes",
      icon: GraduationCap,
      bg: "bg-sky-50/70 border-sky-200 hover:border-sky-400",
      iconBg: "bg-sky-700 text-white"
    },
    {
      id: "business",
      name: "Business / Startup",
      count: "1 scheme",
      icon: Briefcase,
      bg: "bg-purple-50/70 border-purple-200 hover:border-purple-400",
      iconBg: "bg-purple-700 text-white"
    },
    {
      id: "housing",
      name: "Housing",
      count: "1 scheme",
      icon: Home,
      bg: "bg-amber-50/70 border-amber-200 hover:border-amber-400",
      iconBg: "bg-amber-700 text-white"
    }
  ];

  return (
    <div className="bg-white rounded-none p-5 border border-slate-200 border-t-3 border-t-indigo-600 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Scheme Eligibility Overview
          </div>
          <h3 className="text-sm font-bold text-slate-900 mt-0.5">
            Quick Actions
          </h3>
        </div>
        <a 
          href="#schemes" 
          className="text-xs font-semibold text-orange-700 hover:text-orange-900 flex items-center gap-0.5"
        >
          View All Schemes &rarr;
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div 
              key={cat.id}
              className={`p-3 rounded-none border ${cat.bg} flex items-center justify-between transition cursor-pointer group`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-none flex items-center justify-center shrink-0 ${cat.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {cat.name}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5 font-medium">
                    {cat.count}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
