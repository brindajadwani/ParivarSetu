import React from 'react';
import { HeartPulse, GraduationCap, Briefcase, Home, ChevronRight } from 'lucide-react';

export default function ActiveSchemesCard({ schemes = [] }) {
  const defaultSchemes = [
    {
      id: 1,
      title: "MA Amrutam / PMJAY",
      desc: "Health insurance for your family",
      icon: HeartPulse,
      iconBg: "bg-rose-100 text-rose-600"
    },
    {
      id: 2,
      title: "MYSY Post Matric Scholarship",
      desc: "For eligible students",
      icon: GraduationCap,
      iconBg: "bg-sky-100 text-sky-600"
    },
    {
      id: 3,
      title: "Gujarat Startup & Innovation Assistance",
      desc: "Support for new business/startups",
      icon: Briefcase,
      iconBg: "bg-purple-100 text-purple-600"
    },
    {
      id: 4,
      title: "Mukhyamantri Awas Yojana",
      desc: "Housing for all",
      icon: Home,
      iconBg: "bg-amber-100 text-amber-600"
    }
  ];

  const items = schemes.length > 0 ? schemes : defaultSchemes;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900">
          Active Schemes
        </h3>
        <a 
          href="#schemes" 
          className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-0.5"
        >
          View All &rarr;
        </a>
      </div>

      <div className="space-y-3.5">
        {items.map((scheme) => {
          const Icon = scheme.icon || HeartPulse;
          return (
            <div 
              key={scheme.id} 
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer group border border-transparent hover:border-slate-100"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${scheme.iconBg || 'bg-slate-100 text-slate-600'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate group-hover:text-orange-600 transition">
                    {scheme.title}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {scheme.desc}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 ml-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  Eligible
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
