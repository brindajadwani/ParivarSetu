import React from 'react';
import { Users, ShieldCheck, MapPin, Home } from 'lucide-react';

export default function FamilyDetailsCard({
  familyName = "Sharma Family",
  familyId = "GJ12345678",
  district = "Gandhinagar",
  ward = "Sector 6 / Gandhinagar",
  memberCount = 4
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
      <div className="text-sm font-bold text-slate-900 mb-3.5">
        Family Details
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center space-x-3.5">
          <div className="w-13 h-13 rounded-2xl bg-amber-100/70 border border-amber-200/60 flex items-center justify-center text-amber-800 shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-slate-900">{familyName}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-3 h-3" /> Family ID Verified
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              One Family &ndash; One ID Registered
            </div>
          </div>
        </div>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-2 gap-y-3 gap-x-4 pt-3.5 text-xs">
        <div className="flex items-center gap-2 text-slate-500">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>Family ID</span>
        </div>
        <div className="font-bold text-slate-900 text-right sm:text-left">
          {familyId}
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>District</span>
        </div>
        <div className="font-semibold text-slate-800 text-right sm:text-left">
          {district}
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <Home className="w-3.5 h-3.5 text-slate-400" />
          <span>Village / Ward</span>
        </div>
        <div className="font-semibold text-slate-800 text-right sm:text-left">
          {ward}
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>Family Members</span>
        </div>
        <div className="font-bold text-slate-900 text-right sm:text-left">
          {memberCount}
        </div>
      </div>
    </div>
  );
}
