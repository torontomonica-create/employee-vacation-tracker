import React from 'react';
import { cn } from '../ToastContainer';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
    className,
    variant = 'primary',
    size = 'md',
    ...props
}) => {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
                {
                    'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
                    'bg-slate-100 text-slate-900 hover:bg-slate-200': variant === 'secondary',
                    'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
                    'hover:bg-slate-100 text-slate-700': variant === 'ghost',
                    'h-8 px-3 text-sm': size === 'sm',
                    'h-10 px-4 py-2': size === 'md',
                    'h-12 px-6': size === 'lg',
                },
                className
            )}
            {...props}
        />
    );
};
