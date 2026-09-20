import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, X, Users, MapPin, Eye, Building2, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../services/api';

export default function VerifierPortal({ 
  token = null, 
  user = { name: "Shri Ramesh Joshi", role: "Field Verifier (Talati)" },
  activeTab = "verifier-queue",
  onTabChange = () => {}
}) {
  const [provisionalFamilies, setProvisionalFamilies] = useState([]);
  const [enrolledFamilies, setEnrolledFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFamily, setSelectedFamily] = useState(null);

  const isAllView = activeTab === "verifier-all";

  const loadData = async () => {
    setLoading(true);
    try {
      const [prov, perm] = await Promise.all([
        api.listFamilies("provisional"),
        api.listFamilies("permanent")
      ]);
      setProvisionalFamilies(Array.isArray(prov) ? prov : []);
      setEnrolledFamilies(Array.isArray(perm) ? perm : []);
    } catch (err) {
      console.error("Verifier queue error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (familyId, action) => {
    try {
      await api.verifyFamily(familyId, action, token);
      alert(`Family ID ${familyId} marked as ${action === "approve" ? "Permanent" : "Rejected"}!`);
      loadData();
      setSelectedFamily(null);
    } catch (err) {
      alert("Verification failed: " + err.message);
    }
  };

  const displayList = isAllView ? enrolledFamilies : provisionalFamilies;

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
              Field Verification &amp; Family Registration Authority
            </div>
            <h1 className="text-lg font-black text-slate-900 leading-tight">
              Panchayat Secretary &amp; Talati Desk (Gandhinagar)
            </h1>
            <div className="text-xs text-slate-600 mt-0.5">
              Field Verifier: <strong>{user.name || "Shri Ramesh Joshi"}</strong> &bull; Role: <strong>{user.role || "Field Verifier"}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="bg-amber-50 text-amber-800 border border-amber-300 px-3 py-1.5 font-bold flex items-center gap-1.5 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            Pending Verification: {provisionalFamilies.length}
          </div>
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1.5 font-bold flex items-center gap-1.5 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            Permanent Enrolled: {enrolledFamilies.length}
          </div>
        </div>
      </div>

      {/* Verification / Enrolled Families Table */}
      <div className="bg-white rounded-none p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              {isAllView ? (
                <>
                  <Users className="w-4 h-4 text-teal-700" />
                  All Enrolled &amp; Verified Permanent Families ({enrolledFamilies.length})
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-amber-700" />
                  Provisional Family Registrations Awaiting Verification ({provisionalFamilies.length})
                </>
              )}
            </h2>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {isAllView
                ? "Showing citizen households verified and permanently enrolled in ParivarSetu."
                : "Perform field Aadhaar and ration card checks, then Approve Permanent or Reject registration."
              }
            </div>
          </div>

          <button 
            onClick={loadData}
            className="text-xs text-orange-700 font-bold hover:underline cursor-pointer"
          >
            Refresh Data
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Family ID</th>
                <th className="py-2.5 px-3">Head of Family</th>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">Annual Income</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Aadhaar / Ration</th>
                <th className="py-2.5 px-3">Status</th>
                {!isAllView && <th className="py-2.5 px-3 text-right">Verification Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={isAllView ? 7 : 8} className="py-8 text-center text-slate-500 font-semibold">
                    Loading family verification records...
                  </td>
                </tr>
              ) : displayList.length === 0 ? (
                <tr>
                  <td colSpan={isAllView ? 7 : 8} className="py-8 text-center text-slate-500">
                    {isAllView ? "No permanent families recorded yet." : "No provisional families pending verification. All registrations verified!"}
                  </td>
                </tr>
              ) : (
                displayList.map(fam => (
                  <tr key={fam.family_id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{fam.family_id}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{fam.head_name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{fam.district}</td>
                    <td className="py-2.5 px-3 font-medium">₹{Number(fam.income || 0).toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-700">{fam.category}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                      {fam.aadhaar_ref_masked || fam.ration_card_no || "N/A"}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-none border ${
                        fam.status === "permanent"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : fam.status === "provisional"
                          ? "bg-amber-50 text-amber-800 border-amber-300"
                          : "bg-rose-50 text-rose-800 border-rose-300"
                      }`}>
                        {fam.status}
                      </span>
                    </td>
                    {!isAllView && (
                      <td className="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleAction(fam.family_id, "approve")}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] rounded-none shadow-xs cursor-pointer inline-flex items-center gap-1"
                          title="Approve registration and issue permanent Family ID"
                        >
                          <Check className="w-3 h-3" /> Approve Permanent
                        </button>
                        <button
                          onClick={() => handleAction(fam.family_id, "reject")}
                          className="px-2.5 py-1 bg-rose-700 hover:bg-rose-800 text-white font-bold text-[10px] rounded-none shadow-xs cursor-pointer inline-flex items-center gap-1"
                          title="Reject provisional registration"
                        >
                          <X className="w-3 h-3" /> Reject
                        </button>
                      </td>
                    )}
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
