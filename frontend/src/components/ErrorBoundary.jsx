import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
                    <div className="max-w-md w-full glass-card border-red-500/50">
                        <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong.</h1>
                        <p className="text-gray-300 mb-6">
                            The application encountered an unexpected error. Please refresh the page.
                        </p>
                        <div className="bg-gray-900 p-4 rounded-lg overflow-auto max-h-40 mb-6 border border-white/10">
                            <code className="text-xs text-red-400 font-mono">
                                {this.state.error?.toString()}
                            </code>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full btn-primary bg-gradient-to-r from-red-500 to-red-700 border-none hover:from-red-600 hover:to-red-800"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
