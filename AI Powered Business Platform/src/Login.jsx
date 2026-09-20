import React, { useState, useEffect } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, User, Briefcase, UserPlus, Database } from 'lucide-react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [role, setRole] = useState('customer'); // 'customer' or 'employee'
  
  // Form Data
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Generate random particles for the background effect
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    const generatedParticles = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 10 + 10}s`,
      animationDelay: `${Math.random() * 5}s`,
      size: `${Math.random() * 6 + 2}px`,
      opacity: Math.random() * 0.5 + 0.2
    }));
    setParticles(generatedParticles);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (mode === 'signup') {
      setStatusMessage(`Creating account...`);
      // Simulate saving to different databases based on role
      setTimeout(() => {
        setStatusMessage(`Saving to ${role === 'customer' ? 'Customer_DB' : 'Employee_Directory'}...`);
        setTimeout(() => {
          setIsLoading(false);
          setStatusMessage('');
          onLogin(role); // Auto-login after signup
        }, 1200);
      }, 1000);
    } else {
      // Standard Login simulation
      setTimeout(() => {
        setIsLoading(false);
        onLogin(role);
      }, 1200);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setStatusMessage('');
  };

  return (
    <div className="login-wrapper">
      {/* Decorative Background Elements & Particles */}
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>
      <div className="particles-container">
        {particles.map(p => (
          <div 
            key={p.id} 
            className="particle"
            style={{ 
              left: p.left, width: p.size, height: p.size, 
              animationDuration: p.animationDuration, animationDelay: p.animationDelay, opacity: p.opacity
            }}
          ></div>
        ))}
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="logo-box">
            {mode === 'login' ? <ShieldCheck size={28} className="text-blue-600" /> : <UserPlus size={28} className="text-purple-600" />}
          </div>
          <h1 className="login-title">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          
          {/* Role Toggle Switch */}
          <div className="role-toggle-container">
            <button 
              type="button"
              className={`role-btn ${role === 'customer' ? 'active' : ''}`}
              onClick={() => setRole('customer')}
            >
              <User size={16} /> Customer
            </button>
            <button 
              type="button"
              className={`role-btn ${role === 'employee' ? 'active' : ''}`}
              onClick={() => setRole('employee')}
            >
              <Briefcase size={16} /> Employee
            </button>
          </div>
          
          <p className="login-subtitle">
            {mode === 'login' 
              ? (role === 'customer' ? 'Sign in to track your support tickets.' : 'Sign in to access the Agent Workspace.')
              : (role === 'customer' ? 'Register for a new customer support account.' : 'Register for an internal employee account.')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Name Field - Only visible during Sign Up */}
          {mode === 'signup' && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input 
                  type="text" 
                  required 
                  placeholder="John Doe"
                  className="auth-input hover-effect"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                required 
                placeholder={role === 'customer' ? 'user@company.com' : 'agent@ai-ops.com'}
                className="auth-input hover-effect"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <div className="label-row">
              <label className="input-label">Password</label>
              {mode === 'login' && <a href="#" className="forgot-link">Forgot password?</a>}
            </div>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                className="auth-input hover-effect"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Database Saving Status Indicator */}
          {statusMessage && (
            <div className="db-status-message">
              <Database size={14} className="spin-slow" />
              {statusMessage}
            </div>
          )}

          <button 
            type="submit" 
            className={`btn-login ${isLoading ? 'loading' : ''} ${mode === 'signup' ? 'btn-signup' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="spinner-small"></span>
            ) : (
              <>
                {mode === 'login' ? 'Sign In' : 'Register Account'} <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button type="button" onClick={toggleMode} className="toggle-mode-btn">
              {mode === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;