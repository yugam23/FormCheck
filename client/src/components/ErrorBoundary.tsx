import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * ErrorBoundary component that catches JavaScript errors regardless of where they happen 
 * in the child component tree, logs those errors, and displays a fallback UI.
 */
export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // You can also log the error to an error reporting service
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
                    <div className="glass-panel p-8 max-w-md w-full rounded-2xl border-red-500/20 shadow-2xl shadow-red-500/10 text-center space-y-6">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                            <AlertTriangle size={32} />
                        </div>
                        
                        <div className="space-y-2">
                            <h2 className="text-2xl font-display font-bold text-white">Application Error</h2>
                            <p className="text-muted-foreground text-sm">
                                Something went wrong while rendering this part of the application.
                            </p>
                        </div>
                        
                        {this.state.error && (
                            <div className="p-4 bg-black/40 rounded-xl text-left border border-white/5 overflow-hidden">
                                <code className="text-[10px] text-red-400 font-mono break-all whitespace-pre-wrap">
                                    {this.state.error.toString()}
                                </code>
                            </div>
                        )}

                        <button 
                            onClick={this.handleReload}
                            className="w-full btn-primary bg-white text-black hover:bg-gray-200 flex items-center justify-center py-3"
                        >
                            <RefreshCw size={18} className="mr-2" />
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
