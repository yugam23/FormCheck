import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    children,
    className,
    disabled,
    ...props
}) => {
    // Base styles
    const baseStyles = "relative flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
    
    // Variant styles (mapping to existing CSS or Tailwind classes)
    const variants = {
        primary: "btn-primary shadow-primary/20",
        secondary: "btn-secondary text-white", // Ensuring text contrast
        danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 rounded-xl border border-red-500/10",
        ghost: "hover:bg-white/5 text-muted-foreground hover:text-white rounded-lg",
    };

    // Size styles
    const sizes = {
        sm: "text-sm px-3 py-1.5 gap-2",
        md: "text-base px-6 py-3 gap-2.5",
        lg: "text-lg px-8 py-4 gap-3",
    };

    return (
        <button
            className={cn(
                baseStyles,
                variants[variant],
                sizes[size],
                loading && "cursor-wait",
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 18} />}
            {!loading && icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
        </button>
    );
};
