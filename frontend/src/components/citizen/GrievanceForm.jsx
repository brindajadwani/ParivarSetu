import React, { useState } from 'react';
import { MessageSquare, ShieldAlert, CheckCircle2, Clock, Send, ChevronDown } from 'lucide-react';

export default function GrievanceForm({ 
  complaints = [], 
  applications = [],
  onRaiseGrievance = () => {} 
}) {
  const [selectedAppId, setSelectedAppId] = useState(applications[0]?.id || "");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedAppId) return;
    setSubmitting(true);
    try {
      await onRaiseGrievance(Number(selectedAppId), message);
      setMessage("");
      alert("Grievance registered successfully! Your application status has been escalated for officer review.");
    } catch (err) {
      alert("Error filing grievance: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Lodge Grievance Form */}
      <div className="bg-white rounded-none p-5 border border-slate-200 border-t-3 border-t-rose-600 shadow-xs">
        <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          Public Grievance Redressal Desk (CGRS)
        </h2>
        <p className="text-xs text-slate-600 mt-1 font-medium">
          Have an application delayed, document rejected unfairly, or pending verification? Lodge an official complaint directly to the assigned Department Officer.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Select Active Application
              </label>
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 focus:outline-none focus:border-rose-600 rounded-none font-semibold text-slate-800"
                required
              >
                {applications.map(app => (
                  <option key={app.id} value={app.id}>
                    App #{app.id} - {app.scheme_name || `Scheme #${app.scheme_id}`} ({app.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Grievance Description
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="State clearly the reason for grievance (e.g., pending review > 5 days, lack of officer response)..."
              className="w-full text-xs p-3 bg-white border border-slate-300 focus:outline-none focus:border-rose-600 rounded-none font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || applications.length === 0}
            className="px-5 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-none shadow-xs transition flex items-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Registering Grievance...' : 'Submit Official Grievance'}
          </button>
        </form>
      </div>

      {/* Grievance History */}
      <div className="bg-white rounded-none p-5 border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>My Grievance Redressal Records</span>
          <span className="text-xs text-slate-500 font-semibold">Total: {complaints.length}</span>
        </h3>

        {complaints.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 font-medium">
            No grievances lodged. All applications are proceeding on schedule.
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map(c => {
              const isResolved = c.status === "Resolved";
              return (
                <div 
                  key={c.id}
                  className={`p-4 border rounded-none ${
                    isResolved ? 'bg-slate-50/70 border-slate-200' : 'bg-rose-50/50 border-rose-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">
                          Grievance #{c.id}
                        </span>
                        <span className="text-slate-300">&bull;</span>
                        <span className="text-xs font-semibold text-slate-700">
                          Application #{c.application_id} {c.scheme_name && `(${c.scheme_name})`}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Filed: {c.created_at ? new Date(c.created_at).toLocaleString() : 'Recent'}
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-none border ${
                      isResolved 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 font-medium mt-2.5">
                    <strong>Complaint:</strong> {c.message}
                  </p>

                  {/* Officer Response */}
                  {c.officer_response && (
                    <div className="mt-3 p-3 bg-white border border-emerald-200 text-xs text-emerald-950">
                      <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Officer Redressal Remarks:
                      </div>
                      <div className="font-medium">{c.officer_response}</div>
                      {c.resolved_at && (
                        <div className="text-[10px] text-slate-400 mt-1">
                          Resolved on: {new Date(c.resolved_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
