const { query } = require('../config/database');

// Get consumption summary by component
const getConsumptionSummary = async (req, res, next) => {
    try {
        const { start_date, end_date, limit = 20 } = req.query;

        let queryText = `
      SELECT 
        c.id,
        c.component_name,
        c.part_number,
        c.category,
        c.current_stock,
        c.monthly_required_quantity,
        COALESCE(SUM(ch.quantity_consumed), 0) as total_consumed,
        COUNT(DISTINCT ch.production_entry_id) as production_count,
        COALESCE(SUM(ch.quantity_consumed * c.unit_price), 0) as total_cost
      FROM components c
      LEFT JOIN consumption_history ch ON c.id = ch.component_id
    `;

        const params = [];
        let paramCount = 0;

        if (start_date || end_date) {
            queryText += ' WHERE 1=1';

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
        }

        queryText += `
      GROUP BY c.id, c.component_name, c.part_number, c.category, c.current_stock, c.monthly_required_quantity
      ORDER BY total_consumed DESC
      LIMIT $${paramCount + 1}
    `;
        params.push(limit);

        const result = await query(queryText, params);

        res.json({
            success: true,
            data: result.rows.map(row => ({
                ...row,
                total_consumed: parseInt(row.total_consumed),
                production_count: parseInt(row.production_count),
                total_cost: parseFloat(parseFloat(row.total_cost).toFixed(2)),
            })),
        });
    } catch (error) {
        next(error);
    }
};

// Get top consumed components
const getTopConsumed = async (req, res, next) => {
    try {
        const { limit = 10, days = 30 } = req.query;

        const result = await query(
            `SELECT 
        c.id,
        c.component_name,
        c.part_number,
        c.category,
        c.current_stock,
        SUM(ch.quantity_consumed) as total_consumed,
        COUNT(DISTINCT ch.production_entry_id) as times_used,
        (c.current_stock::float / NULLIF(SUM(ch.quantity_consumed), 0) * $2) as days_of_stock_remaining
       FROM components c
       JOIN consumption_history ch ON c.id = ch.component_id
       WHERE ch.consumed_at >= NOW() - INTERVAL '${days} days'
       GROUP BY c.id, c.component_name, c.part_number, c.category, c.current_stock
       ORDER BY total_consumed DESC
       LIMIT $1`,
            [limit, days]
        );

        res.json({
            success: true,
            data: result.rows.map(row => ({
                ...row,
                total_consumed: parseInt(row.total_consumed),
                times_used: parseInt(row.times_used),
                days_of_stock_remaining: row.days_of_stock_remaining ? parseFloat(row.days_of_stock_remaining.toFixed(1)) : null,
            })),
        });
    } catch (error) {
        next(error);
    }
};

// Get consumption trends over time
const getConsumptionTrends = async (req, res, next) => {
    try {
        const { component_id, days = 30 } = req.query;

        let queryText = `
      SELECT 
        DATE(ch.consumed_at) as date,
        c.component_name,
        c.part_number,
        SUM(ch.quantity_consumed) as daily_consumption
      FROM consumption_history ch
      JOIN components c ON ch.component_id = c.id
      WHERE ch.consumed_at >= NOW() - INTERVAL '${days} days'
    `;

        const params = [];
        if (component_id) {
            queryText += ` AND ch.component_id = $1`;
            params.push(component_id);
        }

        queryText += `
      GROUP BY DATE(ch.consumed_at), c.component_name, c.part_number
      ORDER BY date ASC
    `;

        const result = await query(queryText, params);

        res.json({
            success: true,
            data: result.rows.map(row => ({
                ...row,
                daily_consumption: parseInt(row.daily_consumption),
            })),
        });
    } catch (error) {
        next(error);
    }
};

