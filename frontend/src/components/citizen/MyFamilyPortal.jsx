import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Plus, 
  CreditCard, 
  Building2, 
  MapPin, 
  Home, 
  Check, 
  Copy, 
  Printer, 
  UserPlus, 
  AlertCircle,
  Briefcase,
  GraduationCap,
  HeartPulse,
  Tag
} from 'lucide-react';
import { api } from '../../services/api';

export default function MyFamilyPortal({ familyId = "GJ12345678", token = null }) {
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Modals
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    age: '',
    gender: 'Female',
    relation: 'child',
    occupation: 'Student'
  });
  const [addingMember, setAddingMember] = useState(false);

  // Bank Modal
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankForm, setBankForm] = useState({
    bank_name: '',
    account_number: '',
    ifsc: '',
    account_holder: ''
  });
  const [updatingBank, setUpdatingBank] = useState(false);

  // Health/Education modal
  const [showTagModal, setShowTagModal] = useState(false);
  const [tagForm, setTagForm] = useState({
    type: 'health', // health, education, business
    condition_tags: '',
    current_class: '12th Standard',
    school_or_college: 'Gujarat Arts & Science College',
    business_name: 'Priya Handicrafts',
    business_type: 'startup'
  });
  const [updatingTag, setUpdatingTag] = useState(false);

  const loadFamily = async () => {
    setLoading(true);
    try {
      const data = await api.getFamily(familyId);
      setFamily(data);
      if (data.bank_info) {
        setBankForm({
          bank_name: data.bank_info.bank_name || '',
          account_number: '',
          ifsc: data.bank_info.ifsc || '',
          account_holder: data.bank_info.account_holder || ''
        });
      }
    } catch (err) {
      console.error("Failed to load family:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (familyId) {
      loadFamily();
    }
  }, [familyId]);

  const handleCopyFamilyId = () => {
    if (!family) return;
    navigator.clipboard.writeText(family.family_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.name.trim() || !newMember.age) {
      alert("Please provide member name and age.");
      return;
    }
    setAddingMember(true);
    try {
      await api.addFamilyMember(familyId, {
        name: newMember.name,
        age: parseInt(newMember.age),
        gender: newMember.gender,
        relation: newMember.relation,
        occupation: newMember.occupation
      }, token);
      alert("Family member added successfully! Tags and eligibility re-evaluated.");
      setShowAddMemberModal(false);
      setNewMember({ name: '', age: '', gender: 'Female', relation: 'child', occupation: 'Student' });
      loadFamily();
    } catch (err) {
      alert("Failed to add member: " + err.message);
    } finally {
      setAddingMember(false);
    }
  };

  const handleUpdateBank = async (e) => {
    e.preventDefault();
    if (!bankForm.account_number || !bankForm.ifsc || !bankForm.bank_name || !bankForm.account_holder) {
      alert("Please fill in all bank details.");
      return;
    }
    setUpdatingBank(true);
    try {
      await api.updateBankInfo(familyId, bankForm, token);
      alert("Bank account details updated and encrypted successfully!");
      setShowBankModal(false);
      loadFamily();
    } catch (err) {
      alert("Failed to update bank details: " + err.message);
    } finally {
      setUpdatingBank(false);
    }
  };

  const handleUpdateTags = async (e) => {
    e.preventDefault();
    setUpdatingTag(true);
    try {
      if (tagForm.type === 'health') {
        const tags = tagForm.condition_tags.split(',').map(t => t.trim()).filter(Boolean);
        await api.updateHealthInfo(familyId, { condition_tags: tags, bpl_health_card: true }, token);
      } else if (tagForm.type === 'education') {
        await api.updateEducationInfo(familyId, {
          current_class: tagForm.current_class,
          school_or_college: tagForm.school_or_college,
          enrollment_status: 'enrolled',
          last_percentage: 84.5
        }, token);
      } else if (tagForm.type === 'business') {
        await api.updateBusinessInfo(familyId, {
          business_name: tagForm.business_name,
          business_type: tagForm.business_type,
          registration_status: 'registered',
          annual_turnover: 350000
        }, token);
      }
      alert("Profile info updated! Generic Eligibility Engine has synchronized family tags.");
      setShowTagModal(false);
      loadFamily();
    } catch (err) {
      alert("Update failed: " + err.message);
    } finally {
      setUpdatingTag(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-slate-500 font-medium">
        Loading official Gujarat Parivar records for {familyId}...
      </div>
    );
  }

  if (!family) {
    return (
      <div className="p-8 text-center text-xs text-rose-600 bg-white border border-rose-200">
        Family record not found. Please verify your Family ID or register.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Official Header & Gujarat Emblem */}
      <div className="bg-white rounded-none p-5 border border-slate-200 border-t-3 border-t-orange-600 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-none bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-900 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              ગુજરાત સરકાર &bull; એક પરિવાર &ndash; એક ઓળખ
            </div>
            <h1 className="text-lg font-black text-slate-900 leading-tight">
              My Family Profile &amp; Parivar ID (પરિવાર વિગત)
            </h1>
            <div className="text-xs text-slate-600 mt-0.5">
              Head of Household: <strong>{family.head_name}</strong> &bull; District: <strong>{family.district || "Gandhinagar"}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300 rounded-none shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            Print Parivar Card
          </button>
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="px-3 py-1.5 bg-orange-700 hover:bg-orange-800 text-white text-xs font-bold rounded-none shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Member
          </button>
        </div>
      </div>

      {/* 2. Official Gujarat Parivar Digital ID Certificate */}
      <div className="bg-gradient-to-r from-amber-50/70 via-white to-orange-50/50 rounded-none border-2 border-amber-500/40 p-6 shadow-xs relative overflow-hidden">
        {/* Background Gujarat watermark */}
        <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none">
          <div className="text-9xl font-black text-amber-900 select-none">GJ</div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-amber-200/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-amber-900 text-amber-50 flex items-center justify-center font-black text-base border border-amber-700">
              GJ
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">
                Government of Gujarat &bull; ParivarSetu Authority
              </div>
              <div className="text-xl font-black text-slate-900 tracking-tight font-mono flex items-center gap-2">
                {family.family_id}
                <button 
                  onClick={handleCopyFamilyId}
                  className="text-xs text-slate-400 hover:text-slate-800 cursor-pointer p-1"
                  title="Copy Parivar ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              {family.status === "permanent" ? "Verified & Permanent" : "Provisional Registration"}
            </span>
          </div>
        </div>

        {/* Certificate metadata grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">Head of Household</div>
            <div className="font-bold text-slate-900 mt-0.5 text-sm">{family.head_name}</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">Socio-Economic Category</div>
            <div className="font-bold text-slate-900 mt-0.5">
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold border border-amber-300">
                {family.category || "General"}
              </span>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">Annual Family Income</div>
            <div className="font-bold text-slate-900 mt-0.5">
              ₹{family.income?.toLocaleString('en-IN') || "0"} / yr
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">District &amp; Jurisdiction</div>
            <div className="font-bold text-slate-900 mt-0.5">{family.district || "Gandhinagar"}</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">Gujarat Ration Card No.</div>
            <div className="font-mono text-slate-800 font-semibold mt-0.5">{family.ration_card_no || "N/A"}</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">Masked Aadhaar Reference</div>
            <div className="font-mono text-slate-800 font-semibold mt-0.5">{family.aadhaar_ref_masked || "XXXX-XXXX-1234"}</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">Enrolled Members</div>
            <div className="font-bold text-slate-900 mt-0.5">{family.members?.length || 1} Persons</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">Direct Benefit Transfer</div>
            <div className="font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" /> Aadhaar-DBT Linked
            </div>
          </div>
        </div>
      </div>

      {/* 3. Two Column Layout: Members Roster + Bank & Tag Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Family Members Table (7 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-none p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-700" />
                <h2 className="text-sm font-bold text-slate-900">
                  Registered Family Members ({family.members?.length || 0})
                </h2>
              </div>
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="text-xs font-bold text-orange-700 hover:text-orange-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Member
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Member Name</th>
                    <th className="py-2.5 px-3">Relation</th>
                    <th className="py-2.5 px-3">Age / Gender</th>
                    <th className="py-2.5 px-3">Occupation</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {family.members && family.members.map((m, idx) => (
                    <tr key={m.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {m.name}
                        {m.relation?.toLowerCase() === 'head' && (
                          <span className="ml-2 text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                            Head
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 capitalize text-slate-700 font-medium">
                        {m.relation}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {m.age} yrs &bull; {m.gender}
                      </td>
                      <td className="py-3 px-3 text-slate-800">
                        {m.occupation || "Dependent"}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tag & Criteria Engine Profile Card */}
          <div className="bg-white rounded-none p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-700" />
                <h2 className="text-sm font-bold text-slate-900">
                  Socio-Economic &amp; Scheme Eligibility Tags
                </h2>
              </div>
              <button
                onClick={() => setShowTagModal(true)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Update Tags
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              The generic eligibility engine evaluates these synchronized attributes in real-time across health, education, and MSME welfare criteria:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                  <HeartPulse className="w-3 h-3 text-rose-600" /> Health Tags
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {family.health_tags && family.health_tags.length > 0 ? (
                    family.health_tags.map(t => (
                      <span key={t} className="px-1.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-300">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-[11px] italic">BPL Health Card Qualified</span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-sky-600" /> Education Tags
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {family.education_tags && family.education_tags.length > 0 ? (
                    family.education_tags.map(t => (
                      <span key={t} className="px-1.5 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-bold border border-sky-300">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-[11px] italic">No active education tags</span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-amber-600" /> Business &amp; MSME
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {family.business_tags && family.business_tags.length > 0 ? (
                    family.business_tags.map(t => (
                      <span key={t} className="px-1.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-[11px] italic">Handicraft Startup Eligible</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Bank & DBT Info Card (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-none p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-700" />
                <h2 className="text-sm font-bold text-slate-900">
                  Bank &amp; DBT Disbursal Account
                </h2>
              </div>
              <button
                onClick={() => setShowBankModal(true)}
                className="text-xs font-bold text-orange-700 hover:text-orange-800 cursor-pointer"
              >
                Update
              </button>
            </div>

            {family.bank_info ? (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-none space-y-2">
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Bank Name</div>
                    <div className="font-bold text-slate-900 mt-0.5">{family.bank_info.bank_name}</div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Account Holder</div>
                    <div className="font-semibold text-slate-800">{family.bank_info.account_holder}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Masked Account</div>
                      <div className="font-mono font-bold text-slate-900">{family.bank_info.account_number_masked}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase">IFSC Code</div>
                      <div className="font-mono font-bold text-slate-900">{family.bank_info.ifsc}</div>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-emerald-800 text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Direct Benefit Transfer (DBT) Active</strong>
                    <div>Direct credit enabled for all approved Gujarat government cash subsidies.</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-dashed border-slate-300 text-center">
                <div className="text-xs text-slate-600 font-medium">No bank account registered.</div>
                <button
                  onClick={() => setShowBankModal(true)}
                  className="mt-2 px-3 py-1 bg-orange-700 text-white text-xs font-bold rounded-none cursor-pointer"
                >
                  Link Bank Account
                </button>
              </div>
            )}
          </div>

          {/* Quick Help / Verification Status Card */}
          <div className="bg-white rounded-none p-5 border border-slate-200 shadow-xs text-xs space-y-3">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">
              Verification &amp; Portability Notice
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Your Parivar ID <strong>{family.family_id}</strong> is officially verified across all 33 Gujarat districts under the Gujarat State Family Registry.
            </p>
            <div className="text-slate-500 text-[11px] leading-relaxed">
              To update household address or modify the registered head of household, contact your local Talati-cum-Mantri or Gram Panchayat office.
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Add Family Member */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <form onSubmit={handleAddMember} className="bg-white rounded-none border border-slate-300 w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-orange-700" />
                Add Family Member
              </h3>
              <button 
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Sharma"
                  value={newMember.name}
                  onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-none focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="120"
                    placeholder="e.g. 19"
                    value={newMember.age}
                    onChange={e => setNewMember({ ...newMember, age: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-none focus:outline-hidden focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={newMember.gender}
                    onChange={e => setNewMember({ ...newMember, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-none focus:outline-hidden focus:border-orange-500"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Relation to Head</label>
                  <select
                    value={newMember.relation}
                    onChange={e => setNewMember({ ...newMember, relation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-none focus:outline-hidden focus:border-orange-500"
                  >
                    <option value="spouse">Spouse</option>
                    <option value="child">Child</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="other">Other Relative</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Occupation</label>
                  <input
                    type="text"
                    placeholder="e.g. Student / Homemaker"
                    value={newMember.occupation}
                    onChange={e => setNewMember({ ...newMember, occupation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-none focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                className="px-4 py-1.5 text-xs text-slate-700 font-bold border border-slate-300 rounded-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addingMember}
                className="px-4 py-1.5 text-xs bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-none cursor-pointer shadow-xs"
              >
                {addingMember ? "Saving..." : "Save Member"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Update Bank Details */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <form onSubmit={handleUpdateBank} className="bg-white rounded-none border border-slate-300 w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-orange-700" />
                Update Bank &amp; DBT Account
              </h3>
              <button 
                type="button"
                onClick={() => setShowBankModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. State Bank of India"
                  value={bankForm.bank_name}
                  onChange={e => setBankForm({ ...bankForm, bank_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-none focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Holder Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={bankForm.account_holder}
                  onChange={e => setBankForm({ ...bankForm, account_holder: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-none focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bank Account Number</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter account number"
                    value={bankForm.account_number}
                    onChange={e => setBankForm({ ...bankForm, account_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-none focus:outline-hidden focus:border-orange-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SBIN0001234"
                    value={bankForm.ifsc}
                    onChange={e => setBankForm({ ...bankForm, ifsc: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-none focus:outline-hidden focus:border-orange-500 uppercase font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBankModal(false)}
                className="px-4 py-1.5 text-xs text-slate-700 font-bold border border-slate-300 rounded-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatingBank}
                className="px-4 py-1.5 text-xs bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-none cursor-pointer shadow-xs"
              >
                {updatingBank ? "Saving..." : "Save Bank Info"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Update Tags */}
      {showTagModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <form onSubmit={handleUpdateTags} className="bg-white rounded-none border border-slate-300 w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-emerald-700" />
                Update Eligibility Tags
              </h3>
              <button 
                type="button"
                onClick={() => setShowTagModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tag Category</label>
                <select
                  value={tagForm.type}
                  onChange={e => setTagForm({ ...tagForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-none focus:outline-hidden focus:border-emerald-600"
                >
                  <option value="health">Health &amp; Medical Condition</option>
                  <option value="education">Education &amp; Student Enrollment</option>
                  <option value="business">MSME &amp; Business Enterprise</option>
                </select>
              </div>

              {tagForm.type === 'health' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Condition Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. pregnant, chronic_illness, disability"
                    value={tagForm.condition_tags}
                    onChange={e => setTagForm({ ...tagForm, condition_tags: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-none focus:outline-hidden focus:border-emerald-600"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Tags are matched by the generic engine for MA Amrutam / PMJAY.
                  </span>
                </div>
              )}

              {tagForm.type === 'education' && (
                <div className="space-y-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Current Class / Course</label>
                    <input
                      type="text"
                      value={tagForm.current_class}
                      onChange={e => setTagForm({ ...tagForm, current_class: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-none focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">School / College Name</label>
                    <input
                      type="text"
                      value={tagForm.school_or_college}
                      onChange={e => setTagForm({ ...tagForm, school_or_college: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-none focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>
                </div>
              )}

              {tagForm.type === 'business' && (
                <div className="space-y-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Business / Enterprise Name</label>
                    <input
                      type="text"
                      value={tagForm.business_name}
                      onChange={e => setTagForm({ ...tagForm, business_name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-none focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Business Type</label>
                    <select
                      value={tagForm.business_type}
                      onChange={e => setTagForm({ ...tagForm, business_type: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-none focus:outline-hidden focus:border-emerald-600"
                    >
                      <option value="startup">Startup</option>
                      <option value="MSME">MSME</option>
                      <option value="handicraft">Handicraft &amp; Artisan</option>
                      <option value="small_business">Small Retail Business</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowTagModal(false)}
                className="px-4 py-1.5 text-xs text-slate-700 font-bold border border-slate-300 rounded-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatingTag}
                className="px-4 py-1.5 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-none cursor-pointer shadow-xs"
              >
                {updatingTag ? "Updating..." : "Save Tags"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
