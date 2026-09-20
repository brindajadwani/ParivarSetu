import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  ShieldAlert, 
  Send,
  Building2,
  Receipt
} from 'lucide-react';

const STAGES = ["Notified", "Applied", "Under Review", "Approved", "Disbursed"];

export default function ApplicationTracker({ 
  applications = [], 
  onRaiseGrievance = () => {} 
}) {
  const [selectedAppForGrievance, setSelectedAppForGrievance] = useState(null);
  const [grievanceText, setGrievanceText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(null);

  const getStageIndex = (status) => {
    if (status === "Escalated") return 2; // Under review stage with alert
    if (status === "Rejected") return 2;
    return STAGES.indexOf(status);
  };

  const handleSubmitGrievance = async (e) => {
    e.preventDefault();
    if (!grievanceText.trim()) return;
    setSubmitting(true);
    try {
      await onRaiseGrievance(selectedAppForGrievance.id, grievanceText);
      setSubmittedSuccess(selectedAppForGrievance.id);
      setGrievanceText("");
      setSelectedAppForGrievance(null);
    } catch (err) {
      alert("Failed to submit grievance: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white rounded-none p-5 border border-slate-200 border-t-3 border-t-orange-600 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-600" />
            My Scheme Applications & Benefit Tracker
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 font-medium">
            Real-time Direct Benefit Transfer (DBT) lifecycle tracking across Government of Gujarat welfare departments.
          </p>
        </div>
        <div className="text-xs text-slate-600 bg-slate-50 px-3 py-1.5 border border-slate-200 font-semibold">
          Active Applications: <span className="font-bold text-slate-900">{applications.length}</span>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="bg-white rounded-none p-10 border border-slate-200 text-center text-slate-500 text-xs font-medium">
            No applications submitted yet. Browse the Schemes catalog to apply for eligible welfare schemes.
          </div>
        ) : (
          applications.map((app) => {
            const currentStageIdx = getStageIndex(app.status);
            const isEscalated = app.status === "Escalated";
            const isRejected = app.status === "Rejected";
            const isDisbursed = app.status === "Disbursed";

            return (
              <div 
                key={app.id} 
                className="bg-white rounded-none border border-slate-200 shadow-xs overflow-hidden"
              >
                {/* Application Header Bar */}
                <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        App #{app.id}
                      </span>
                      <span className="text-xs text-slate-300">&bull;</span>
                      <h3 className="text-sm font-black text-slate-900">
                        {app.scheme_name || `Scheme #${app.scheme_id}`}
                      </h3>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-3">
                      <span>Family ID: <strong className="text-slate-700">{app.family_id}</strong></span>
                      {app.applied_on && (
                        <span>Applied: <strong className="text-slate-700">{new Date(app.applied_on).toLocaleDateString()}</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge & Action */}
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-none text-[11px] font-black uppercase tracking-wider border ${
                      isDisbursed ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                      isEscalated ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse' :
                      isRejected ? 'bg-slate-200 text-slate-800 border-slate-400' :
                      app.status === 'Approved' ? 'bg-sky-100 text-sky-800 border-sky-300' :
                      'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {app.status}
                    </span>

                    {/* Disbursal DBT details chip */}
                    {isDisbursed && app.txn_id && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-300 text-[10px] font-mono font-bold">
                        <Receipt className="w-3 h-3 text-emerald-700" />
                        {app.txn_id} (₹{app.disbursed_amount?.toLocaleString('en-IN')})
                      </span>
                    )}

                    {/* Raise Grievance button */}
                    {!isDisbursed && !isRejected && (
                      <button
                        onClick={() => setSelectedAppForGrievance(selectedAppForGrievance?.id === app.id ? null : app)}
                        className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 transition cursor-pointer flex items-center gap-1"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        {selectedAppForGrievance?.id === app.id ? 'Cancel' : 'Raise Grievance'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Visual Pipeline Bar */}
                <div className="p-5">
                  <div className="relative">
                    {/* Connecting Bar */}
                    <div className="absolute top-4 left-6 right-6 h-1 bg-slate-200 -z-0 hidden sm:block" />
                    
                    {/* Progress Bar Active */}
                    <div 
                      className={`absolute top-4 left-6 h-1 transition-all duration-500 -z-0 hidden sm:block ${
                        isRejected ? 'bg-slate-400' : isEscalated ? 'bg-rose-500' : 'bg-orange-600'
                      }`}
                      style={{ 
                        width: `${Math.max(0, (currentStageIdx / (STAGES.length - 1)) * 100)}%` 
                      }} 
                    />

                    {/* Stage Nodes */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-0 relative z-10">
                      {STAGES.map((stage, idx) => {
                        const isPast = idx < currentStageIdx;
                        const isCurrent = idx === currentStageIdx;
                        const isNext = idx > currentStageIdx;

                        return (
                          <div key={stage} className="flex sm:flex-col items-center gap-3 sm:gap-2">
                            {/* Node Circle/Box */}
                            <div className={`w-8 h-8 rounded-none border-2 flex items-center justify-center font-bold text-xs transition shrink-0 ${
                              isCurrent
                                ? isEscalated 
                                  ? 'bg-rose-600 border-rose-700 text-white shadow-xs'
                                  : isRejected
                                  ? 'bg-slate-600 border-slate-700 text-white'
                                  : 'bg-orange-600 border-orange-700 text-white shadow-xs'
                                : isPast
                                ? 'bg-emerald-600 border-emerald-700 text-white'
                                : 'bg-white border-slate-300 text-slate-400'
                            }`}>
                              {isPast ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : isCurrent && isEscalated ? (
                                <AlertCircle className="w-4 h-4 animate-bounce" />
                              ) : (
                                idx + 1
                              )}
                            </div>

                            {/* Label */}
                            <div className="text-left sm:text-center">
                              <div className={`text-xs font-bold ${
                                isCurrent ? 'text-slate-900 font-black' : isPast ? 'text-slate-800' : 'text-slate-400'
                              }`}>
                                {isCurrent && isEscalated ? 'Escalated' : stage}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {isPast ? 'Completed' : isCurrent ? 'Active Stage' : 'Upcoming'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Grievance Submission Drawer */}
                  {selectedAppForGrievance?.id === app.id && (
                    <form 
                      onSubmit={handleSubmitGrievance}
                      className="mt-5 p-4 bg-rose-50/70 border border-rose-200 space-y-3"
                    >
                      <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                        Lodge Grievance for Application #{app.id}
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">
                        Submitting a grievance flags this application as <strong>Escalated</strong> on the Department Officer&apos;s desk and requires mandatory written resolution remarks.
                      </p>
                      <textarea
                        required
                        rows={2}
                        value={grievanceText}
                        onChange={(e) => setGrievanceText(e.target.value)}
                        placeholder="Detail your delay, verification query, or disbursal issue..."
                        className="w-full text-xs p-2.5 bg-white border border-rose-300 focus:outline-none focus:border-rose-600 rounded-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedAppForGrievance(null)}
                          className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 border border-slate-300 rounded-none cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-4 py-1.5 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-none shadow-xs transition cursor-pointer flex items-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {submitting ? 'Submitting...' : 'Submit Grievance'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
