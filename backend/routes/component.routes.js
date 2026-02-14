const express = require('express');
const router = express.Router();
const {
    getAllComponents,
    getComponentById,
    createComponent,
    updateComponent,
    deleteComponent,
    getLowStockComponents,
} = require('../controllers/componentController');
const { authenticateToken } = require('../middleware/auth');
const { componentValidation, validate } = require('../middleware/validation');

// All routes are protected
router.use(authenticateToken);

// Component routes
router.get('/', getAllComponents);
router.get('/low-stock', getLowStockComponents);
router.get('/:id', getComponentById);
router.post('/', componentValidation.create, validate, createComponent);
router.put('/:id', componentValidation.update, validate, updateComponent);
router.delete('/:id', deleteComponent);

module.exports = router;
