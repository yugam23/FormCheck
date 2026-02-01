import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
    children, 
    className, 
    hoverEffect = false,
    ...props 
}) => {
    return (
        <div 
            className={cn(
                "glass-panel rounded-3xl p-6 border border-white/5 bg-black/40 backdrop-blur-xl",
                hoverEffect && "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300",
                className
            )} 
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
    return (
        <div className={cn("flex flex-col space-y-1.5 mb-6", className)} {...props}>
            {children}
        </div>
    );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => {
    return (
        <h3 className={cn("font-bold text-lg flex items-center", className)} {...props}>
            {children}
        </h3>
    );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
    return (
        <div className={cn("pt-0", className)} {...props}>
            {children}
        </div>
    );
};
