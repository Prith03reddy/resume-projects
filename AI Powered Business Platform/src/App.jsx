import React, { useState } from 'react';
import TicketSubmissionForm from './ticketsubmissionform';
import AgentDashboard from './AgentDashboard';
import TicketDetail from './TicketDetail'; 
import KnowledgeBase from './KnowledgeBase';
import AnalyticsDashboard from './AnalyticsDashboard'; 
import Login from './Login';
// 1. IMPORT SETTINGS
import AdminSettings from './AdminSettings';

function App() {
  const [userRole, setUserRole] = useState(null); 
  const [currentView, setCurrentView] = useState(''); 

  const handleLogin = (role) => {
    setUserRole(role);
    setCurrentView(role === 'customer' ? 'customer-portal' : 'agent-dashboard');
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentView('');
  };

  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div>
      <nav style={{ 
        padding: '1rem 2rem', backgroundColor: '#111827', color: 'white', 
        display: 'flex', alignItems: 'center', gap: '1rem',
        position: 'sticky', top: 0, zIndex: 10
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
              style={{ background: (currentView === 'agent-dashboard' || currentView === 'ticket-detail') ? '#2563eb' : 'transparent', color: 'white', border: '1px solid #2563eb', padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer' }}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setCurrentView('knowledge')}
              style={{ background: currentView === 'knowledge' ? '#9333ea' : 'transparent', color: 'white', border: '1px solid #9333ea', padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer' }}
            >
              Knowledge Base
            </button>
            <button 
              onClick={() => setCurrentView('analytics')}
              style={{ background: currentView === 'analytics' ? '#059669' : 'transparent', color: 'white', border: '1px solid #059669', padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer' }}
            >
              Analytics
            </button>
            {/* 2. ADD SETTINGS BUTTON */}
            <button 
              onClick={() => setCurrentView('settings')}
              style={{ background: currentView === 'settings' ? '#4b5563' : 'transparent', color: 'white', border: '1px solid #4b5563', padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer' }}
            >
              Settings
            </button>
          </>
        )}
        
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
            {userRole === 'customer' ? 'Customer' : 'Employee'}
          </span>
          <button 
            onClick={handleLogout}
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
        {/* 3. RENDER SETTINGS VIEW */}
        {currentView === 'settings' && <AdminSettings />}
      </div>
    </div>
  );
}

export default App;