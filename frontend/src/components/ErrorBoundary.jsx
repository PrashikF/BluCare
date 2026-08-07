// src/components/ErrorBoundary.jsx
import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('BluCare Runtime Error Boundary Caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-bg-base p-6 text-primary">
          <div className="max-w-md w-full p-8 rounded-3xl bg-bg-surface/90 backdrop-blur-xl border border-rose-500/30 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.3)]">
              <ShieldAlert size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-primary">Unexpected Runtime Anomaly</h2>
              <p className="text-xs text-subdued leading-relaxed">
                BluCare+ encountered a temporary rendering exception. Your session state remains safe in storage.
              </p>
            </div>
            <button
              onClick={this.handleReload}
              className="w-full py-3 rounded-xl bg-sage text-bg-base font-semibold text-xs transition-all hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_var(--glow-sage)]"
            >
              <RefreshCw size={16} />
              <span>Reload Workspace</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
