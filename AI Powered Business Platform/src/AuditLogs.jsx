import React, { useState } from 'react';
import './AdminSettings.css'; 
import { Shield, Search, Filter, Download, User, Settings, FileText, Activity } from 'lucide-react';
import './AdminSettings.css'; // Reusing your existing settings CSS for the tables!

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock Audit Log Data
  const [logs] = useState([
    { id: 'LOG-099', time: '10:42 AM, Today', user: 'Sarah Jenkins', role: 'Agent', action: 'Approved AI Draft', resource: 'Ticket TCK-894', type: 'operation' },
    { id: 'LOG-098', time: '09:15 AM, Today', user: 'Prithvi Kumar', role: 'Admin', action: 'Changed SLA Threshold', resource: 'Settings: Critical Priority (15m)', type: 'security' },
    { id: 'LOG-097', time: '08:30 AM, Today', user: 'System AI', role: 'System', action: 'Auto-Resolved Ticket', resource: 'Ticket TCK-712', type: 'automation' },
    { id: 'LOG-096', time: 'Yesterday, 4:20 PM', user: 'Prithvi Kumar', role: 'Admin', action: 'Uploaded Document', resource: 'Refund_Policy_2026.pdf', type: 'document' },
    { id: 'LOG-095', time: 'Yesterday, 3:15 PM', user: 'David Chen', role: 'Agent', action: 'Escalated to Tier 2', resource: 'Ticket TCK-890', type: 'operation' },
    { id: 'LOG-094', time: 'Yesterday, 1:00 PM', user: 'System Auth', role: 'System', action: 'Failed Login Attempt', resource: 'IP: 192.168.1.45', type: 'alert' }
  ]);

  const getIcon = (type) => {
    switch(type) {
      case 'security': return <Shield size={16} className="text-purple-600" />;
      case 'operation': return <User size={16} className="text-blue-600" />;
      case 'automation': return <Activity size={16} className="text-green-600" />;
      case 'document': return <FileText size={16} className="text-orange-600" />;
      case 'alert': return <Shield size={16} className="text-red-600" />;
      default: return <Settings size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="settings-container fade-in">
      <div className="settings-header">
        <div>
          <h1 className="settings-title">Security & Audit Logs</h1>
          <p className="settings-subtitle">Immutable ledger of system events and user actions.</p>
        </div>
        <button className="btn-secondary">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="settings-card">
        <div className="card-header flex-between">
          <div className="search-box" style={{ width: '300px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f9fafb', border: '1px solid #e5e7eb', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
            <Search size={16} className="text-gray-400" />
            <input type="text" placeholder="Search logs, users, or tickets..." style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }} />
          </div>
          <button className="btn-secondary"><Filter size={16} /> Filter Events</button>
        </div>
        
        <div className="card-body p-0">
          <table className="settings-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User / System</th>
                <th>Action Performed</th>
                <th>Target Resource</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td className="text-sm text-gray-500">{log.time}</td>
                  <td>
                    <div className="font-semibold text-gray-800">{log.user}</div>
                    <div className="text-xs text-gray-500">{log.role}</div>
                  </td>
                  <td>
                    <div className="flex-align-center gap-1">
                      {getIcon(log.type)}
                      <span className="font-semibold text-gray-700 ml-1">{log.action}</span>
                    </div>
                  </td>
                  <td className="text-sm text-gray-600">{log.resource}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;