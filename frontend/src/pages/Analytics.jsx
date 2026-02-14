import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { analyticsService } from '../services';
import { toast } from 'react-toastify';
import GlassCard from '../components/common/GlassCard';
import Skeleton from '../components/common/Skeleton';
import { FiPieChart, FiBarChart2 } from 'react-icons/fi';

const Analytics = () => {
    const [topConsumed, setTopConsumed] = useState([]);
    const [categoryDist, setCategoryDist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [topRes, catRes] = await Promise.all([
                analyticsService.getTopConsumed({ limit: 10 }),
                analyticsService.getCategoryDistribution(),
            ]);
            setTopConsumed(topRes.data.data);
            setCategoryDist(catRes.data.data);
        } catch (error) {
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/90 backdrop-blur-md p-3 border border-gray-100 rounded-lg shadow-xl">
                    <p className="font-semibold text-gray-900">{label}</p>
                    <p className="text-blue-600 font-medium">
                        {payload[0].value} units
                    </p>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton width="300px" height="40px" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton height="400px" className="rounded-xl" />
                    <Skeleton height="400px" className="rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-4xl font-bold text-gradient mb-2">Analytics Dashboard</h1>
                <p className="text-gray-600">Deep dive into consumption trends and inventory distribution</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Consumed Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <GlassCard className="h-[500px] flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <FiBarChart2 className="text-blue-600 w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Top Consumed Components</h2>
                        </div>

                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topConsumed} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="component_name"
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                    />
                                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="total_consumed"
                                        fill="url(#colorTotal)"
                                        radius={[4, 4, 0, 0]}
                                        animationDuration={1500}
                                    >
                                        {topConsumed.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Category Distribution Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <GlassCard className="h-[500px] flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <FiPieChart className="text-green-600 w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Category Distribution</h2>
                        </div>

                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryDist}
                                        dataKey="component_count"
                                        nameKey="category"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={5}
                                        animationDuration={1500}
                                    >
                                        {categoryDist.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        layout="vertical"
                                        verticalAlign="middle"
                                        align="right"
                                        wrapperStyle={{ fontSize: '12px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </div>
    );
};

export default Analytics;
