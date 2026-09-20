import React, { useState, useEffect } from 'react';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import StatCards from '../components/dashboard/StatCards';
import FamilyDetailsCard from '../components/dashboard/FamilyDetailsCard';
import ApplicationStatusCard from '../components/dashboard/ApplicationStatusCard';
import ActiveSchemesCard from '../components/dashboard/ActiveSchemesCard';
import QuickActionsCard from '../components/dashboard/QuickActionsCard';
import NotificationsCard from '../components/dashboard/NotificationsCard';

export default function CitizenDashboard() {
  const [loading, setLoading] = useState(false);
  const [familyData, setFamilyData] = useState(null);

  useEffect(() => {
    // Attempt fetching live data from FastAPI backend if running, fallback seamlessly to Gujarat seeds
    const fetchData = async () => {
      try {
        const res = await fetch('/api/v1/families/GJ12345678');
        if (res.ok) {
          const data = await res.json();
          setFamilyData(data);
        }
      } catch (err) {
        console.log("Using baseline Gujarat seed data for dashboard display:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Welcome Banner */}
      <WelcomeBanner userName="Priya Sharma" />

      {/* 2. Key Stats Row */}
      <StatCards 
        familyId={familyData?.family_id || "GJ12345678"}
        status={familyData?.status === "permanent" ? "Active" : "Active"}
        totalSchemes={5}
        applicationsCount={3}
        inProgressCount={2}
        approvedCount={1}
        totalBenefits={48000}
      />

      {/* 3. Main Dashboard Content Grid (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 of 12 cols on desktop) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Family Details Card */}
          <FamilyDetailsCard 
            familyName="Sharma Family"
            familyId={familyData?.family_id || "GJ12345678"}
            district={familyData?.district || "Gandhinagar"}
            ward="Sector 6 / Gandhinagar"
            memberCount={familyData?.members?.length || 4}
          />

          {/* Application Status Card */}
          <ApplicationStatusCard />

          {/* Quick Actions / Scheme Eligibility Overview */}
          <QuickActionsCard />
        </div>

        {/* Right Column (5 of 12 cols on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Schemes Card */}
          <ActiveSchemesCard />

          {/* Recent Notifications Card */}
          <NotificationsCard />
        </div>
      </div>
    </div>
  );
}
