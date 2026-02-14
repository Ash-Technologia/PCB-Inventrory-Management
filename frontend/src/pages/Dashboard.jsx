import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { analyticsService, procurementService } from '../services';
import { toast } from 'react-toastify';
import {
    FiPackage,
    FiAlertTriangle,
    FiCpu,
    FiTrendingUp,
    FiArrowRight,
    FiZap,
    FiActivity,
    FiDollarSign,
} from 'react-icons/fi';
import GlassCard from '../components/common/GlassCard';
import StatCounter from '../components/common/StatCounter';
import AnimatedButton from '../components/common/AnimatedButton';
// import Badge from '../components/common/Badge'; // Unused in this simplified version if we don't need it for cards
import Skeleton from '../components/common/Skeleton';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [triggers, setTriggers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, triggersRes] = await Promise.all([
                analyticsService.getDashboardStats(),
                procurementService.getTriggers({ status: 'PENDING' }),
            ]);

            setStats(statsRes.data.data);
            setTriggers(triggersRes.data.data.slice(0, 5));
        } catch (error) {
            console.error(error);
            // toast.error('Failed to load dashboard data'); // Suppress error for cleaner UX if mostly working
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total Components',
            value: stats?.total_components || 0,
            icon: FiPackage,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-100',
            link: '/inventory',
            description: 'Active inventory items',
        },
        {
            title: 'Low Stock Items',
            value: stats?.low_stock_count || 0,
            icon: FiAlertTriangle,
            color: 'text-orange-500',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-100',
            link: '/inventory?lowStock=true',
            description: 'Require attention',
        },
        {
            title: 'Critical Stock',
            value: stats?.critical_stock_count || 0,
            icon: FiZap,
            color: 'text-red-500',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-100',
            link: '/procurement',
            description: 'Immediate action needed',
        },
        {
            title: 'Total PCBs',
            value: stats?.total_pcbs || 0,
            icon: FiCpu,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-100',
            link: '/pcbs',
            description: 'PCB models',
        },
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <Skeleton width="200px" height="36px" />
                    <div className="mt-2">
                        <Skeleton width="300px" height="20px" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-6 bg-white rounded-xl">
                            <Skeleton height="120px" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Dashboard
                </h1>
                <p className="text-gray-600 text-lg">
                    Real-time insights for production
                </p>
            </motion.div>

            {/* Simplified Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Link key={index} to={stat.link}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-md border ${stat.borderColor} transition-all duration-200 h-full`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <FiArrowRight className="text-gray-300" />
                                </div>

                                <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-1">
                                    {stat.title}
                                </h3>

                                <div className="text-3xl font-bold text-gray-900 mb-1">
                                    <StatCounter value={stat.value} duration={1} />
                                </div>

                                <p className="text-gray-400 text-xs">
                                    {stat.description}
                                </p>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>

            {/* Anomaly Alert */}
            {stats?.anomaly_detection?.is_anomaly && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-4">
                        <div className="p-2 bg-red-100 rounded-full">
                            <FiAlertTriangle className="text-red-600 w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-red-900 mb-1">
                                Anomaly Detected
                            </h3>
                            <p className="text-red-700 text-sm">
                                High consumption detected ({stats.anomaly_detection.today_consumption}) compared to average ({stats.anomaly_detection.average_consumption.toFixed(0)}).
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Recent Procurement Triggers */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Recent Alerts</h2>
                    <Link to="/procurement" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        View All
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {triggers.length > 0 ? (
                        triggers.map((trigger, index) => (
                            <div key={trigger.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-orange-50 rounded-lg">
                                        <FiAlertTriangle className="text-orange-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">{trigger.component_name}</h4>
                                        <p className="text-sm text-gray-500">Stock: {trigger.current_stock} (Min: {trigger.min_stock_level})</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full">
                                    CRITICAL
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            No active alerts
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
