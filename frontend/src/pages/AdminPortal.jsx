import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Building2, 
  Clock, 
  Target, 
  MapPin, 
  IndianRupee, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Search, 
  Filter, 
  Download, 
  ShieldCheck, 
  Layers, 
  RefreshCw,
  Info,
  ArrowUpRight,
  ChevronRight,
  BarChart3,
  PieChart as PieIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { api } from '../services/api';

const STATUS_COLORS = {
  "Disbursed": "#059669",
  "Approved": "#10b981",
  "Under Review": "#0284c7",
  "Applied": "#f59e0b",
  "Escalated": "#e11d48",
  "Rejected": "#64748b"
};

const DEPT_CHART_COLORS = [
  "#d97706", "#0284c7", "#10b981", "#7c3aed", 
  "#ea580c", "#0891b2", "#be185d", "#4b5563"
];

export default function AdminPortal({ 
  token = null, 
  user = { name: "Shri Rajesh Kumar, IAS", role: "Admin" },
  activeTab = "admin-overview",
  onTabChange = () => {}
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters for tables
  const [deptSortField, setDeptSortField] = useState("total_disbursed_amount");
  const [schemeSearch, setSchemeSearch] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("all");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAdminDashboard(token);
      setData(res);
    } catch (err) {
      console.error("Failed to load admin analytics:", err);
      setError(err.message || "Failed to load executive intelligence data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center bg-white border border-slate-200 p-12 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-orange-600 animate-spin" />
        <div className="text-sm font-bold text-slate-800">
          Aggregating Statewide ParivarSetu Data Analysis...
        </div>
        <div className="text-xs text-slate-500">
          Compiling department-wise deductions, pending caseloads, and algorithmic saturation gaps.
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-rose-50 border-2 border-rose-300 text-rose-900 rounded-none space-y-3">
        <div className="flex items-center gap-2 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-700" />
          Analytics Service Notice
        </div>
        <p className="text-xs text-rose-700">{error || "Could not retrieve administrator intelligence summary."}</p>
        <button
          onClick={loadData}
          className="px-4 py-1.5 bg-rose-700 text-white font-bold text-xs rounded-none cursor-pointer"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  const {
    executive_summary = {},
    department_wise_analysis = [],
    proactive_gap_analysis = [],
    district_saturation = [],
    delayed_bottlenecks = []
  } = data;

  // Format currency
  const formatINR = (amt) => {
    const val = Number(amt || 0);
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakh`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  // Sort department data
  const sortedDepts = [...department_wise_analysis].sort((a, b) => {
    if (deptSortField === "total_disbursed_amount") return b.total_disbursed_amount - a.total_disbursed_amount;
    if (deptSortField === "pending_applications") return b.pending_applications - a.pending_applications;
    if (deptSortField === "saturation_rate") return b.saturation_rate - a.saturation_rate;
    if (deptSortField === "total_applications") return b.total_applications - a.total_applications;
    return a.department_name.localeCompare(b.department_name);
  });

  // Filter schemes for proactive gap analysis
  const filteredSchemes = proactive_gap_analysis.filter(s => {
    const matchesSearch = s.scheme_name.toLowerCase().includes(schemeSearch.toLowerCase()) ||
                          s.department_name.toLowerCase().includes(schemeSearch.toLowerCase());
    const matchesDept = selectedDeptFilter === "all" || s.department_name === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  // Chart data: Disbursals by Department
  const deptChartData = department_wise_analysis.map(d => ({
    name: d.department_name.replace(" Department", "").replace("& Family Welfare", ""),
    fullName: d.department_name,
    disbursed: d.total_disbursed_amount,
    pending: d.pending_applications
  }));

  // Chart data: Saturation Comparison
  const saturationChartData = proactive_gap_analysis.slice(0, 6).map(s => ({
    name: s.scheme_name.length > 18 ? s.scheme_name.substring(0, 18) + "..." : s.scheme_name,
    applied: s.applied_count,
    unappliedGap: s.eligible_not_applied
  }));

  return (
    <div className="space-y-6">
      {/* 1. Official State Administrator Command Header */}
      <div className="bg-white rounded-none p-5 border border-slate-200 border-t-4 border-t-[#0B2545] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 font-black text-xl rounded-none shrink-0 shadow-xs">
            GJ
          </div>
          <div>
            <div className="text-[10px] font-bold text-orange-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>ગુજરાત સરકાર &bull; State Administrative Oversight Authority</span>
              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 text-[9px] font-black">
                Executive Command
              </span>
            </div>
            <h1 className="text-lg font-black text-slate-900 leading-tight">
              ParivarSetu Executive Governance &amp; Saturation Intelligence Desk
            </h1>
            <div className="text-xs text-slate-600 mt-0.5">
              State Administrator: <strong>{user.name}</strong> &bull; Office of the Chief Secretary / GOG
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={loadData}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-300 rounded-none cursor-pointer flex items-center gap-1.5 shadow-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-orange-600" />
            Refresh Analytics
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-[#0B2545] hover:bg-slate-800 text-white font-bold rounded-none cursor-pointer flex items-center gap-1.5 shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            Export State Brief
          </button>
        </div>
      </div>

      {/* 2. Executive Notice Banner: Clarifying Non-Operational Analytics Role */}
      <div className="p-3.5 bg-blue-50/80 border-l-4 border-l-blue-600 border border-blue-200 text-xs text-slate-700 flex items-start gap-2.5 shadow-xs">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-blue-900 font-bold">Executive Authority Standard: </strong>
          The State Administrator exercises strategic oversight across all departments, tracking family enrollments, department-wise budget disbursals, pending bottlenecks, and proactive welfare saturation. 
          <em> Manual application approvals and rejections remain isolated to designated Department Review Officers and Talati Field Verifiers.</em>
        </div>
      </div>

      {/* 3. Primary State KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Registered Families */}
        <div className="bg-white p-4 border border-slate-200 border-l-4 border-l-amber-600 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase tracking-wider text-[10px]">Registered Families</span>
            <Users className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {executive_summary.total_registered_families?.toLocaleString('en-IN') || 0}
          </div>
          <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>
              <strong className="text-emerald-700">{executive_summary.permanent_families || 0}</strong> Permanent
            </span>
            <span>&bull;</span>
            <span>
              <strong className="text-amber-800">{executive_summary.provisional_families || 0}</strong> Provisional
            </span>
            <span>&bull;</span>
            <span>
              <strong>{executive_summary.total_citizens_count || 0}</strong> Citizens
            </span>
          </div>
        </div>

        {/* KPI 2: Total Disbursed Amount Department-wise */}
        <div className="bg-white p-4 border border-slate-200 border-l-4 border-l-emerald-600 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase tracking-wider text-[10px]">Total DBT Outlay Disbursed</span>
            <IndianRupee className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-emerald-800">
            {formatINR(executive_summary.total_disbursed_amount)}
          </div>
          <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>
              Across <strong>{department_wise_analysis.length}</strong> State Depts
            </span>
            <span className="font-semibold text-emerald-700">
              {executive_summary.total_disbursed_applications || 0} Families Benefited
            </span>
          </div>
        </div>

        {/* KPI 3: Pending Applications Caseload */}
        <div className="bg-white p-4 border border-slate-200 border-l-4 border-l-orange-500 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase tracking-wider text-[10px]">Pending Applications</span>
            <Clock className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-black text-orange-700">
            {executive_summary.total_pending_applications || 0}
          </div>
          <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-100">
            <span className="text-rose-700 font-bold">
              {executive_summary.delayed_sla_breaches || 0} Delayed &gt; 3 Days
            </span>
            <span>
              of {executive_summary.total_applications || 0} Total Apps
            </span>
          </div>
        </div>

        {/* KPI 4: Eligible But Not Yet Applied Gap */}
        <div className="bg-white p-4 border border-slate-200 border-l-4 border-l-indigo-600 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase tracking-wider text-[10px]">Proactive Saturation Gap</span>
            <Target className="w-4 h-4 text-indigo-700" />
          </div>
          <div className="text-2xl font-black text-indigo-900">
            {executive_summary.total_eligible_not_applied?.toLocaleString('en-IN') || 0}
          </div>
          <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-100">
            <span className="font-bold text-amber-800">
              Eligible &amp; Not Yet Applied
            </span>
            <span className="font-semibold text-slate-700">
              {executive_summary.overall_saturation_rate || 0}% Saturated
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION A: EXECUTIVE OVERVIEW (CHARTS & GRAPHS) */}
      {/* ============================================================ */}
      {(activeTab === "admin-overview" || activeTab === "dashboard") && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Department Disbursal Outlay (Bar Chart) */}
            <div className="bg-white p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-orange-600" />
                    Welfare Amount Deducted / Disbursed by Department (₹)
                  </h3>
                  <div className="text-[11px] text-slate-500">Total DBT outlay delivered per government department</div>
                </div>
              </div>

              <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 10, fill: '#475569' }} 
                      angle={-15} 
                      textAnchor="end" 
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: '#475569' }} 
                      tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} 
                    />
                    <Tooltip 
                      formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Disbursed Amount']}
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                      contentStyle={{ fontSize: '11px', borderRadius: 0, border: '1px solid #cbd5e1' }}
                    />
                    <Bar dataKey="disbursed" fill="#059669" radius={0} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Saturation Gap Analysis: Applied vs Unreached Eligible */}
            <div className="bg-white p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-700" />
                    Proactive Scheme Saturation (Top Schemes)
                  </h3>
                  <div className="text-[11px] text-slate-500">Families who applied vs eligible families not yet reached</div>
                </div>
              </div>

              <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={saturationChartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#475569' }} angle={-15} textAnchor="end" />
                    <YAxis tick={{ fontSize: 10, fill: '#475569' }} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: 0, border: '1px solid #cbd5e1' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="applied" name="Already Applied" fill="#0284c7" stackId="a" radius={0} />
                    <Bar dataKey="unappliedGap" name="Eligible Not Yet Applied" fill="#f59e0b" stackId="a" radius={0} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Quick Department Summary Cards */}
          <div className="bg-white p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-700" />
                Department Disbursal Snapshot &amp; Pending Queues
              </h3>
              <button
                onClick={() => onTabChange("admin-departments")}
                className="text-xs text-orange-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                Detailed Department Breakdown <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {department_wise_analysis.map(dept => (
                <div key={dept.dept_id} className="p-3.5 bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span className="truncate">{dept.department_name}</span>
                    <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 text-slate-700 font-bold shrink-0">
                      {dept.schemes_count} Schemes
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-500">Disbursed:</span>
                    <span className="font-mono font-black text-emerald-800 text-sm">
                      {formatINR(dept.total_disbursed_amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span>Pending Caseload: <strong className="text-orange-700">{dept.pending_applications}</strong></span>
                    <span>Gap: <strong className="text-indigo-800">{dept.eligible_not_applied}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION B: DEPARTMENT-WISE DISBURSALS & DEDUCTIONS */}
      {/* ============================================================ */}
      {activeTab === "admin-departments" && (
        <div className="bg-white p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-orange-600" />
                Department-Wise Disbursal, Outlay Deductions &amp; Pending Analysis
              </h2>
              <div className="text-xs text-slate-500">
                Cross-department audit tracking total welfare funds deducted/disbursed, pending applications, and saturation.
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <label className="text-slate-600 font-bold">Sort By:</label>
              <select
                value={deptSortField}
                onChange={e => setDeptSortField(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-none text-xs font-semibold focus:outline-hidden focus:border-orange-500"
              >
                <option value="total_disbursed_amount">Highest Disbursal Amount</option>
                <option value="pending_applications">Highest Pending Applications</option>
                <option value="saturation_rate">Highest Saturation Rate</option>
                <option value="total_applications">Total Applications Received</option>
                <option value="name">Department Name (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Department Name</th>
                  <th className="py-2.5 px-3 text-center">Active Schemes</th>
                  <th className="py-2.5 px-3 text-right">Total Applied</th>
                  <th className="py-2.5 px-3 text-right text-orange-800">Pending Review</th>
                  <th className="py-2.5 px-3 text-right text-emerald-800">Approved &amp; Disbursed</th>
                  <th className="py-2.5 px-3 text-right font-black text-emerald-900">Total Funds Disbursed</th>
                  <th className="py-2.5 px-3 text-right text-indigo-900">Eligible Not Applied</th>
                  <th className="py-2.5 px-3 text-center">Saturation</th>
                  <th className="py-2.5 px-3 text-center text-rose-800">SLA Delayed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedDepts.map(dept => (
                  <tr key={dept.dept_id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      {dept.department_name}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700">
                      {dept.schemes_count}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-800">
                      {dept.total_applications}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-orange-700">
                      {dept.pending_applications}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-700">
                      {dept.approved_applications + dept.disbursed_applications}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-emerald-900 text-sm">
                      {formatINR(dept.total_disbursed_amount)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-indigo-700">
                      {dept.eligible_not_applied}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-none border ${
                        dept.saturation_rate >= 75
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : dept.saturation_rate >= 40
                          ? "bg-amber-50 text-amber-800 border-amber-300"
                          : "bg-rose-50 text-rose-800 border-rose-300"
                      }`}>
                        {dept.saturation_rate}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {dept.delayed_count > 0 ? (
                        <span className="bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 font-bold text-[10px]">
                          {dept.delayed_count}
                        </span>
                      ) : (
                        <span className="text-slate-400">&mdash;</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION C: PENDING APPLICATIONS CASELOAD */}
      {/* ============================================================ */}
      {activeTab === "admin-pending" && (
        <div className="space-y-6">
          <div className="bg-white p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                Statewide Pending Applications &amp; Service Bottlenecks
              </h2>
              <div className="text-xs text-slate-500">
                Applications currently in Applied, Under Review, or Escalated status awaiting department officer action.
              </div>
            </div>

            {/* Stage Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-amber-50/70 border border-amber-200 text-xs space-y-1">
                <div className="font-bold text-amber-900 uppercase text-[10px]">Applied (Initial Screening)</div>
                <div className="text-xl font-black text-amber-800">
                  {proactive_gap_analysis.reduce((sum, s) => sum + (s.pending_count || 0), 0)}
                </div>
                <div className="text-slate-600 text-[11px]">Citizen submitted, pending officer eligibility check.</div>
              </div>

              <div className="p-4 bg-sky-50/70 border border-sky-200 text-xs space-y-1">
                <div className="font-bold text-sky-900 uppercase text-[10px]">Under Review (Department Level)</div>
                <div className="text-xl font-black text-sky-800">
                  {department_wise_analysis.reduce((sum, d) => sum + Math.max(0, d.pending_applications - 2), 0)}
                </div>
                <div className="text-slate-600 text-[11px]">Documents scrutinised by departmental officers.</div>
              </div>

              <div className="p-4 bg-rose-50/70 border border-rose-200 text-xs space-y-1">
                <div className="font-bold text-rose-900 uppercase text-[10px]">SLA Breaches (&gt; 3 Days Delay)</div>
                <div className="text-xl font-black text-rose-800">
                  {executive_summary.delayed_sla_breaches || 0}
                </div>
                <div className="text-slate-600 text-[11px]">Pending review exceeding state turnaround threshold.</div>
              </div>
            </div>

            {/* Delayed Applications Table */}
            <div className="pt-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Applications Exceeding Turnaround SLA (&gt; 3 Days)
              </h3>

              {delayed_bottlenecks.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 border border-slate-200 bg-slate-50">
                  No applications are currently breaching the 3-day SLA threshold across all departments!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">App ID</th>
                        <th className="py-2 px-3">Family ID</th>
                        <th className="py-2 px-3">Scheme Name</th>
                        <th className="py-2 px-3">Department</th>
                        <th className="py-2 px-3">Applied On</th>
                        <th className="py-2 px-3 text-center">Days Pending</th>
                        <th className="py-2 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {delayed_bottlenecks.map(b => (
                        <tr key={b.application_id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">#{b.application_id}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">{b.family_id}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{b.scheme_name}</td>
                          <td className="py-2.5 px-3 text-slate-600">{b.department_name}</td>
                          <td className="py-2.5 px-3 text-slate-500">{b.applied_on ? new Date(b.applied_on).toLocaleDateString('en-IN') : 'N/A'}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-rose-800">
                            {b.days_pending} Days
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-300">
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION D: ELIGIBLE BUT NOT YET APPLIED (PROACTIVE GAP) */}
      {/* ============================================================ */}
      {activeTab === "admin-gap" && (
        <div className="bg-white p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-700" />
                Algorithmic Proactive Gap Analysis: Eligible But Not Yet Applied
              </h2>
              <div className="text-xs text-slate-500">
                ParivarSetu Eligibility Engine cross-matching: Identifies households eligible under income, caste, and tags who have not yet claimed benefits.
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 text-xs">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search scheme..."
                  value={schemeSearch}
                  onChange={e => setSchemeSearch(e.target.value)}
                  className="pl-7 pr-3 py-1.5 bg-white border border-slate-300 rounded-none text-xs focus:outline-hidden focus:border-orange-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
              </div>

              <select
                value={selectedDeptFilter}
                onChange={e => setSelectedDeptFilter(e.target.value)}
                className="px-2 py-1.5 bg-white border border-slate-300 rounded-none text-xs font-semibold focus:outline-hidden focus:border-orange-500"
              >
                <option value="all">All Departments</option>
                {department_wise_analysis.map(d => (
                  <option key={d.dept_id} value={d.department_name}>{d.department_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Scheme &amp; Department</th>
                  <th className="py-2.5 px-3 text-right">Benefit Amount</th>
                  <th className="py-2.5 px-3 text-right">Eligible Families</th>
                  <th className="py-2.5 px-3 text-right text-emerald-800">Applied Count</th>
                  <th className="py-2.5 px-3 text-right font-black text-indigo-900 bg-indigo-50/50">
                    Eligible Not Applied (The Gap)
                  </th>
                  <th className="py-2.5 px-3 text-center">Saturation Rate</th>
                  <th className="py-2.5 px-3 text-right text-amber-900">Unclaimed Welfare Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSchemes.map(s => (
                  <tr key={s.scheme_id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{s.scheme_name}</div>
                      <div className="text-[10.5px] text-slate-500">{s.department_name}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                      ₹{Number(s.benefit_amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-800">
                      {s.eligible_count}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-700">
                      {s.applied_count}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-indigo-900 bg-indigo-50/30 text-sm">
                      {s.eligible_not_applied}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-none border ${
                        s.saturation_rate >= 75
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : s.saturation_rate >= 40
                          ? "bg-amber-50 text-amber-800 border-amber-300"
                          : "bg-rose-50 text-rose-800 border-rose-300"
                      }`}>
                        {s.saturation_rate}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-amber-900">
                      {formatINR(s.unclaimed_outlay)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-amber-700" />
              Proactive Governance Saturation Directive:
            </div>
            <p className="text-[11.5px] text-slate-700 leading-relaxed">
              Total <strong>{executive_summary.total_eligible_not_applied}</strong> eligible family-scheme pairings across Gujarat have not yet applied. 
              The State Administration recommends triggering localized SMS notifications and directing Talatis and Anganwadi workers to assist these households in 1-click verification.
            </p>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION E: DISTRICT SATURATION */}
      {/* ============================================================ */}
      {activeTab === "admin-districts" && (
        <div className="bg-white p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              District-Wise Registration, Caseload &amp; DBT Outlay Disbursals
            </h2>
            <div className="text-xs text-slate-500">
              Geographical distribution of registered families, active applications, and funds delivered across Gujarat.
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">District Name</th>
                  <th className="py-2.5 px-3 text-right">Registered Families</th>
                  <th className="py-2.5 px-3 text-right">Applications Received</th>
                  <th className="py-2.5 px-3 text-right text-orange-800">Pending Review</th>
                  <th className="py-2.5 px-3 text-right font-black text-emerald-900">Total Funds Disbursed (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {district_saturation.map(dist => (
                  <tr key={dist.district} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {dist.district}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-800">
                      {dist.families_count}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-800">
                      {dist.total_applications}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-orange-700">
                      {dist.pending_applications}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-emerald-800 text-sm">
                      {formatINR(dist.total_disbursed)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
