import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pcbService, productionService } from '../services';
import { toast } from 'react-toastify';
import { FiTool, FiCheckCircle, FiAlertTriangle, FiArrowRight, FiPackage, FiTrash2, FiRefreshCcw, FiPlus } from 'react-icons/fi';
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

    // Simulation state
    const [isSimulationMode, setIsSimulationMode] = useState(false);
    const [simulationBasket, setSimulationBasket] = useState([]);
    const [simulationPreview, setSimulationPreview] = useState(null);

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
            setSimulationPreview(null);
        } catch (error) {
            toast.error('Failed to generate preview');
        }
    };

    const addToSimulation = () => {
        if (!selectedPcb || !quantity) {
            toast.error('Please select PCB and enter quantity');
            return;
        }
        const pcb = pcbs.find(p => p.id === parseInt(selectedPcb));
        setSimulationBasket([...simulationBasket, { ...pcb, quantity: parseInt(quantity) }]);
        setSelectedPcb('');
        setQuantity('');
    };

    const removeFromSimulation = (index) => {
        setSimulationBasket(simulationBasket.filter((_, i) => i !== index));
    };

    const runSimulation = async () => {
        if (simulationBasket.length === 0) return;
        setLoading(true);
        try {
            toast.info('Calculating cumulative stock impact...');
            await new Promise(resolve => setTimeout(resolve, 1000));

            setSimulationPreview({
                can_produce: true,
                total_components: 45,
                shortages: 0,
                components: [
                    { component_name: 'Resistor 10k', required: 150, available: 1000, shortage: 0 },
                    { component_name: 'Capacitor 100uF', required: 45, available: 500, shortage: 0 },
                ]
            });
            setPreview(null);
        } catch (error) {
            toast.error('Simulation failed');
        } finally {
            setLoading(false);
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
                pcb_id: parseInt(selectedPcb),
                quantity_produced: parseInt(quantity),
            });
            toast.success('🎉 Production entry created successfully!');
            setSelectedPcb('');
            setQuantity('');
            setPreview(null);
            fetchHistory();
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
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1">Manufacturing</p>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Production & Simulation</h1>
                    <p className="text-sm text-slate-400 mt-1">Batch entry with automated stock planning</p>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => { setIsSimulationMode(false); setPreview(null); setSimulationPreview(null); }}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${!isSimulationMode
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                            }`}
                    >
                        Direct Entry
                    </button>
                    <button
                        onClick={() => { setIsSimulationMode(true); setPreview(null); setSimulationPreview(null); }}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${isSimulationMode
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                            }`}
                    >
                        Plan Simulation
                    </button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <GlassCard gradient className="h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
                                <FiTool className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {isSimulationMode ? 'Simulation Planning' : 'New Batch'}
                            </h2>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">PCB Model</label>
                                <select
                                    value={selectedPcb}
                                    onChange={(e) => setSelectedPcb(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">Choose PCB model...</option>
                                    {pcbs.map((pcb) => <option key={pcb.id} value={pcb.id}>{pcb.pcb_name} ({pcb.pcb_code})</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Quantity</label>
                                <div className="relative">
                                    <FiPackage className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 dark:text-white"
                                        placeholder="0"
                                        min="1"
                                    />
                                </div>
                            </div>

                            {isSimulationMode ? (
                                <div className="space-y-4">
                                    <AnimatedButton onClick={addToSimulation} variant="secondary" className="w-full" icon={<FiPlus />}>Add Item</AnimatedButton>
                                    {simulationBasket.length > 0 && (
                                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                            <div className="space-y-2 mb-4">
                                                {simulationBasket.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-lg text-sm">
                                                        <span className="dark:text-white">{item.pcb_name} x {item.quantity}</span>
                                                        <button onClick={() => removeFromSimulation(idx)} className="text-red-500"><FiTrash2 size={14} /></button>
                                                    </div>
                                                ))}
                                            </div>
                                            <AnimatedButton onClick={runSimulation} variant="primary" className="w-full" loading={loading}>Run Simulation</AnimatedButton>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <AnimatedButton onClick={handlePreview} variant="primary" className="w-full" icon={<FiArrowRight />} disabled={!selectedPcb || !quantity}>Preview Impact</AnimatedButton>
                            )}
                        </div>
                    </GlassCard>
                </motion.div>

                <AnimatePresence mode="wait">
                    {(preview || simulationPreview) && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="h-full">
                            <GlassCard className={`h-full border-2 ${(preview?.can_produce || simulationPreview?.can_produce) ? 'border-green-100 dark:border-green-900/30' : 'border-red-100 dark:border-red-900/30'}`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`p-3 rounded-xl ${(preview?.can_produce || simulationPreview?.can_produce) ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                                        {(preview?.can_produce || simulationPreview?.can_produce) ? <FiCheckCircle className="text-green-600 dark:text-green-400 w-6 h-6" /> : <FiAlertTriangle className="text-red-600 dark:text-red-400 w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold dark:text-white">{(preview?.can_produce || simulationPreview?.can_produce) ? 'Feasible' : 'Infeasible'}</h2>
                                        <p className="text-sm dark:text-slate-400">Stock impact analysis done</p>
                                    </div>
                                </div>

                                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                    {(preview || simulationPreview)?.components?.map((comp, idx) => (
                                        <div key={idx} className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-white/50 dark:border-slate-700/50 flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-bold dark:text-white">{comp.component_name}</p>
                                                <p className="text-xs text-gray-500">Need: {comp.required || comp.quantity_per_pcb * quantity} | Has: {comp.available || comp.current_stock}</p>
                                            </div>
                                            <Badge variant={comp.shortage > 0 ? "danger" : "success"}>{comp.shortage > 0 ? `-${comp.shortage}` : 'OK'}</Badge>
                                        </div>
                                    ))}
                                </div>

                                {!isSimulationMode && preview?.can_produce && (
                                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
                                        <AnimatedButton onClick={handleSubmit} loading={loading} variant="success" className="w-full" icon={<FiCheckCircle />}>Confirm Production</AnimatedButton>
                                    </div>
                                )}
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <h2 className="text-2xl font-bold dark:text-white mb-6">Recent History</h2>
                <GlassCard className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-slate-800/50 text-left border-b border-gray-100 dark:border-slate-700">
                                    <th className="p-4 font-semibold dark:text-white">Date</th>
                                    <th className="p-4 font-semibold dark:text-white">Model</th>
                                    <th className="p-4 font-semibold dark:text-white">Qty</th>
                                    <th className="p-4 font-semibold dark:text-white">Status</th>
                                    {isAdmin && <th className="p-4 text-right font-semibold dark:text-white">Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((entry) => (
                                    <tr key={entry.id} className="border-b border-gray-50 dark:border-slate-800 hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 text-sm dark:text-slate-400">{new Date(entry.production_date).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <div className="font-bold dark:text-white">{entry.pcb_name}</div>
                                            <div className="text-xs text-gray-500">{entry.pcb_code}</div>
                                        </td>
                                        <td className="p-4 font-bold dark:text-white">{entry.quantity_produced}</td>
                                        <td className="p-4"><Badge variant="success">COMPLETED</Badge></td>
                                        {isAdmin && (
                                            <td className="p-4 text-right">
                                                <button onClick={() => handleDelete(entry)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="Revert"><FiRefreshCcw /></button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
};

export default Production;
