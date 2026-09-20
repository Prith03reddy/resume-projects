import React, { useState } from 'react';
import { 
  UploadCloud, FileText, Database, CheckCircle, 
  Clock, Trash2, Search, BookOpen, AlertCircle 
} from 'lucide-react';
import './KnowledgeBase.css';

const KnowledgeBase = () => {
  const [isUploading, setIsUploading] = useState(false);
  
  // Mock data representing uploaded company documents
  const [documents, setDocuments] = useState([
    {
      id: 'DOC-001',
      name: 'Q3_Refund_Policy_2026.pdf',
      size: '2.4 MB',
      uploadDate: 'Sept 15, 2026',
      status: 'active',
      chunks: 142
    },
    {
      id: 'DOC-002',
      name: 'Server_Outage_SOP_v2.pdf',
      size: '1.1 MB',
      uploadDate: 'Sept 12, 2026',
      status: 'active',
      chunks: 85
    },
    {
      id: 'DOC-003',
      name: 'Employee_Handbook_Draft.docx',
      size: '5.6 MB',
      uploadDate: 'Just now',
      status: 'processing',
      chunks: 0
    }
  ]);

  const handleSimulatedUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setDocuments([{
        id: `DOC-00${documents.length + 1}`,
        name: 'New_Shipping_Guidelines.pdf',
        size: '1.8 MB',
        uploadDate: 'Just now',
        status: 'processing',
        chunks: 0
      }, ...documents]);
      setIsUploading(false);
    }, 1500);
  };

  return (
    <div className="kb-container">
      <div className="kb-header">
        <div>
          <h1 className="kb-title">AI Knowledge Base</h1>
          <p className="kb-subtitle">Upload company documents to train the RAG AI agent.</p>
        </div>
        <div className="vector-db-status">
          <Database size={16} className="text-purple-600" />
          <span>pgvector Connected • 227 Chunks Indexed</span>
        </div>
      </div>

      <div className="kb-layout">
        {/* Left Column: Upload Zone */}
        <div className="upload-section">
          <div className="card">
            <div className="card-header">
              <UploadCloud size={20} className="text-blue-600" />
              <h2 className="card-title">Upload New Document</h2>
            </div>
            
            <div 
              className={`drop-zone ${isUploading ? 'uploading' : ''}`}
              onClick={handleSimulatedUpload}
            >
              {isUploading ? (
                <div className="processing-state">
                  <div className="spinner"></div>
                  <p>Extracting text and generating embeddings...</p>
                </div>
              ) : (
                <>
                  <UploadCloud size={40} className="drop-icon" />
                  <p className="drop-title">Click to upload or drag & drop</p>
                  <p className="drop-desc">PDF, DOCX, or TXT (Max 50MB)</p>
                  <button className="btn-upload">Select File</button>
                </>
              )}
            </div>

            <div className="rag-explainer">
              <div className="explainer-header">
                <BookOpen size={16} />
                <span>How this works</span>
              </div>
              <p>
                Uploaded documents are split into smaller chunks, converted into mathematical vectors (embeddings), and stored in our PostgreSQL database. 
                When a ticket arrives, the AI searches this database for relevant policies to draft accurate answers.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Document List */}
        <div className="document-list-section">
          <div className="card">
            <div className="card-header flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-gray-700" />
                <h2 className="card-title">Indexed Documents</h2>
              </div>
              
              <div className="search-box">
                <Search size={16} className="text-gray-400" />
                <input type="text" placeholder="Search documents..." className="search-input" />
              </div>
            </div>

            <div className="doc-list">
              {documents.map(doc => (
                <div key={doc.id} className="doc-item">
                  <div className="doc-info-main">
                    <div className="doc-icon">
                      <FileText size={20} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="doc-name">{doc.name}</p>
                      <p className="doc-meta">{doc.size} • Uploaded {doc.uploadDate}</p>
                    </div>
                  </div>

                  <div className="doc-status-area">
                    {doc.status === 'processing' ? (
                      <div className="status-badge badge-processing">
                        <Clock size={14} className="spin-slow" />
                        Vectorizing...
                      </div>
                    ) : (
                      <div className="status-badge badge-active">
                        <CheckCircle size={14} />
                        Active ({doc.chunks} chunks)
                      </div>
                    )}
                    <button className="btn-icon-danger">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;