import React from 'react';
import { HeartPulse, GraduationCap, Briefcase, Home, ChevronRight } from 'lucide-react';

export default function QuickActionsCard() {
  const categories = [
    {
      id: "health",
      name: "Health",
      count: "2 schemes",
      icon: HeartPulse,
      bg: "bg-rose-50 border-rose-100/80 hover:border-rose-300",
      iconBg: "bg-rose-600 text-white"
    },
    {
      id: "education",
      name: "Education",
      count: "2 schemes",
      icon: GraduationCap,
      bg: "bg-sky-50 border-sky-100/80 hover:border-sky-300",
      iconBg: "bg-sky-600 text-white"
    },
    {
      id: "business",
      name: "Business / Startup",
      count: "1 scheme",
      icon: Briefcase,
      bg: "bg-purple-50 border-purple-100/80 hover:border-purple-300",
      iconBg: "bg-purple-600 text-white"
    },
    {
      id: "housing",
      name: "Housing",
      count: "1 scheme",
      icon: Home,
      bg: "bg-amber-50 border-amber-100/80 hover:border-amber-300",
      iconBg: "bg-amber-600 text-white"
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Scheme Eligibility Overview
          </div>
          <h3 className="text-sm font-bold text-slate-900 mt-0.5">
            Quick Actions
          </h3>
        </div>
        <a 
          href="#schemes" 
          className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-0.5"
        >
          View All Schemes &rarr;
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div 
              key={cat.id}
              className={`p-3.5 rounded-xl border ${cat.bg} flex items-center justify-between transition cursor-pointer group`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${cat.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {cat.name}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {cat.count}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
