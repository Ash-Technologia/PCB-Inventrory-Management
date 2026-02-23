import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { procurementService } from '../services';
import { toast } from 'react-toastify';
import {
    FiAlertTriangle, FiClock, FiShoppingBag, FiCheckCircle,
    FiPlus, FiX, FiRefreshCw, FiTrendingDown, FiPackage,
    FiDollarSign, FiCalendar, FiCheck
} from 'react-icons/fi';
import GlassCard from '../components/common/GlassCard';
import AnimatedButton from '../components/common/AnimatedButton';
import Badge from '../components/common/Badge';
import Skeleton from '../components/common/Skeleton';
import ProgressBar from '../components/common/ProgressBar';

// ─── Modal Overlay ────────────────────────────────────────────────────────────
const ModalOverlay = ({ children, onClose }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
        <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
        >
            {children}
        </motion.div>
    </motion.div>
);

// ─── Trigger Detail Modal ─────────────────────────────────────────────────────
const TriggerModal = ({ trigger, onClose, onUpdate }) => {
    const [updating, setUpdating] = useState(false);

    const handleAction = async (status) => {
        setUpdating(true);
        try {
            await procurementService.updateTrigger(trigger.id, { status });
            toast.success(`Trigger marked as ${status}`);
            onUpdate();
            onClose();
        } catch {
            toast.error('Failed to update trigger');
        } finally {
            setUpdating(false);
        }
    };

    const stockPct = trigger.monthly_required_quantity > 0
        ? Math.round((trigger.current_stock / trigger.monthly_required_quantity) * 100)
        : 0;

    return (
        <ModalOverlay onClose={onClose}>
            <div className="p-6">
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <Badge color={trigger.priority === 'CRITICAL' ? 'red' : 'yellow'} size="sm">
                            {trigger.priority || trigger.status}
                        </Badge>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-2">{trigger.component_name}</h2>
                        <p className="text-sm text-slate-400">{trigger.part_number}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                        <FiX />
                    </button>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                        { label: 'Current Stock', value: trigger.current_stock ?? '—', icon: FiPackage, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                        { label: 'Min Required', value: trigger.min_stock_level ?? trigger.monthly_required_quantity ?? '—', icon: FiAlertTriangle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                        { label: 'Order Qty', value: trigger.recommended_order_quantity ?? '—', icon: FiShoppingBag, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                    ].map(m => (
                        <div key={m.label} className={`p-3 rounded-xl ${m.bg} text-center`}>
                            <div className={`flex justify-center mb-1.5 ${m.color}`}><m.icon className="w-4 h-4" /></div>
                            <p className={`text-xl font-black ${m.color}`}>{m.value}</p>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">{m.label}</p>
                        </div>
                    ))}
                </div>

                {/* Stock level bar */}
                <div className="mb-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Level</span>
                        <span className={`text-sm font-black ${stockPct < 30 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>{stockPct}%</span>
                    </div>
                    <ProgressBar
                        progress={stockPct}
                        color={stockPct < 30 ? 'danger' : 'warning'}
                        showLabel={false}
                    />
                    <p className="text-xs text-slate-400 mt-2">Supplier: <span className="font-semibold text-slate-600 dark:text-slate-300">{trigger.supplier || 'N/A'}</span></p>
                </div>

                <div className="flex gap-3">
                    <AnimatedButton
                        onClick={() => handleAction('ORDERED')}
                        loading={updating}
                        className="flex-1"
                        icon={<FiShoppingBag />}
                    >
                        Mark Ordered
                    </AnimatedButton>
                    <AnimatedButton
                        onClick={() => handleAction('PENDING')}
                        variant="secondary"
                        className="flex-1"
                        icon={<FiClock />}
                    >
                        Set Pending
                    </AnimatedButton>
                </div>
            </div>
        </ModalOverlay>
    );
};

// ─── New PO Modal ─────────────────────────────────────────────────────────────
const NewPOModal = ({ onClose, onSave }) => {
    const [form, setForm] = useState({
        supplier: '',
        items: '',
        total: '',
        expectedDate: '',
        notes: '',
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.supplier || !form.items || !form.total) {
            toast.error('Please fill in all required fields');
            return;
        }
        setSaving(true);
        // Simulate save (would call API in full implementation)
        await new Promise(r => setTimeout(r, 600));
        onSave({
            id: `PO-${Date.now()}`,
            supplier: form.supplier,
            items: parseInt(form.items),
            total: parseFloat(form.total),
            status: 'PENDING',
            date: new Date().toISOString().split('T')[0],
            notes: form.notes,
        });
        toast.success('Purchase Order created!');
        setSaving(false);
        onClose();
    };

    return (
        <ModalOverlay onClose={onClose}>
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">New Purchase Order</h2>
                        <p className="text-sm text-slate-400">Create a new supplier purchase order</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                        <FiX />
                    </button>
                </div>
                <form onSubmit={handleSave} className="space-y-4">
                    {[
                        { label: 'Supplier Name *', key: 'supplier', placeholder: 'DigiKey, Mouser, Arrow...', type: 'text' },
                        { label: 'Number of Items *', key: 'items', placeholder: '10', type: 'number' },
                        { label: 'Total Value (USD) *', key: 'total', placeholder: '0.00', type: 'number', step: '0.01' },
                        { label: 'Expected Delivery Date', key: 'expectedDate', type: 'date' },
                    ].map(f => (
                        <div key={f.key}>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">{f.label}</label>
                            <input
                                type={f.type}
                                step={f.step}
                                value={form[f.key]}
                                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                placeholder={f.placeholder}
                                className="input-field"
                            />
                        </div>
                    ))}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Notes</label>
                        <textarea
                            rows={3}
                            value={form.notes}
                            onChange={e => setForm({ ...form, notes: e.target.value })}
                            placeholder="Additional notes..."
                            className="input-field resize-none"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <AnimatedButton type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</AnimatedButton>
                        <AnimatedButton type="submit" loading={saving} className="flex-1" icon={<FiCheck />}>Create PO</AnimatedButton>
                    </div>
                </form>
            </div>
        </ModalOverlay>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Procurement = () => {
    const [triggers, setTriggers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('triggers');
    const [selectedTrigger, setSelectedTrigger] = useState(null);
    const [showPOModal, setShowPOModal] = useState(false);
    const [purchaseOrders, setPurchaseOrders] = useState([
        { id: 'PO-2024-001', supplier: 'DigiKey', items: 12, total: 450.50, status: 'PENDING', date: '2024-03-20', notes: '' },
        { id: 'PO-2024-002', supplier: 'Mouser', items: 8, total: 1230.00, status: 'COMPLETED', date: '2024-03-18', notes: '' },
        { id: 'PO-2024-003', supplier: 'Arrow Electronics', items: 5, total: 890.25, status: 'RECEIVED', date: '2024-03-15', notes: '' },
    ]);

    const fetchTriggers = async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        try {
            const response = await procurementService.getTriggers();
            setTriggers(response.data.data || []);
        } catch (error) {
            if (!silent) toast.error('Failed to load procurement triggers');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchTriggers(); }, []);

    const poStatusColor = { PENDING: 'yellow', COMPLETED: 'green', RECEIVED: 'cyan', CANCELLED: 'red' };

    const pendingCount = triggers.filter(t => t.status === 'PENDING').length;
    const criticalCount = triggers.filter(t => t.priority === 'CRITICAL').length;

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton width="220px" height="40px" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} height="100px" className="rounded-2xl" />)}
                </div>
                <Skeleton height="300px" className="rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1">Supply Chain</p>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Procurement Hub</h1>
                    <p className="text-sm text-slate-400 mt-1">Automated stock triggers and purchase orders</p>
                </div>
                <motion.button
                    onClick={() => fetchTriggers(true)}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:border-purple-300 shadow-sm"
                >
                    <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
                </motion.button>
            </motion.div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                    { label: 'Total Triggers', value: triggers.length, icon: FiAlertTriangle, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                    { label: 'Pending Action', value: pendingCount, icon: FiClock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                    { label: 'Critical Items', value: criticalCount, icon: FiTrendingDown, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
                ].map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-card dark:shadow-card-dark"
                    >
                        <div className={`p-2.5 rounded-xl ${s.bg} ${s.color} w-fit mb-3`}><s.icon className="w-4 h-4" /></div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{s.value}</p>
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{s.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Tab Switch */}
            <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl w-fit">
                {[
                    { id: 'triggers', label: 'Stock Triggers' },
                    { id: 'pos', label: 'Purchase Orders' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === tab.id
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        {tab.label}
                        {tab.id === 'triggers' && pendingCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'triggers' ? (
                    <motion.div key="triggers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                        {triggers.length === 0 ? (
                            <GlassCard className="text-center py-16">
                                <FiCheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Clear!</h3>
                                <p className="text-slate-400 text-sm mt-1">No components require procurement action.</p>
                            </GlassCard>
                        ) : (
                            triggers.map((trigger, idx) => {
                                const currentStock = trigger.current_stock ?? 0;
                                const minRequired = trigger.min_stock_level ?? trigger.monthly_required_quantity ?? 0;
                                const stockPct = minRequired > 0 ? Math.min(100, Math.round((currentStock / minRequired) * 100)) : 0;
                                const isCritical = trigger.priority === 'CRITICAL' || stockPct < 25;

                                return (
                                    <motion.div
                                        key={trigger.id}
                                        initial={{ opacity: 0, x: -12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.04 }}
                                        onClick={() => setSelectedTrigger(trigger)}
                                        className="group cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-card dark:shadow-card-dark hover:border-purple-200 dark:hover:border-purple-800/50 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2.5 mb-2">
                                                    <div className={`p-1.5 rounded-lg ${isCritical ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
                                                        <FiAlertTriangle className="w-3.5 h-3.5" />
                                                    </div>
                                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{trigger.component_name}</h3>
                                                    <Badge color={isCritical ? 'red' : 'yellow'} size="xs">
                                                        {trigger.priority || trigger.status || 'LOW'}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-slate-400 mb-4">{trigger.part_number}</p>

                                                {/* Metric Row */}
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 text-center">
                                                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Stock</p>
                                                        <p className="text-base font-black text-slate-900 dark:text-white">{currentStock}</p>
                                                    </div>
                                                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 text-center">
                                                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Required</p>
                                                        <p className="text-base font-black text-slate-900 dark:text-white">{minRequired}</p>
                                                    </div>
                                                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 text-center">
                                                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Order Qty</p>
                                                        <p className="text-base font-black text-purple-600 dark:text-purple-400">{trigger.recommended_order_quantity ?? '—'}</p>
                                                    </div>
                                                </div>

                                                {/* Stock Bar */}
                                                <div className="mt-3">
                                                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                                        <span>Stock Level</span>
                                                        <span className={`font-bold ${isCritical ? 'text-red-500' : 'text-amber-500'}`}>{stockPct}%</span>
                                                    </div>
                                                    <ProgressBar progress={stockPct} color={isCritical ? 'danger' : 'warning'} />
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                                                <AnimatedButton
                                                    size="sm"
                                                    onClick={async (e) => { e.stopPropagation(); await procurementService.updateTrigger(trigger.id, { status: 'ORDERED' }); toast.success('Marked as Ordered'); fetchTriggers(true); }}
                                                    icon={<FiShoppingBag />}
                                                >
                                                    Order
                                                </AnimatedButton>
                                                <AnimatedButton
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={async (e) => { e.stopPropagation(); await procurementService.updateTrigger(trigger.id, { status: 'PENDING' }); toast.success('Set to Pending'); fetchTriggers(true); }}
                                                    icon={<FiClock />}
                                                >
                                                    Pending
                                                </AnimatedButton>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </motion.div>
                ) : (
                    <motion.div key="pos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-slate-900 dark:text-white">Purchase Orders</h2>
                                <p className="text-xs text-slate-400">{purchaseOrders.length} total orders</p>
                            </div>
                            <AnimatedButton onClick={() => setShowPOModal(true)} icon={<FiPlus />} size="sm">New PO</AnimatedButton>
                        </div>

                        <GlassCard noPad>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800">
                                            {['Order ID', 'Supplier', 'Items', 'Total Value', 'Status', 'Date'].map(h => (
                                                <th key={h} className="py-3 px-5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {purchaseOrders.map((po, i) => (
                                            <motion.tr
                                                key={po.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.04 }}
                                                className="border-b border-slate-50 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                                            >
                                                <td className="py-4 px-5 font-bold text-purple-600 dark:text-purple-400 text-sm">{po.id}</td>
                                                <td className="py-4 px-5 font-semibold text-slate-700 dark:text-slate-300 text-sm">{po.supplier}</td>
                                                <td className="py-4 px-5 text-slate-600 dark:text-slate-400 text-sm">{po.items} items</td>
                                                <td className="py-4 px-5 font-bold text-slate-900 dark:text-white text-sm">${po.total.toLocaleString()}</td>
                                                <td className="py-4 px-5">
                                                    <Badge color={poStatusColor[po.status] || 'gray'} size="sm">{po.status}</Badge>
                                                </td>
                                                <td className="py-4 px-5 text-slate-400 text-xs">{po.date}</td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                                {purchaseOrders.length === 0 && (
                                    <div className="text-center py-12 text-slate-400">
                                        <FiShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">No purchase orders yet</p>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals */}
            <AnimatePresence>
                {selectedTrigger && (
                    <TriggerModal
                        trigger={selectedTrigger}
                        onClose={() => setSelectedTrigger(null)}
                        onUpdate={() => fetchTriggers(true)}
                    />
                )}
                {showPOModal && (
                    <NewPOModal
                        onClose={() => setShowPOModal(false)}
                        onSave={(newPO) => setPurchaseOrders(prev => [newPO, ...prev])}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Procurement;
