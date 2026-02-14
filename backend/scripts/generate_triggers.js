const { query } = require('../config/database');

async function generateTriggers() {
    try {
        console.log('🔄 Checking stock levels and generating procurement triggers...');

        // 1. Get all components with low stock
        // Logic: current_stock < 20% of monthly_required_quantity
        const lowStockResult = await query(`
            SELECT id, component_name, current_stock, monthly_required_quantity 
            FROM components 
            WHERE current_stock < (monthly_required_quantity * 0.2)
        `);

        const lowStockComponents = lowStockResult.rows;
        console.log(`📊 Found ${lowStockComponents.length} components with low/critical stock.`);

        if (lowStockComponents.length === 0) {
            console.log('✅ No low stock components found. Triggers up to date.');
            process.exit(0);
        }

        let newTriggers = 0;
        let existingTriggers = 0;

        for (const component of lowStockComponents) {
            // Check if a PENDING trigger already exists
            const existingTrigger = await query(
                'SELECT id FROM procurement_triggers WHERE component_id = $1 AND status = $2',
                [component.id, 'PENDING']
            );

            if (existingTrigger.rows.length > 0) {
                existingTriggers++;
                continue;
            }

            // Calculate priority and recommended order quantity
            const stockRatio = component.current_stock / component.monthly_required_quantity;
            let priority = 'MEDIUM';
            if (stockRatio < 0.1) priority = 'CRITICAL';
            else if (stockRatio < 0.15) priority = 'HIGH';

            // Recommended order: restore to 2 months supply
            const recommendedOrder = Math.ceil((component.monthly_required_quantity * 2) - component.current_stock);

            // Create new trigger
            await query(
                `INSERT INTO procurement_triggers 
                (component_id, current_stock, monthly_required, recommended_order_quantity, priority, status)
                VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    component.id,
                    component.current_stock,
                    component.monthly_required_quantity,
                    recommendedOrder,
                    priority,
                    'PENDING'
                ]
            );

            console.log(`  ➕ Created trigger for ${component.component_name} (${priority})`);
            newTriggers++;
        }

        console.log('\n✅ Trigger generation complete!');
        console.log(`   - New triggers created: ${newTriggers}`);
        console.log(`   - Existing pending triggers: ${existingTriggers}`);

        process.exit(0);

    } catch (error) {
        console.error('❌ Error generating triggers:', error);
        process.exit(1);
    }
}

generateTriggers();
