import React, { useState } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, Paperclip } from 'lucide-react';
import './TicketSubmissionForm.css';

const TicketSubmissionForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    department: 'general',
    description: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call to backend
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Request Submitted</h2>
        <p className="text-gray-600 mb-6">
          Your ticket has been securely routed. Our AI is currently analyzing your request to assign it to the right expert.
        </p>
        <button 
          onClick={() => { setIsSuccess(false); setFormData({subject: '', department: 'general', description: ''}); }}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">How can we help you?</h2>
        <p className="text-gray-500 text-sm mt-1">Submit a request and our team will get back to you shortly.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject Line */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input 
            type="text" 
            required
            placeholder="Brief summary of the issue"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
          />
        </div>

        {/* Department / Category Hint */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Related Area</label>
          <select 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
            value={formData.department}
            onChange={(e) => setFormData({...formData, department: e.target.value})}
          >
            <option value="general">General Inquiry</option>
            <option value="billing">Billing & Payments</option>
            <option value="technical">Technical Support</option>
            <option value="hr">Human Resources (Internal)</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea 
            required
            rows="5"
            placeholder="Please provide as much detail as possible..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          ></textarea>
        </div>

        {/* Improved File Upload Zone */}
        <label className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-blue-400 transition-colors cursor-pointer group">
          {/* Hide the default input but stretch it over the box to keep it accessible/clickable */}
          <input 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            onChange={(e) => console.log(e.target.files)}
          />
          
          <UploadCloud className="w-8 h-8 mb-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
          <p className="text-sm font-medium text-gray-700">
            <span className="text-blue-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs mt-1 text-gray-500">SVG, PNG, JPG, or PDF (max. 10MB)</p>
        </label>

        {/* Submit Action */}
        <div className="pt-4 flex items-center justify-between border-t border-gray-100 ">
          <div className="flex items-center text-xs text-gray-500">
            <AlertCircle className="w-4 h-4 mr-1" />
            Protected by enterprise-grade security
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`px-6 py-2.5 rounded-lg text-white font-medium transition-all ${
              isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
            }`}
          >
            {isSubmitting ? 'Processing...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketSubmissionForm;