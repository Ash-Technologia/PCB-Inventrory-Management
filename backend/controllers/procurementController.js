const { query } = require('../config/database');

// Get all procurement triggers
const getAllTriggers = async (req, res, next) => {
    try {
        const { status = 'PENDING', priority } = req.query;

        let queryText = `
      SELECT 
        pt.*,
        c.component_name,
        c.part_number,
        c.category,
        c.supplier,
        c.unit_price,
        (pt.recommended_order_quantity * c.unit_price) as estimated_cost
      FROM procurement_triggers pt
      JOIN components c ON pt.component_id = c.id
      WHERE pt.status = $1
    `;

        const params = [status];
        let paramCount = 1;

        if (priority) {
            paramCount++;
            queryText += ` AND pt.priority = $${paramCount}`;
            params.push(priority);
        }

        queryText += ` ORDER BY 
      CASE pt.priority 
        WHEN 'CRITICAL' THEN 1
        WHEN 'HIGH' THEN 2
        WHEN 'MEDIUM' THEN 3
        WHEN 'LOW' THEN 4
      END,
      pt.triggered_at DESC
    `;

        const result = await query(queryText, params);

        // Calculate days until stockout for each trigger
        const triggersWithPrediction = await Promise.all(
            result.rows.map(async (trigger) => {
                const consumptionResult = await query(
                    `SELECT 
            COALESCE(SUM(quantity_consumed), 0) as total_consumed,
            COALESCE(COUNT(DISTINCT DATE(consumed_at)), 1) as days_active
           FROM consumption_history
           WHERE component_id = $1
           AND consumed_at >= NOW() - INTERVAL '30 days'`,
                    [trigger.component_id]
                );

                const { total_consumed, days_active } = consumptionResult.rows[0];
                const avgDailyConsumption = days_active > 0 ? total_consumed / days_active : 0;
                const daysUntilStockout = avgDailyConsumption > 0
                    ? Math.floor(trigger.current_stock / avgDailyConsumption)
                    : 999;

                return {
                    ...trigger,
                    estimated_cost: parseFloat(parseFloat(trigger.estimated_cost).toFixed(2)),
                    avg_daily_consumption: parseFloat(avgDailyConsumption.toFixed(2)),
                    days_until_stockout: daysUntilStockout,
                    stock_percentage: ((trigger.current_stock / trigger.monthly_required) * 100).toFixed(1),
                };
            })
        );

        res.json({
            success: true,
            data: triggersWithPrediction,
            count: triggersWithPrediction.length,
        });
    } catch (error) {
        next(error);
    }
};

// Update procurement trigger status
const updateTriggerStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['PENDING', 'ORDERED', 'FULFILLED'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be PENDING, ORDERED, or FULFILLED',
            });
        }

        const resolvedAt = status === 'FULFILLED' ? new Date() : null;

        const result = await query(
            'UPDATE procurement_triggers SET status = $1, resolved_at = $2 WHERE id = $3 RETURNING *',
            [status, resolvedAt, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Procurement trigger not found',
            });
        }

        res.json({
            success: true,
            message: 'Procurement trigger updated successfully',
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

// Create manual procurement trigger
const createTrigger = async (req, res, next) => {
    try {
        const { component_id, notes } = req.body;

        // Get component details
        const componentResult = await query(
            'SELECT current_stock, monthly_required_quantity, unit_price FROM components WHERE id = $1',
            [component_id]
        );

        if (componentResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Component not found',
            });
        }

        const { current_stock, monthly_required_quantity } = componentResult.rows[0];
        const stockPercentage = (current_stock / monthly_required_quantity) * 100;

        let priority = 'MEDIUM';
        if (stockPercentage < 10) priority = 'CRITICAL';
        else if (stockPercentage < 15) priority = 'HIGH';
        else if (stockPercentage < 20) priority = 'MEDIUM';
        else priority = 'LOW';

        const recommendedOrder = Math.max(monthly_required_quantity * 2 - current_stock, 0);

        const result = await query(
            `INSERT INTO procurement_triggers 
       (component_id, current_stock, monthly_required, recommended_order_quantity, priority)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [component_id, current_stock, monthly_required_quantity, recommendedOrder, priority]
        );

        res.status(201).json({
            success: true,
            message: 'Procurement trigger created successfully',
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

// Get procurement summary
const getProcurementSummary = async (req, res, next) => {
    try {
        const summaryResult = await query(
            `SELECT 
        status,
        priority,
        COUNT(*) as count,
        SUM(recommended_order_quantity * c.unit_price) as total_estimated_cost
       FROM procurement_triggers pt
       JOIN components c ON pt.component_id = c.id
       GROUP BY status, priority
       ORDER BY status, 
         CASE priority 
           WHEN 'CRITICAL' THEN 1
           WHEN 'HIGH' THEN 2
           WHEN 'MEDIUM' THEN 3
           WHEN 'LOW' THEN 4
         END`
        );

        res.json({
            success: true,
            data: summaryResult.rows.map(row => ({
                ...row,
                count: parseInt(row.count),
                total_estimated_cost: parseFloat(parseFloat(row.total_estimated_cost || 0).toFixed(2)),
            })),
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllTriggers,
    updateTriggerStatus,
    createTrigger,
    getProcurementSummary,
};
