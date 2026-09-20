import React, { useState } from 'react';
import { ShieldCheck, Search, Users, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { api } from '../../services/api';

export default function FamilyRegistrationModal({ isOpen = false, onClose = () => {}, onRegistered = () => {} }) {
  const [identifier, setIdentifier] = useState("");
  const [searching, setSearching] = useState(false);
  const [lookupResult, setLookupResult] = useState(null);
  const [form, setForm] = useState({
    head_name: "",
    district: "Gandhinagar",
    income: 180000,
    category: "OBC",
    ration_card_no: "",
    aadhaar_no: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleLookup = async () => {
    if (!identifier.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const res = await api.lookupCitizen(identifier);
      if (res.found && res.data) {
        setLookupResult(res.data);
        setForm({
          head_name: res.data.head_name,
          district: res.data.district,
          income: res.data.income,
          category: res.data.category,
          ration_card_no: res.data.ration_card_no,
          aadhaar_no: identifier
        });
      } else {
        setLookupResult(null);
        setError("Not found in Gujarat PDS database. You can fill details manually.");
      }
    } catch (err) {
      setError("Lookup error: " + err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.registerFamily({
        head_name: form.head_name,
        income: parseFloat(form.income),
        category: form.category,
        district: form.district,
        ration_card_no: form.ration_card_no || null,
        aadhaar_no: form.aadhaar_no || null
      });
      alert(`Family Registered Successfully! Provisional Family ID: ${res.family_id}`);
      onRegistered(res);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-none border border-slate-300 w-full max-w-xl shadow-2xl p-6 relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-slate-900 font-black text-base border-b border-slate-200 pb-3">
          <ShieldCheck className="w-5 h-5 text-orange-600" />
          One Family &ndash; One ID Family Registration
        </div>

        {/* Step 1: Simulated Aadhaar/Ration card verification lookup */}
        <div className="mt-4 p-4 bg-amber-50/70 border border-amber-200">
          <div className="text-xs font-bold text-amber-900">
            Quick Verification via Gujarat PDS / Aadhaar Registry
          </div>
          <div className="text-[11px] text-slate-600 mt-0.5">
            Test with simulated Aadhaar (e.g. <code>987654321012</code> or <code>456789012345</code>) or Ration Card (e.g. <code>RC-GJ-7718290</code>):
          </div>
          <div className="flex gap-2 mt-2">
            <input 
              type="text"
              placeholder="Enter 12-digit Aadhaar or Ration Card number..."
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="flex-1 text-xs p-2 bg-white border border-amber-300 rounded-none focus:outline-none"
            />
            <button
              type="button"
              onClick={handleLookup}
              disabled={searching}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-none shadow-xs transition cursor-pointer"
            >
              {searching ? 'Verifying...' : 'Verify'}
            </button>
          </div>

          {lookupResult && (
            <div className="mt-2 text-xs text-emerald-800 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Verified citizen record found: {lookupResult.head_name} ({lookupResult.district}, {lookupResult.category})
            </div>
          )}
          {error && (
            <div className="mt-2 text-xs text-rose-700 flex items-center gap-1 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Step 2: Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Head of Family</label>
              <input 
                type="text" 
                required 
                value={form.head_name} 
                onChange={(e) => setForm({...form, head_name: e.target.value})} 
                className="w-full p-2 border border-slate-300 rounded-none" 
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">District</label>
              <input 
                type="text" 
                required 
                value={form.district} 
                onChange={(e) => setForm({...form, district: e.target.value})} 
                className="w-full p-2 border border-slate-300 rounded-none" 
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Annual Income (₹)</label>
              <input 
                type="number" 
                required 
                value={form.income} 
                onChange={(e) => setForm({...form, income: e.target.value})} 
                className="w-full p-2 border border-slate-300 rounded-none" 
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Social Category</label>
              <select 
                value={form.category} 
                onChange={(e) => setForm({...form, category: e.target.value})} 
                className="w-full p-2 border border-slate-300 rounded-none font-semibold"
              >
                <option value="BPL">BPL</option>
                <option value="SEBC">SEBC / OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="General">General</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Ration Card Number</label>
              <input 
                type="text" 
                value={form.ration_card_no} 
                onChange={(e) => setForm({...form, ration_card_no: e.target.value})} 
                placeholder="RC-GJ-..." 
                className="w-full p-2 border border-slate-300 rounded-none" 
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Aadhaar (Will be Masked)</label>
              <input 
                type="text" 
                value={form.aadhaar_no} 
                onChange={(e) => setForm({...form, aadhaar_no: e.target.value})} 
                placeholder="12 digits" 
                className="w-full p-2 border border-slate-300 rounded-none" 
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs border border-slate-300 text-slate-600 rounded-none hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-orange-700 hover:bg-orange-800 rounded-none shadow-xs transition cursor-pointer"
            >
              {submitting ? 'Registering...' : 'Register Family (Provisional)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
