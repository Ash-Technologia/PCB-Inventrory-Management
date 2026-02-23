import { motion } from 'framer-motion';
import { useState } from 'react';

const AnimatedButton = ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon = null,
    className = '',
    type = 'button',
    ...props
}) => {
    const variants = {
        primary: 'gradient-aurora text-white shadow-glow-purple hover:shadow-glow-purple',
        secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700',
        success: 'gradient-success text-white shadow-glow-success',
        danger: 'gradient-danger text-white',
        ghost: 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
        outline: 'border-2 border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
        xl: 'px-8 py-4 text-lg',
    };

    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                relative overflow-hidden rounded-xl font-semibold
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
                ${variants[variant]}
                ${sizes[size]}
                ${className}
            `}
            whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
            {...props}
        >
            {loading ? (
                <div className="loading-spinner" />
            ) : (
                <>
                    {icon && <span className="flex-shrink-0">{icon}</span>}
                    {children && <span>{children}</span>}
                </>
            )}
        </motion.button>
    );
};

export default AnimatedButton;
