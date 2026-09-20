import React, { useState, useEffect } from 'react';
import Header, { PRESET_PROFILES } from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import CitizenDashboard from './pages/CitizenDashboard';
import ApplicationTracker from './components/citizen/ApplicationTracker';
import SchemeCatalog from './components/citizen/SchemeCatalog';
import GrievanceForm from './components/citizen/GrievanceForm';
import FamilyRegistrationModal from './components/citizen/FamilyRegistrationModal';
import MyFamilyPortal from './components/citizen/MyFamilyPortal';
import OfficerPortal from './pages/OfficerPortal';
import VerifierPortal from './pages/VerifierPortal';
import LandingPage from './pages/LandingPage';
import ErrorBoundary from './components/common/ErrorBoundary';
import { api } from './services/api';

export default function App() {
  const [viewMode, setViewMode] = useState('landing'); // 'landing' | 'portal'
  const [currentProfile, setCurrentProfile] = useState(PRESET_PROFILES[0]);
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Global app data state
  const [schemes, setSchemes] = useState([]);
  const [eligibleSchemeIds, setEligibleSchemeIds] = useState([]);
  const [applications, setApplications] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const authenticateProfile = async (profile) => {
    try {
      const res = await api.login(profile.email, "Gujarat@2026");
      setToken(res.access_token);
      return res.access_token;
    } catch {
      try {
        const res = await api.login(profile.email, "password123");
        setToken(res.access_token);
        return res.access_token;
      } catch (err) {
        console.warn(`Could not login ${profile.email}:`, err);
        setToken(null);
        return null;
      }
    }
  };

  const loadData = async (activeTok, profile) => {
    try {
      // 1. Schemes
      const sch = await api.listSchemes();
      setSchemes(Array.isArray(sch) ? sch : []);

      // 2. If citizen, load their applications and eligible schemes
      if (profile.role === "Citizen") {
        const [apps, elg, comps, notifs] = await Promise.all([
          api.listApplications({ family_id: profile.family_id }),
          api.getEligibleSchemesForFamily(profile.family_id),
          api.listComplaints({ family_id: profile.family_id }),
          api.listNotifications(profile.family_id)
        ]);
        setApplications(Array.isArray(apps) ? apps : []);
        setEligibleSchemeIds(Array.isArray(elg) ? elg.map(s => s.id) : []);
        setComplaints(Array.isArray(comps) ? comps : []);
        setNotifications(Array.isArray(notifs) ? notifs : []);
      } else if (profile.role === "Officer") {
        setApplications([]);
        setEligibleSchemeIds([]);
        setComplaints([]);
        try {
          const [deptComplaints, delayedApps] = await Promise.all([
            api.listComplaints({ dept_id: profile.dept_id, status: 'Open' }, activeTok).catch(() => []),
            api.getDelayedApplications(activeTok).catch(() => [])
          ]);
          
          const officerAlerts = [];
          if (Array.isArray(deptComplaints)) {
            deptComplaints.forEach(c => {
              officerAlerts.push({
                id: `comp-${c.id}`,
                message: `Grievance #${c.id} on ${c.scheme_name || 'Scheme Application'} requires officer review.`,
                targetTab: 'officer-complaints',
                read: false,
                created_at: c.created_at,
                type: 'urgent'
              });
            });
          }
          if (Array.isArray(delayedApps)) {
            const deptDelayed = delayedApps.filter(d => !profile.dept_id || d.scheme_id === profile.dept_id || d.dept_id === profile.dept_id);
            deptDelayed.forEach(d => {
              officerAlerts.push({
                id: `del-${d.application_id || d.id}`,
                message: `Application #${d.application_id || d.id} (${d.scheme_name || 'Scheme'}) pending review > 3 days.`,
                targetTab: 'officer-apps',
                read: false,
                created_at: d.applied_on,
                type: 'warning'
              });
            });
          }
          setNotifications(officerAlerts);
        } catch {
          setNotifications([]);
        }
      } else if (profile.role === "Verifier") {
        setApplications([]);
        setEligibleSchemeIds([]);
        setComplaints([]);
        try {
          const provFamilies = await api.listFamilies('provisional').catch(() => []);
          const verifierAlerts = [];
          if (Array.isArray(provFamilies) && provFamilies.length > 0) {
            verifierAlerts.push({
              id: 'ver-prov',
              message: `${provFamilies.length} provisional families pending field document verification.`,
              targetTab: 'verifier-queue',
              read: false,
              type: 'info'
            });
          }
          setNotifications(verifierAlerts);
        } catch {
          setNotifications([]);
        }
      }
    } catch (err) {
      console.error("Data load error:", err);
    }
  };

  const handleSelectNotification = (notif) => {
    if (notif.targetTab) {
      setActiveTab(notif.targetTab);
    } else if (currentProfile.role === "Citizen") {
      setActiveTab("my-applications");
    }
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  useEffect(() => {
    const init = async () => {
      const tok = await authenticateProfile(currentProfile);
      loadData(tok, currentProfile);
    };
    init();
  }, [currentProfile]);

  const handleProfileChange = async (profile) => {
    setCurrentProfile(profile);
    if (profile.role === "Officer") {
      setActiveTab("officer-apps");
    } else if (profile.role === "Verifier") {
      setActiveTab("verifier-queue");
    } else {
      setActiveTab("dashboard");
    }
  };

  const handleSelectProfileFromLanding = (profile) => {
    handleProfileChange(profile);
    setViewMode('portal');
  };

  const handleExitToLanding = () => {
    setViewMode('landing');
  };

  const handleLogout = () => {
    setToken(null);
    setViewMode('landing');
  };

  const handleApplyToScheme = async (schemeId) => {
    try {
      await api.applyToScheme(currentProfile.family_id, schemeId);
      alert("Application submitted successfully! Your application is now in 'Applied' status.");
      loadData(token, currentProfile);
      setActiveTab("my-applications");
    } catch (err) {
      alert("Application failed: " + err.message);
    }
  };

  const handleRaiseGrievance = async (applicationId, message) => {
    await api.raiseComplaint(applicationId, message);
    loadData(token, currentProfile);
  };

  const appliedSchemeIds = applications.map(a => a.scheme_id);

  // If in Public Landing Page Mode
  if (viewMode === 'landing') {
    return (
      <>
        <LandingPage 
          onSelectProfile={handleSelectProfileFromLanding}
          onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
        />
        <FamilyRegistrationModal 
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onRegistered={(newFam) => {
            setIsRegisterModalOpen(false);
            const newProfile = {
              id: "citizen",
              name: newFam.head_name,
              role: "Citizen",
              email: "citizen@parivar.gujarat.gov.in",
              family_id: newFam.family_id
            };
            handleSelectProfileFromLanding(newProfile);
          }}
        />
      </>
    );
  }

  return (
    <ErrorBoundary onExitToLanding={handleExitToLanding}>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      {/* 1. Header (Government of Gujarat & ParivarSetu) */}
      <Header 
        currentProfile={currentProfile}
        onProfileChange={handleProfileChange}
        onLogout={handleLogout}
        onExitToLanding={handleLogout}
        notifications={notifications}
        unreadCount={notifications.filter(n => !n.read).length} 
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onSelectNotification={handleSelectNotification}
      />

      {/* 2. Main Body with Sidebar + Dynamic View */}
      <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          role={currentProfile.role}
          notificationCount={notifications.filter(n => !n.read).length} 
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-5 md:p-7 overflow-y-auto max-w-full">
          {/* === CITIZEN VIEWS === */}
          {currentProfile.role === "Citizen" && (
            <>
              {activeTab === 'dashboard' && (
                <CitizenDashboard 
                  currentFamilyId={currentProfile.family_id} 
                  onNavigate={setActiveTab} 
                />
              )}
              
              {activeTab === 'my-applications' && (
                <ApplicationTracker 
                  applications={applications} 
                  onRaiseGrievance={handleRaiseGrievance} 
                />
              )}

              {activeTab === 'schemes' && (
                <SchemeCatalog 
                  schemes={schemes}
                  eligibleSchemeIds={eligibleSchemeIds}
                  appliedSchemeIds={appliedSchemeIds}
                  familyId={currentProfile.family_id}
                  onApply={handleApplyToScheme}
                />
              )}

              {activeTab === 'complaints' && (
                <GrievanceForm 
                  applications={applications}
                  complaints={complaints}
                  onRaiseGrievance={handleRaiseGrievance}
                />
              )}

              {activeTab === 'notifications' && (
                <div className="bg-white rounded-none p-5 border border-slate-200 border-t-3 border-t-sky-600 shadow-xs">
                  <h2 className="text-base font-black text-slate-900 mb-3 pb-2 border-b border-slate-100">
                    Welfare Notifications & Scheme Broadcasts
                  </h2>
                  <div className="space-y-2.5">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-500">No notifications yet.</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-3 border border-slate-200 bg-slate-50 text-xs flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-slate-900">{n.message}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {n.created_at ? new Date(n.created_at).toLocaleString() : 'Recent broadcast'}
                            </div>
                          </div>
                          {!n.read && (
                            <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-bold uppercase rounded-none border border-sky-300">
                              New
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'my-family' && (
                <MyFamilyPortal 
                  familyId={currentProfile.family_id} 
                  token={token} 
                />
              )}
            </>
          )}

          {/* === OFFICER PORTAL === */}
          {currentProfile.role === "Officer" && (
            <OfficerPortal 
              token={token} 
              user={currentProfile} 
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          )}

          {/* === VERIFIER PORTAL === */}
          {currentProfile.role === "Verifier" && (
            <VerifierPortal 
              token={token} 
              user={currentProfile} 
            />
          )}
        </main>
      </div>

      {/* Family Registration Modal */}
      <FamilyRegistrationModal 
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegistered={(newFam) => {
          loadData(token, currentProfile);
        }}
      />
    </div>
    </ErrorBoundary>
  );
}
