import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { componentService, excelService } from '../services';
import { toast } from 'react-toastify';
import { FiPlus, FiDownload, FiSearch, FiGrid, FiList, FiFilter, FiX, FiPackage, FiEdit2, FiTrash2 } from 'react-icons/fi';
import GlassCard from '../components/common/GlassCard';
import AnimatedButton from '../components/common/AnimatedButton';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import Skeleton from '../components/common/Skeleton';
import { useAuth } from '../context/AuthContext';

const Inventory = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    const [components, setComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [filter, setFilter] = useState('all');

    // Add/Edit Component Modal State
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

    const fetchComponents = async () => {
        try {
            const response = await componentService.getAll({ search });
            setComponents(response.data.data);
        } catch (error) {
            toast.error('Failed to load components');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            if (search || filter !== 'all') {
                fetchComponents();
            }
        }, 300);
        return () => clearTimeout(debounce);
    }, [search]);

    const handleExport = async () => {
        try {
            const response = await excelService.exportInventory();
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'inventory_export.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('📥 Inventory exported successfully!');
        } catch (error) {
            toast.error('Export failed');
        }
    };

    const openAddModal = () => {
        setIsEditing(false);
        setFormData({
            component_name: '',
            part_number: '',
            category: '',
            current_stock: '',
            monthly_required_quantity: '',
            unit_price: '',
            supplier: ''
        });
        setShowModal(true);
    };

    const openEditModal = (comp) => {
        setIsEditing(true);
        setSelectedId(comp.id);
        setFormData({
            component_name: comp.component_name,
            part_number: comp.part_number,
            category: comp.category || '',
            current_stock: comp.current_stock,
            monthly_required_quantity: comp.monthly_required_quantity,
            unit_price: comp.unit_price,
            supplier: comp.supplier || ''
        });
        setShowModal(true);
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
                toast.success('Component updated successfully!');
            } else {
                await componentService.create(data);
                toast.success('Component added successfully!');
            }
            setShowModal(false);
            fetchComponents();
        } catch (error) {
            toast.error(isEditing ? 'Failed to update component' : 'Failed to add component');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this component? This action cannot be undone.')) {
            try {
                await componentService.delete(id);
                toast.success('Component deleted successfully');
                fetchComponents();
            } catch (error) {
                toast.error('Failed to delete component');
            }
        }
    };

    const filteredComponents = components.filter((comp) => {
        if (filter === 'all') return true;
        if (filter === 'critical') return comp.stock_status === 'CRITICAL';
        if (filter === 'low') return comp.stock_status === 'LOW';
        if (filter === 'normal') return comp.stock_status === 'NORMAL' || comp.stock_status === 'ADEQUATE';
        return true;
    });

    const filterOptions = [
        { value: 'all', label: 'All Items', count: components.length },
        { value: 'critical', label: 'Critical', count: components.filter(c => c.stock_status === 'CRITICAL').length },
        { value: 'low', label: 'Low Stock', count: components.filter(c => c.stock_status === 'LOW').length },
        { value: 'normal', label: 'Normal', count: components.filter(c => c.stock_status === 'NORMAL' || c.stock_status === 'ADEQUATE').length },
    ];

    // Modal Component
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
            <div className="space-y-6">
                <Skeleton width="250px" height="36px" />
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="p-6 bg-white rounded-xl">
                            <Skeleton height="150px" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-4xl font-bold text-gradient">Component Inventory</h1>
                    <p className="text-gray-600 mt-1">{filteredComponents.length} components • Real-time stock tracking</p>
                </div>
                <div className="flex gap-3">
                    <AnimatedButton
                        onClick={handleExport}
                        icon={<FiDownload />}
                        variant="secondary"
                    >
                        Export
                    </AnimatedButton>
                    <AnimatedButton
                        icon={<FiPlus />}
                        onClick={openAddModal}
                    >
                        Add Component
                    </AnimatedButton>
                </div>
            </motion.div>

            {/* Search & Filters */}
            <GlassCard gradient>
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, part number, category..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* View Toggle */}
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                                ? 'bg-white shadow-sm text-purple-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <FiGrid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'table'
                                ? 'bg-white shadow-sm text-purple-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <FiList size={20} />
                        </button>
                    </div>
                </div>

                {/* Filter Chips */}
                <div className="flex gap-2 mt-4 flex-wrap">
                    {filterOptions.map((option) => (
                        <motion.button
                            key={option.value}
                            onClick={() => setFilter(option.value)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-4 py-2 rounded-full font-medium transition-all ${filter === option.value
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {option.label} ({option.count})
                        </motion.button>
                    ))}
                </div>
            </GlassCard>

            {/* Components Grid/Table */}
            <AnimatePresence mode="wait">
                {viewMode === 'grid' ? (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    >
                        {filteredComponents.map((comp, index) => {
                            const stockPercentage = (comp.current_stock / comp.monthly_required_quantity) * 100;
                            const statusConfig = {
                                CRITICAL: { color: 'danger', gradient: 'from-red-500 to-rose-500' },
                                LOW: { color: 'warning', gradient: 'from-yellow-500 to-orange-500' },
                                NORMAL: { color: 'success', gradient: 'from-green-500 to-emerald-500' },
                                ADEQUATE: { color: 'success', gradient: 'from-green-500 to-emerald-500' },
                            };

                            const config = statusConfig[comp.stock_status] || statusConfig.NORMAL;

                            return (
                                <motion.div
                                    key={comp.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <GlassCard hover className="h-full relative group">
                                        {/* Admin Controls Overlay */}
                                        {isAdmin && (
                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <button
                                                    onClick={() => openEditModal(comp)}
                                                    className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(comp.id)}
                                                    className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex items-start justify-between mb-3">
                                            <div className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient}`}>
                                                <div className="w-8 h-8 flex items-center justify-center text-white font-bold text-sm">
                                                    {comp.category?.charAt(0) || 'C'}
                                                </div>
                                            </div>
                                            <Badge variant={config.color} size="sm">
                                                {comp.stock_status}
                                            </Badge>
                                        </div>

                                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                                            {comp.component_name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-3">{comp.part_number}</p>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Stock</span>
                                                <span className="font-bold text-gray-900">{comp.current_stock}</span>
                                            </div>
                                            <ProgressBar
                                                progress={stockPercentage}
                                                color={config.color}
                                            />
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>Monthly: {comp.monthly_required_quantity}</span>
                                                <span>{Math.round(stockPercentage)}%</span>
                                            </div>
                                        </div>

                                        {comp.category && (
                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                <span className="text-xs text-gray-600">{comp.category}</span>
                                            </div>
                                        )}
                                    </GlassCard>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ) : (
                    <motion.div
                        key="table"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <GlassCard>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Component</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Part Number</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Stock</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Monthly Req.</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Category</th>
                                            {isAdmin && <th className="text-right py-3 px-4 font-semibold text-gray-900">Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredComponents.map((comp, index) => (
                                            <motion.tr
                                                key={comp.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.02 }}
                                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors group"
                                            >
                                                <td className="py-3 px-4 font-medium text-gray-900">{comp.component_name}</td>
                                                <td className="py-3 px-4 text-gray-600">{comp.part_number}</td>
                                                <td className="py-3 px-4 font-semibold">{comp.current_stock}</td>
                                                <td className="py-3 px-4">{comp.monthly_required_quantity}</td>
                                                <td className="py-3 px-4">
                                                    <Badge
                                                        variant={
                                                            comp.stock_status === 'CRITICAL' ? 'danger' :
                                                                comp.stock_status === 'LOW' ? 'warning' : 'success'
                                                        }
                                                        size="sm"
                                                    >
                                                        {comp.stock_status}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-gray-600">{comp.category || 'N/A'}</td>
                                                {isAdmin && (
                                                    <td className="py-3 px-4 text-right">
                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => openEditModal(comp)}
                                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                            >
                                                                <FiEdit2 />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(comp.id)}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                                            >
                                                                <FiTrash2 />
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <ModalOverlay onClose={() => setShowModal(false)}>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                        <FiPackage className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {isEditing ? 'Edit Component' : 'Add Component'}
                                    </h2>
                                </div>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <FiX className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Component Name</label>
                                        <input
                                            type="text" required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="e.g. Resistor 10k Ohm"
                                            value={formData.component_name}
                                            onChange={e => setFormData({ ...formData, component_name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Part Number</label>
                                        <input
                                            type="text" required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="e.g. R-10K-0805"
                                            value={formData.part_number}
                                            onChange={e => setFormData({ ...formData, part_number: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <input
                                            type="text" required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="e.g. Resistor"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                                        <input
                                            type="number" required min="0"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="0"
                                            value={formData.current_stock}
                                            onChange={e => setFormData({ ...formData, current_stock: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Req.</label>
                                        <input
                                            type="number" required min="0"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="0"
                                            value={formData.monthly_required_quantity}
                                            onChange={e => setFormData({ ...formData, monthly_required_quantity: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price ($)</label>
                                        <input
                                            type="number" required min="0" step="0.01"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="0.00"
                                            value={formData.unit_price}
                                            onChange={e => setFormData({ ...formData, unit_price: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                                        <input
                                            type="text" required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="e.g. DigiKey"
                                            value={formData.supplier}
                                            onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium shadow-sm hover:shadow-md transition-all"
                                    >
                                        {isEditing ? 'Save Changes' : 'Add Component'}
                                    </button>
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
