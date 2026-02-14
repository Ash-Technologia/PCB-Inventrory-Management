import { motion } from 'framer-motion';

const ProgressBar = ({ progress = 0, color = 'primary', showLabel = false, className = '' }) => {
    const colors = {
        primary: 'bg-gradient-to-r from-purple-500 to-pink-500',
        success: 'bg-gradient-to-r from-green-500 to-emerald-500',
        warning: 'bg-gradient-to-r from-yellow-500 to-orange-500',
        danger: 'bg-gradient-to-r from-red-500 to-rose-500',
    };

    return (
        <div className={`w-full ${className}`}>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                    className={`h-full ${colors[color]} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </div>
            {showLabel && (
                <div className="mt-1 text-xs text-gray-600 text-right">
                    {Math.round(progress)}%
                </div>
            )}
        </div>
    );
};

export default ProgressBar;
