import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ChartErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Chart Error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] bg-red-500/5 rounded-xl border border-red-500/10 text-red-400 p-4">
                    <AlertTriangle size={24} className="mb-2" />
                    <p className="text-sm font-medium">Failed to load chart</p>
                </div>
            );
        }

        return this.props.children;
    }
}
