import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
    FiHome, FiPackage, FiCpu, FiTool,
    FiBarChart2, FiAlertTriangle, FiLogOut,
    FiZap, FiMoon, FiSun, FiChevronRight
} from 'react-icons/fi';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', path: '/', icon: FiHome, desc: 'Overview' },
        { name: 'Inventory', path: '/inventory', icon: FiPackage, desc: 'Components' },
        { name: 'PCB Models', path: '/pcbs', icon: FiCpu, desc: 'Boards' },
        { name: 'Production', path: '/production', icon: FiTool, desc: 'Build runs' },
        { name: 'Procurement', path: '/procurement', icon: FiAlertTriangle, desc: 'Alerts' },
        { name: 'Analytics', path: '/analytics', icon: FiBarChart2, desc: 'Insights' },
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <aside className="fixed inset-y-0 left-0 w-64 z-50 flex flex-col transition-all duration-300"
            style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--color-border)' }}
        >
            {/* Logo */}
            <div className="px-5 py-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-3">
                    <motion.div
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        className="p-2 rounded-xl gradient-aurora shadow-glow-purple flex-shrink-0"
                    >
                        <FiZap className="w-5 h-5 text-white" />
                    </motion.div>
                    <div>
                        <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">PCB Inventory</h1>
                        <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wider">Electrolyte Solutions</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">
                <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">Navigation</p>
                {navigation.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                        <Link key={item.path} to={item.path}>
                            <motion.div
                                whileHover={{ x: 2 }}
                                whileTap={{ scale: 0.97 }}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group relative ${active
                                        ? 'gradient-aurora text-white shadow-glow-purple'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                {active && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute inset-0 rounded-xl gradient-aurora opacity-100"
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                                    />
                                )}
                                <Icon className={`w-4 h-4 flex-shrink-0 relative z-10 ${active ? 'text-white' : ''}`} />
                                <div className="flex-1 relative z-10">
                                    <span className="text-sm font-semibold block leading-tight">{item.name}</span>
                                </div>
                                {active && <FiChevronRight className="w-3 h-3 relative z-10 text-white/70" />}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Panel */}
            <div className="p-3 border-t space-y-2" style={{ borderColor: 'var(--color-border)' }}>
                {/* Dark mode toggle - FIXED */}
                <button
                    onClick={toggleDarkMode}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 group"
                >
                    <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                            <AnimatePresence mode="wait">
                                {darkMode ? (
                                    <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                                        <FiSun className="w-3.5 h-3.5 text-amber-500" />
                                    </motion.div>
                                ) : (
                                    <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                                        <FiMoon className="w-3.5 h-3.5 text-slate-600" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </div>
                    {/* Toggle pill */}
                    <div
                        className={`relative w-9 h-5 rounded-full transition-all duration-300 ${darkMode ? 'bg-purple-600' : 'bg-slate-200'}`}
                    >
                        <motion.div
                            animate={{ x: darkMode ? 16 : 2 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
                        />
                    </div>
                </button>

                {/* User info */}
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="w-7 h-7 rounded-lg gradient-aurora flex items-center justify-center flex-shrink-0 shadow-glow-purple">
                        <span className="text-xs font-bold text-white">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.username || 'User'}</p>
                        <p className="text-[10px] text-slate-400 truncate">{user?.role || 'Viewer'}</p>
                    </div>
                    <motion.button
                        onClick={logout}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Logout"
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <FiLogOut className="w-3.5 h-3.5" />
                    </motion.button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
