import React from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[AuraTriage Boundary Catch]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetSession = () => {
    try {
      localStorage.removeItem('auratriage_user');
      localStorage.removeItem('auratriage_token');
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">System Interface Catch</h2>
              <p className="text-xs text-slate-400 mt-1">
                A component render exception was caught. Telemetry and database records remain fully secure.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-left">
                <p className="text-[11px] font-mono text-red-400 break-words font-semibold">
                  {String(this.state.error?.message || this.state.error)}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleResetSession}
                className="flex-1 flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2.5 px-4 rounded-xl border border-slate-700 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Session</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

