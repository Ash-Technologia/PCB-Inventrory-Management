const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth.routes');
const componentRoutes = require('./routes/component.routes');
const pcbRoutes = require('./routes/pcb.routes');
const productionRoutes = require('./routes/production.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const procurementRoutes = require('./routes/procurement.routes');
const excelRoutes = require('./routes/excel.routes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'PCB Inventory Management API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/components', componentRoutes);
app.use('/api/pcbs', pcbRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/excel', excelRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║   PCB Inventory Management System - INVICTUS Hackathon    ║');
    console.log('║   Electrolyte Solutions                                   ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 API Base URL: http://localhost:${PORT}`);
    console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log('');
    console.log('📝 Available endpoints:');
    console.log('   GET  /health                          - Health check');
    console.log('   POST /api/auth/register               - User registration');
    console.log('   POST /api/auth/login                  - User login');
    console.log('   GET  /api/auth/me                     - Get current user');
    console.log('   GET  /api/components                  - List components');
    console.log('   GET  /api/components/low-stock        - Low stock components');
    console.log('   GET  /api/pcbs                        - List PCBs');
    console.log('   POST /api/production                  - Create production entry');
    console.log('   GET  /api/production/preview          - Production preview');
    console.log('   GET  /api/analytics/dashboard-stats   - Dashboard statistics');
    console.log('   GET  /api/procurement/triggers        - Procurement triggers');
    console.log('   POST /api/excel/import-components     - Import from Excel');
    console.log('   GET  /api/excel/export-inventory      - Export to Excel');
    console.log('');
    console.log('✅ Server ready to accept requests!');
    console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});

module.exports = app;
