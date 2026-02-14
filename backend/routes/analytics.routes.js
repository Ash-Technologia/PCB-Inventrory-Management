const express = require('express');
const router = express.Router();
const {
    getConsumptionSummary,
    getTopConsumed,
    getConsumptionTrends,
    getDashboardStats,
    getCategoryDistribution,
} = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/auth');

// All routes are protected
router.use(authenticateToken);

// Analytics routes
router.get('/consumption-summary', getConsumptionSummary);
router.get('/top-consumed', getTopConsumed);
router.get('/consumption-trends', getConsumptionTrends);
router.get('/dashboard-stats', getDashboardStats);
router.get('/category-distribution', getCategoryDistribution);

module.exports = router;
