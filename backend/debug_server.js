console.log("Starting debug sequence...");

try {
    console.log("Importing express...");
    const express = require('express');
    console.log("✅ express imported");
} catch (e) { console.error("❌ express failed:", e.message); }

try {
    console.log("Importing cors...");
    const cors = require('cors');
    console.log("✅ cors imported");
} catch (e) { console.error("❌ cors failed:", e.message); }

try {
    console.log("Importing dotenv...");
    require('dotenv').config();
    console.log("✅ dotenv imported");
} catch (e) { console.error("❌ dotenv failed:", e.message); }

try {
    console.log("Importing middleware...");
    const { errorHandler, notFound } = require('./middleware/errorHandler');
    console.log("✅ middleware imported");
} catch (e) { console.error("❌ middleware failed:", e.message); }

// Routes
const routes = [
    './routes/auth.routes',
    './routes/component.routes',
    './routes/pcb.routes',
    './routes/production.routes',
    './routes/analytics.routes',
    './routes/procurement.routes',
    './routes/excel.routes'
];

for (const route of routes) {
    try {
        console.log(`Importing ${route}...`);
        require(route);
        console.log(`✅ ${route} imported`);
    } catch (e) {
        console.error(`❌ ${route} failed:`, e.message);
    }
}

console.log("Debug sequence complete.");
