import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

const StatCounter = ({ value, duration = 2, suffix = '', prefix = '' }) => {
    const spring = useSpring(0, { duration: duration * 1000 });
    const display = useTransform(spring, (current) =>
        Math.floor(current).toLocaleString()
    );

    useEffect(() => {
        spring.set(value);
    }, [spring, value]);

    return (
        <motion.span className="font-bold tabular-nums">
            {prefix}
            <motion.span>{display}</motion.span>
            {suffix}
        </motion.span>
    );
};

export default StatCounter;
