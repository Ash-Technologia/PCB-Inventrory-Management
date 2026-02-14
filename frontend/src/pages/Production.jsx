import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pcbService, productionService } from '../services';
import { toast } from 'react-toastify';
import { FiTool, FiCheckCircle, FiAlertTriangle, FiArrowRight, FiPackage, FiTrash2, FiRefreshCcw } from 'react-icons/fi';
import GlassCard from '../components/common/GlassCard';
import AnimatedButton from '../components/common/AnimatedButton';
import Skeleton from '../components/common/Skeleton';
import Badge from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';

const Production = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    const [pcbs, setPcbs] = useState([]);
    const [selectedPcb, setSelectedPcb] = useState('');
    const [quantity, setQuantity] = useState('');
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pcbsLoading, setPcbsLoading] = useState(true);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchPCBs();
        fetchHistory();
    }, []);

    const fetchPCBs = async () => {
        try {
            const response = await pcbService.getAll();
            setPcbs(Array.isArray(response.data.data) ? response.data.data : []);
        } catch (error) {
            toast.error('Failed to load PCBs');
        } finally {
            setPcbsLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await productionService.getAll({ limit: 10 });
            setHistory(response.data.data);
        } catch (error) {
            console.error('Failed to load history', error);
        }
    };

    const handlePreview = async () => {
        if (!selectedPcb || !quantity) {
            toast.error('Please select PCB and enter quantity');
            return;
        }

        try {
            const response = await productionService.getPreview({
                pcb_id: selectedPcb,
                quantity_produced: quantity,
            });
            setPreview(response.data.data);
        } catch (error) {
            toast.error('Failed to generate preview');
        }
    };

    const handleSubmit = async () => {
        if (!preview?.can_produce) {
            toast.error('Insufficient stock for production');
            return;
        }

        setLoading(true);
        try {
            await productionService.create({
                pcb_id: selectedPcb,
                quantity_produced: parseInt(quantity),
            });
            toast.success('🎉 Production entry created successfully!');
            setSelectedPcb('');
            setQuantity('');
            setPreview(null);
            fetchHistory(); // Refresh history
        } catch (error) {
            toast.error(error.response?.data?.message || 'Production failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (entry) => {
        if (window.confirm(`⚠️ WARNING: Deleting this production entry will REVERT the stock deduction for ${entry.quantity_produced} units of ${entry.pcb_name}. Are you sure?`)) {
            try {
                await productionService.delete(entry.id);
                toast.success('Production reverted and stock restored successfully');
                fetchHistory();
            } catch (error) {
                toast.error('Failed to revert production');
            }
        }
    };

    if (pcbsLoading) {
        return <div className="p-8 space-y-4"><Skeleton height="300px" /><Skeleton height="200px" /></div>;
    }

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-4xl font-bold text-gradient mb-2">Production Entry</h1>
                <p className="text-gray-600">Log new production batches and automatically deduct stock</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <GlassCard gradient className="h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <FiTool className="text-blue-600 w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">New Batch</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Select PCB Model
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedPcb}
                                        onChange={(e) => setSelectedPcb(e.target.value)}
                                        className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Choose PCB...</option>
                                        {pcbs.map((pcb) => (
                                            <option key={pcb.id} value={pcb.id}>
                                                {pcb.pcb_name} ({pcb.pcb_code})
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Quantity to Produce
                                </label>
                                <div className="relative">
                                    <FiPackage className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Enter quantity..."
                                        min="1"
                                    />
                                </div>
                            </div>

                            <AnimatedButton
                                onClick={handlePreview}
                                variant="primary"
                                className="w-full py-3"
                                icon={<FiArrowRight />}
                                disabled={!selectedPcb || !quantity}
                            >
                                Preview Stock Impact
                            </AnimatedButton>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Preview Section */}
                <AnimatePresence mode="wait">
                    {preview && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <GlassCard
                                className={`h-full border-2 ${preview.can_produce ? 'border-green-100 bg-green-50/30' : 'border-red-100 bg-red-50/30'}`}
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`p-3 rounded-xl ${preview.can_produce ? 'bg-green-100' : 'bg-red-100'}`}>
                                        {preview.can_produce ? (
                                            <FiCheckCircle className="text-green-600 w-6 h-6" />
                                        ) : (
                                            <FiAlertTriangle className="text-red-600 w-6 h-6" />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className={`text-xl font-bold ${preview.can_produce ? 'text-green-900' : 'text-red-900'}`}>
                                            {preview.can_produce ? 'Stock Available' : 'Insufficient Stock'}
                                        </h2>
                                        <p className={`text-sm ${preview.can_produce ? 'text-green-700' : 'text-red-700'}`}>
                                            {preview.can_produce
                                                ? 'Production can proceed immediately'
                                                : 'Cannot fulfill this request with current inventory'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {preview.can_produce ? (
                                        <div className="space-y-3">
                                            {preview.components.map((comp) => (
                                                <div key={comp.component_id} className="p-3 bg-white/60 rounded-xl border border-white/50 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{comp.component_name}</p>
                                                        <p className="text-xs text-gray-500 mt-1">Required: {comp.quantity_per_pcb * quantity} (Current: {comp.current_stock})</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-2">
                                                            <FiArrowRight className="text-green-500 w-3 h-3" />
                                                            <span className="text-sm font-bold text-gray-900">{comp.stock_after}</span>
                                                        </div>
                                                        <Badge variant="success" size="sm" className="mt-1">OK</Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {preview.insufficient_components.map((comp) => (
                                                <div key={comp.component_id} className="p-3 bg-white/60 rounded-xl border border-red-200">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <p className="font-semibold text-red-900">{comp.component_name}</p>
                                                            <div className="flex gap-2 mt-1">
                                                                <Badge variant="danger" size="sm">Shortage: {comp.shortage}</Badge>
                                                            </div>
                                                        </div>
                                                        <div className="text-right text-sm">
                                                            <p className="text-gray-500">Have: <span className="font-semibold text-gray-900">{comp.available}</span></p>
                                                            <p className="text-red-600 font-medium">Need: {comp.required}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {preview.can_produce && (
                                    <div className="mt-6 pt-6 border-t border-green-200/50">
                                        <AnimatedButton
                                            onClick={handleSubmit}
                                            loading={loading}
                                            variant="success"
                                            className="w-full py-3"
                                            icon={<FiCheckCircle />}
                                        >
                                            Confirm & Deduct Stock
                                        </AnimatedButton>
                                    </div>
                                )}
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Production History Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8"
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Production History</h2>
                <GlassCard className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Date</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-900">PCB Model</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Quantity</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Created By</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                                    {isAdmin && <th className="text-right py-4 px-6 font-semibold text-gray-900">Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {history.length > 0 ? (
                                    history.map((entry) => (
                                        <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                                            <td className="py-4 px-6 text-gray-600">
                                                {new Date(entry.production_date).toLocaleDateString()}
                                                <span className="text-xs text-gray-400 block">
                                                    {new Date(entry.production_date).toLocaleTimeString()}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-medium text-gray-900">{entry.pcb_name}</div>
                                                <div className="text-xs text-gray-500">{entry.pcb_code}</div>
                                            </td>
                                            <td className="py-4 px-6 font-semibold text-gray-900">
                                                {entry.quantity_produced}
                                            </td>
                                            <td className="py-4 px-6 text-gray-600">
                                                {entry.created_by || 'System'}
                                            </td>
                                            <td className="py-4 px-6">
                                                <Badge variant="success" size="sm">COMPLETED</Badge>
                                            </td>
                                            {isAdmin && (
                                                <td className="py-4 px-6 text-right">
                                                    <button
                                                        onClick={() => handleDelete(entry)}
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100 flex items-center gap-1 ml-auto"
                                                        title="Revert Production"
                                                    >
                                                        <span className="text-xs font-semibold">Revert</span>
                                                        <FiRefreshCcw size={14} />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={isAdmin ? 6 : 5} className="py-8 text-center text-gray-500">
                                            No production history found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
};

export default Production;
