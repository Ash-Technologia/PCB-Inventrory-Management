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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
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
        <div className="space-y-8 relative">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-gradient">PCB Designs</h1>
                    <p className="text-gray-600 mt-1">Manage your board layouts and BOMs</p>
                </div>
                <AnimatedButton
                    icon={<FiPlus />}
                    onClick={() => setShowCreateModal(true)}
                >
                    Create PCB
                </AnimatedButton>
            </div>

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
                            {/* Admin Controls */}
                            {isAdmin && (
                                <button
                                    onClick={(e) => handleDelete(pcb.id, e)}
                                    className="absolute top-4 right-4 p-2 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10 hover:bg-red-200"
                                    title="Delete PCB"
                                >
                                    <FiTrash2 size={18} />
                                </button>
                            )}

                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                                    <FiLayers className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{pcb.pcb_name}</h3>
                                    <p className="text-sm text-gray-500">{pcb.pcb_code}</p>
                                </div>
                            </div>

                            <p className="text-gray-600 mb-6 line-clamp-2 min-h-[40px]">
                                {pcb.description || 'No description provided.'}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <FiCpu />
                                    <span>{pcb.component_count || 0} Components</span>
                                </div>
                                <Badge variant="info" size="sm">Active</Badge>
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
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Create New PCB</h2>
                                <button onClick={() => setShowCreateModal(false)}><FiX size={24} /></button>
                            </div>
                            <form onSubmit={handleCreateSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">PCB Name</label>
                                    <input
                                        type="text" required
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.pcb_name}
                                        onChange={e => setFormData({ ...formData, pcb_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">PCB Code</label>
                                    <input
                                        type="text" required
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.pcb_code}
                                        onChange={e => setFormData({ ...formData, pcb_code: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        rows="3"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Create PCB
                                    </button>
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
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {selectedPCB ? selectedPCB.pcb_name : 'Loading...'}
                                    </h2>
                                    <p className="text-gray-500">{selectedPCB?.pcb_code}</p>
                                </div>
                                <button onClick={() => setShowBOMModal(false)}><FiX size={24} /></button>
                            </div>

                            {bomLoading ? (
                                <div className="space-y-4">
                                    <Skeleton height="40px" />
                                    <Skeleton height="40px" />
                                    <Skeleton height="40px" />
                                </div>
                            ) : selectedPCB && selectedPCB.bom && selectedPCB.bom.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Component</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Part #</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty / PCB</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {selectedPCB.bom.map((comp) => (
                                                <tr key={comp.mapping_id}>
                                                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{comp.component_name}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-500">{comp.part_number}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-900 text-right font-bold">{comp.quantity_per_pcb}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-500 text-right">${comp.unit_price}</td>
                                                </tr>
                                            ))}
                                            <tr className="bg-gray-50 font-bold">
                                                <td colSpan="3" className="px-4 py-3 text-right">Total Cost Per PCB:</td>
                                                <td className="px-4 py-3 text-right text-green-600">${selectedPCB.total_cost_per_pcb}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="bg-gray-100 p-4 rounded-full inline-block mb-3">
                                        <FiAlertCircle className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500">No components in this BOM yet.</p>
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