// Get dashboard statistics (USP #4: Consumption Intelligence Dashboard)
const getDashboardStats = async (req, res, next) => {
    try {
        // Total components
        const totalComponentsResult = await query('SELECT COUNT(*) as count FROM components');
        const totalComponents = parseInt(totalComponentsResult.rows[0].count);

        // Low stock components
        const lowStockResult = await query(
            'SELECT COUNT(*) as count FROM components WHERE current_stock < (monthly_required_quantity * 0.2)'
        );
        const lowStockCount = parseInt(lowStockResult.rows[0].count);

        // Critical stock components
        const criticalStockResult = await query(
            'SELECT COUNT(*) as count FROM components WHERE current_stock < (monthly_required_quantity * 0.1)'
        );
        const criticalStockCount = parseInt(criticalStockResult.rows[0].count);

        // Total PCBs
        const totalPCBsResult = await query('SELECT COUNT(*) as count FROM pcbs');
        const totalPCBs = parseInt(totalPCBsResult.rows[0].count);

        // Production entries this month
        const productionThisMonthResult = await query(
            `SELECT COUNT(*) as count, COALESCE(SUM(quantity_produced), 0) as total_units
       FROM production_entries
       WHERE production_date >= DATE_TRUNC('month', CURRENT_DATE)`
        );
        const productionThisMonth = {
            entries: parseInt(productionThisMonthResult.rows[0].count),
            units: parseInt(productionThisMonthResult.rows[0].total_units),
        };

        // Pending procurement triggers
        const pendingTriggersResult = await query(
            'SELECT COUNT(*) as count FROM procurement_triggers WHERE status = $1',
            ['PENDING']
        );
        const pendingTriggers = parseInt(pendingTriggersResult.rows[0].count);

        // Total inventory value
        const inventoryValueResult = await query(
            'SELECT COALESCE(SUM(current_stock * unit_price), 0) as total_value FROM components'
        );
        const totalInventoryValue = parseFloat(parseFloat(inventoryValueResult.rows[0].total_value).toFixed(2));

        // Consumption this month
        const consumptionThisMonthResult = await query(
            `SELECT COALESCE(SUM(quantity_consumed), 0) as total_consumed
       FROM consumption_history
       WHERE consumed_at >= DATE_TRUNC('month', CURRENT_DATE)`
        );
        const consumptionThisMonth = parseInt(consumptionThisMonthResult.rows[0].total_consumed);

        // USP #8: Consumption Anomaly Detector
        const anomalyResult = await query(
            `WITH daily_consumption AS (
        SELECT 
          DATE(consumed_at) as date,
          SUM(quantity_consumed) as daily_total
        FROM consumption_history
        WHERE consumed_at >= NOW() - INTERVAL '14 days'
        GROUP BY DATE(consumed_at)
      ),
      stats AS (
        SELECT 
          AVG(daily_total) as avg_consumption,
          STDDEV(daily_total) as stddev_consumption
        FROM daily_consumption
      ),
      today AS (
        SELECT COALESCE(SUM(quantity_consumed), 0) as today_total
        FROM consumption_history
        WHERE DATE(consumed_at) = CURRENT_DATE
      )
      SELECT 
        today.today_total,
        stats.avg_consumption,
        CASE 
          WHEN today.today_total > (stats.avg_consumption + 2 * COALESCE(stats.stddev_consumption, 0)) THEN true
          ELSE false
        END as is_anomaly
      FROM today, stats`
        );

        const anomalyDetection = {
            today_consumption: parseInt(anomalyResult.rows[0]?.today_total || 0),
            average_consumption: parseFloat(parseFloat(anomalyResult.rows[0]?.avg_consumption || 0).toFixed(2)),
            is_anomaly: anomalyResult.rows[0]?.is_anomaly || false,
        };

        res.json({
            success: true,
            data: {
                total_components: totalComponents,
                low_stock_count: lowStockCount,
                critical_stock_count: criticalStockCount,
                total_pcbs: totalPCBs,
                production_this_month: productionThisMonth,
                pending_procurement_triggers: pendingTriggers,
                total_inventory_value: totalInventoryValue,
                consumption_this_month: consumptionThisMonth,
                anomaly_detection: anomalyDetection,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get category-wise distribution
const getCategoryDistribution = async (req, res, next) => {
    try {
        const result = await query(
            `SELECT 
        category,
        COUNT(*) as component_count,
        SUM(current_stock) as total_stock,
        SUM(current_stock * unit_price) as total_value
       FROM components
       WHERE category IS NOT NULL
       GROUP BY category
       ORDER BY component_count DESC`
        );

        res.json({
            success: true,
            data: result.rows.map(row => ({
                ...row,
                component_count: parseInt(row.component_count),
                total_stock: parseInt(row.total_stock),
                total_value: parseFloat(parseFloat(row.total_value).toFixed(2)),
            })),
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getConsumptionSummary,
    getTopConsumed,
    getConsumptionTrends,
    getDashboardStats,
    getCategoryDistribution,
};
