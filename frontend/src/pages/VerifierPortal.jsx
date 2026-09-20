import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, X, Users, MapPin, Eye, Building2 } from 'lucide-react';
import { api } from '../services/api';

export default function VerifierPortal({ token = null, user = { name: "Shri V.K. Joshi", role: "Verifier (Talati)" } }) {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFamily, setSelectedFamily] = useState(null);

  const loadProvisional = async () => {
    setLoading(true);
    try {
      const data = await api.listFamilies("provisional");
      setFamilies(data);
    } catch (err) {
      console.error("Verifier queue error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProvisional();
  }, []);

  const handleAction = async (familyId, action) => {
    try {
      await api.verifyFamily(familyId, action, token);
      alert(`Family ID ${familyId} marked as ${action === "approve" ? "Permanent" : "Rejected"}!`);
      loadProvisional();
      setSelectedFamily(null);
    } catch (err) {
      alert("Verification failed: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Verifier Header */}
      <div className="bg-white rounded-none p-5 border border-slate-200 border-t-3 border-t-teal-700 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-none bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Field Verification & Enrollment Desk
            </div>
            <h1 className="text-lg font-black text-slate-900 leading-tight">
              Panchayat Secretary / Talati Desk (Gandhinagar)
            </h1>
            <div className="text-xs text-slate-600 mt-0.5">
              Verifier: <strong>{user.name}</strong> &bull; Role: <strong>{user.role}</strong>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-600 bg-slate-50 px-3 py-1.5 border border-slate-200 font-semibold">
          Provisional Pending: <strong className="text-amber-800">{families.length}</strong>
        </div>
      </div>

      {/* Provisional Families Table */}
      <div className="bg-white rounded-none p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">
            Provisional Family Registrations Awaiting Verification
          </h2>
          <button 
            onClick={loadProvisional}
            className="text-xs text-orange-700 font-bold hover:underline cursor-pointer"
          >
            Refresh Queue
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Family ID</th>
                <th className="py-2.5 px-3">Head of Family</th>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">Income & Category</th>
                <th className="py-2.5 px-3">Aadhaar / Ration</th>
                <th className="py-2.5 px-3 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {families.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No provisional families pending verification. All registrations verified!
                  </td>
                </tr>
              ) : (
                families.map(fam => (
                  <tr key={fam.family_id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{fam.family_id}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{fam.head_name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{fam.district}</td>
                    <td className="py-2.5 px-3 font-medium">
                      ₹{fam.income?.toLocaleString('en-IN')} &bull; <span className="font-bold">{fam.category}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                      {fam.aadhaar_ref_masked || fam.ration_card_no || "N/A"}
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1.5">
                      <button
                        onClick={() => handleAction(fam.family_id, "approve")}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] rounded-none shadow-xs cursor-pointer inline-flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Approve Permanent
                      </button>
                      <button
                        onClick={() => handleAction(fam.family_id, "reject")}
                        className="px-2.5 py-1 bg-slate-700 hover:bg-slate-800 text-white font-bold text-[10px] rounded-none shadow-xs cursor-pointer inline-flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Reject
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
