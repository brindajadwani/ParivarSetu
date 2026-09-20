import React, { useState } from 'react';
import { 
  Briefcase, 
  HeartPulse, 
  GraduationCap, 
  Home, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Search,
  Filter
} from 'lucide-react';

export default function SchemeCatalog({ 
  schemes = [], 
  eligibleSchemeIds = [], 
  familyId = "GJ12345678",
  appliedSchemeIds = [],
  onApply = () => {} 
}) {
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [applyingId, setApplyingId] = useState(null);

  const getDeptIcon = (name = "") => {
    const lower = name.toLowerCase();
    if (lower.includes("health")) return HeartPulse;
    if (lower.includes("edu")) return GraduationCap;
    if (lower.includes("housing") || lower.includes("urban")) return Home;
    return Briefcase;
  };

  const filtered = schemes.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          (s.description && s.description.toLowerCase().includes(search.toLowerCase()));
    const matchesDept = selectedDept === "all" || s.department_name === selectedDept;
    return matchesSearch && matchesDept;
  });

  const departments = Array.from(new Set(schemes.map(s => s.department_name).filter(Boolean)));

  const handleApplyClick = async (schemeId) => {
    setApplyingId(schemeId);
    try {
      await onApply(schemeId);
    } catch (err) {
      alert("Application submission failed: " + err.message);
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-white rounded-none p-5 border border-slate-200 border-t-3 border-t-amber-600 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight">
            Government Welfare Schemes Directory
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 font-medium">
            Data-driven welfare programs across Health, Education, MSME, and Housing for Gujarat citizens.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search box */}
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input 
              type="text"
              placeholder="Search schemes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-amber-600 rounded-none font-medium"
            />
          </div>

          {/* Department Filter */}
          <div className="w-full sm:w-auto">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 focus:outline-none focus:border-amber-600 rounded-none font-semibold text-slate-700"
            >
              <option value="all">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(scheme => {
          const Icon = getDeptIcon(scheme.name);
          const isEligible = eligibleSchemeIds.includes(scheme.id);
          const hasApplied = appliedSchemeIds.includes(scheme.id);

          return (
            <div 
              key={scheme.id}
              className={`bg-white rounded-none border border-slate-200 shadow-xs p-5 flex flex-col justify-between transition hover:border-slate-300 border-t-3 ${
                isEligible ? 'border-t-emerald-600' : 'border-t-slate-400'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-none bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {scheme.department_name || "Department Welfare"}
                      </span>
                      <h3 className="text-sm font-black text-slate-900 leading-tight">
                        {scheme.name}
                      </h3>
                    </div>
                  </div>

                  {/* Eligibility Pill */}
                  <span className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider shrink-0 border ${
                    isEligible 
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}>
                    {isEligible ? 'Eligible' : 'Not Eligible'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium mt-3 leading-relaxed">
                  {scheme.description || "Government welfare assistance provided under Gujarat One Family One ID initiative."}
                </p>

                {/* Criteria Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100 text-[10px]">
                  {scheme.max_income && (
                    <span className="px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-200">
                      Income &le; ₹{scheme.max_income.toLocaleString('en-IN')}
                    </span>
                  )}
                  {scheme.category && (
                    <span className="px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-200">
                      Category: {scheme.category}
                    </span>
                  )}
                  {scheme.required_class && (
                    <span className="px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-200">
                      Class: {scheme.required_class}
                    </span>
                  )}
                  {scheme.business_category && (
                    <span className="px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-200">
                      Biz: {scheme.business_category}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer: Benefit & Action */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Benefit Value</div>
                  <div className="text-base font-black text-slate-900">
                    ₹{scheme.benefit_amount?.toLocaleString('en-IN') || "0"}
                  </div>
                </div>

                <div>
                  {hasApplied ? (
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Applied
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApplyClick(scheme.id)}
                      disabled={applyingId === scheme.id}
                      className={`px-4 py-1.5 text-xs font-bold text-white rounded-none shadow-xs transition flex items-center gap-1 cursor-pointer ${
                        isEligible 
                          ? 'bg-orange-700 hover:bg-orange-800' 
                          : 'bg-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      {applyingId === scheme.id ? 'Applying...' : 'Apply Now'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
