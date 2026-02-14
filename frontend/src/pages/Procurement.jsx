import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { procurementService } from '../services';
import { toast } from 'react-toastify';
import { FiAlertTriangle, FiClock, FiCheck, FiShoppingBag, FiBriefcase } from 'react-icons/fi';
import GlassCard from '../components/common/GlassCard';
import AnimatedButton from '../components/common/AnimatedButton';
import Badge from '../components/common/Badge';
import Skeleton from '../components/common/Skeleton';
import ProgressBar from '../components/common/ProgressBar';

const Procurement = () => {
    const [triggers, setTriggers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTriggers();
    }, []);

    const fetchTriggers = async () => {
        try {
            const response = await procurementService.getTriggers({ status: 'PENDING' });
            setTriggers(response.data.data);
        } catch (error) {
            toast.error('Failed to load procurement triggers');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await procurementService.updateTrigger(id, { status });
            toast.success(`Trigger marked as ${status}`);
            // Remove item from list with animation instead of full refetch
            setTriggers(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            toast.error('Failed to update trigger');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton width="400px" height="40px" />
                {[1, 2, 3].map(i => <Skeleton key={i} height="120px" className="rounded-xl" />)}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-4xl font-bold text-gradient mb-2">Procurement Triggers</h1>
                    <p className="text-gray-600">Automated stock replenishment alerts</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 bg-white p-2 pr-4 rounded-xl shadow-sm border border-gray-100"
                >
                    <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg text-white font-bold text-xl">
                        {triggers.length}
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                        Pending<br />Actions
                    </div>
                </motion.div>
            </div>

            <div className="space-y-4">
                <AnimatePresence>
                    {triggers.map((trigger, index) => {
                        const priorityConfig = {
                            CRITICAL: { color: 'danger', gradient: 'from-red-500 to-rose-500', icon: FiAlertTriangle },
                            HIGH: { color: 'warning', gradient: 'from-yellow-500 to-orange-500', icon: FiClock },
                            MEDIUM: { color: 'info', gradient: 'from-blue-500 to-cyan-500', icon: FiBriefcase },
                            LOW: { color: 'gray', gradient: 'from-gray-500 to-gray-600', icon: FiShoppingBag },
                        };

                        const config = priorityConfig[trigger.priority];
                        const Icon = config.icon;

                        return (
                            <motion.div
                                key={trigger.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ delay: index * 0.05 }}
                                layout
                            >
                                <GlassCard hover border className="relative overflow-hidden">
                                    {/* Left priority strip */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${config.gradient}`} />

                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pl-4">
                                        {/* Header Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Badge variant={config.color} size="sm" pulse={trigger.priority === 'CRITICAL'}>
                                                    <div className="flex items-center gap-1">
                                                        <Icon size={12} />
                                                        {trigger.priority}
                                                    </div>
                                                </Badge>
                                                <h3 className="text-lg font-bold text-gray-900">{trigger.component_name}</h3>
                                            </div>
                                            <p className="text-sm text-gray-600">{trigger.part_number}</p>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 flex-[2]">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Current Stock</p>
                                                <p className="text-xl font-bold text-gray-900">{trigger.current_stock}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Stock Level</p>
                                                <div className="mt-1">
                                                    <ProgressBar
                                                        progress={trigger.stock_percentage}
                                                        color={config.color}
                                                        showLabel
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Stockout In</p>
                                                <p className={`text-xl font-bold ${trigger.days_until_stockout < 5 ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {trigger.days_until_stockout} days
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Order Qty</p>
                                                <p className="text-xl font-bold text-blue-600">{trigger.recommended_order_quantity}</p>
                                            </div>
                                        </div>

                                        {/* Action */}
                                        <div className="flex items-center gap-2 pt-4 lg:pt-0 lg:border-l border-gray-100 lg:pl-6">
                                            <AnimatedButton
                                                onClick={() => handleUpdateStatus(trigger.id, 'ORDERED')}
                                                variant="primary"
                                                className="whitespace-nowrap"
                                                icon={<FiCheck />}
                                            >
                                                Mark Ordered
                                            </AnimatedButton>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {triggers.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20"
                    >
                        <div className="inline-block p-6 bg-green-50 rounded-full mb-4">
                            <FiCheck className="w-12 h-12 text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">All Clear!</h3>
                        <p className="text-gray-500">No pending procurement actions needed.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Procurement;
