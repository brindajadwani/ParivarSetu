import React, { useState, useEffect } from 'react';
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
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  IndianRupee, 
  Users, 
  Clock,
  Layers,
  Building2
} from 'lucide-react';
import { api } from '../../services/api';

const STATUS_COLORS = {
  "Applied": "#f59e0b",
  "Under Review": "#0284c7",
  "Approved": "#10b981",
  "Disbursed": "#059669",
  "Rejected": "#64748b",
  "Escalated": "#e11d48"
};

const PIE_COLORS = ["#0284c7", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899"];

export default function AnalyticsDashboard({ token = null, departmentName = "All Departments" }) {
  const [summary, setSummary] = useState(null);
  const [schemeData, setSchemeData] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [delayedApps, setDelayedApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [sum, sch, dst, dly] = await Promise.all([
          api.getAnalyticsSummary(token),
          api.getAnalyticsByScheme(token),
          api.getAnalyticsByDistrict(token),
          api.getDelayedApplications(token)
        ]);
        setSummary(sum);
        setSchemeData(sch);
        setDistrictData(dst);
        setDelayedApps(dly);
      } catch (err) {
        console.error("Analytics load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="p-10 text-center text-xs font-bold text-slate-500 bg-white border border-slate-200">
        Loading real-time governance analytics...
      </div>
    );
  }

  // Prep Status Bar Data
  const statusBarData = summary?.applications_by_status 
    ? Object.entries(summary.applications_by_status).map(([status, count]) => ({
        status,
        count,
        fill: STATUS_COLORS[status] || "#94a3b8"
      }))
    : [];

  // Prep Scheme Disbursals for Pie chart
  const schemePieData = schemeData.filter(s => s.total_disbursed_amount > 0).map(s => ({
    name: s.scheme_name,
    value: s.total_disbursed_amount
  }));

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="bg-white rounded-none p-5 border border-slate-200 border-t-3 border-t-slate-900 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Governance Intelligence Dashboard
          </span>
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            ParivarSetu Analytics & DBT Reporting ({summary?.department_name || departmentName})
          </h2>
        </div>
        <div className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 border border-slate-200">
          Last Updated: <strong className="text-slate-900">{new Date().toLocaleDateString()}</strong>
        </div>
      </div>

      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-none p-4.5 border border-slate-200 border-t-3 border-t-sky-600 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Statewide Families</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {summary?.total_families || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Registered in One Family &ndash; One ID
          </div>
        </div>

        <div className="bg-white rounded-none p-4.5 border border-slate-200 border-t-3 border-t-emerald-600 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Disbursed (DBT)</div>
          <div className="text-2xl font-black text-emerald-800 mt-1">
            ₹{summary?.total_disbursed_amount?.toLocaleString('en-IN') || "0"}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Directly transferred to citizen accounts
          </div>
        </div>

        <div className="bg-white rounded-none p-4.5 border border-slate-200 border-t-3 border-t-amber-600 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Open Grievances</div>
          <div className="text-2xl font-black text-amber-800 mt-1">
            {summary?.open_complaints || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Awaiting officer resolution remarks
          </div>
        </div>

        {/* Delayed Applications Card (Critical SLA) */}
        <div className={`bg-white rounded-none p-4.5 border shadow-xs border-t-3 ${
          (summary?.delayed_applications || 0) > 0 
            ? 'border-rose-300 border-t-rose-600 bg-rose-50/30' 
            : 'border-slate-200 border-t-slate-400'
        }`}>
          <div className="text-[11px] font-semibold text-rose-800 uppercase flex items-center justify-between">
            <span>Delayed Apps (&gt;3 Days)</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-900 mt-1">
            {summary?.delayed_applications || 0}
          </div>
          <div className="text-[11px] text-rose-700 mt-1 font-medium">
            Exceeding citizen service charter SLA
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Application Funnel Breakdown (Bar Chart) */}
        <div className="bg-white rounded-none p-5 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Applications by State Transition Status
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">
            Monitoring active workload through the strict 5-stage lifecycle.
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusBarData}>
                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#ea580c" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Scheme Disbursals Distribution (Pie Chart) */}
        <div className="bg-white rounded-none p-5 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Welfare Fund Disbursals by Scheme
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">
            Proportional DBT allocation across flagship government programs.
          </p>
          <div className="h-64">
            {schemePieData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No funds disbursed yet for this department view.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={schemePieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name.substring(0, 15)}... (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {schemePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* District Distribution Table */}
      <div className="bg-white rounded-none p-5 border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          District-Wise Outreach & Disbursal Performance (Gujarat)
        </h3>
        <p className="text-[11px] text-slate-500 mb-4">
          Tracking coverage across urban, semi-urban, and tribal districts.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">District</th>
                <th className="py-2.5 px-4">Registered Families</th>
                <th className="py-2.5 px-4">Total DBT Disbursed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {districtData.slice(0, 8).map((d) => (
                <tr key={d.district} className="hover:bg-slate-50">
                  <td className="py-2 px-4 font-semibold text-slate-900">{d.district}</td>
                  <td className="py-2 px-4 text-slate-700 font-mono">{d.families_count}</td>
                  <td className="py-2 px-4 font-bold text-emerald-800 font-mono">
                    ₹{d.total_disbursed.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
