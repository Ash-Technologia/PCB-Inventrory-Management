import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import { analyticsService } from '../services';
import { toast } from 'react-toastify';
import GlassCard from '../components/common/GlassCard';
import Skeleton from '../components/common/Skeleton';
import { FiPieChart, FiBarChart2 } from 'react-icons/fi';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

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
            console.error(error);
            // toast.error('Failed to load analytics'); // Silent fail for cleaner UX
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton width="300px" height="40px" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton height="500px" className="rounded-xl" />
                    <Skeleton height="500px" className="rounded-xl" />
                </div>
            </div>
        );
    }

    // Chart Options
    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: { display: false },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right' },
        },
    };

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
                <p className="text-gray-600">Inventory distribution and consumption insights</p>
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

                        <div className="flex-1 w-full min-h-0 relative">
                            <Bar
                                data={{
                                    labels: topConsumed.map(item => item.component_name),
                                    datasets: [{
                                        label: 'Units Consumed',
                                        data: topConsumed.map(item => item.total_consumed),
                                        backgroundColor: 'rgba(59, 130, 246, 0.5)',
                                        borderColor: 'rgb(59, 130, 246)',
                                        borderWidth: 1
                                    }]
                                }}
                                options={barOptions}
                            />
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
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <FiPieChart className="text-purple-600 w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Category Distribution</h2>
                        </div>

                        <div className="flex-1 w-full min-h-0 relative flex items-center justify-center">
                            <Doughnut
                                data={{
                                    labels: categoryDist.map(item => item.category),
                                    datasets: [{
                                        data: categoryDist.map(item => item.count),
                                        backgroundColor: [
                                            'rgba(255, 99, 132, 0.6)',
                                            'rgba(54, 162, 235, 0.6)',
                                            'rgba(255, 206, 86, 0.6)',
                                            'rgba(75, 192, 192, 0.6)',
                                            'rgba(153, 102, 255, 0.6)',
                                            'rgba(255, 159, 64, 0.6)',
                                            'rgba(199, 199, 199, 0.6)',
                                            'rgba(83, 102, 255, 0.6)',
                                        ],
                                        borderColor: [
                                            'rgba(255, 99, 132, 1)',
                                            'rgba(54, 162, 235, 1)',
                                            'rgba(255, 206, 86, 1)',
                                            'rgba(75, 192, 192, 1)',
                                            'rgba(153, 102, 255, 1)',
                                            'rgba(255, 159, 64, 1)',
                                            'rgba(199, 199, 199, 1)',
                                            'rgba(83, 102, 255, 1)',
                                        ],
                                        borderWidth: 1,
                                    }]
                                }}
                                options={doughnutOptions}
                            />
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </div>
    );
};

export default Analytics;
