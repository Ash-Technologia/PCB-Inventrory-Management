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
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [triggers, setTriggers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, triggersRes, topConsumedRes, categoryRes] = await Promise.all([
                analyticsService.getDashboardStats(),
                procurementService.getTriggers({ status: 'PENDING' }),
                analyticsService.getTopConsumed(),
                analyticsService.getCategoryDistribution(),
            ]);

            setStats({
                ...statsRes.data.data,
                top_consumed: topConsumedRes.data.data,
                category_distribution: categoryRes.data.data
            });
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
                <div>
                    <h2 className="text-sm font-semibold text-purple-600 tracking-wide uppercase mb-1">
                        Electrolyte Solutions
                    </h2>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Overview Dashboard
                    </h1>
                </div>
                <p className="text-gray-600 text-lg mt-2">
                    Real-time insights for production and inventory
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

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Consumed Components (Bar Chart) */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Top Consumed Components</h2>
                    <div className="h-64 flex items-center justify-center">
                        <Bar
                            data={{
                                labels: stats?.top_consumed?.map(item => item.component_name) || [],
                                datasets: [{
                                    label: 'Units Consumed',
                                    data: stats?.top_consumed?.map(item => item.total_consumed) || [],
                                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                                    borderColor: 'rgb(59, 130, 246)',
                                    borderWidth: 1
                                }]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { position: 'top' },
                                    title: { display: false }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Category Distribution (Doughnut Chart) */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Category Distribution</h2>
                    <div className="h-64 flex items-center justify-center">
                        <Doughnut
                            data={{
                                labels: stats?.category_distribution?.map(item => item.category) || [],
                                datasets: [{
                                    data: stats?.category_distribution?.map(item => item.count) || [],
                                    backgroundColor: [
                                        'rgba(255, 99, 132, 0.6)',
                                        'rgba(54, 162, 235, 0.6)',
                                        'rgba(255, 206, 86, 0.6)',
                                        'rgba(75, 192, 192, 0.6)',
                                        'rgba(153, 102, 255, 0.6)',
                                        'rgba(255, 159, 64, 0.6)',
                                    ],
                                    borderColor: [
                                        'rgba(255, 99, 132, 1)',
                                        'rgba(54, 162, 235, 1)',
                                        'rgba(255, 206, 86, 1)',
                                        'rgba(75, 192, 192, 1)',
                                        'rgba(153, 102, 255, 1)',
                                        'rgba(255, 159, 64, 1)',
                                    ],
                                    borderWidth: 1,
                                }]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { position: 'right' }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/inventory" className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 group">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <FiPackage />
                    </div>
                    <span className="font-medium text-gray-700">Add Component</span>
                </Link>
                <Link to="/production" className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 group">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-100 transition-colors">
                        <FiCpu />
                    </div>
                    <span className="font-medium text-gray-700">Start Production</span>
                </Link>
                <Link to="/import-export" className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 group">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
                        <FiDollarSign />
                    </div>
                    <span className="font-medium text-gray-700">Import / Export</span>
                </Link>
                <Link to="/analytics" className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 group">
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-100 transition-colors">
                        <FiTrendingUp />
                    </div>
                    <span className="font-medium text-gray-700">View Analytics</span>
                </Link>
            </div>

            {/* Recent Procurement Triggers */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Action Required: Low Stock</h2>
                    <Link to="/procurement" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        View All
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {triggers.length > 0 ? (
                        triggers.map((trigger, index) => (
                            <div key={trigger.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-red-100 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-red-50 rounded-lg">
                                        <FiAlertTriangle className="text-red-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">{trigger.component_name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-500">Stock: <span className="font-medium text-gray-700">{trigger.current_stock}</span></span>
                                            <span className="text-gray-300">|</span>
                                            <span className="text-xs text-gray-500">Min: {trigger.min_stock_level || Math.round(trigger.monthly_required * 0.2)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${trigger.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {trigger.priority}
                                    </span>
                                    <span className="text-xs text-blue-600 font-medium hover:underline cursor-pointer">
                                        Order +{trigger.recommended_order_quantity}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            All stock levels are healthy!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
