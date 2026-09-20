import React from 'react';
import { Users, FileSpreadsheet, ClipboardCheck } from 'lucide-react';

export default function StatCards({ 
  familyId = "GJ12345678", 
  status = "Active",
  totalSchemes = 5,
  applicationsCount = 3,
  inProgressCount = 2,
  approvedCount = 1,
  totalBenefits = 48000
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Family ID Card */}
      <div className="bg-white rounded-none p-4.5 border border-slate-200 border-t-3 border-t-sky-600 shadow-xs flex items-center space-x-4">
        <div className="w-12 h-12 rounded-none bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 shrink-0">
          <Users className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Family ID</div>
          <div className="text-lg font-black text-slate-900 tracking-tight mt-0.5 truncate">
            {familyId}
          </div>
          <div className="mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Total Schemes Card */}
      <div className="bg-white rounded-none p-4.5 border border-slate-200 border-t-3 border-t-emerald-600 shadow-xs flex items-center space-x-4">
        <div className="w-12 h-12 rounded-none bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
          <FileSpreadsheet className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Schemes</div>
          <div className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
            {totalSchemes}
          </div>
          <div className="text-[11px] text-slate-600 font-medium mt-1 truncate">
            Applicable for your family
          </div>
        </div>
      </div>

      {/* 3. Applications Card */}
      <div className="bg-white rounded-none p-4.5 border border-slate-200 border-t-3 border-t-indigo-600 shadow-xs flex items-center space-x-4">
        <div className="w-12 h-12 rounded-none bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
          <ClipboardCheck className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Applications</div>
          <div className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
            {applicationsCount}
          </div>
          <div className="text-[11px] text-slate-600 font-medium mt-1 truncate">
            <span className="font-bold text-slate-900">{inProgressCount}</span> In Progress &nbsp;|&nbsp; <span className="font-bold text-slate-900">{approvedCount}</span> Approved
          </div>
        </div>
      </div>

      {/* 4. Total Benefits Received Card */}
      <div className="bg-white rounded-none p-4.5 border border-slate-200 border-t-3 border-t-amber-600 shadow-xs flex items-center space-x-4">
        <div className="w-12 h-12 rounded-none bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
          <span className="text-xl font-black">₹</span>
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Benefits Received</div>
          <div className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
            ₹ {totalBenefits.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-600 font-medium mt-1 truncate">
            (Last 12 months)
          </div>
        </div>
      </div>
    </div>
  );
}
