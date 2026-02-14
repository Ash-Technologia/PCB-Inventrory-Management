const { query, getClient } = require('../config/database');

// Get all components with pagination, search, and filtering
const getAllComponents = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 50,
            search = '',
            category = '',
            lowStock = false
        } = req.query;

        const offset = (page - 1) * limit;
        let queryText = 'SELECT * FROM components WHERE 1=1';
        const params = [];
        let paramCount = 0;

        // Search filter
        if (search) {
            paramCount++;
            queryText += ` AND (component_name ILIKE $${paramCount} OR part_number ILIKE $${paramCount})`;
            params.push(`%${search}%`);
        }

        // Category filter
        if (category) {
            paramCount++;
            queryText += ` AND category = $${paramCount}`;
            params.push(category);
        }

        // Low stock filter (USP #2: Smart Threshold Engine)
        if (lowStock === 'true') {
            queryText += ` AND current_stock < (monthly_required_quantity * 0.2)`;
        }

        // Get total count
        const countResult = await query(`SELECT COUNT(*) FROM (${queryText}) AS filtered`, params);
        const totalCount = parseInt(countResult.rows[0].count);

        // Add pagination
        queryText += ` ORDER BY component_name ASC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        params.push(limit, offset);

        const result = await query(queryText, params);

        // Calculate stock status for each component
        const components = result.rows.map(comp => ({
            ...comp,
            stock_percentage: (comp.current_stock / comp.monthly_required_quantity) * 100,
            stock_status: comp.current_stock < (comp.monthly_required_quantity * 0.2)
                ? 'CRITICAL'
                : comp.current_stock < (comp.monthly_required_quantity * 0.5)
                    ? 'LOW'
                    : 'ADEQUATE',
        }));

        res.json({
            success: true,
            data: components,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit),
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get single component by ID
const getComponentById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await query('SELECT * FROM components WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Component not found',
            });
        }

        // Get consumption history for this component
        const historyResult = await query(
            `SELECT ch.*, pe.production_date, pe.quantity_produced, p.pcb_name
       FROM consumption_history ch
       JOIN production_entries pe ON ch.production_entry_id = pe.id
       JOIN pcbs p ON pe.pcb_id = p.id
       WHERE ch.component_id = $1
       ORDER BY ch.consumed_at DESC
       LIMIT 10`,
            [id]
        );

        const component = {
            ...result.rows[0],
            consumption_history: historyResult.rows,
            stock_percentage: (result.rows[0].current_stock / result.rows[0].monthly_required_quantity) * 100,
        };

        res.json({
            success: true,
            data: component,
        });
    } catch (error) {
        next(error);
    }
};

// Create new component
const createComponent = async (req, res, next) => {
    try {
        const {
            component_name,
            part_number,
            current_stock,
            monthly_required_quantity,
            category,
            supplier,
            unit_price,
        } = req.body;

        const result = await query(
            `INSERT INTO components 
       (component_name, part_number, current_stock, monthly_required_quantity, category, supplier, unit_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [component_name, part_number, current_stock, monthly_required_quantity, category, supplier, unit_price]
        );

        // Check if procurement trigger needed
        const component = result.rows[0];
        if (component.current_stock < (component.monthly_required_quantity * 0.2)) {
            await createProcurementTrigger(component.id, component.current_stock, component.monthly_required_quantity);
        }

        res.status(201).json({
            success: true,
            message: 'Component created successfully',
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

// Update component
const updateComponent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Build dynamic update query
        const fields = Object.keys(updates);
        const values = Object.values(updates);

        if (fields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update',
            });
        }

        const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
        values.push(id);

        const result = await query(
            `UPDATE components SET ${setClause} WHERE id = $${values.length} RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Component not found',
            });
        }

        // Check if procurement trigger needed
        const component = result.rows[0];
        if (component.current_stock < (component.monthly_required_quantity * 0.2)) {
            await createProcurementTrigger(component.id, component.current_stock, component.monthly_required_quantity);
        }

        res.json({
            success: true,
            message: 'Component updated successfully',
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

// Delete component
const deleteComponent = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await query('DELETE FROM components WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Component not found',
            });
        }

        res.json({
            success: true,
            message: 'Component deleted successfully',
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

// Get low stock components (USP #2: Smart Procurement Intelligence)
const getLowStockComponents = async (req, res, next) => {
    try {
        const result = await query(
            `SELECT 
        c.*,
        (c.current_stock::float / c.monthly_required_quantity * 100) as stock_percentage,
        CASE 
          WHEN c.current_stock < (c.monthly_required_quantity * 0.1) THEN 'CRITICAL'
          WHEN c.current_stock < (c.monthly_required_quantity * 0.2) THEN 'HIGH'
          WHEN c.current_stock < (c.monthly_required_quantity * 0.3) THEN 'MEDIUM'
          ELSE 'LOW'
        END as priority
       FROM components c
       WHERE c.current_stock < (c.monthly_required_quantity * 0.2)
       ORDER BY stock_percentage ASC`
        );

        // Calculate days until stockout for each component (USP #7)
        const componentsWithPrediction = await Promise.all(
            result.rows.map(async (comp) => {
                // Get average daily consumption
                const consumptionResult = await query(
                    `SELECT 
            COALESCE(SUM(quantity_consumed), 0) as total_consumed,
            COALESCE(COUNT(DISTINCT DATE(consumed_at)), 1) as days_active
           FROM consumption_history
           WHERE component_id = $1
           AND consumed_at >= NOW() - INTERVAL '30 days'`,
                    [comp.id]
                );

                const { total_consumed, days_active } = consumptionResult.rows[0];
                const avgDailyConsumption = days_active > 0 ? total_consumed / days_active : 0;
                const daysUntilStockout = avgDailyConsumption > 0
                    ? Math.floor(comp.current_stock / avgDailyConsumption)
                    : 999;

                // Recommended order quantity (2 months supply)
                const recommendedOrder = Math.max(
                    comp.monthly_required_quantity * 2 - comp.current_stock,
                    0
                );

                return {
                    ...comp,
                    avg_daily_consumption: parseFloat(avgDailyConsumption.toFixed(2)),
                    days_until_stockout: daysUntilStockout,
                    recommended_order_quantity: recommendedOrder,
                };
            })
        );

        res.json({
            success: true,
            data: componentsWithPrediction,
            count: componentsWithPrediction.length,
        });
    } catch (error) {
        next(error);
    }
};

// Helper function to create procurement trigger
async function createProcurementTrigger(componentId, currentStock, monthlyRequired) {
    try {
        const stockPercentage = (currentStock / monthlyRequired) * 100;
        let priority = 'MEDIUM';

        if (stockPercentage < 10) priority = 'CRITICAL';
        else if (stockPercentage < 15) priority = 'HIGH';
        else if (stockPercentage < 20) priority = 'MEDIUM';

        const recommendedOrder = Math.max(monthlyRequired * 2 - currentStock, 0);

        // Check if trigger already exists for this component with PENDING status
        const existingTrigger = await query(
            'SELECT id FROM procurement_triggers WHERE component_id = $1 AND status = $2',
            [componentId, 'PENDING']
        );

        if (existingTrigger.rows.length === 0) {
            await query(
                `INSERT INTO procurement_triggers 
         (component_id, current_stock, monthly_required, recommended_order_quantity, priority)
         VALUES ($1, $2, $3, $4, $5)`,
                [componentId, currentStock, monthlyRequired, recommendedOrder, priority]
            );
        }
    } catch (error) {
        console.error('Error creating procurement trigger:', error);
    }
}

module.exports = {
    getAllComponents,
    getComponentById,
    createComponent,
    updateComponent,
    deleteComponent,
    getLowStockComponents,
};
