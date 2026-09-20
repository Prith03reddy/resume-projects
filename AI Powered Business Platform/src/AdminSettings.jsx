import React, { useState } from 'react';
import { 
  Users, Sliders, Shield, Bell, Save, 
  Plus, Trash2, Check, AlertTriangle 
} from 'lucide-react';
import './AdminSettings.css';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('team');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Mock Team Data
  const [team, setTeam] = useState([
    { id: 1, name: 'Prithvi Kumar', email: 'prithvi@ai-ops.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Sarah Jenkins', email: 'sarah@ai-ops.com', role: 'Tier 2 Agent', status: 'Active' },
    { id: 3, name: 'David Chen', email: 'david@ai-ops.com', role: 'Tier 1 Agent', status: 'Offline' }
  ]);

  // Mock SLA Data
  const [slaSettings, setSlaSettings] = useState({
    critical: 15, // minutes
    high: 60,
    medium: 240,
    autoAssign: true,
    aiConfidenceThreshold: 85
  });

  const handleSave = () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div>
          <h1 className="settings-title">Workspace Settings</h1>
          <p className="settings-subtitle">Manage your team, AI configurations, and SLA rules.</p>
        </div>
        <button className="btn-save" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <span className="spinner-small"></span> : (saveSuccess ? <Check size={18} /> : <Save size={18} />)}
          {isSaving ? 'Saving...' : (saveSuccess ? 'Saved!' : 'Save Changes')}
        </button>
      </div>

      <div className="settings-layout">
        {/* Left Sidebar Navigation */}
        <div className="settings-sidebar">
          <button 
            className={`tab-btn ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            <Users size={18} /> Team & Roles
          </button>
          <button 
            className={`tab-btn ${activeTab === 'sla' ? 'active' : ''}`}
            onClick={() => setActiveTab('sla')}
          >
            <Sliders size={18} /> SLA & Routing
          </button>
          <button 
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Shield size={18} /> Security
          </button>
          <button 
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={18} /> Notifications
          </button>
        </div>

        {/* Right Content Area */}
        <div className="settings-content">
          
          {/* TEAM SETTINGS TAB */}
          {activeTab === 'team' && (
            <div className="settings-card fade-in">
              <div className="card-header flex-between">
                <div>
                  <h2 className="card-title">Team Members</h2>
                  <p className="card-desc">Manage who has access to the Agent Dashboard.</p>
                </div>
                <button className="btn-secondary"><Plus size={16} /> Invite User</button>
              </div>
              <div className="card-body p-0">
                <table className="settings-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.map(member => (
                      <tr key={member.id}>
                        <td>
                          <div className="font-semibold text-gray-800">{member.name}</div>
                          <div className="text-xs text-gray-500">{member.email}</div>
                        </td>
                        <td>
                          <select className="form-select" defaultValue={member.role}>
                            <option>Admin</option>
                            <option>Tier 2 Agent</option>
                            <option>Tier 1 Agent</option>
                          </select>
                        </td>
                        <td>
                          <span className={`status-dot ${member.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                          <span className="text-sm text-gray-600">{member.status}</span>
                        </td>
                        <td>
                          <button className="btn-icon text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SLA & ROUTING TAB */}
          {activeTab === 'sla' && (
            <div className="settings-card fade-in">
              <div className="card-header">
                <h2 className="card-title">SLA & AI Routing Rules</h2>
                <p className="card-desc">Configure how the AI handles incoming tickets and sets deadlines.</p>
              </div>
              
              <div className="card-body">
                <div className="setting-group">
                  <div className="setting-label-row">
                    <label className="font-semibold text-gray-800">AI Auto-Response Confidence Threshold</label>
                    <span className="text-blue-600 font-bold">{slaSettings.aiConfidenceThreshold}%</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">If the AI's confidence is above this number, it will send the reply to the customer automatically. If below, it drafts a response for human review.</p>
                  <input 
                    type="range" 
                    min="50" max="100" 
                    className="range-slider"
                    value={slaSettings.aiConfidenceThreshold}
                    onChange={(e) => setSlaSettings({...slaSettings, aiConfidenceThreshold: e.target.value})}
                  />
                </div>

                <div className="divider"></div>

                <h3 className="font-semibold text-gray-800 mb-3">Priority Deadlines (Minutes)</h3>
                <div className="grid-2-col">
                  <div className="input-group">
                    <label className="text-sm text-red-600 font-semibold flex-align-center gap-1">
                      <AlertTriangle size={14} /> Critical Priority
                    </label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={slaSettings.critical}
                      onChange={(e) => setSlaSettings({...slaSettings, critical: e.target.value})}
                    />
                  </div>
                  <div className="input-group">
                    <label className="text-sm text-orange-600 font-semibold">High Priority</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={slaSettings.high}
                      onChange={(e) => setSlaSettings({...slaSettings, high: e.target.value})}
                    />
                  </div>
                </div>

                <div className="divider"></div>

                <div className="flex-between">
                  <div>
                    <div className="font-semibold text-gray-800">Auto-Assign Tickets</div>
                    <div className="text-sm text-gray-500">Automatically assign new tickets to online agents based on workload.</div>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked={slaSettings.autoAssign} />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* PLACEHOLDERS FOR OTHER TABS */}
          {(activeTab === 'security' || activeTab === 'notifications') && (
            <div className="settings-card fade-in">
              <div className="card-body text-center p-8 text-gray-500">
                <Shield size={48} className="mx-auto mb-4 text-gray-300" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Coming Soon</h2>
                <p>This configuration module is scheduled for the next development sprint.</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminSettings;