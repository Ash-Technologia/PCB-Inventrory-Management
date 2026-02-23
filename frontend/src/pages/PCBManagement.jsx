import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pcbService } from '../services';
import { toast } from 'react-toastify';
import { FiPlus, FiLayers, FiCpu, FiAlertCircle, FiX, FiTrash2 } from 'react-icons/fi';
import GlassCard from '../components/common/GlassCard';
import AnimatedButton from '../components/common/AnimatedButton';
import Badge from '../components/common/Badge';
import Skeleton from '../components/common/Skeleton';
import { useAuth } from '../context/AuthContext';

const PCBManagement = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    const [pcbs, setPcbs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showBOMModal, setShowBOMModal] = useState(false);
    const [selectedPCB, setSelectedPCB] = useState(null);
    const [bomLoading, setBomLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        pcb_name: '',
        pcb_code: '',
        description: ''
    });

    useEffect(() => {
        fetchPCBs();
    }, []);

    const fetchPCBs = async () => {
        try {
            const response = await pcbService.getAll();
            setPcbs(Array.isArray(response.data.data) ? response.data.data : []);
        } catch (error) {
            toast.error('Failed to load PCBs');
            setPcbs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            await pcbService.create(formData);
            toast.success('PCB Design created successfully!');
            setShowCreateModal(false);
            setFormData({ pcb_name: '', pcb_code: '', description: '' });
            fetchPCBs();
        } catch (error) {
            toast.error('Failed to create PCB');
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation(); // Prevent opening BOM modal
        if (window.confirm('Are you sure you want to delete this PCB? This action cannot be undone.')) {
            try {
                await pcbService.delete(id);
                toast.success('PCB deleted successfully');
                fetchPCBs();
            } catch (error) {
                toast.error('Failed to delete PCB');
            }
        }
    };

    const handleViewBOM = async (pcb) => {
        setSelectedPCB(null); // Reset first
        setShowBOMModal(true);
        setBomLoading(true);
        try {
            const response = await pcbService.getById(pcb.id);
            setSelectedPCB(response.data.data);
        } catch (error) {
            toast.error('Failed to load BOM details');
            setShowBOMModal(false);
        } finally {
            setBomLoading(false);
        }
    };

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
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800"
                onMouseDown={(e) => e.stopPropagation()}
            >
                {children}
            </motion.div>
        </motion.div>
    );

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <Skeleton key={i} height="200px" />)}
            </div>
        );
    }

    return (
        <div className="space-y-6 relative">
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
                <div>
                    <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1">Designs</p>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">PCB Designs</h1>
                    <p className="text-sm text-slate-400 mt-1">Manage board layouts and bill of materials</p>
                </div>
                <AnimatedButton icon={<FiPlus />} onClick={() => setShowCreateModal(true)} size="sm">
                    Create PCB
                </AnimatedButton>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pcbs.map((pcb, index) => (
                    <motion.div
                        key={pcb.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="h-full"
                    >
                        <GlassCard
                            hover
                            className="h-full cursor-pointer relative group"
                            onClick={() => handleViewBOM(pcb)}
                        >
                            {isAdmin && (
                                <button
                                    onClick={(e) => handleDelete(pcb.id, e)}
                                    className="absolute top-4 right-4 p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10 hover:bg-red-100 dark:hover:bg-red-900/50"
                                    title="Delete PCB"
                                >
                                    <FiTrash2 size={14} />
                                </button>
                            )}

                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                                    <FiLayers className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{pcb.pcb_name}</h3>
                                    <p className="text-xs text-slate-400">{pcb.pcb_code}</p>
                                </div>
                            </div>

                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 min-h-[36px]">
                                {pcb.description || 'No description provided.'}
                            </p>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <FiCpu />
                                    <span>{pcb.component_count || 0} Components</span>
                                </div>
                                <Badge color="blue" size="xs">Active</Badge>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            {/* Create PCB Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <ModalOverlay onClose={() => setShowCreateModal(false)}>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-5">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create New PCB</h2>
                                    <p className="text-xs text-slate-400">Add a new PCB design to the system</p>
                                </div>
                                <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><FiX /></button>
                            </div>
                            <form onSubmit={handleCreateSubmit} className="space-y-4">
                                {[
                                    { label: 'PCB Name *', key: 'pcb_name', type: 'text' },
                                    { label: 'PCB Code *', key: 'pcb_code', type: 'text' },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">{f.label}</label>
                                        <input
                                            type={f.type}
                                            required
                                            className="input-field"
                                            value={formData[f.key]}
                                            onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                                        />
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Description</label>
                                    <textarea
                                        className="input-field resize-none"
                                        rows="3"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <AnimatedButton type="button" variant="secondary" onClick={() => setShowCreateModal(false)} className="flex-1">Cancel</AnimatedButton>
                                    <AnimatedButton type="submit" className="flex-1" icon={<FiPlus />}>Create PCB</AnimatedButton>
                                </div>
                            </form>
                        </div>
                    </ModalOverlay>
                )}
            </AnimatePresence>

            {/* View BOM Modal */}
            <AnimatePresence>
                {showBOMModal && (
                    <ModalOverlay onClose={() => setShowBOMModal(false)}>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-5">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {selectedPCB ? selectedPCB.pcb_name : 'Loading...'}
                                    </h2>
                                    <p className="text-xs text-slate-400">{selectedPCB?.pcb_code} • Bill of Materials</p>
                                </div>
                                <button onClick={() => setShowBOMModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><FiX /></button>
                            </div>

                            {bomLoading ? (
                                <div className="space-y-3">
                                    <Skeleton height="36px" />
                                    <Skeleton height="36px" />
                                    <Skeleton height="36px" />
                                </div>
                            ) : selectedPCB && selectedPCB.bom && selectedPCB.bom.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                                {['Component', 'Part #', 'Qty/PCB', 'Unit Cost'].map(h => (
                                                    <th key={h} className="py-2 px-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedPCB.bom.map((comp) => (
                                                <tr key={comp.mapping_id} className="border-b border-slate-50 dark:border-slate-800/70">
                                                    <td className="py-2.5 px-3 text-sm font-semibold text-slate-900 dark:text-white">{comp.component_name}</td>
                                                    <td className="py-2.5 px-3 text-xs text-slate-400">{comp.part_number}</td>
                                                    <td className="py-2.5 px-3 text-sm font-bold text-slate-900 dark:text-white">{comp.quantity_per_pcb}</td>
                                                    <td className="py-2.5 px-3 text-xs text-slate-400">${comp.unit_price}</td>
                                                </tr>
                                            ))}
                                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                                <td colSpan="3" className="py-3 px-3 text-right text-sm font-bold text-slate-700 dark:text-white">Total Cost Per PCB:</td>
                                                <td className="py-3 px-3 text-sm font-black text-emerald-600 dark:text-emerald-400">${selectedPCB.total_cost_per_pcb}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 inline-block mb-3">
                                        <FiAlertCircle className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <p className="text-sm text-slate-400">No components in this BOM yet.</p>
                                </div>
                            )}
                        </div>
                    </ModalOverlay>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PCBManagement;
