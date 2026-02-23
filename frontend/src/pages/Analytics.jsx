import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { analyticsService } from '../services';
import GlassCard from '../components/common/GlassCard';
import Skeleton from '../components/common/Skeleton';
import { FiPieChart, FiBarChart2, FiTrendingUp, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    Title, Tooltip, Legend, ArcElement, LineElement, PointElement, Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement, Filler);

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#3b82f6'];

const tooltipStyle = {
    backgroundColor: '#0d1117',
    titleColor: '#e2e8f0',
    bodyColor: '#94a3b8',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    padding: 10,
};

const Analytics = () => {
    const [topConsumed, setTopConsumed] = useState([]);
    const [categoryDist, setCategoryDist] = useState([]);
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAnalytics = async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        try {
            const [topRes, catRes, trendRes] = await Promise.all([
                analyticsService.getTopConsumed({ limit: 10 }),
                analyticsService.getCategoryDistribution(),
                analyticsService.getConsumptionTrends({ days: 14 }),
            ]);
            setTopConsumed(topRes.data.data || []);
            setCategoryDist(catRes.data.data || []);
            setTrends(trendRes.data.data || []);
        } catch (err) {
            if (!silent) toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchAnalytics(); }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton width="200px" height="40px" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton height="350px" className="rounded-2xl" />
                    <Skeleton height="350px" className="rounded-2xl" />
                </div>
            </div>
        );
    }

    const barData = {
        labels: topConsumed.map(i => i.component_name?.slice(0, 14) || ''),
        datasets: [{
            label: 'Units Consumed',
            data: topConsumed.map(i => i.total_consumed),
            backgroundColor: COLORS[0] + 'cc',
            borderRadius: 6,
            borderSkipped: false,
        }],
    };

    const doughnutData = {
        labels: categoryDist.map(i => i.category),
        datasets: [{
            data: categoryDist.map(i => i.count),
            backgroundColor: COLORS,
            borderWidth: 0,
            hoverOffset: 10,
        }],
    };

    const lineData = {
        labels: trends.map(t => t.date || t.day || ''),
        datasets: [{
            label: 'Daily Consumption',
            data: trends.map(t => t.total || t.count || 0),
            borderColor: COLORS[0],
            backgroundColor: COLORS[0] + '18',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: COLORS[0],
        }],
    };

    const baseOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: tooltipStyle },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 11 } } },
            y: { grid: { color: 'rgba(148,163,184,0.08)' }, ticks: { color: '#64748b', font: { size: 11 } } },
        },
    };

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start justify-between"
            >
                <div>
                    <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1">Insights</p>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Analytics</h1>
                    <p className="text-sm text-slate-400 mt-1">Consumption trends and inventory distribution</p>
                </div>
                <motion.button
                    onClick={() => fetchAnalytics(true)}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:border-purple-300 shadow-sm"
                >
                    <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
                </motion.button>
            </motion.div>

            {/* Trend Line */}
            {trends.length > 0 && (
                <GlassCard noPad>
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"><FiTrendingUp className="w-4 h-4" /></div>
                        <div>
                            <h2 className="font-bold text-slate-900 dark:text-white text-sm">Consumption Trend (Last 14 Days)</h2>
                            <p className="text-xs text-slate-400">Daily units consumed</p>
                        </div>
                    </div>
                    <div className="p-5 h-52">
                        <Line data={lineData} options={baseOptions} />
                    </div>
                </GlassCard>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar chart */}
                <GlassCard noPad>
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"><FiBarChart2 className="w-4 h-4" /></div>
                        <div>
                            <h2 className="font-bold text-slate-900 dark:text-white text-sm">Top 10 Consumed Components</h2>
                            <p className="text-xs text-slate-400">Units consumed this period</p>
                        </div>
                    </div>
                    <div className="p-5 h-80">
                        {topConsumed.length > 0 ? (
                            <Bar data={barData} options={baseOptions} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 text-sm">No data yet</div>
                        )}
                    </div>
                    {/* Ranking table */}
                    {topConsumed.length > 0 && (
                        <div className="px-5 pb-5">
                            <div className="space-y-2">
                                {topConsumed.slice(0, 5).map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                        <div className="flex items-center gap-2.5">
                                            <span className="w-5 h-5 rounded-full gradient-aurora flex items-center justify-center text-[9px] font-black text-white">{i + 1}</span>
                                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]">{item.component_name}</span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-500">{item.total_consumed} units</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </GlassCard>

                {/* Doughnut */}
                <GlassCard noPad>
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"><FiPieChart className="w-4 h-4" /></div>
                        <div>
                            <h2 className="font-bold text-slate-900 dark:text-white text-sm">Category Distribution</h2>
                            <p className="text-xs text-slate-400">By component type</p>
                        </div>
                    </div>
                    <div className="p-5 h-64 flex items-center justify-center">
                        {categoryDist.length > 0 ? (
                            <Doughnut data={doughnutData} options={{
                                responsive: true, maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        labels: { color: '#64748b', font: { size: 11 }, padding: 14, boxWidth: 10, usePointStyle: true },
                                    },
                                    tooltip: tooltipStyle,
                                },
                                cutout: '68%',
                            }} />
                        ) : <div className="text-slate-400 text-sm">No data yet</div>}
                    </div>
                    {/* Category list */}
                    {categoryDist.length > 0 && (
                        <div className="px-5 pb-5">
                            <div className="space-y-2">
                                {categoryDist.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                                            <span className="text-xs text-slate-600 dark:text-slate-400">{item.category}</span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.count} items</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
};

export default Analytics;
