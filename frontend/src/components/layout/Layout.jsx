import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';

const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
};

const Layout = () => {
    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-[#03070e] transition-colors duration-300">
            <Sidebar />
            <div className="flex-1 ml-64 min-h-screen">
                <main className="p-6 max-w-[1400px] mx-auto">
                    <motion.div
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                        <Outlet />
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
