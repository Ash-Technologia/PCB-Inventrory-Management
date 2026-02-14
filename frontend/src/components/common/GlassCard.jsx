import { motion } from 'framer-motion';

const GlassCard = ({
    children,
    className = '',
    hover = true,
    gradient = false,
    glass = true,
    onClick,
    ...props
}) => {
    return (
        <motion.div
            onClick={onClick}
            className={`
        ${glass ? 'glass' : ''} rounded-xl p-6 
        ${gradient ? 'border-2 border-transparent bg-gradient-to-br from-white/20 to-white/5' : ''}
        ${hover ? 'hover-lift cursor-pointer' : ''}
        ${className}
      `}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={hover ? { scale: 1.02 } : {}}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;
