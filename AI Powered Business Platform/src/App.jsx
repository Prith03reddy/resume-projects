import React, { useState } from 'react';
import TicketSubmissionForm from './ticketsubmissionform';
import AgentDashboard from './AgentDashboard';
import TicketDetail from './TicketDetail'; 
import KnowledgeBase from './KnowledgeBase';
import AnalyticsDashboard from './AnalyticsDashboard'; 
import AdminSettings from './AdminSettings';
import Login from './Login';
// IMPORT THE TWO NEW FILES
import AuditLogs from './AuditLogs';
import SystemMonitoring from './SystemMonitoring';

function App() {
  const [userRole, setUserRole] = useState(null); 
  const [currentView, setCurrentView] = useState(''); 

  const handleLogin = (role) => {
    setUserRole(role);
    setCurrentView(role === 'customer' ? 'customer-portal' : 'agent-dashboard');
  };

  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div>
      <nav style={{ 
        padding: '1rem 2rem', backgroundColor: '#111827', color: 'white', 
        display: 'flex', alignItems: 'center', gap: '1rem',
        position: 'sticky', top: 0, zIndex: 10, flexWrap: 'wrap'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.25rem', marginRight: 'auto' }}>
          AI Ops Platform
        </div>
        
        {userRole === 'customer' && (
          <button 
            onClick={() => setCurrentView('customer-portal')}
            style={{ background: '#2563eb', color: 'white', border: '1px solid #2563eb', padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer' }}
          >
            My Support Tickets
          </button>
        )}

        {userRole === 'employee' && (
          <>
            <button 
              onClick={() => setCurrentView('agent-dashboard')}
              style={{ background: (currentView === 'agent-dashboard' || currentView === 'ticket-detail') ? '#2563eb' : 'transparent', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer' }}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setCurrentView('knowledge')}
              style={{ background: currentView === 'knowledge' ? '#9333ea' : 'transparent', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer' }}
            >
              Knowledge Base
            </button>
            <button 
              onClick={() => setCurrentView('analytics')}
              style={{ background: currentView === 'analytics' ? '#059669' : 'transparent', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer' }}
            >
              Analytics
            </button>
            
            {/* ADMIN ONLY DROPDOWN MENU SIMULATION */}
            <div style={{ display: 'flex', gap: '0.5rem', borderLeft: '1px solid #374151', paddingLeft: '1rem', marginLeft: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', alignSelf: 'center', marginRight: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin</span>
              
              <button 
                onClick={() => setCurrentView('settings')}
                style={{ background: currentView === 'settings' ? '#4b5563' : 'transparent', color: 'white', border: '1px solid #4b5563', padding: '0.4rem 0.8rem', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}
              >
                Settings
              </button>
              <button 
                onClick={() => setCurrentView('audit')}
                style={{ background: currentView === 'audit' ? '#4b5563' : 'transparent', color: 'white', border: '1px solid #4b5563', padding: '0.4rem 0.8rem', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}
              >
                Logs
              </button>
              <button 
                onClick={() => setCurrentView('monitoring')}
                style={{ background: currentView === 'monitoring' ? '#4b5563' : 'transparent', color: 'white', border: '1px solid #4b5563', padding: '0.4rem 0.8rem', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}
              >
                System Health
              </button>
            </div>
          </>
        )}
        
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
            {userRole === 'customer' ? 'Customer' : 'Employee'}
          </span>
          <button 
            onClick={() => {setUserRole(null); setCurrentView('');}}
            style={{ background: 'transparent', color: '#f87171', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 'bold' }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div style={{ backgroundColor: '#f3f4f6', minHeight: 'calc(100vh - 64px)' }}>
        {currentView === 'customer-portal' && <TicketSubmissionForm />}
        {currentView === 'agent-dashboard' && <AgentDashboard onReviewTicket={() => setCurrentView('ticket-detail')} />}
        {currentView === 'ticket-detail' && <TicketDetail onBack={() => setCurrentView('agent-dashboard')} />}
        {currentView === 'knowledge' && <KnowledgeBase />}
        {currentView === 'analytics' && <AnalyticsDashboard />}
        {currentView === 'settings' && <AdminSettings />}
        {/* RENDER THE NEW VIEWS */}
        {currentView === 'audit' && <AuditLogs />}
        {currentView === 'monitoring' && <SystemMonitoring />}
      </div>
    </div>
  );
}

export default App;