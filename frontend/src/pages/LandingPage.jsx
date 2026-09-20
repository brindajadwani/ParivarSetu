import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Building2, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  Lock, 
  CreditCard, 
  HeartPulse, 
  GraduationCap, 
  Briefcase, 
  Home, 
  HelpCircle, 
  UserCheck, 
  ChevronRight,
  Sparkles,
  Award,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { PRESET_PROFILES } from '../components/layout/Header';
import { api } from '../services/api';

export default function LandingPage({
  onSelectProfile = () => {},
  onOpenRegisterModal = () => {}
}) {
  const [showOfficerModal, setShowOfficerModal] = useState(false);
  const [showCitizenModal, setShowCitizenModal] = useState(false);

  // Officer Login Form State
  const [officerEmail, setOfficerEmail] = useState('');
  const [officerPassword, setOfficerPassword] = useState('');
  const [showOfficerPassword, setShowOfficerPassword] = useState(false);
  const [officerLoading, setOfficerLoading] = useState(false);
  const [officerError, setOfficerError] = useState(null);

  // Citizen Login Form State
  const [citizenEmail, setCitizenEmail] = useState('');
  const [citizenPassword, setCitizenPassword] = useState('');
  const [showCitizenPassword, setShowCitizenPassword] = useState(false);
  const [citizenLoading, setCitizenLoading] = useState(false);
  const [citizenError, setCitizenError] = useState(null);

  const handleOfficerLogin = async (e) => {
    e.preventDefault();
    setOfficerLoading(true);
    setOfficerError(null);
    try {
      const res = await api.login(officerEmail, officerPassword);
      const matchedProfile = PRESET_PROFILES.find(p => p.email.toLowerCase() === officerEmail.toLowerCase());
      if (matchedProfile) {
        onSelectProfile(matchedProfile);
      } else {
        const profile = {
          name: res.name || (res.role === 'admin' ? "Shri Rajesh Kumar, IAS" : officerEmail.split('@')[0]),
          role: res.role === 'verifier' ? 'Verifier' : res.role === 'admin' ? 'Admin' : 'Officer',
          email: officerEmail,
          dept_id: res.dept_id,
          family_id: res.family_id,
          department_name: res.department_name || (res.role === 'admin' ? "State Administration (GOG)" : res.dept_id === 6 ? "Health & Family Welfare" : res.dept_id === 7 ? "Education Department" : "Industries & MSME")
        };
        onSelectProfile(profile);
      }
      setShowOfficerModal(false);
    } catch (err) {
      setOfficerError(err.message || "Invalid credentials. Please check official email and password.");
    } finally {
      setOfficerLoading(false);
    }
  };

  const handleCitizenLogin = async (e) => {
    e.preventDefault();
    setCitizenLoading(true);
    setCitizenError(null);
    try {
      const res = await api.login(citizenEmail, citizenPassword);
      const matchedProfile = PRESET_PROFILES.find(p => p.email.toLowerCase() === citizenEmail.toLowerCase());
      if (matchedProfile) {
        onSelectProfile(matchedProfile);
      } else {
        const profile = {
          name: res.name || citizenEmail.split('@')[0],
          role: 'Citizen',
          email: citizenEmail,
          family_id: res.family_id || "GJ12345678"
        };
        onSelectProfile(profile);
      }
      setShowCitizenModal(false);
    } catch (err) {
      setCitizenError(err.message || "Invalid credentials. Please check citizen email and password.");
    } finally {
      setCitizenLoading(false);
    }
  };

  const fillOfficerCredentials = (email, password) => {
    setOfficerEmail(email);
    setOfficerPassword(password);
    setOfficerError(null);
  };

  const fillCitizenCredentials = (email, password) => {
    setCitizenEmail(email);
    setCitizenPassword(password);
    setCitizenError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. Official Government Header Strip */}
      <div className="bg-[#0B2545] text-white text-[11px] px-6 py-1.5 flex items-center justify-between border-b border-orange-500">
        <div className="flex items-center space-x-3">
          <span className="font-bold">ગુજરાત સરકાર &bull; Government of Gujarat</span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:inline text-slate-300">National Informatics Centre (NIC) Portal Standard</span>
        </div>
        <div className="flex items-center space-x-4 text-[10px]">
          <span className="text-orange-400 font-bold">Helpline: 181 (CM Helpline)</span>
          <span className="bg-orange-600 px-2 py-0.5 font-bold uppercase rounded-none">One Family &ndash; One ID</span>
        </div>
      </div>

      {/* 2. Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 bg-amber-50 border border-amber-600/40 p-1 flex items-center justify-center rounded-none shadow-xs text-amber-900 font-black text-base">
              GJ
            </div>
            <div>
              <div className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">
                ગુજરાત સરકાર &bull; Digital Gujarat Initiative
              </div>
              <div className="text-lg font-black text-[#0B2545] leading-tight">
                પરિવાર સેતુ &ndash; ParivarSetu
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-bold text-slate-700">
            <a href="#how-it-works" className="hover:text-orange-700 transition-colors">How It Works</a>
            <a href="#schemes" className="hover:text-orange-700 transition-colors">Schemes</a>
            <a href="#impact" className="hover:text-orange-700 transition-colors">Impact Stats</a>
            <a href="#faqs" className="hover:text-orange-700 transition-colors">FAQs</a>
          </nav>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setShowCitizenModal(true)}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300 rounded-none shadow-xs cursor-pointer flex items-center gap-1.5 transition"
            >
              <Users className="w-3.5 h-3.5 text-orange-700" />
              Citizen Access
            </button>
            <button
              onClick={() => setShowOfficerModal(true)}
              className="px-3.5 py-2 bg-orange-700 hover:bg-orange-800 text-white text-xs font-bold rounded-none shadow-xs cursor-pointer flex items-center gap-1.5 transition"
            >
              <Building2 className="w-3.5 h-3.5" />
              Officer Portal Login
            </button>
          </div>
        </div>
      </header>

      {/* 3. Hero Section */}
      <section className="bg-gradient-to-b from-[#0B2545] via-[#10335D] to-[#0B2545] text-white py-16 px-6 relative overflow-hidden">
        {/* Subtle decorative motif */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <div className="text-[280px] font-black text-amber-400 select-none">GJ</div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider rounded-none">
              <Sparkles className="w-3.5 h-3.5" />
              Direct Benefit Transfer &bull; Zero Documentation Leakage
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
              One Family &ndash; One ID <br />
              <span className="text-orange-400">પરિવાર સેતુ (ParivarSetu)</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Gujarat&apos;s unified digital governance platform connecting every household to social welfare schemes through automated data-driven eligibility matching, direct DBT disbursals, and transparent grievance redressal.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setShowCitizenModal(true)}
                className="px-5 py-3 bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold rounded-none shadow-lg cursor-pointer flex items-center gap-2 transition"
              >
                <Users className="w-4 h-4" />
                Citizen Portal Login
              </button>
              <button
                onClick={onOpenRegisterModal}
                className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-none shadow-lg cursor-pointer flex items-center gap-2 transition"
              >
                <UserCheck className="w-4 h-4" />
                Register New Family (Aadhaar / PDS)
              </button>
              <button
                onClick={() => setShowOfficerModal(true)}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold rounded-none border border-slate-600 cursor-pointer flex items-center gap-2 transition"
              >
                <Building2 className="w-4 h-4" />
                Department Officers Login &rarr;
              </button>
            </div>

            <div className="pt-4 flex items-center space-x-6 text-xs text-slate-300 border-t border-slate-700/60">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Masked Aadhaar &amp; PDS Linked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% DBT Verified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Paperwork Verification</span>
              </div>
            </div>
          </div>

          {/* Quick Access Dual Gateways Card */}
          <div className="lg:col-span-5 bg-white text-slate-900 rounded-none border-2 border-orange-500 shadow-2xl p-6 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <div className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">
                Digital Gujarat Single Sign-On
              </div>
              <h2 className="text-base font-black text-slate-900">
                Select Your Access Gateway
              </h2>
            </div>

            {/* Gateway 1: Citizen */}
            <div className="p-4 border border-slate-200 bg-slate-50 hover:border-orange-500 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 text-orange-800 flex items-center justify-center font-bold text-xs">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900">Citizen &amp; Family Head</h3>
                    <p className="text-[11px] text-slate-500">Access Parivar card, track schemes &amp; DBT</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  onClick={() => setShowCitizenModal(true)}
                  className="w-full py-1.5 bg-orange-700 hover:bg-orange-800 text-white font-bold text-xs rounded-none cursor-pointer text-center"
                >
                  Citizen Login
                </button>
                <button
                  onClick={onOpenRegisterModal}
                  className="w-full py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs rounded-none cursor-pointer text-center"
                >
                  Register Family
                </button>
              </div>
            </div>

            {/* Gateway 2: Officer & Verifier */}
            <div className="p-4 border border-slate-200 bg-slate-50 hover:border-orange-500 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900">Government Officers &amp; Talati</h3>
                    <p className="text-[11px] text-slate-500">Department review, DBT disbursal &amp; audits</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowOfficerModal(true)}
                className="w-full mt-2 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-none cursor-pointer text-center flex items-center justify-center gap-1"
              >
                <span>Department Portal Login</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. "How It Works" Step-by-Step Guide for Citizens */}
      <section id="how-it-works" className="py-16 px-6 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-3xl mx-auto">
            <div className="text-xs font-bold text-orange-700 uppercase tracking-widest">
              Citizen Guide &bull; કેવી રીતે ઉપયોગ કરવો
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              How ParivarSetu Works for Gujarat Families
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              A 5-stage transparent citizen lifecycle designed to deliver benefits without repetitive form filling or documentation queues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Step 1 */}
            <div className="p-5 border border-slate-200 rounded-none bg-slate-50/50 border-t-4 border-t-orange-600 space-y-3">
              <div className="w-8 h-8 bg-orange-100 text-orange-800 font-black text-xs flex items-center justify-center">
                01
              </div>
              <h3 className="text-sm font-bold text-slate-900">1. Instant PDS Verification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your 12-digit Aadhaar or Gujarat Ration Card. Details are auto-populated securely from the state registry.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 border border-slate-200 rounded-none bg-slate-50/50 border-t-4 border-t-amber-600 space-y-3">
              <div className="w-8 h-8 bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center">
                02
              </div>
              <h3 className="text-sm font-bold text-slate-900">2. Permanent Parivar ID</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive your official digital Parivar ID (<code className="font-mono text-orange-700">GJ-XXXXXXXX</code>) unifying all members under one record.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 border border-slate-200 rounded-none bg-slate-50/50 border-t-4 border-t-emerald-600 space-y-3">
              <div className="w-8 h-8 bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                03
              </div>
              <h3 className="text-sm font-bold text-slate-900">3. Auto-Matches Schemes for Family</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automatically matches eligible government welfare schemes for your family based on your verified household details.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 border border-slate-200 rounded-none bg-slate-50/50 border-t-4 border-t-sky-600 space-y-3">
              <div className="w-8 h-8 bg-sky-100 text-sky-800 font-black text-xs flex items-center justify-center">
                04
              </div>
              <h3 className="text-sm font-bold text-slate-900">4. Direct Benefit (DBT)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Officers approve applications with state machine verification. Subsidies are disbursed with immutable <code className="font-mono text-sky-800">DBT-GJ</code> receipts.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-5 border border-slate-200 rounded-none bg-slate-50/50 border-t-4 border-t-rose-600 space-y-3">
              <div className="w-8 h-8 bg-rose-100 text-rose-800 font-black text-xs flex items-center justify-center">
                05
              </div>
              <h3 className="text-sm font-bold text-slate-900">5. Grievance Redressal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Citizens submit grievances that auto-escalate delayed applications directly into the responsible officer&apos;s priority queue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured Welfare Schemes */}
      <section id="schemes" className="py-16 px-6 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-orange-700 uppercase tracking-widest">
                Welfare Schemes &bull; સરકારી યોજનાઓ
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                Integrated Gujarat Government Schemes
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Scheme 1 */}
            <div className="bg-white p-5 border border-slate-200 rounded-none shadow-xs space-y-3 border-t-3 border-t-rose-600">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300">
                  Health &amp; Family Welfare
                </span>
                <span className="font-bold text-xs text-slate-900">₹5,00,000 / yr</span>
              </div>
              <h3 className="text-sm font-black text-slate-900">MA Amrutam / PMJAY Health Scheme</h3>
              <p className="text-xs text-slate-600">
                Cashless tertiary medical treatment for BPL and low-income families across Gujarat empanelled super-specialty hospitals.
              </p>
            </div>

            {/* Scheme 2 */}
            <div className="bg-white p-5 border border-slate-200 rounded-none shadow-xs space-y-3 border-t-3 border-t-sky-600">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-100 text-sky-800 border border-sky-300">
                  Education Department
                </span>
                <span className="font-bold text-xs text-slate-900">₹2,00,000 / yr</span>
              </div>
              <h3 className="text-sm font-black text-slate-900">MYSY (Mukhyamantri Yuva Swavalamban)</h3>
              <p className="text-xs text-slate-600">
                Higher education scholarship and tuition assistance for meritorious students scoring &gt; 80 percentile in 10th/12th standard.
              </p>
            </div>

            {/* Scheme 3 */}
            <div className="bg-white p-5 border border-slate-200 rounded-none shadow-xs space-y-3 border-t-3 border-t-purple-600">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-800 border border-purple-300">
                  Industries &amp; MSME
                </span>
                <span className="font-bold text-xs text-slate-900">₹10,00,000</span>
              </div>
              <h3 className="text-sm font-black text-slate-900">Gujarat Startup &amp; Innovation Scheme</h3>
              <p className="text-xs text-slate-600">
                Seed grants, prototype development assistance, and marketing subsidies for young Gujarati entrepreneurs and artisans.
              </p>
            </div>

            {/* Scheme 4 */}
            <div className="bg-white p-5 border border-slate-200 rounded-none shadow-xs space-y-3 border-t-3 border-t-amber-600">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300">
                  Urban &amp; Housing
                </span>
                <span className="font-bold text-xs text-slate-900">₹1,50,000</span>
              </div>
              <h3 className="text-sm font-black text-slate-900">Mukhyamantri Awas Yojana (Gujarat)</h3>
              <p className="text-xs text-slate-600">
                Financial assistance and interest subsidies for constructing pucca houses for economically weaker sections (EWS/LIG).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Impact Stats */}
      <section id="impact" className="py-12 px-6 bg-[#0B2545] text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4">
            <div className="text-3xl sm:text-4xl font-black text-orange-400">33</div>
            <div className="text-xs text-slate-300 uppercase font-bold mt-1">Gujarat Districts Active</div>
          </div>
          <div className="p-4">
            <div className="text-3xl sm:text-4xl font-black text-orange-400">29+</div>
            <div className="text-xs text-slate-300 uppercase font-bold mt-1">Registered Gujarat Families</div>
          </div>
          <div className="p-4">
            <div className="text-3xl sm:text-4xl font-black text-orange-400">18</div>
            <div className="text-xs text-slate-300 uppercase font-bold mt-1">State Schemes Integrated</div>
          </div>
          <div className="p-4">
            <div className="text-3xl sm:text-4xl font-black text-orange-400">₹7.5 Lakh+</div>
            <div className="text-xs text-slate-300 uppercase font-bold mt-1">DBT Subsidies Disbursed</div>
          </div>
        </div>
      </section>

      {/* 7. Frequently Asked Questions */}
      <section id="faqs" className="py-16 px-6 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <div className="text-xs font-bold text-orange-700 uppercase tracking-widest">
              Frequently Asked Questions &bull; પ્રશ્નોત્તરી
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              Common Questions About ParivarSetu
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 border border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm mb-1">
                What is the Gujarat Parivar ID?
              </h3>
              <p className="text-slate-600">
                It is an 8-digit unique identifier (prefixed with <code className="font-mono">GJ</code>) issued to each family residing in Gujarat. It maps household members, socio-economic category, bank account, and entitlements into one unified registry.
              </p>
            </div>

            <div className="p-4 border border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm mb-1">
                Do I need to submit physical copies for every government scheme?
              </h3>
              <p className="text-slate-600">
                No. With ParivarSetu, once your family is verified by the local Talati / Panchayat secretary, the Generic Eligibility Engine matches rules electronically, enabling 1-click scheme applications without submitting documents repeatedly.
              </p>
            </div>

            <div className="p-4 border border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm mb-1">
                How do officers access their department portal?
              </h3>
              <p className="text-slate-600">
                Officers log in using their official <code className="font-mono">@gujarat.gov.in</code> email. The backend enforces server-side department isolation via JWT tokens, ensuring an officer only sees schemes and applications under their jurisdiction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-6 text-xs mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <div className="text-white font-bold">Government of Gujarat &bull; One Family &ndash; One ID System (ParivarSetu)</div>
            <div>Developed in accordance with the National E-Governance Standards and NIC Portal Guidelines.</div>
          </div>
          <div className="text-slate-500">
            &copy; {new Date().getFullYear()} Government of Gujarat. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* ============================================================ */}
      {/* MODAL: Department Officer & Verifier Login */}
      {/* ============================================================ */}
      {showOfficerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-none border-2 border-orange-600 w-full max-w-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-700" />
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Department Officer &amp; Verifier Portal Login
                  </h3>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Secure JWT authentication &bull; Government of Gujarat
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowOfficerModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Email & Password Authentication Form */}
            <form onSubmit={handleOfficerLogin} className="space-y-3 text-xs bg-slate-50 p-4 border border-slate-200">
              <div className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-orange-600" />
                Sign In with Official Government Account
              </div>

              {officerError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{officerError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Government Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. health.officer@gujarat.gov.in"
                    value={officerEmail}
                    onChange={e => setOfficerEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-none focus:outline-hidden focus:border-orange-500 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showOfficerPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      placeholder="Enter password"
                      value={officerPassword}
                      onChange={e => setOfficerPassword(e.target.value)}
                      className="w-full pl-3 pr-10 py-2 bg-white border border-slate-300 rounded-none focus:outline-hidden focus:border-orange-500 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOfficerPassword(!showOfficerPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 p-1 cursor-pointer"
                      title={showOfficerPassword ? "Hide password" : "Show password"}
                    >
                      {showOfficerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOfficerModal(false)}
                  className="px-4 py-2 text-xs text-slate-700 font-bold border border-slate-300 rounded-none cursor-pointer bg-white hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={officerLoading}
                  className="px-5 py-2 text-xs bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-none cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Lock className="w-3 h-3" />
                  {officerLoading ? "Verifying Credentials..." : "Sign In to Department Portal"}
                </button>
              </div>
            </form>

            {/* Official Accounts Directory */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Official Department Login Directory &amp; Credentials:
                </label>
                <span className="text-[10px] text-slate-500 font-medium">Click &quot;Auto-fill&quot; to populate login inputs</span>
              </div>

              <div className="border border-slate-200 overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold border-b border-slate-200">
                      <th className="p-2">Role / Department</th>
                      <th className="p-2">Official Name</th>
                      <th className="p-2">Official Email</th>
                      <th className="p-2">Password</th>
                      <th className="p-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="hover:bg-slate-50">
                      <td className="p-2 font-bold text-rose-900">
                        <div className="flex items-center gap-1.5">
                          <HeartPulse className="w-3.5 h-3.5 text-rose-700" />
                          Health &amp; Family Welfare
                        </div>
                      </td>
                      <td className="p-2 text-slate-700">Dr. Rajesh Mehta</td>
                      <td className="p-2 font-mono text-slate-800 text-[11px]">health.officer@gujarat.gov.in</td>
                      <td className="p-2 font-mono text-slate-600 text-[11px]">Gujarat@2026</td>
                      <td className="p-2 text-right">
                        <button
                          type="button"
                          onClick={() => fillOfficerCredentials("health.officer@gujarat.gov.in", "Gujarat@2026")}
                          className="px-2 py-1 bg-white hover:bg-slate-100 text-orange-700 font-bold border border-orange-300 rounded-none cursor-pointer text-[10px]"
                        >
                          Auto-fill
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="p-2 font-bold text-sky-900">
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-sky-700" />
                          Education Department
                        </div>
                      </td>
                      <td className="p-2 text-slate-700">Shri Kirit Trivedi</td>
                      <td className="p-2 font-mono text-slate-800 text-[11px]">education.officer@gujarat.gov.in</td>
                      <td className="p-2 font-mono text-slate-600 text-[11px]">Gujarat@2026</td>
                      <td className="p-2 text-right">
                        <button
                          type="button"
                          onClick={() => fillOfficerCredentials("education.officer@gujarat.gov.in", "Gujarat@2026")}
                          className="px-2 py-1 bg-white hover:bg-slate-100 text-orange-700 font-bold border border-orange-300 rounded-none cursor-pointer text-[10px]"
                        >
                          Auto-fill
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="p-2 font-bold text-purple-900">
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-purple-700" />
                          Industries &amp; MSME
                        </div>
                      </td>
                      <td className="p-2 text-slate-700">Smt. Hina Patel</td>
                      <td className="p-2 font-mono text-slate-800 text-[11px]">msme.officer@gujarat.gov.in</td>
                      <td className="p-2 font-mono text-slate-600 text-[11px]">Gujarat@2026</td>
                      <td className="p-2 text-right">
                        <button
                          type="button"
                          onClick={() => fillOfficerCredentials("msme.officer@gujarat.gov.in", "Gujarat@2026")}
                          className="px-2 py-1 bg-white hover:bg-slate-100 text-orange-700 font-bold border border-orange-300 rounded-none cursor-pointer text-[10px]"
                        >
                          Auto-fill
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="p-2 font-bold text-emerald-900">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                          Talati-cum-Mantri (Field)
                        </div>
                      </td>
                      <td className="p-2 text-slate-700">Shri Ramesh Joshi</td>
                      <td className="p-2 font-mono text-slate-800 text-[11px]">talati.gandhinagar@gujarat.gov.in</td>
                      <td className="p-2 font-mono text-slate-600 text-[11px]">Gujarat@2026</td>
                      <td className="p-2 text-right">
                        <button
                          type="button"
                          onClick={() => fillOfficerCredentials("talati.gandhinagar@gujarat.gov.in", "Gujarat@2026")}
                          className="px-2 py-1 bg-white hover:bg-slate-100 text-orange-700 font-bold border border-orange-300 rounded-none cursor-pointer text-[10px]"
                        >
                          Auto-fill
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="p-2 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-700" />
                          State Administrator
                        </div>
                      </td>
                      <td className="p-2 text-slate-700">Admin Office</td>
                      <td className="p-2 font-mono text-slate-800 text-[11px]">admin@gujarat.gov.in</td>
                      <td className="p-2 font-mono text-slate-600 text-[11px]">Gujarat@2026</td>
                      <td className="p-2 text-right">
                        <button
                          type="button"
                          onClick={() => fillOfficerCredentials("admin@gujarat.gov.in", "Gujarat@2026")}
                          className="px-2 py-1 bg-white hover:bg-slate-100 text-orange-700 font-bold border border-orange-300 rounded-none cursor-pointer text-[10px]"
                        >
                          Auto-fill
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: Citizen Access */}
      {/* ============================================================ */}
      {showCitizenModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-none border-2 border-orange-600 w-full max-w-lg shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-700" />
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Citizen Portal Login
                  </h3>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Access Family ID, DBT receipts &amp; Scheme benefits
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowCitizenModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Email & Password Authentication Form */}
            <form onSubmit={handleCitizenLogin} className="space-y-3 text-xs bg-slate-50 p-4 border border-slate-200">
              <div className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-orange-600" />
                Sign In with Registered Citizen Credentials
              </div>

              {citizenError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{citizenError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Registered Citizen Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. priya.sharma@parivar.gujarat.gov.in"
                  value={citizenEmail}
                  onChange={e => setCitizenEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-none focus:outline-hidden focus:border-orange-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showCitizenPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="Enter citizen password"
                    value={citizenPassword}
                    onChange={e => setCitizenPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 bg-white border border-slate-300 rounded-none focus:outline-hidden focus:border-orange-500 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCitizenPassword(!showCitizenPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 p-1 cursor-pointer"
                    title={showCitizenPassword ? "Hide password" : "Show password"}
                  >
                    {showCitizenPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCitizenModal(false)}
                  className="px-4 py-2 text-xs text-slate-700 font-bold border border-slate-300 rounded-none cursor-pointer bg-white hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={citizenLoading}
                  className="px-5 py-2 text-xs bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-none cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Lock className="w-3 h-3" />
                  {citizenLoading ? "Verifying..." : "Sign In to Citizen Portal"}
                </button>
              </div>
            </form>

            {/* Official Citizen Credentials Directory */}
            <div className="p-3.5 border border-amber-200 bg-amber-50/70 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-orange-700" />
                  Registered Citizen Login Information:
                </div>
                <button
                  type="button"
                  onClick={() => fillCitizenCredentials("priya.sharma@parivar.gujarat.gov.in", "Gujarat@2026")}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-orange-800 font-bold border border-orange-300 rounded-none cursor-pointer text-[10px]"
                >
                  Auto-fill Credentials
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 pt-1">
                <div>
                  <span className="font-bold text-slate-500">Head of Family:</span> Smt. Priya Sharma
                </div>
                <div>
                  <span className="font-bold text-slate-500">Family ID:</span> <code className="font-mono font-bold text-orange-800">GJ12345678</code>
                </div>
                <div>
                  <span className="font-bold text-slate-500">Email:</span> <code className="font-mono text-slate-800">priya.sharma@parivar.gujarat.gov.in</code>
                </div>
                <div>
                  <span className="font-bold text-slate-500">Password:</span> <code className="font-mono text-slate-800">Gujarat@2026</code>
                </div>
              </div>
            </div>

            <div className="pt-2 text-center text-xs text-slate-600 space-y-2 border-t border-slate-100">
              <div>New Gujarat Resident?</div>
              <button
                type="button"
                onClick={() => {
                  setShowCitizenModal(false);
                  onOpenRegisterModal();
                }}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-none cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Register New Family (Simulated PDS / Aadhaar)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
