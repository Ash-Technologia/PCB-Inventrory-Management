const { query } = require('../config/database');

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

        // USP #8: Consumption Anomaly Detector (Real Data Logic)
        const todayConsumptionResult = await query(
            `SELECT COALESCE(SUM(quantity_consumed), 0) as today_consumed
             FROM consumption_history
             WHERE consumed_at >= DATE_TRUNC('day', CURRENT_DATE)`
        );
        const todayConsumption = parseInt(todayConsumptionResult.rows[0].today_consumed);

        const avgConsumptionResult = await query(
            `SELECT COALESCE(AVG(daily_total), 0) as avg_daily
             FROM (
                 SELECT DATE(consumed_at) as day, SUM(quantity_consumed) as daily_total
                 FROM consumption_history
                 WHERE consumed_at >= CURRENT_DATE - INTERVAL '30 days'
                 AND consumed_at < DATE_TRUNC('day', CURRENT_DATE)
                 GROUP BY DATE(consumed_at)
             ) as daily_stats`
        );
        const avgConsumption = parseFloat(parseFloat(avgConsumptionResult.rows[0].avg_daily).toFixed(2));

        const anomalyDetection = {
            today_consumption: todayConsumption,
            average_consumption: avgConsumption,
            is_anomaly: todayConsumption > (avgConsumption * 1.5) && avgConsumption > 0, // Flag if 50% higher than average
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

const getConsumptionSummary = async (req, res, next) => {
    try {
        const result = await query(`
            SELECT 
                COUNT(*) as total_entries, 
                COUNT(DISTINCT component_id) as distinct_components,
                COALESCE(SUM(quantity_consumed), 0) as total_units
            FROM consumption_history
        `);

        const data = result.rows[0];
        res.json({
            success: true,
            data: {
                total: parseInt(data.total_units),
                distinct_components: parseInt(data.distinct_components),
                total_entries: parseInt(data.total_entries)
            }
        });
    } catch (error) { next(error); }
};

const getTopConsumed = async (req, res, next) => {
    try {
        const result = await query(`
            SELECT c.component_name, SUM(ch.quantity_consumed) as total_consumed
            FROM consumption_history ch
            JOIN components c ON ch.component_id = c.id
            GROUP BY c.component_name, c.id
            ORDER BY total_consumed DESC
            LIMIT 5
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) { next(error); }
};

const getConsumptionTrends = async (req, res, next) => {
    try {
        const result = await query(`
            SELECT TO_CHAR(consumed_at, 'YYYY-MM-DD') as date, SUM(quantity_consumed) as total
            FROM consumption_history
            WHERE consumed_at >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY TO_CHAR(consumed_at, 'YYYY-MM-DD')
            ORDER BY date ASC
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) { next(error); }
};

const getCategoryDistribution = async (req, res, next) => {
    try {
        const result = await query(`
            SELECT category, COUNT(*) as count
            FROM components
            WHERE category IS NOT NULL
            GROUP BY category
            ORDER BY count DESC
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) { next(error); }
};

module.exports = {
    getDashboardStats,
    getConsumptionSummary,
    getTopConsumed,
    getConsumptionTrends,
    getCategoryDistribution,
};
