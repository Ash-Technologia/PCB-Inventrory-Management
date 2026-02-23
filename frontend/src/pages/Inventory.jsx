import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { componentService, excelService } from '../services';
import { toast } from 'react-toastify';
import { FiPlus, FiDownload, FiSearch, FiGrid, FiList, FiFilter, FiX, FiPackage, FiEdit2, FiTrash2, FiUpload } from 'react-icons/fi';
import GlassCard from '../components/common/GlassCard';
import AnimatedButton from '../components/common/AnimatedButton';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import Skeleton from '../components/common/Skeleton';
import { useAuth } from '../context/AuthContext';

// Modal Component
const ModalOverlay = ({ children, onClose }) => {
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onMouseDown={handleOverlayClick}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto border border-white/20 dark:border-slate-800"
                onClick={e => e.stopPropagation()}
                onMouseDown={e => e.stopPropagation()}
            >
                {children}
            </motion.div>
        </motion.div>
    );
};

const Inventory = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    const [components, setComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [filter, setFilter] = useState('all');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formData, setFormData] = useState({
        component_name: '',
        part_number: '',
        category: '',
        current_stock: '',
        monthly_required_quantity: '',
        unit_price: '',
        supplier: ''
    });

    useEffect(() => {
        fetchComponents();
    }, []);

    const fetchComponents = async (refresh = false) => {
        try {
            const response = await componentService.getAll({ search: refresh ? '' : search });
            setComponents(response.data.data);
            if (refresh) setSearch('');
        } catch (error) {
            toast.error('Failed to load components');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => fetchComponents(), 300);
        return () => clearTimeout(debounce);
    }, [search]);

    const handleExport = async () => {
        try {
            const response = await excelService.exportInventory();
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `inventory_export_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('📥 Exported successfully');
        } catch (error) {
            toast.error('Export failed');
        }
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const loadingToast = toast.loading('Importing components...');
        try {
            await excelService.importComponents(file);
            toast.update(loadingToast, {
                render: '📥 Imported successfully',
                type: 'success',
                isLoading: false,
                autoClose: 3000
            });
            fetchComponents(true);
        } catch (error) {
            toast.update(loadingToast, {
                render: error.response?.data?.message || 'Import failed',
                type: 'error',
                isLoading: false,
                autoClose: 3000
            });
        }
        e.target.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                current_stock: parseInt(formData.current_stock),
                monthly_required_quantity: parseInt(formData.monthly_required_quantity),
                unit_price: parseFloat(formData.unit_price)
            };

            if (isEditing) {
                await componentService.update(selectedId, data);
                toast.success('Updated successfully');
            } else {
                await componentService.create(data);
                toast.success('Added successfully');
            }
            setShowModal(false);
            fetchComponents(true);
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    const filteredComponents = components.filter((comp) => {
        if (filter === 'all') return true;
        if (filter === 'critical') return comp.stock_status === 'CRITICAL';
        if (filter === 'low') return comp.stock_status === 'LOW';
        return comp.stock_status === 'NORMAL' || comp.stock_status === 'ADEQUATE';
    });

    if (loading) return <div className="p-8"><Skeleton height="400px" /></div>;

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1">Components</p>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Inventory</h1>
                    <p className="text-sm text-slate-400 mt-1">{components.length} components tracked</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <input type="file" id="import-inv" className="hidden" accept=".csv, .xlsx" onChange={handleImport} />
                    <AnimatedButton onClick={() => document.getElementById('import-inv').click()} variant="secondary" size="sm" icon={<FiUpload />}>Import</AnimatedButton>
                    <AnimatedButton onClick={handleExport} variant="secondary" size="sm" icon={<FiDownload />}>Export</AnimatedButton>
                    {isAdmin && <AnimatedButton onClick={() => { setIsEditing(false); setFormData({ component_name: '', part_number: '', category: '', current_stock: '', monthly_required_quantity: '', unit_price: '', supplier: '' }); setShowModal(true); }} size="sm" icon={<FiPlus />}>Add Item</AnimatedButton>}
                </div>
            </motion.div>

            <GlassCard noPad>
                <div className="p-4 flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or part number..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {['all', 'critical', 'low', 'normal'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${filter === f
                                        ? 'gradient-aurora text-white shadow-glow-purple'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </GlassCard>

            <AnimatePresence mode="wait">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredComponents.map((comp, idx) => (
                        <motion.div key={comp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}>
                            <GlassCard hover className="h-full relative group">
                                {isAdmin && (
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => { setIsEditing(true); setSelectedId(comp.id); setFormData(comp); setShowModal(true); }} className="p-2 bg-blue-50 dark:bg-blue-900/40 text-blue-600 rounded-lg"><FiEdit2 size={14} /></button>
                                        <button onClick={async () => { if (window.confirm('Delete?')) { await componentService.delete(comp.id); fetchComponents(true); } }} className="p-2 bg-red-50 dark:bg-red-900/40 text-red-600 rounded-lg"><FiTrash2 size={14} /></button>
                                    </div>
                                )}
                                <div className="mb-3">
                                    <Badge color={comp.stock_status === 'CRITICAL' ? 'red' : comp.stock_status === 'LOW' ? 'yellow' : 'green'} size="xs">
                                        {comp.stock_status}
                                    </Badge>
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-1 text-sm leading-tight">{comp.component_name}</h3>
                                <p className="text-xs text-slate-400 mb-3">{comp.part_number}</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Stock</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{comp.current_stock}</span>
                                    </div>
                                    <ProgressBar progress={(comp.current_stock / comp.monthly_required_quantity) * 100} color={comp.stock_status === 'CRITICAL' ? 'danger' : 'warning'} />
                                    <p className="text-xs text-slate-400">{comp.category}</p>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </AnimatePresence>

            <AnimatePresence>
                {showModal && (
                    <ModalOverlay onClose={() => setShowModal(false)}>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{isEditing ? 'Update Component' : 'Add Component'}</h2>
                                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><FiX /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                                {[{ label: 'Component Name', key: 'component_name', colSpan: true }, { label: 'Part Number', key: 'part_number' }, { label: 'Category', key: 'category' }, { label: 'Current Stock', key: 'current_stock', type: 'number' }, { label: 'Monthly Required', key: 'monthly_required_quantity', type: 'number' }, { label: 'Unit Price', key: 'unit_price', type: 'number' }, { label: 'Supplier', key: 'supplier', colSpan: true }].map(f => (
                                    <div key={f.key} className={f.colSpan ? 'col-span-2' : ''}>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">{f.label}</label>
                                        <input
                                            type={f.type || 'text'}
                                            value={formData[f.key] || ''}
                                            onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                ))}
                                <div className="col-span-2 flex justify-end gap-3 mt-2">
                                    <AnimatedButton type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</AnimatedButton>
                                    <AnimatedButton type="submit">Save Component</AnimatedButton>
                                </div>
                            </form>
                        </div>
                    </ModalOverlay>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Inventory;
