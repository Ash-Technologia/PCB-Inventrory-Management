import { motion } from 'framer-motion';

const GlassCard = ({
    children,
    className = '',
    hover = false,
    onClick,
    noPad = false,
    ...props
}) => {
    return (
        <motion.div
            onClick={onClick}
            className={`
                bg-white dark:bg-slate-900
                border border-slate-100 dark:border-slate-800
                rounded-2xl shadow-card dark:shadow-card-dark
                transition-all duration-300
                ${hover ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-slate-900' : ''}
                ${noPad ? '' : 'p-6'}
                ${className}
            `}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;
