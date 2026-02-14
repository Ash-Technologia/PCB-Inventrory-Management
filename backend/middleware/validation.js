const { body, param, query, validationResult } = require('express-validator');

// Validation result checker
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
        });
    }
    next();
};

// Component validation rules
const componentValidation = {
    create: [
        body('component_name').trim().notEmpty().withMessage('Component name is required'),
        body('part_number').trim().notEmpty().withMessage('Part number is required'),
        body('current_stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
        body('monthly_required_quantity').isInt({ min: 1 }).withMessage('Monthly requirement must be a positive integer'),
        body('category').optional().trim(),
        body('supplier').optional().trim(),
        body('unit_price').optional().isFloat({ min: 0 }).withMessage('Price must be non-negative'),
    ],
    update: [
        param('id').isInt().withMessage('Invalid component ID'),
        body('component_name').optional().trim().notEmpty(),
        body('current_stock').optional().isInt({ min: 0 }),
        body('monthly_required_quantity').optional().isInt({ min: 1 }),
        body('unit_price').optional().isFloat({ min: 0 }),
    ],
};

// PCB validation rules
const pcbValidation = {
    create: [
        body('pcb_name').trim().notEmpty().withMessage('PCB name is required'),
        body('pcb_code').trim().notEmpty().withMessage('PCB code is required'),
        body('description').optional().trim(),
    ],
    update: [
        param('id').isInt().withMessage('Invalid PCB ID'),
        body('pcb_name').optional().trim().notEmpty(),
        body('description').optional().trim(),
    ],
};

// Production validation rules
const productionValidation = {
    create: [
        body('pcb_id').isInt().withMessage('Valid PCB ID is required'),
        body('quantity_produced').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
        body('production_date').optional().isISO8601().withMessage('Invalid date format'),
        body('notes').optional().trim(),
    ],
};

// Auth validation rules
const authValidation = {
    register: [
        body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    login: [
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
};

module.exports = {
    validate,
    componentValidation,
    pcbValidation,
    productionValidation,
    authValidation,
};
