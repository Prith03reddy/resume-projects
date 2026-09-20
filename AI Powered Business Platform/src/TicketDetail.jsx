import React, { useState } from 'react';
import { 
  ArrowLeft, Clock, AlertTriangle, User, Bot, Check, 
  Edit2, RefreshCw, X, ShieldAlert, Send ,Activity
} from 'lucide-react';
import './TicketDetail.css';

const TicketDetail = ({ onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [responseStatus, setResponseStatus] = useState(null); // 'approved' or 'regenerating'
  
  const [draftResponse, setDraftResponse] = useState(
    "Hi Acme Corp,\n\nI understand your production server is currently down and you are locked out. I have immediately escalated this to our Tier 3 infrastructure team.\n\nCould you please confirm if you made any recent changes to your firewall rules or IAM policies in the last 24 hours?\n\nWe are investigating the logs right now and will provide an update within the next 15 minutes."
  );

  const handleApprove = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setResponseStatus('approved');
    }, 1000);
  };

  const handleRegenerate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setDraftResponse("Hello Acme Corp,\n\nWe received your critical alert regarding the production server lockout. Our automated systems detected a potential IP block due to repeated failed SSH attempts.\n\nI have temporarily whitelisted your registered IP. Please try logging in again and let me know if you regain access.");
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="ticket-detail-container">
      {/* Top Navigation */}
      <button className="btn-back" onClick={onBack}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      {/* Ticket Header */}
      <div className="ticket-header-area">
        <div className="ticket-title-row">
          <h1 className="ticket-title">URGENT: Server is down, completely locked out of production!</h1>
          <span className="badge badge-critical">Critical</span>
          <span className="badge badge-open">Open</span>
        </div>
        <p className="ticket-meta-info">TCK-894 • Created 2 mins ago by Acme Corp</p>
      </div>

      <div className="ticket-layout">
        {/* Left Column: Conversation & AI Workspace */}
        <div className="conversation-column">
          
          {/* Customer Message */}
          <div className="message-bubble customer-message">
            <div className="message-header">
              <div className="avatar bg-gray-200"><User size={16} className="text-gray-600" /></div>
              <div>
                <span className="sender-name">Acme Corp</span>
                <span className="message-time">2 mins ago</span>
              </div>
            </div>
            <div className="message-body">
              Help! Our main production server just went offline. We can't SSH into it, and our customers are getting 502 Bad Gateway errors. We didn't change anything, it just suddenly locked us out. This is costing us thousands per minute. Please fix ASAP!
            </div>
          </div>

          {/* AI Response Workspace */}
          {responseStatus === 'approved' ? (
            <div className="message-bubble agent-message">
              <div className="message-header">
                <div className="avatar bg-blue-100"><User size={16} className="text-blue-600" /></div>
                <div>
                  <span className="sender-name">You (Sent)</span>
                  <span className="message-time">Just now</span>
                </div>
              </div>
              <div className="message-body whitespace-pre-wrap">{draftResponse}</div>
            </div>
          ) : (
            <div className="ai-workspace">
              <div className="ai-workspace-header">
                <div className="flex items-center gap-2">
                  <Bot size={18} className="text-purple-600" />
                  <span className="font-semibold text-purple-900">AI Suggested Response</span>
                </div>
                <span className="ai-confidence-badge">High Confidence</span>
              </div>
              
              <div className="ai-workspace-body">
                {isEditing ? (
                  <textarea 
                    className="ai-textarea"
                    value={draftResponse}
                    onChange={(e) => setDraftResponse(e.target.value)}
                    rows={6}
                  />
                ) : (
                  <div className="ai-draft-preview">{draftResponse}</div>
                )}
              </div>

              <div className="ai-workspace-footer">
                <div className="flex gap-2">
                  <button 
                    className="btn-secondary" 
                    onClick={() => setIsEditing(!isEditing)}
                    disabled={isProcessing}
                  >
                    {isEditing ? <Check size={16} /> : <Edit2 size={16} />}
                    {isEditing ? 'Done Editing' : 'Edit'}
                  </button>
                  <button 
                    className="btn-secondary" 
                    onClick={handleRegenerate}
                    disabled={isProcessing}
                  >
                    <RefreshCw size={16} className={isProcessing ? "spin" : ""} />
                    Regenerate
                  </button>
                </div>
                <button 
                  className="btn-primary" 
                  onClick={handleApprove}
                  disabled={isProcessing}
                >
                  <Send size={16} />
                  Approve & Send
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Intelligence & Metadata */}
        <div className="metadata-column">
          
          {/* SLA Card */}
          <div className="meta-card sla-breach-warning">
            <div className="meta-card-header text-red-700">
              <AlertTriangle size={16} />
              <span className="font-semibold">SLA Deadline</span>
            </div>
            <div className="sla-time text-red-600">13m 45s</div>
            <p className="text-xs text-red-500 mt-1">Resolution required within 15 mins for Critical priority.</p>
          </div>

          {/* AI Analysis Card */}
          <div className="meta-card">
            <div className="meta-card-header border-b pb-2 mb-3">
              <Activity size={16} className="text-blue-600" />
              <span className="font-semibold text-gray-800">AI Analysis</span>
            </div>
            
            <div className="analysis-row">
              <span className="analysis-label">Category</span>
              <span className="analysis-value">Technical Support</span>
            </div>
            
            <div className="analysis-row">
              <span className="analysis-label">Sentiment</span>
              <span className="analysis-value text-red-600 font-medium">Negative (Panicked)</span>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Overall Confidence</span>
                <span className="font-bold text-gray-700">99%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '99%' }}></div>
              </div>
            </div>
          </div>

          {/* Ticket Details Card */}
          <div className="meta-card">
            <div className="meta-card-header border-b pb-2 mb-3">
              <span className="font-semibold text-gray-800">Ticket Details</span>
            </div>
            <div className="analysis-row">
              <span className="analysis-label">Assigned Dept</span>
              <span className="analysis-value">Tier 3 Infrastructure</span>
            </div>
            <div className="analysis-row">
              <span className="analysis-label">Assigned Agent</span>
              <span className="analysis-value">You</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TicketDetail;