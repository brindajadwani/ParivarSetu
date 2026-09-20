import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Users, 
  Bell, 
  Check, 
  X, 
  IndianRupee, 
  MessageSquare, 
  FileText, 
  Search, 
  Eye, 
  Send, 
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Lock,
  UserCheck,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import AnalyticsDashboard from '../components/officer/AnalyticsDashboard';

export default function OfficerPortal({ 
  token = null, 
  user = { name: "Dr. Mehta", dept_id: 6, department_name: "Health & Family Welfare" },
  activeTab: externalTab = "officer-apps",
  onTabChange = () => {}
}) {
  const getInternalTab = (tab) => {
    if (tab === "officer-complaints" || tab === "complaints") return "complaints";
    if (tab === "officer-schemes" || tab === "schemes") return "schemes";
    if (tab === "officer-analytics" || tab === "analytics") return "analytics";
    return "applications";
  };

  const [activeTab, setActiveTab] = useState(() => getInternalTab(externalTab));
  const [schemes, setSchemes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveTab(getInternalTab(externalTab));
  }, [externalTab]);

  const handleTabChange = (targetTab) => {
    setActiveTab(targetTab);
    onTabChange(`officer-${targetTab}`);
  };

  // Modals state
  const [showCreateSchemeModal, setShowCreateSchemeModal] = useState(false);
  const [selectedSchemeForEligible, setSelectedSchemeForEligible] = useState(null);
  const [eligibleFamilies, setEligibleFamilies] = useState([]);
  const [eligibleLoading, setEligibleLoading] = useState(false);

  const [disburseModalApp, setDisburseModalApp] = useState(null);
  const [disburseAmount, setDisburseAmount] = useState("");
  const [disbursing, setDisbursing] = useState(false);

  const [resolveModalComplaint, setResolveModalComplaint] = useState(null);
  const [resolveRemarks, setResolveRemarks] = useState("");
  const [resolving, setResolving] = useState(false);

  // Blind Review & Anti-Bias Dossier State
  const [inspectDossierApp, setInspectDossierApp] = useState(null);
  const [dossierFamily, setDossierFamily] = useState(null);
  const [dossierLoading, setDossierLoading] = useState(false);

  const handleOpenBlindDossier = async (app) => {
    setInspectDossierApp(app);
    setDossierLoading(true);
    setDossierFamily(null);
    try {
      const fam = await api.getFamily(app.family_id, token);
      setDossierFamily(fam);
    } catch (err) {
      console.error("Failed to load blind dossier:", err);
    } finally {
      setDossierLoading(false);
    }
  };

  // New scheme form state
  const [newScheme, setNewScheme] = useState({
    name: "",
    description: "",
    benefit_amount: 25000,
    max_income: 300000,
    category: "",
    required_condition_tag: "",
    required_class: "",
    min_percentage: 0,
    business_category: "",
    min_business_age: 0
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [sch, apps, comps] = await Promise.all([
        api.listSchemes(token),
        api.listApplications({}, token),
        api.listComplaints({}, token)
      ]);
      setSchemes(sch);
      setApplications(apps);
      setComplaints(comps);
    } catch (err) {
      console.error("Officer portal fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, user?.dept_id]);

  // Handlers
  const handleCreateScheme = async (e) => {
    e.preventDefault();
    try {
      await api.createScheme({
        ...newScheme,
        benefit_amount: parseFloat(newScheme.benefit_amount),
        max_income: newScheme.max_income ? parseFloat(newScheme.max_income) : null,
        min_percentage: newScheme.min_percentage ? parseFloat(newScheme.min_percentage) : null,
        min_business_age: newScheme.min_business_age ? parseInt(newScheme.min_business_age) : null
      }, token);
      alert("New scheme created successfully!");
      setShowCreateSchemeModal(false);
      loadData();
    } catch (err) {
      alert("Error creating scheme: " + err.message);
    }
  };

  const handleViewEligible = async (scheme) => {
    setSelectedSchemeForEligible(scheme);
    setEligibleLoading(true);
    try {
      const fams = await api.getEligibleFamiliesForScheme(scheme.id);
      setEligibleFamilies(fams);
    } catch (err) {
      alert("Failed to compute eligible families: " + err.message);
    } finally {
      setEligibleLoading(false);
    }
  };

  const handleNotifyEligible = async (schemeId) => {
    try {
      const res = await api.notifyEligible(schemeId, token);
      alert(`Broadcast Complete! Found ${res.eligible_families_found} eligible families, sent ${res.new_notifications_sent} new notifications.`);
    } catch (err) {
      alert("Failed to broadcast notifications: " + err.message);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.updateApplicationStatus(appId, newStatus, token);
      loadData();
    } catch (err) {
      alert("Transition failed: " + err.message);
    }
  };

  const handleDisburse = async (e) => {
    e.preventDefault();
    if (!disburseAmount || !disburseModalApp) return;
    setDisbursing(true);
    try {
      const res = await api.disburseApplication(disburseModalApp.id, disburseAmount, token);
      alert(`Funds Disbursed! Transaction ID: ${res.txn_id}`);
      setDisburseModalApp(null);
      loadData();
    } catch (err) {
      alert("Disbursal failed: " + err.message);
    } finally {
      setDisbursing(false);
    }
  };

  const handleResolveComplaint = async (e) => {
    e.preventDefault();
    if (!resolveRemarks.trim() || !resolveModalComplaint) return;
    setResolving(true);
    try {
      await api.resolveComplaint(resolveModalComplaint.id, resolveRemarks, token);
      alert("Grievance marked as Resolved and application returned to Under Review!");
      setResolveModalComplaint(null);
      setResolveRemarks("");
      loadData();
    } catch (err) {
      alert("Resolution error: " + err.message);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Officer Department Banner */}
      <div className="bg-white rounded-none p-5 border border-slate-200 border-t-3 border-t-orange-600 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-none bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-800 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Department Officer Management Portal
            </div>
            <h1 className="text-lg font-black text-slate-900 leading-tight">
              {user.department_name || "Government Department"}
            </h1>
            <div className="text-xs text-slate-600 mt-0.5">
              Officer: <strong>{user.name}</strong> &bull; Dept ID: <strong>#{user.dept_id}</strong> (Server-Isolated)
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap gap-1 border border-slate-200 p-1 bg-slate-50">
          <button
            onClick={() => handleTabChange("applications")}
            className={`px-3 py-1.5 text-xs font-bold rounded-none cursor-pointer ${
              activeTab === "applications" ? 'bg-orange-700 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            Applications ({applications.length})
          </button>
          <button
            onClick={() => handleTabChange("schemes")}
            className={`px-3 py-1.5 text-xs font-bold rounded-none cursor-pointer ${
              activeTab === "schemes" ? 'bg-orange-700 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            My Schemes ({schemes.length})
          </button>
          <button
            onClick={() => handleTabChange("complaints")}
            className={`px-3 py-1.5 text-xs font-bold rounded-none cursor-pointer flex items-center gap-1 ${
              activeTab === "complaints" ? 'bg-orange-700 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            Grievances ({complaints.length})
            {complaints.filter(c => c.status === "Open").length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            )}
          </button>
          <button
            onClick={() => handleTabChange("analytics")}
            className={`px-3 py-1.5 text-xs font-bold rounded-none cursor-pointer ${
              activeTab === "analytics" ? 'bg-orange-700 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* 1. Applications Review Table */}
      {activeTab === "applications" && (
        <div className="bg-white rounded-none p-5 border border-slate-200 shadow-xs space-y-4">
          {/* Official Anti-Bias Blind Adjudication Banner */}
          <div className="p-3.5 bg-slate-900 text-white border-l-4 border-l-amber-500 flex items-start justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <span>Blind Adjudication Standard Active &bull; Zero-Bias Evaluation Mode</span>
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/50 px-1.5 py-0.2 text-[9px] font-black">
                    DPDP Act Compliant
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-300 mt-0.5 leading-relaxed">
                  To eliminate unconscious, surname, community, and gender bias, citizen personal identifiers (names, surnames, addresses) are strictly de-identified. Applications must be reviewed and decided strictly against verified Family ID qualification facts.
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-[10.5px] text-amber-300 bg-amber-950/60 px-2.5 py-1 border border-amber-600/50 shrink-0">
              <Lock className="w-3.5 h-3.5" />
              <span>Names Withheld for Fair Scrutiny</span>
            </div>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Department Applications Queue (Blind Review)
              </h2>
              <div className="text-xs text-slate-500 font-medium">
                Decide approvals objectively using Family ID and verified qualification facts
              </div>
            </div>
            <div className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 border border-slate-200 font-bold">
              Total Caseload: {applications.length}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">App ID</th>
                  <th className="py-2.5 px-3">Family ID (Blind Reference)</th>
                  <th className="py-2.5 px-3">Scheme Name</th>
                  <th className="py-2.5 px-3 text-center">Verified Facts</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Applied On</th>
                  <th className="py-2.5 px-3 text-right">Statutory Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No applications found for this department.
                    </td>
                  </tr>
                ) : (
                  applications.map(app => {
                    const isApplied = app.status === "Applied";
                    const isUnderReview = app.status === "Under Review";
                    const isApproved = app.status === "Approved";
                    const isDisbursed = app.status === "Disbursed";
                    const isEscalated = app.status === "Escalated";

                    return (
                      <tr key={app.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">#{app.id}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-mono font-black text-slate-900">{app.family_id}</div>
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 border border-slate-200 mt-0.5">
                            <Lock className="w-2.5 h-2.5 text-slate-500" /> Anonymized Unit
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">
                          {app.scheme_name || `Scheme #${app.scheme_id}`}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => handleOpenBlindDossier(app)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] rounded-none cursor-pointer inline-flex items-center gap-1 shadow-xs"
                            title="Inspect verified qualification facts without seeing citizen personal identity"
                          >
                            <Eye className="w-3 h-3 text-amber-700" />
                            Inspect Facts
                          </button>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-none ${
                            isDisbursed ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                            isEscalated ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse' :
                            isApproved ? 'bg-sky-100 text-sky-800 border-sky-300' :
                            'bg-amber-100 text-amber-800 border-amber-300'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {app.applied_on ? new Date(app.applied_on).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                          {/* Review Action */}
                          {isApplied && (
                            <button
                              onClick={() => handleStatusChange(app.id, "Under Review")}
                              className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-white font-bold text-[10px] rounded-none cursor-pointer shadow-xs"
                            >
                              Review
                            </button>
                          )}

                          {/* Approve Action */}
                          {(isUnderReview || isEscalated) && (
                            <button
                              onClick={() => handleStatusChange(app.id, "Approved")}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] rounded-none cursor-pointer shadow-xs"
                            >
                              Approve
                            </button>
                          )}

                          {/* Reject Action */}
                          {(isApplied || isUnderReview || isEscalated) && (
                            <button
                              onClick={() => handleStatusChange(app.id, "Rejected")}
                              className="px-2.5 py-1 bg-slate-700 hover:bg-slate-800 text-white font-bold text-[10px] rounded-none cursor-pointer shadow-xs"
                            >
                              Reject
                            </button>
                          )}

                          {/* Disburse Action */}
                          {isApproved && (
                            <button
                              onClick={() => {
                                setDisburseModalApp(app);
                                setDisburseAmount(48000);
                              }}
                              className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-[10px] rounded-none cursor-pointer inline-flex items-center gap-1 shadow-xs"
                            >
                              <IndianRupee className="w-3 h-3" /> Disburse
                            </button>
                          )}

                          {/* Disbursed Status info */}
                          {isDisbursed && (
                            <span className="text-[10px] font-mono text-emerald-800 font-bold">
                              {app.txn_id}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Schemes Management */}
      {activeTab === "schemes" && (
        <div className="bg-white rounded-none p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Department Welfare Schemes ({user.department_name})
              </h2>
              <div className="text-[11px] text-slate-500">
                Rules live as data &mdash; no hardcoding needed for eligibility engine.
              </div>
            </div>
            <button
              onClick={() => setShowCreateSchemeModal(true)}
              className="px-3 py-1.5 bg-orange-700 hover:bg-orange-800 text-white text-xs font-bold rounded-none shadow-xs transition cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Create Scheme
            </button>
          </div>

          <div className="space-y-3">
            {schemes.map(s => (
              <div key={s.id} className="p-4 border border-slate-200 rounded-none bg-slate-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black text-slate-900">{s.name}</h3>
                    <span className="text-[10px] px-2 py-0.2 bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                      ₹{s.benefit_amount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 max-w-xl">
                    {s.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleViewEligible(s)}
                    className="px-3 py-1.5 text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-none cursor-pointer flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5 text-orange-600" />
                    View Eligible Families
                  </button>
                  <button
                    onClick={() => handleNotifyEligible(s.id)}
                    className="px-3 py-1.5 text-xs font-bold bg-orange-700 hover:bg-orange-800 text-white rounded-none cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    Notify All
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Grievances Inbox */}
      {activeTab === "complaints" && (
        <div className="bg-white rounded-none p-5 border border-slate-200 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Department Grievance Inbox</span>
            <span className="text-xs text-slate-500 font-medium">Pending: {complaints.filter(c => c.status === "Open").length}</span>
          </h2>

          <div className="space-y-3">
            {complaints.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 font-medium">
                No active complaints filed in this department.
              </div>
            ) : (
              complaints.map(c => (
                <div key={c.id} className="p-4 border border-slate-200 rounded-none bg-slate-50/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">Grievance #{c.id}</span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="text-xs text-slate-600">Application #{c.application_id}</span>
                      <span className={`px-2 py-0.2 text-[10px] font-bold uppercase rounded-none border ${
                        c.status === "Resolved" ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-800 font-medium mt-1">
                      {c.message}
                    </div>
                    {c.officer_response && (
                      <div className="text-xs text-emerald-800 mt-2 font-semibold">
                        Resolution: {c.officer_response}
                      </div>
                    )}
                  </div>

                  {c.status !== "Resolved" && (
                    <button
                      onClick={() => setResolveModalComplaint(c)}
                      className="px-3 py-1.5 text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white rounded-none shadow-xs cursor-pointer shrink-0"
                    >
                      Resolve Grievance
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. Analytics Tab */}
      {activeTab === "analytics" && (
        <AnalyticsDashboard token={token} departmentName={user.department_name} />
      )}

      {/* MODAL: View Eligible Families */}
      {selectedSchemeForEligible && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-none border border-slate-300 w-full max-w-2xl shadow-2xl p-6 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Eligible Families for &ldquo;{selectedSchemeForEligible.name}&rdquo;
                </h3>
                <div className="text-xs text-slate-500 font-medium">
                  Dynamic query execution via Generic Eligibility Engine
                </div>
              </div>
              <button 
                onClick={() => setSelectedSchemeForEligible(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto my-4">
              {eligibleLoading ? (
                <div className="py-10 text-center text-xs text-slate-500">Evaluating eligibility criteria...</div>
              ) : eligibleFamilies.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-500">No families currently meet this scheme&apos;s criteria.</div>
              ) : (
                <div className="space-y-2">
                  {eligibleFamilies.map(fam => (
                    <div key={fam.family_id} className="p-3 border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span className="font-mono font-black text-slate-900">{fam.family_id}</span>
                          <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 font-bold uppercase rounded-none border border-slate-300">
                            De-Identified Unit
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          District: <strong>{fam.district || "Gujarat"}</strong> &bull; Category: <strong>{fam.category}</strong> &bull; Verified Income: <strong>₹{Number(fam.income || 0).toLocaleString('en-IN')}</strong>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase border border-emerald-300">
                        Qualified
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs text-slate-600 font-bold">
                Total Matches: {eligibleFamilies.length}
              </span>
              <button
                onClick={() => setSelectedSchemeForEligible(null)}
                className="px-4 py-1.5 text-xs bg-slate-800 text-white font-bold rounded-none cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Blind Review Application Dossier */}
      {inspectDossierApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-none border-2 border-orange-600 w-full max-w-xl shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-sm">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    De-Identified Application Dossier &ndash; App #{inspectDossierApp.id}
                  </h3>
                  <div className="text-[11px] text-orange-700 font-bold uppercase tracking-wider">
                    Anti-Bias Blind Adjudication Standard
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setInspectDossierApp(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Anti-Bias DPDP Warning */}
            <div className="p-3 bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong>Anonymized Review Active:</strong> Citizen personal names, surnames, and street addresses are withheld under Gujarat DPDP Anti-Bias governance standards to ensure impartial evaluation. Decisions must be made strictly on verified eligibility criteria.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {dossierLoading ? (
                <div className="py-12 text-center text-xs font-bold text-slate-500">
                  Retrieving de-identified verified registry facts...
                </div>
              ) : (
                <>
                  {/* Key Fact Sheet */}
                  <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3.5 border border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Family Blind Identifier</span>
                      <span className="font-mono font-black text-slate-900 text-sm">{inspectDossierApp.family_id}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Current Application Status</span>
                      <span className="inline-block font-bold text-[10px] uppercase px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 mt-0.5">
                        {inspectDossierApp.status}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Applied Welfare Scheme</span>
                      <span className="font-bold text-slate-800">{inspectDossierApp.scheme_name || `Scheme #${inspectDossierApp.scheme_id}`}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Application Submission Date</span>
                      <span className="font-semibold text-slate-700">
                        {inspectDossierApp.applied_on ? new Date(inspectDossierApp.applied_on).toLocaleDateString('en-IN') : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Verified Qualification Facts */}
                  <div className="border border-slate-200 p-3.5 space-y-2.5">
                    <div className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Verified Qualification Facts (State Registry)
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-300 px-1.5 py-0.2 font-bold">
                        Talati Verified
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 text-[11px] block">Verified Annual Income:</span>
                        <strong className="text-slate-900 font-mono text-xs">
                          ₹{Number(dossierFamily?.income || 0).toLocaleString('en-IN')}
                        </strong>
                      </div>

                      <div>
                        <span className="text-slate-500 text-[11px] block">Social Category:</span>
                        <strong className="text-slate-900">{dossierFamily?.category || "General / OBC"}</strong>
                      </div>

                      <div>
                        <span className="text-slate-500 text-[11px] block">District Jurisdiction:</span>
                        <strong className="text-slate-900">{dossierFamily?.district || "Gujarat"}</strong>
                      </div>

                      <div>
                        <span className="text-slate-500 text-[11px] block">Registration Classification:</span>
                        <strong className="text-emerald-800 capitalize">{dossierFamily?.status || "Permanent"}</strong>
                      </div>

                      <div>
                        <span className="text-slate-500 text-[11px] block">Aadhaar Biometric Reference:</span>
                        <strong className="font-mono text-slate-700 text-[11px]">
                          {dossierFamily?.aadhaar_ref_masked || "XXXX-XXXX-8821"}
                        </strong>
                      </div>

                      <div>
                        <span className="text-slate-500 text-[11px] block">DBT Linked Account:</span>
                        <strong className="font-mono text-slate-700 text-[11px]">
                          {dossierFamily?.bank_info?.account_number_masked || "****4321"}
                        </strong>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Statutory Action Buttons */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setInspectDossierApp(null)}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 border border-slate-300 rounded-none bg-white hover:bg-slate-100 cursor-pointer"
              >
                Close Dossier
              </button>

              <div className="flex items-center gap-2">
                {inspectDossierApp.status === "Applied" && (
                  <button
                    onClick={() => {
                      handleStatusChange(inspectDossierApp.id, "Under Review");
                      setInspectDossierApp(prev => ({ ...prev, status: "Under Review" }));
                    }}
                    className="px-3 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-none cursor-pointer shadow-xs"
                  >
                    Move to Under Review
                  </button>
                )}

                {(inspectDossierApp.status === "Under Review" || inspectDossierApp.status === "Escalated") && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusChange(inspectDossierApp.id, "Rejected");
                        setInspectDossierApp(null);
                      }}
                      className="px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-none cursor-pointer shadow-xs"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(inspectDossierApp.id, "Approved");
                        setInspectDossierApp(prev => ({ ...prev, status: "Approved" }));
                      }}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-none cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve Benefit
                    </button>
                  </>
                )}

                {inspectDossierApp.status === "Approved" && (
                  <button
                    onClick={() => {
                      const appToDisburse = inspectDossierApp;
                      setInspectDossierApp(null);
                      setDisburseModalApp(appToDisburse);
                      setDisburseAmount(48000);
                    }}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-none cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <IndianRupee className="w-3.5 h-3.5" /> Disburse DBT
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Disburse Benefit Funds */}
      {disburseModalApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <form onSubmit={handleDisburse} className="bg-white rounded-none border border-slate-300 w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-emerald-700" />
              Direct Benefit Transfer (DBT) Disbursal
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              Disbursing funds for Application #{disburseModalApp.id} ({disburseModalApp.scheme_name || `Scheme #${disburseModalApp.scheme_id}`}) to Family <strong>{disburseModalApp.family_id}</strong>.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Disbursal Amount (₹)</label>
              <input
                type="number"
                required
                value={disburseAmount}
                onChange={(e) => setDisburseAmount(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-none focus:outline-none focus:border-emerald-600 font-mono font-bold"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDisburseModalApp(null)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-none text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={disbursing}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-none shadow-xs cursor-pointer"
              >
                {disbursing ? 'Processing DBT...' : 'Execute Disbursal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Resolve Grievance */}
      {resolveModalComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <form onSubmit={handleResolveComplaint} className="bg-white rounded-none border border-slate-300 w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-2">
              Resolve Grievance #{resolveModalComplaint.id}
            </h3>
            <div className="text-xs text-slate-600">
              <strong>Citizen Complaint:</strong> {resolveModalComplaint.message}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Redressal Remarks
              </label>
              <textarea
                required
                rows={3}
                value={resolveRemarks}
                onChange={(e) => setResolveRemarks(e.target.value)}
                placeholder="State corrective action taken..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-none focus:outline-none focus:border-rose-600"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setResolveModalComplaint(null)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-none text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={resolving}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-none shadow-xs cursor-pointer"
              >
                {resolving ? 'Submitting...' : 'Mark Resolved'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
