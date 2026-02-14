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
    ...props
}) => {
    const [ripples, setRipples] = useState([]);

    const handleClick = (e) => {
        if (disabled || loading) return;

        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newRipple = {
            x,
            y,
            id: Date.now(),
        };

        setRipples([...ripples, newRipple]);

        setTimeout(() => {
            setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
        }, 600);

        if (onClick) onClick(e);
    };

    const variants = {
        primary: 'gradient-primary text-white shadow-lg hover:shadow-glow-primary',
        secondary: 'bg-white text-gray-900 border-2 border-gray-200 hover:border-purple-500',
        success: 'gradient-success text-white shadow-lg hover:shadow-glow-success',
        danger: 'gradient-danger text-white shadow-lg',
        ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <motion.button
            onClick={handleClick}
            disabled={disabled || loading}
            className={`
        relative overflow-hidden rounded-lg font-semibold
        transition-all duration-200 
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
            whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
            {...props}
        >
            {/* Ripple effects */}
            {ripples.map((ripple) => (
                <motion.span
                    key={ripple.id}
                    className="absolute bg-white rounded-full pointer-events-none"
                    initial={{ width: 0, height: 0, opacity: 0.5, x: ripple.x, y: ripple.y }}
                    animate={{ width: 300, height: 300, opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{
                        left: 0,
                        top: 0,
                        transform: 'translate(-50%, -50%)',
                    }}
                />
            ))}

            {/* Content */}
            {loading ? (
                <div className="loading-spinner w-5 h-5 border-2" />
            ) : (
                <>
                    {icon && <span className="flex-shrink-0">{icon}</span>}
                    <span>{children}</span>
                </>
            )}
        </motion.button>
    );
};

export default AnimatedButton;
