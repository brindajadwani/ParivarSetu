import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="bg-white border-2 border-orange-600 p-8 max-w-lg w-full shadow-2xl rounded-none space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Application Display Notice
                </h2>
                <div className="text-xs text-slate-500">
                  Government of Gujarat &bull; ParivarSetu
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              An unexpected render notice occurred while displaying this view. You can return to the public landing page or reload the session.
            </p>

            <div className="p-3 bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px] break-all">
              {this.state.error?.message || "Render display error"}
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={this.handleReset}
                className="px-5 py-2 bg-orange-700 hover:bg-orange-800 text-white font-bold text-xs rounded-none cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Portal
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  if (this.props.onExitToLanding) {
                    this.props.onExitToLanding();
                  } else {
                    window.location.href = '/';
                  }
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-none cursor-pointer bg-white hover:bg-slate-100"
              >
                Return to Landing Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
