import React, { useState } from 'react';
import { ShieldAlert, AlertCircle, Clock, CheckCircle, Smile, Frown, Meh, Activity, X } from 'lucide-react';
import './agentdashboard.css';

// Notice the { onReviewTicket } inside the parentheses here!
const AgentDashboard = ({ onReviewTicket }) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const [tickets] = useState([
    {
      id: 'TCK-892',
      subject: 'My payment was deducted but the order failed',
      customer: 'Sarah Jenkins',
      time: '10 mins ago',
      aiCategory: 'Billing',
      aiPriority: 'High',
      aiSentiment: 'Negative',
      aiConfidence: 94,
      status: 'Open'
    },
    {
      id: 'TCK-893',
      subject: 'How do I add a new team member to my workspace?',
      customer: 'David Chen',
      time: '1 hour ago',
      aiCategory: 'Technical Support',
      aiPriority: 'Low',
      aiSentiment: 'Neutral',
      aiConfidence: 88,
      status: 'Open'
    },
    {
      id: 'TCK-894',
      subject: 'URGENT: Server is down, completely locked out of production!',
      customer: 'Acme Corp',
      time: '2 mins ago',
      aiCategory: 'Technical Support',
      aiPriority: 'Critical',
      aiSentiment: 'Negative',
      aiConfidence: 99,
      status: 'Open'
    },
    {
      id: 'TCK-895',
      subject: 'Password reset instructions not arriving',
      customer: 'Emma Watson',
      time: '3 hours ago',
      aiCategory: 'Account',
      aiPriority: 'Low',
      aiSentiment: 'Neutral',
      aiConfidence: 97,
      status: 'Resolved'
    }
  ]);

  const openCount = tickets.filter(t => t.status === 'Open').length;
  const criticalCount = tickets.filter(t => t.aiPriority === 'Critical').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;

  const filteredTickets = tickets.filter(ticket => {
    if (activeFilter === 'open') return ticket.status === 'Open';
    if (activeFilter === 'critical') return ticket.aiPriority === 'Critical';
    if (activeFilter === 'resolved') return ticket.status === 'Resolved';
    return true; 
  });

  const handleFilterClick = (filterType) => {
    setActiveFilter(activeFilter === filterType ? 'all' : filterType);
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Critical': return 'badge-critical';
      case 'High': return 'badge-high';
      case 'Medium': return 'badge-medium';
      case 'Low': return 'badge-low';
      default: return 'badge-default';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch(sentiment) {
      case 'Positive': return <Smile className="icon-sm text-green-600" />;
      case 'Negative': return <Frown className="icon-sm text-red-600" />;
      default: return <Meh className="icon-sm text-gray-500" />;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Agent Workspace</h1>
          <p className="dashboard-subtitle">Review incoming tickets and AI classifications.</p>
        </div>
        <div className="ai-status">
          <Activity className="icon-sm text-blue-500 ai-pulse" />
          <span>AI Engine Active</span>
        </div>
      </div>

      <div className="kpi-grid">
        <div 
          className={`kpi-card ${activeFilter === 'open' ? 'active-filter' : ''}`}
          onClick={() => handleFilterClick('open')}
        >
          <div className="kpi-icon-wrapper bg-blue-100 text-blue-600"><Clock /></div>
          <div className="kpi-details">
            <p className="kpi-label">Open Tickets</p>
            <p className="kpi-value">{openCount}</p>
          </div>
        </div>
        
        <div 
          className={`kpi-card ${activeFilter === 'critical' ? 'active-filter' : ''}`}
          onClick={() => handleFilterClick('critical')}
        >
          <div className="kpi-icon-wrapper bg-red-100 text-red-600"><ShieldAlert /></div>
          <div className="kpi-details">
            <p className="kpi-label">Critical Priority</p>
            <p className="kpi-value">{criticalCount}</p>
          </div>
        </div>

        <div 
          className={`kpi-card ${activeFilter === 'resolved' ? 'active-filter' : ''}`}
          onClick={() => handleFilterClick('resolved')}
        >
          <div className="kpi-icon-wrapper bg-green-100 text-green-600"><CheckCircle /></div>
          <div className="kpi-details">
            <p className="kpi-label">AI Auto-Resolved</p>
            <p className="kpi-value">{resolvedCount}</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="table-title">
            {activeFilter === 'all' ? 'All Recent Tickets' : 'Filtered Tickets'}
          </h2>
          
          {activeFilter !== 'all' && (
            <button 
              onClick={() => setActiveFilter('all')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#6b7280', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X className="icon-xs" /> Clear Filter
            </button>
          )}
        </div>

        <table className="ticket-table">
          <thead>
            <tr>
              <th>Ticket Info</th>
              <th>AI Category</th>
              <th>AI Priority</th>
              <th>AI Sentiment</th>
              <th>AI Confidence</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="ticket-row">
                  <td>
                    <div className="ticket-subject">{ticket.subject}</div>
                    <div className="ticket-meta">
                      <span className="ticket-id">{ticket.id}</span> • {ticket.customer} • {ticket.time}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-default">{ticket.aiCategory}</span>
                  </td>
                  <td>
                    <span className={`badge ${getPriorityColor(ticket.aiPriority)}`}>
                      {ticket.aiPriority === 'Critical' && <AlertCircle className="icon-xs mr-1" />}
                      {ticket.aiPriority}
                    </span>
                  </td>
                  <td>
                    <div className="sentiment-wrapper">
                      {getSentimentIcon(ticket.aiSentiment)}
                      <span className="sentiment-text">{ticket.aiSentiment}</span>
                    </div>
                  </td>
                  <td>
                    <div className="confidence-wrapper">
                      <div className="confidence-bar-bg">
                        <div 
                          className={`confidence-bar-fill ${ticket.aiConfidence > 90 ? 'bg-green-500' : 'bg-orange-500'}`} 
                          style={{ width: `${ticket.aiConfidence}%` }}
                        ></div>
                      </div>
                      <span className="confidence-text">{ticket.aiConfidence}%</span>
                    </div>
                  </td>
                  <td>
                    {/* The click event is wired up right here! */}
                    <button className="btn-review" onClick={onReviewTicket}>
                      {ticket.status === 'Resolved' ? 'View' : 'Review'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                  No tickets found matching this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgentDashboard;