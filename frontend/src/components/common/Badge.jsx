import { motion } from 'framer-motion';

const Badge = ({
    children,
    variant = 'primary',
    size = 'md',
    pulse = false,
    className = ''
}) => {
    const variants = {
        primary: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
        success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
        warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
        danger: 'bg-gradient-to-r from-red-500 to-rose-500 text-white',
        gray: 'bg-gray-200 text-gray-800',
        info: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    return (
        <motion.span
            className={`
        inline-flex items-center justify-center
        rounded-full font-semibold uppercase tracking-wide
        ${variants[variant]}
        ${sizes[size]}
        ${pulse ? 'animate-pulse-glow' : ''}
        ${className}
      `}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
        >
            {children}
        </motion.span>
    );
};

export default Badge;
