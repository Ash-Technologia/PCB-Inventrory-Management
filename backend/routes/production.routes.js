const express = require('express');
const router = express.Router();
const {
    createProductionEntry,
    getAllProductionEntries,
    getProductionEntryById,
    getProductionPreview,
    deleteProductionEntry,
} = require('../controllers/productionController');
const { authenticateToken } = require('../middleware/auth');
const { productionValidation, validate } = require('../middleware/validation');

// All routes are protected
router.use(authenticateToken);

// Production routes
router.post('/', productionValidation.create, validate, createProductionEntry);
router.get('/', getAllProductionEntries);
router.get('/preview', getProductionPreview);
router.get('/:id', getProductionEntryById);
router.delete('/:id', deleteProductionEntry);

module.exports = router;
