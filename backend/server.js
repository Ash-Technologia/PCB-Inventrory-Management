const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize Express app immediately to catch errors early
const app = express();

console.log("🚀 Initializing Server...");

// Import middleware
try {
    const { errorHandler, notFound } = require('./middleware/errorHandler');

    app.use(cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
    }));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Request logging
    if (process.env.NODE_ENV === 'development') {
        app.use((req, res, next) => {
            console.log(`${req.method} ${req.path}`);
            next();
        });
    }

    app.get('/health', (req, res) => {
        res.json({
            success: true,
            message: 'PCB Inventory Management API is running',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
        });
    });

    // Import Routes with Error Handling
    const routes = [
        { path: '/api/auth', file: './routes/auth.routes' },
        { path: '/api/components', file: './routes/component.routes' },
        { path: '/api/pcbs', file: './routes/pcb.routes' },
        { path: '/api/production', file: './routes/production.routes' },
        { path: '/api/analytics', file: './routes/analytics.routes' },
        { path: '/api/procurement', file: './routes/procurement.routes' },
        { path: '/api/excel', file: './routes/excel.routes' }
    ];

    routes.forEach(route => {
        try {
            console.log(`Loading route: ${route.path}`);
            app.use(route.path, require(route.file));
        } catch (error) {
            console.error(`❌ Failed to load route ${route.path}:`, error.message);
        }
    });

    // Error handlers
    app.use(notFound);
    app.use(errorHandler);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
    });

} catch (error) {
    console.error("❌ CRITICAL SERVER ERROR:", error);
}
