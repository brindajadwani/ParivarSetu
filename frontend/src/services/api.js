const API_BASE = '/api/v1';

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Login failed');
    return res.json();
  },

  async getMe(token) {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Could not fetch user profile');
    return res.json();
  },

  // Families & Registry
  async lookupCitizen(identifier) {
    const res = await fetch(`${API_BASE}/families/lookup?identifier=${encodeURIComponent(identifier)}`);
    return res.json();
  },

  async registerFamily(data) {
    const res = await fetch(`${API_BASE}/families/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Registration failed');
    return res.json();
  },

  async getFamily(familyId, token = null) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_BASE}/families/${familyId}`, { headers });
    if (!res.ok) throw new Error('Family not found');
    return res.json();
  },

  async listFamilies(status = null) {
    const url = status ? `${API_BASE}/families?status=${status}` : `${API_BASE}/families`;
    const res = await fetch(url);
    return res.json();
  },

  async verifyFamily(familyId, action, token) {
    const res = await fetch(`${API_BASE}/families/${familyId}/verify?action=${action}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Verification failed');
    return res.json();
  },

  async addFamilyMember(familyId, memberData, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/families/${familyId}/members`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(memberData)
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to add member');
    return res.json();
  },

  async updateBankInfo(familyId, bankData, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/families/${familyId}/bank`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(bankData)
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to update bank details');
    return res.json();
  },

  async updateHealthInfo(familyId, healthData, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/families/${familyId}/health`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(healthData)
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to update health info');
    return res.json();
  },

  async updateEducationInfo(familyId, eduData, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/families/${familyId}/education`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(eduData)
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to update education info');
    return res.json();
  },

  async updateBusinessInfo(familyId, bizData, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/families/${familyId}/business`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(bizData)
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to update business info');
    return res.json();
  },

  // Schemes
  async listSchemes(token = null) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_BASE}/schemes`, { headers });
    return res.json();
  },

  async getEligibleSchemesForFamily(familyId) {
    const res = await fetch(`${API_BASE}/schemes/eligible-for-family/${familyId}`);
    return res.json();
  },

  async getEligibleFamiliesForScheme(schemeId) {
    const res = await fetch(`${API_BASE}/schemes/${schemeId}/eligible-families`);
    return res.json();
  },

  async createScheme(data, token) {
    const res = await fetch(`${API_BASE}/schemes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to create scheme');
    return res.json();
  },

  async notifyEligible(schemeId, token) {
    const res = await fetch(`${API_BASE}/schemes/${schemeId}/notify-eligible`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  // Applications
  async listApplications(params = {}, token = null) {
    const query = new URLSearchParams(params).toString();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_BASE}/applications?${query}`, { headers });
    return res.json();
  },

  async applyToScheme(familyId, schemeId, memberId = null) {
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ family_id: familyId, scheme_id: schemeId, member_id: memberId })
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Application submission failed');
    return res.json();
  },

  async updateApplicationStatus(appId, newStatus, token) {
    const res = await fetch(`${API_BASE}/applications/${appId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Status transition failed');
    return res.json();
  },

  async disburseApplication(appId, amount, token) {
    const res = await fetch(`${API_BASE}/applications/${appId}/disburse`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ amount: parseFloat(amount) })
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Disbursal failed');
    return res.json();
  },

  // Complaints
  async listComplaints(params = {}, token = null) {
    const query = new URLSearchParams(params).toString();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_BASE}/complaints?${query}`, { headers });
    return res.json();
  },

  async raiseComplaint(applicationId, message) {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application_id: applicationId, message })
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to file grievance');
    return res.json();
  },

  async resolveComplaint(complaintId, officerResponse, token) {
    const res = await fetch(`${API_BASE}/complaints/${complaintId}/resolve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ officer_response: officerResponse })
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to resolve grievance');
    return res.json();
  },

  // Analytics
  async getAnalyticsSummary(token = null) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_BASE}/analytics/summary`, { headers });
    return res.json();
  },

  async getAnalyticsByScheme(token = null) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_BASE}/analytics/by-scheme`, { headers });
    return res.json();
  },

  async getAnalyticsByDistrict(token = null) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_BASE}/analytics/by-district`, { headers });
    return res.json();
  },

  async getDelayedApplications(token = null) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_BASE}/analytics/delayed-applications`, { headers });
    return res.json();
  },

  async getAdminDashboard(token = null) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_BASE}/analytics/admin-dashboard`, { headers });
    return res.json();
  },

  // Notifications
  async listNotifications(familyId) {
    const res = await fetch(`${API_BASE}/notifications?family_id=${familyId}`);
    return res.json();
  },

  async markNotificationRead(id) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT' });
    return res.json();
  }
};
