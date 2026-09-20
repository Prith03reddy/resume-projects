import React from 'react';
import { 
  TrendingUp, Users, Clock, CheckCircle, 
  Target, AlertTriangle, Zap, BarChart2 
} from 'lucide-react';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <div>
          <h1 className="analytics-title">Operations & AI Analytics</h1>
          <p className="analytics-subtitle">Real-time performance metrics for the last 30 days.</p>
        </div>
        <button className="btn-export">
          <DownloadIcon /> Export Report
        </button>
      </div>

      {/* Top Overview Metric Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Total Tickets</span>
            <div className="icon-box bg-blue-100 text-blue-600"><BarChart2 size={18} /></div>
          </div>
          <div className="metric-value">2,845</div>
          <div className="metric-trend positive">
            <TrendingUp size={14} /> <span>+12.5% from last month</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">SLA Compliance</span>
            <div className="icon-box bg-green-100 text-green-600"><Target size={18} /></div>
          </div>
          <div className="metric-value">94.2%</div>
          <div className="metric-trend positive">
            <TrendingUp size={14} /> <span>+2.1% from last month</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Avg Resolution Time</span>
            <div className="icon-box bg-orange-100 text-orange-600"><Clock size={18} /></div>
          </div>
          <div className="metric-value">4h 12m</div>
          <div className="metric-trend negative">
            <TrendingUp size={14} className="rotate-180" /> <span>-45m (Faster)</span>
          </div>
        </div>

        <div className="metric-card ai-glow-card">
          <div className="metric-header">
            <span className="metric-label">AI Resolution Rate</span>
            <div className="icon-box bg-purple-100 text-purple-600"><Zap size={18} /></div>
          </div>
          <div className="metric-value text-purple-700">38.5%</div>
          <div className="metric-trend positive">
            <CheckCircle size={14} /> <span>1,095 tickets solved without humans</span>
          </div>
        </div>
      </div>

      <div className="charts-layout">
        {/* Left Chart: Ticket Volume by Department */}
        <div className="chart-card">
          <h2 className="chart-title">Ticket Volume by Department</h2>
          <div className="css-bar-chart">
            <div className="bar-row">
              <span className="bar-label">Technical Support</span>
              <div className="bar-track">
                <div className="bar-fill bg-blue-500" style={{ width: '85%' }}></div>
              </div>
              <span className="bar-value">1,240</span>
            </div>
            <div className="bar-row">
              <span className="bar-label">Billing & Payments</span>
              <div className="bar-track">
                <div className="bar-fill bg-blue-400" style={{ width: '60%' }}></div>
              </div>
              <span className="bar-value">845</span>
            </div>
            <div className="bar-row">
              <span className="bar-label">Account Management</span>
              <div className="bar-track">
                <div className="bar-fill bg-blue-300" style={{ width: '45%' }}></div>
              </div>
              <span className="bar-value">520</span>
            </div>
            <div className="bar-row">
              <span className="bar-label">Human Resources</span>
              <div className="bar-track">
                <div className="bar-fill bg-blue-200" style={{ width: '20%' }}></div>
              </div>
              <span className="bar-value">240</span>
            </div>
          </div>
        </div>

        {/* Right Chart: AI Engine Performance */}
        <div className="chart-card">
          <h2 className="chart-title">AI Engine Accuracy</h2>
          <div className="ai-stats-grid">
            
            <div className="ai-stat-box">
              <div className="stat-name">Categorization Accuracy</div>
              <div className="stat-progress-circle">
                <div className="circle-value">96%</div>
              </div>
            </div>

            <div className="ai-stat-row">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Human Override Rate</span>
                <span className="text-sm font-bold text-red-500">12%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '12%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Agents edited the AI's suggested response in 12% of cases.</p>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

// Simple SVG icon for the export button
const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);

export default AnalyticsDashboard;