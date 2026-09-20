import React from 'react';
import { HeartPulse, GraduationCap, Briefcase, Home, ChevronRight } from 'lucide-react';

export default function ActiveSchemesCard({ schemes = [] }) {
  const defaultSchemes = [
    {
      id: 1,
      title: "MA Amrutam / PMJAY",
      desc: "Health insurance for your family",
      icon: HeartPulse,
      iconBg: "bg-rose-50 text-rose-700 border border-rose-200"
    },
    {
      id: 2,
      title: "MYSY Post Matric Scholarship",
      desc: "For eligible students",
      icon: GraduationCap,
      iconBg: "bg-sky-50 text-sky-700 border border-sky-200"
    },
    {
      id: 3,
      title: "Gujarat Startup & Innovation Assistance",
      desc: "Support for new business/startups",
      icon: Briefcase,
      iconBg: "bg-purple-50 text-purple-700 border border-purple-200"
    },
    {
      id: 4,
      title: "Mukhyamantri Awas Yojana",
      desc: "Housing for all",
      icon: Home,
      iconBg: "bg-amber-50 text-amber-700 border border-amber-200"
    }
  ];

  const items = schemes.length > 0 ? schemes : defaultSchemes;

  return (
    <div className="bg-white rounded-none p-5 border border-slate-200 border-t-3 border-t-emerald-600 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">
          Active Schemes
        </h3>
        <a 
          href="#schemes" 
          className="text-xs font-semibold text-orange-700 hover:text-orange-900 flex items-center gap-0.5"
        >
          View All &rarr;
        </a>
      </div>

      <div className="space-y-2.5">
        {items.map((scheme) => {
          const Icon = scheme.icon || HeartPulse;
          return (
            <div 
              key={scheme.id} 
              className="flex items-center justify-between p-3 rounded-none bg-slate-50/70 hover:bg-slate-100/90 transition cursor-pointer group border border-slate-200"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className={`w-9 h-9 rounded-none flex items-center justify-center shrink-0 ${scheme.iconBg || 'bg-slate-100 text-slate-600'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate group-hover:text-orange-700 transition">
                    {scheme.title}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5 truncate font-medium">
                    {scheme.desc}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 ml-3">
                <span className="px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Eligible
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
