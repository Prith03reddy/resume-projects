import React from 'react';
import { Server, Database, Activity, Cpu, CheckCircle, AlertTriangle, Wifi, HardDrive } from 'lucide-react';
import './SystemMonitoring.css';
const SystemMonitoring = () => {
  return (
    <div className="settings-container fade-in">
      <div className="settings-header">
        <div>
          <h1 className="settings-title">System Health & Monitoring</h1>
          <p className="settings-subtitle">Real-time infrastructure, API, and database status.</p>
        </div>
        <div className="security-badge bg-green-500 text-white px-3 py-1 rounded-full flex-align-center gap-1 text-sm font-bold">
          <CheckCircle size={16} /> All Systems Operational
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid-2-col mb-4">
        
        {/* Core API Service */}
        <div className="settings-card p-4 flex-between">
          <div className="flex-align-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><Server size={24} /></div>
            <div>
              <h3 className="font-bold text-gray-800">Core Backend API</h3>
              <p className="text-sm text-gray-500">Node.js / Express Cluster</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-green-500 font-bold flex-align-center gap-1 justify-end"><CheckCircle size={14}/> Online</div>
            <div className="text-xs text-gray-500">Uptime: 99.9% • Latency: 42ms</div>
          </div>
        </div>

        {/* AI Engine Service */}
        <div className="settings-card p-4 flex-between">
          <div className="flex-align-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg text-purple-600"><Activity size={24} /></div>
            <div>
              <h3 className="font-bold text-gray-800">AI Inference Engine</h3>
              <p className="text-sm text-gray-500">Python / FastAPI Worker</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-green-500 font-bold flex-align-center gap-1 justify-end"><CheckCircle size={14}/> Online</div>
            <div className="text-xs text-gray-500">Model: GPT-4-Turbo • Queue: 0</div>
          </div>
        </div>

        {/* PostgreSQL Database */}
        <div className="settings-card p-4 flex-between">
          <div className="flex-align-center gap-4">
            <div className="bg-orange-100 p-3 rounded-lg text-orange-600"><Database size={24} /></div>
            <div>
              <h3 className="font-bold text-gray-800">PostgreSQL (Relational)</h3>
              <p className="text-sm text-gray-500">Users, Tickets, Audit Logs</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-green-500 font-bold flex-align-center gap-1 justify-end"><CheckCircle size={14}/> Online</div>
            <div className="text-xs text-gray-500">Conn: 24/100 • Size: 4.2 GB</div>
          </div>
        </div>

        {/* Vector Database (RAG) */}
        <div className="settings-card p-4 flex-between" style={{ borderLeft: '4px solid #eab308' }}>
          <div className="flex-align-center gap-4">
            <div className="bg-yellow-100 p-3 rounded-lg text-yellow-600"><HardDrive size={24} /></div>
            <div>
              <h3 className="font-bold text-gray-800">pgvector Storage</h3>
              <p className="text-sm text-gray-500">Knowledge Base Embeddings</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-yellow-600 font-bold flex-align-center gap-1 justify-end"><AlertTriangle size={14}/> Warning</div>
            <div className="text-xs text-gray-500">Re-indexing in progress (84%)</div>
          </div>
        </div>

      </div>

      {/* Server Resources */}
      <div className="settings-card mb-4">
        <div className="card-header"><h2 className="card-title">Server Resource Usage (AWS EC2)</h2></div>
        <div className="card-body">
          <div className="mb-4">
            <div className="flex-between mb-1">
              <span className="font-semibold text-gray-700 flex-align-center gap-1"><Cpu size={16}/> CPU Utilization</span>
              <span className="font-bold text-gray-800">45%</span>
            </div>
            <div style={{ width: '100%', background: '#e5e7eb', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '45%', background: '#3b82f6', height: '100%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex-between mb-1">
              <span className="font-semibold text-gray-700 flex-align-center gap-1"><Database size={16}/> Memory Allocation</span>
              <span className="font-bold text-gray-800">6.2 GB / 16.0 GB</span>
            </div>
            <div style={{ width: '100%', background: '#e5e7eb', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '38%', background: '#10b981', height: '100%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitoring;