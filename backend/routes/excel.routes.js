const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    importComponents,
    exportInventory,
    exportConsumption,
    downloadTemplate,
} = require('../controllers/excelController');
const { authenticateToken } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'import-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.xlsx', '.xls'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

// All routes are protected
router.use(authenticateToken);

// Excel routes
router.post('/import-components', upload.single('file'), importComponents);
router.get('/export-inventory', exportInventory);
router.get('/export-consumption', exportConsumption);
router.get('/template', downloadTemplate);

module.exports = router;
