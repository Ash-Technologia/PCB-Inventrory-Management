import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
    FiHome,
    FiPackage,
    FiCpu,
    FiTool,
    FiBarChart2,
    FiAlertTriangle,
    FiLogOut,
    FiZap,
} from 'react-icons/fi';
import AnimatedButton from '../common/AnimatedButton';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', path: '/', icon: FiHome },
        { name: 'Inventory', path: '/inventory', icon: FiPackage },
        { name: 'PCB Management', path: '/pcbs', icon: FiCpu },
        { name: 'Production', path: '/production', icon: FiTool },
        { name: 'Analytics', path: '/analytics', icon: FiBarChart2 },
        { name: 'Procurement', path: '/procurement', icon: FiAlertTriangle },
    ];

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <aside className="fixed inset-y-0 left-0 w-72 bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-2xl z-50 flex flex-col">
            {/* Logo Area */}
            <div className="p-8 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/30">
                        <FiZap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                            PCB Inventory
                        </h1>
                        <p className="text-xs text-purple-600 font-medium">
                            Electrolyte Solutions
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Menu
                </div>
                {navigation.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                        <Link key={item.path} to={item.path}>
                            <motion.div
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${active
                                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon
                                    className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                                        }`}
                                />
                                <span className="font-medium">{item.name}</span>
                                {active && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="ml-auto w-1.5 h-1.5 bg-white rounded-full"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                    />
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="p-4 m-4 bg-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 border-2 border-white flex items-center justify-center shadow-sm">
                        <span className="text-lg font-bold text-purple-700">
                            {user?.username?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                            {user?.username}
                        </p>
                        <p className="text-xs text-gray-500 font-medium truncate">
                            {user?.email}
                        </p>
                    </div>
                </div>

                <AnimatedButton
                    onClick={logout}
                    variant="secondary"
                    className="w-full text-sm py-2 hover:bg-white hover:text-red-600 hover:border-red-100"
                    icon={<FiLogOut />}
                >
                    Sign Out
                </AnimatedButton>
            </div>
        </aside>
    );
};

export default Sidebar;
