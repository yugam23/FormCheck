import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils'; // Assuming utilities are in this path

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (type: ToastType, message: string, duration?: number) => void;
    removeToast: (id: string) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback((type: ToastType, message: string, duration = 5000) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: Toast = { id, type, message, duration };
        
        setToasts((prev) => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    const success = (message: string, duration?: number) => addToast('success', message, duration);
    const error = (message: string, duration?: number) => addToast('error', message, duration);
    const warning = (message: string, duration?: number) => addToast('warning', message, duration);
    const info = (message: string, duration?: number) => addToast('info', message, duration);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
            {children}
            {createPortal(
                <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                    {toasts.map((toast) => (
                        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-400" />,
        error: <AlertCircle className="w-5 h-5 text-red-400" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
        info: <Info className="w-5 h-5 text-blue-400" />
    };

    const styles = {
        success: 'border-green-500/20 bg-green-500/10 text-green-100',
        error: 'border-red-500/20 bg-red-500/10 text-red-100',
        warning: 'border-amber-500/20 bg-amber-500/10 text-amber-100',
        info: 'border-blue-500/20 bg-blue-500/10 text-blue-100'
    };

    return (
        <div 
            className={cn(
                "pointer-events-auto min-w-[300px] max-w-md p-4 rounded-xl border backdrop-blur-md shadow-lg animate-in slide-in-from-right-full fade-in duration-300 flex items-start gap-3",
                styles[toast.type]
            )}
        >
            <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1 text-sm font-medium leading-relaxed">{toast.message}</div>
            <button 
                onClick={() => onRemove(toast.id)}
                className="flex-shrink-0 text-white/50 hover:text-white transition-colors"
                aria-label="Close"
            >
                <X size={16} />
            </button>
        </div>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
