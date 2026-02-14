const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const { query, getClient } = require('../config/database');

// Import components from Excel (USP #5 & #10: Excel-First Philosophy + Fail-Safe Validator)
const importComponents = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        // Read Excel file
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            fs.unlinkSync(req.file.path); // Clean up uploaded file
            return res.status(400).json({
                success: false,
                message: 'Excel file is empty',
            });
        }

        // Validation errors array
        const validationErrors = [];
        const validComponents = [];

        // Required fields
        const requiredFields = ['component_name', 'part_number', 'current_stock', 'monthly_required_quantity'];

        // Validate each row (USP #10: Fail-Safe Excel Import Validator)
        data.forEach((row, index) => {
            const rowNumber = index + 2; // Excel rows start at 1, header is row 1
            const errors = [];

            // Check required fields
            requiredFields.forEach(field => {
                if (!row[field] && row[field] !== 0) {
                    errors.push(`Missing required field: ${field}`);
                }
            });

            // Validate data types
            if (row.current_stock !== undefined && (isNaN(row.current_stock) || row.current_stock < 0)) {
                errors.push('current_stock must be a non-negative number');
            }

            if (row.monthly_required_quantity !== undefined && (isNaN(row.monthly_required_quantity) || row.monthly_required_quantity <= 0)) {
                errors.push('monthly_required_quantity must be a positive number');
            }

            if (row.unit_price !== undefined && row.unit_price !== '' && (isNaN(row.unit_price) || row.unit_price < 0)) {
                errors.push('unit_price must be a non-negative number');
            }

            if (errors.length > 0) {
                validationErrors.push({
                    row: rowNumber,
                    data: row,
                    errors: errors,
                });
            } else {
                validComponents.push({
                    component_name: row.component_name,
                    part_number: row.part_number,
                    current_stock: parseInt(row.current_stock),
                    monthly_required_quantity: parseInt(row.monthly_required_quantity),
                    category: row.category || null,
                    supplier: row.supplier || null,
                    unit_price: row.unit_price ? parseFloat(row.unit_price) : 0,
                });
            }
        });

        // If there are validation errors, return them without importing
        if (validationErrors.length > 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                validation_errors: validationErrors,
                valid_count: validComponents.length,
                error_count: validationErrors.length,
            });
        }

        // Check for duplicate part numbers in the file
        const partNumbers = validComponents.map(c => c.part_number);
        const duplicates = partNumbers.filter((item, index) => partNumbers.indexOf(item) !== index);

        if (duplicates.length > 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'Duplicate part numbers found in file',
                duplicates: [...new Set(duplicates)],
            });
        }

        // Import components (atomic transaction)
        const client = await getClient();
        const importedComponents = [];
        const skippedComponents = [];

        try {
            await client.query('BEGIN');

            for (const comp of validComponents) {
                try {
                    const result = await client.query(
                        `INSERT INTO components 
             (component_name, part_number, current_stock, monthly_required_quantity, category, supplier, unit_price)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
                        [comp.component_name, comp.part_number, comp.current_stock, comp.monthly_required_quantity,
                        comp.category, comp.supplier, comp.unit_price]
                    );
                    importedComponents.push(result.rows[0]);
                } catch (error) {
                    if (error.code === '23505') { // Unique constraint violation
                        skippedComponents.push({
                            part_number: comp.part_number,
                            reason: 'Part number already exists',
                        });
                    } else {
                        throw error;
                    }
                }
            }

            await client.query('COMMIT');

            // Clean up uploaded file
            fs.unlinkSync(req.file.path);

            res.json({
                success: true,
                message: 'Components imported successfully',
                data: {
                    imported_count: importedComponents.length,
                    skipped_count: skippedComponents.length,
                    imported_components: importedComponents,
                    skipped_components: skippedComponents,
                },
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        // Clean up file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
};

// Export inventory to Excel
const exportInventory = async (req, res, next) => {
    try {
        const { lowStock = false } = req.query;

        let queryText = 'SELECT * FROM components';

        if (lowStock === 'true') {
            queryText += ' WHERE current_stock < (monthly_required_quantity * 0.2)';
        }

        queryText += ' ORDER BY component_name ASC';

        const result = await query(queryText);

        // Prepare data for Excel
        const excelData = result.rows.map(comp => ({
            'Component Name': comp.component_name,
            'Part Number': comp.part_number,
            'Current Stock': comp.current_stock,
            'Monthly Required': comp.monthly_required_quantity,
            'Stock %': ((comp.current_stock / comp.monthly_required_quantity) * 100).toFixed(1) + '%',
            'Category': comp.category || '',
            'Supplier': comp.supplier || '',
            'Unit Price': comp.unit_price || 0,
            'Total Value': (comp.current_stock * (comp.unit_price || 0)).toFixed(2),
            'Status': comp.current_stock < (comp.monthly_required_quantity * 0.2) ? 'LOW STOCK' : 'ADEQUATE',
        }));

        // Create workbook
        const worksheet = xlsx.utils.json_to_sheet(excelData);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Inventory');

        // Set column widths
        worksheet['!cols'] = [
            { wch: 30 }, // Component Name
            { wch: 20 }, // Part Number
            { wch: 15 }, // Current Stock
            { wch: 15 }, // Monthly Required
            { wch: 10 }, // Stock %
            { wch: 20 }, // Category
            { wch: 25 }, // Supplier
            { wch: 12 }, // Unit Price
            { wch: 12 }, // Total Value
            { wch: 15 }, // Status
        ];

        // Generate buffer
        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename=inventory_export.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);

    } catch (error) {
        next(error);
    }
};

// Export consumption report to Excel
const exportConsumption = async (req, res, next) => {
    try {
        const { start_date, end_date } = req.query;

        let queryText = `
      SELECT 
        c.component_name,
        c.part_number,
        c.category,
        SUM(ch.quantity_consumed) as total_consumed,
        COUNT(DISTINCT ch.production_entry_id) as production_count,
        MIN(ch.consumed_at) as first_consumption,
        MAX(ch.consumed_at) as last_consumption
      FROM consumption_history ch
      JOIN components c ON ch.component_id = c.id
      WHERE 1=1
    `;

        const params = [];
        let paramCount = 0;

        if (start_date) {
            paramCount++;
            queryText += ` AND ch.consumed_at >= $${paramCount}`;
            params.push(start_date);
        }

        if (end_date) {
            paramCount++;
            queryText += ` AND ch.consumed_at <= $${paramCount}`;
            params.push(end_date);
        }

        queryText += `
      GROUP BY c.component_name, c.part_number, c.category
      ORDER BY total_consumed DESC
    `;

        const result = await query(queryText, params);

        // Prepare data for Excel
        const excelData = result.rows.map(row => ({
            'Component Name': row.component_name,
            'Part Number': row.part_number,
            'Category': row.category || '',
            'Total Consumed': parseInt(row.total_consumed),
            'Production Count': parseInt(row.production_count),
            'First Consumption': new Date(row.first_consumption).toLocaleDateString(),
            'Last Consumption': new Date(row.last_consumption).toLocaleDateString(),
        }));

        // Create workbook
        const worksheet = xlsx.utils.json_to_sheet(excelData);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Consumption Report');

        // Set column widths
        worksheet['!cols'] = [
            { wch: 30 },
            { wch: 20 },
            { wch: 20 },
            { wch: 15 },
            { wch: 18 },
            { wch: 18 },
            { wch: 18 },
        ];

        // Generate buffer
        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename=consumption_report.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);

    } catch (error) {
        next(error);
    }
};

// Download Excel template
const downloadTemplate = async (req, res, next) => {
    try {
        const templateData = [
            {
                component_name: 'Resistor 10kΩ',
                part_number: 'R-10K-001',
                current_stock: 5000,
                monthly_required_quantity: 10000,
                category: 'Resistors',
                supplier: 'Component Supplier A',
                unit_price: 0.05,
            },
            {
                component_name: 'Capacitor 10μF',
                part_number: 'C-10UF-001',
                current_stock: 3000,
                monthly_required_quantity: 8000,
                category: 'Capacitors',
                supplier: 'Component Supplier B',
                unit_price: 0.15,
            },
        ];

        const worksheet = xlsx.utils.json_to_sheet(templateData);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Components');

        // Set column widths
        worksheet['!cols'] = [
            { wch: 30 },
            { wch: 20 },
            { wch: 15 },
            { wch: 25 },
            { wch: 20 },
            { wch: 25 },
            { wch: 12 },
        ];

        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename=component_import_template.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);

    } catch (error) {
        next(error);
    }
};

module.exports = {
    importComponents,
    exportInventory,
    exportConsumption,
    downloadTemplate,
};
