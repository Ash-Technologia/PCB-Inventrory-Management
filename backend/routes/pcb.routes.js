const express = require('express');
const router = express.Router();
const {
    getAllPCBs,
    getPCBById,
    createPCB,
    updatePCB,
    deletePCB,
    addComponentToBOM,
    updateBOMComponent,
    removeComponentFromBOM,
} = require('../controllers/pcbController');
const { authenticateToken } = require('../middleware/auth');
const { pcbValidation, validate } = require('../middleware/validation');

// All routes are protected
router.use(authenticateToken);

// PCB routes
router.get('/', getAllPCBs);
router.get('/:id', getPCBById);
router.post('/', pcbValidation.create, validate, createPCB);
router.put('/:id', pcbValidation.update, validate, updatePCB);
router.delete('/:id', deletePCB);

// BOM management routes
router.post('/:id/components', addComponentToBOM);
router.put('/:pcbId/components/:componentId', updateBOMComponent);
router.delete('/:pcbId/components/:componentId', removeComponentFromBOM);

module.exports = router;
