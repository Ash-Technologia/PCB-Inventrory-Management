import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsService, procurementService } from '../services';
import { toast } from 'react-toastify';
import {
    FiPackage, FiAlertTriangle, FiCpu,
    FiTrendingUp, FiArrowRight, FiZap,
    FiActivity, FiRefreshCw, FiCornerDownRight,
} from 'react-icons/fi';
import GlassCard from '../components/common/GlassCard';
import Skeleton from '../components/common/Skeleton';
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    BarElement, Title, Tooltip, Legend, ArcElement,
    LineElement, PointElement, Filler,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, LinearScale, BarElement,
    Title, Tooltip, Legend, ArcElement,
    LineElement, PointElement, Filler
);

const StatCard = ({ title, value, icon: Icon, color, bg, link, description, index }) => (
    <Link to={link}>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4 }}
            whileHover={{ y: -4 }}
            className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-card dark:shadow-card-dark cursor-pointer transition-all duration-300 hover:shadow-lg dark:hover:shadow-slate-900 hover:border-slate-200 dark:hover:border-slate-700 relative overflow-hidden"
        >
            {/* Background decoration */}
            <div className={`absolute top-0 right-0 w-20 h-20 ${bg} opacity-5 rounded-full -translate-y-4 translate-x-4 group-hover:opacity-10 transition-opacity`} />

            <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${bg} ${color} shadow-sm`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 ${bg} ${color}`}>
                    <FiArrowRight className="w-3 h-3" />
                </div>
            </div>

            <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                {value?.toLocaleString() || 0}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">{title}</div>
            <div className="text-xs text-slate-400">{description}</div>
        </motion.div>
    </Link>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [triggers, setTriggers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboardData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        try {
            const [statsRes, triggersRes, topRes, catRes] = await Promise.all([
                analyticsService.getDashboardStats(),
                procurementService.getTriggers({ status: 'PENDING' }),
                analyticsService.getTopConsumed(),
                analyticsService.getCategoryDistribution(),
            ]);
            setStats({
                ...statsRes.data.data,
                top_consumed: topRes.data.data,
                category_distribution: catRes.data.data,
            });
            setTriggers(triggersRes.data.data.slice(0, 6));
        } catch (err) {
            if (!silent) toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const statCards = [
        { title: 'Total Components', value: stats?.total_components, icon: FiPackage, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', link: '/inventory', description: 'Active in inventory', index: 0 },
        { title: 'Low Stock Items', value: stats?.low_stock_count, icon: FiAlertTriangle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', link: '/inventory?lowStock=true', description: 'Need restocking', index: 1 },
        { title: 'Critical Stock', value: stats?.critical_stock_count, icon: FiZap, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', link: '/procurement', description: 'Immediate action needed', index: 2 },
        { title: 'PCB Models', value: stats?.total_pcbs, icon: FiCpu, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', link: '/pcbs', description: 'Registered boards', index: 3 },
    ];

    const chartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e293b', titleColor: '#e2e8f0', bodyColor: '#94a3b8' } },
        scales: { x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } }, y: { grid: { color: 'rgba(148,163,184,0.1)' }, ticks: { color: '#94a3b8', font: { size: 11 } } } },
    };

    const barData = {
        labels: stats?.top_consumed?.map(i => i.component_name?.slice(0, 12)) || [],
        datasets: [{
            data: stats?.top_consumed?.map(i => i.total_consumed) || [],
            backgroundColor: 'rgba(124,58,237,0.7)',
            borderRadius: 6,
        }],
    };

    const doughnutColors = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];
    const doughnutData = {
        labels: stats?.category_distribution?.map(i => i.category) || [],
        datasets: [{
            data: stats?.category_distribution?.map(i => i.count) || [],
            backgroundColor: doughnutColors,
            borderWidth: 0,
            hoverOffset: 8,
        }],
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton height="48px" width="250px" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} height="140px" className="rounded-2xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton height="280px" className="rounded-2xl" />
                    <Skeleton height="280px" className="rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start justify-between"
            >
                <div>
                    <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1">
                        Welcome back, {user?.username} 👋
                    </p>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                        Operations Dashboard
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Real-time inventory and production insights</p>
                </div>
                <motion.button
                    onClick={() => fetchDashboardData(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:border-purple-300 transition-all shadow-sm"
                >
                    <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </motion.button>
            </motion.div>

            {/* Anomaly Alert */}
            {stats?.anomaly_detection?.is_anomaly && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/50 rounded-2xl"
                >
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                        <FiActivity className="text-red-600 dark:text-red-400 w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-red-900 dark:text-red-300 text-sm mb-0.5">Consumption Anomaly Detected</h3>
                        <p className="text-red-700 dark:text-red-400 text-xs">
                            Today's consumption ({stats.anomaly_detection.today_consumption}) is significantly above average ({stats.anomaly_detection.average_consumption?.toFixed(0)}).
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(card => <StatCard key={card.title} {...card} />)}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <GlassCard className="lg:col-span-3" noPad>
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <h2 className="font-bold text-slate-900 dark:text-white text-sm">Top Consumed Components</h2>
                            <p className="text-xs text-slate-400">Units consumed this period</p>
                        </div>
                        <FiTrendingUp className="text-purple-500 w-5 h-5" />
                    </div>
                    <div className="p-5 h-56">
                        {stats?.top_consumed?.length > 0 ? (
                            <Bar data={barData} options={chartOptions} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 text-sm">No data available</div>
                        )}
                    </div>
                </GlassCard>

                <GlassCard className="lg:col-span-2" noPad>
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="font-bold text-slate-900 dark:text-white text-sm">Category Distribution</h2>
                        <p className="text-xs text-slate-400">By component type</p>
                    </div>
                    <div className="p-5 h-56 flex items-center justify-center">
                        {stats?.category_distribution?.length > 0 ? (
                            <Doughnut
                                data={doughnutData}
                                options={{
                                    responsive: true, maintainAspectRatio: false,
                                    plugins: {
                                        legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 }, padding: 12, boxWidth: 10 } },
                                        tooltip: { backgroundColor: '#1e293b', titleColor: '#e2e8f0', bodyColor: '#94a3b8' },
                                    },
                                    cutout: '65%',
                                }}
                            />
                        ) : (
                            <div className="text-slate-400 text-sm">No data available</div>
                        )}
                    </div>
                </GlassCard>
            </div>

            {/* Quick Actions */}
            <GlassCard noPad>
                <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="font-bold text-slate-900 dark:text-white text-sm">Quick Actions</h2>
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'Add Component', to: '/inventory', icon: FiPackage, style: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' },
                        { label: 'Start Production', to: '/production', icon: FiCpu, style: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' },
                        { label: 'View Procurement', to: '/procurement', icon: FiAlertTriangle, style: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20' },
                        { label: 'Analytics', to: '/analytics', icon: FiTrendingUp, style: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20' },
                    ].map((action) => (
                        <Link key={action.label} to={action.to}>
                            <motion.div
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer transition-all text-center"
                            >
                                <div className={`p-2.5 rounded-xl ${action.style}`}>
                                    <action.icon className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{action.label}</span>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </GlassCard>

            {/* Procurement Triggers */}
            <GlassCard noPad>
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h2 className="font-bold text-slate-900 dark:text-white text-sm">Action Required — Low Stock</h2>
                        <p className="text-xs text-slate-400">{triggers.length} pending procurement triggers</p>
                    </div>
                    <Link to="/procurement" className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1">
                        View All <FiArrowRight className="w-3 h-3" />
                    </Link>
                </div>
                <div className="p-4">
                    {triggers.length > 0 ? (
                        <div className="space-y-2">
                            {triggers.map((trigger, i) => (
                                <motion.div
                                    key={trigger.id}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-lg ${trigger.priority === 'CRITICAL' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
                                            <FiAlertTriangle className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{trigger.component_name}</p>
                                            <p className="text-xs text-slate-400">Stock: {trigger.current_stock} units</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${trigger.priority === 'CRITICAL' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                                            {trigger.priority}
                                        </span>
                                        <p className="text-xs text-slate-400 mt-1">Order +{trigger.recommended_order_quantity}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                            <FiZap className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm font-medium">All stock levels are healthy!</p>
                        </div>
                    )}
                </div>
            </GlassCard>
        </div>
    );
};

export default Dashboard;
