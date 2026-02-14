import api from './api';

// Authentication services
export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.success) {
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    },

    register: async (username, email, password, role = 'USER') => {
        const response = await api.post('/auth/register', { username, email, password, role });
        if (response.data.success) {
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },
};

// Component services
export const componentService = {
    getAll: (params) => api.get('/components', { params }),
    getById: (id) => api.get(`/components/${id}`),
    create: (data) => api.post('/components', data),
    update: (id, data) => api.put(`/components/${id}`, data),
    delete: (id) => api.delete(`/components/${id}`),
    getLowStock: () => api.get('/components/low-stock'),
};

// PCB services
export const pcbService = {
    getAll: () => api.get('/pcbs'),
    getById: (id) => api.get(`/pcbs/${id}`),
    create: (data) => api.post('/pcbs', data),
    update: (id, data) => api.put(`/pcbs/${id}`, data),
    delete: (id) => api.delete(`/pcbs/${id}`),
    addComponent: (pcbId, data) => api.post(`/pcbs/${pcbId}/components`, data),
    updateComponent: (pcbId, componentId, data) => api.put(`/pcbs/${pcbId}/components/${componentId}`, data),
    removeComponent: (pcbId, componentId) => api.delete(`/pcbs/${pcbId}/components/${componentId}`),
};

// Production services
export const productionService = {
    create: (data) => api.post('/production', data),
    getAll: (params) => api.get('/production', { params }),
    getById: (id) => api.get(`/production/${id}`),
    getPreview: (params) => api.get('/production/preview', { params }),
    delete: (id) => api.delete(`/production/${id}`),
};

// Analytics services
export const analyticsService = {
    getConsumptionSummary: (params) => api.get('/analytics/consumption-summary', { params }),
    getTopConsumed: (params) => api.get('/analytics/top-consumed', { params }),
    getConsumptionTrends: (params) => api.get('/analytics/consumption-trends', { params }),
    getDashboardStats: () => api.get('/analytics/dashboard-stats'),
    getCategoryDistribution: () => api.get('/analytics/category-distribution'),
};

// Procurement services
export const procurementService = {
    getTriggers: (params) => api.get('/procurement/triggers', { params }),
    updateTrigger: (id, data) => api.put(`/procurement/triggers/${id}`, data),
    createTrigger: (data) => api.post('/procurement/triggers', data),
    getSummary: () => api.get('/procurement/summary'),
};

// Excel services
export const excelService = {
    importComponents: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/excel/import-components', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    exportInventory: (params) => {
        return api.get('/excel/export-inventory', {
            params,
            responseType: 'blob',
        });
    },
    exportConsumption: (params) => {
        return api.get('/excel/export-consumption', {
            params,
            responseType: 'blob',
        });
    },
    downloadTemplate: () => {
        return api.get('/excel/template', {
            responseType: 'blob',
        });
    },
};
