const express = require('express');
const router = express.Router();
const {
    getAllTriggers,
    updateTriggerStatus,
    createTrigger,
    getProcurementSummary,
} = require('../controllers/procurementController');
const { authenticateToken } = require('../middleware/auth');

// All routes are protected
router.use(authenticateToken);

// Procurement routes
router.get('/triggers', getAllTriggers);
router.get('/summary', getProcurementSummary);
router.post('/triggers', createTrigger);
router.put('/triggers/:id', updateTriggerStatus);

module.exports = router;
