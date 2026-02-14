console.log("🚀 Starting index.js execution...");

try {
    console.log("Importing express...");
    const express = require('express');
    console.log("✅ Express imported");

    console.log("Importing cors...");
    const cors = require('cors');
    console.log("✅ Cors imported");

    console.log("Configuring dotenv...");
    require('dotenv').config();
    console.log("✅ Dotenv configured");

    console.log("Importing middleware...");
    const { errorHandler, notFound } = require('./middleware/errorHandler');
    console.log("✅ Middleware imported");

    // Import routes
    console.log("Importing auth routes...");
    const authRoutes = require('./routes/auth.routes');
    console.log("✅ Auth routes imported");

    console.log("Importing component routes...");
    const componentRoutes = require('./routes/component.routes');
    console.log("✅ Component routes imported");

    console.log("Importing pcb routes...");
    const pcbRoutes = require('./routes/pcb.routes');
    console.log("✅ PCB routes imported");

    console.log("Importing production routes...");
    const productionRoutes = require('./routes/production.routes');
    console.log("✅ Production routes imported");

    console.log("Importing analytics routes...");
    const analyticsRoutes = require('./routes/analytics.routes');
    console.log("✅ Analytics routes imported");

    console.log("Importing procurement routes...");
    const procurementRoutes = require('./routes/procurement.routes');
    console.log("✅ Procurement routes imported");

    console.log("Importing excel routes...");
    const excelRoutes = require('./routes/excel.routes');
    console.log("✅ Excel routes imported");

    console.log("Initializing app...");
    const app = express();

    app.use(cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
    }));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/components', componentRoutes);
    app.use('/api/pcbs', pcbRoutes);
    app.use('/api/production', productionRoutes);
    app.use('/api/analytics', analyticsRoutes);
    app.use('/api/procurement', procurementRoutes);
    app.use('/api/excel', excelRoutes);

    app.use(notFound);
    app.use(errorHandler);

    const PORT = process.env.PORT || 5000;

    console.log(`Attempting to listen on port ${PORT}...`);
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

} catch (error) {
    console.error("❌ CRITICAL ERROR IN index.js:", error);
}
