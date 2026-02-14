const { query } = require('../config/database');

async function createDemoStockData() {
    try {
        console.log('🔄 Creating demo stock data...\n');

        // Get all components
        const allComponents = await query('SELECT id, component_name, monthly_required_quantity FROM components LIMIT 30');

        if (allComponents.rows.length === 0) {
            console.log('❌ No components found in database');
            process.exit(1);
        }

        const components = allComponents.rows;

        // Set first 5 to CRITICAL (5% stock)
        for (let i = 0; i < Math.min(5, components.length); i++) {
            const newStock = Math.floor(components[i].monthly_required_quantity * 0.05);
            await query(
                'UPDATE components SET current_stock = $1 WHERE id = $2',
                [newStock, components[i].id]
            );
        }
        console.log('✅ Created 5 CRITICAL stock components (5% stock level)');

        // Set next 8 to LOW (15% stock)
        for (let i = 5; i < Math.min(13, components.length); i++) {
            const newStock = Math.floor(components[i].monthly_required_quantity * 0.15);
            await query(
                'UPDATE components SET current_stock = $1 WHERE id = $2',
                [newStock, components[i].id]
            );
        }
        console.log('✅ Created 8 LOW stock components (15% stock level)');

        // Set next 10 to ADEQUATE (35% stock)
        for (let i = 13; i < Math.min(23, components.length); i++) {
            const newStock = Math.floor(components[i].monthly_required_quantity * 0.35);
            await query(
                'UPDATE components SET current_stock = $1 WHERE id = $2',
                [newStock, components[i].id]
            );
        }
        console.log('✅ Created 10 ADEQUATE stock components (35% stock level)\n');

        // Verify the changes
        const statusResult = await query(`
            SELECT 
                CASE 
                    WHEN current_stock < (monthly_required_quantity * 0.1) THEN 'CRITICAL'
                    WHEN current_stock < (monthly_required_quantity * 0.2) THEN 'LOW'
                    WHEN current_stock < (monthly_required_quantity * 0.5) THEN 'ADEQUATE'
                    ELSE 'NORMAL'
                END as stock_status,
                COUNT(*) as count
            FROM components
            GROUP BY 1
            ORDER BY 
                CASE 
                    WHEN (CASE 
                        WHEN current_stock < (monthly_required_quantity * 0.1) THEN 'CRITICAL'
                        WHEN current_stock < (monthly_required_quantity * 0.2) THEN 'LOW'
                        WHEN current_stock < (monthly_required_quantity * 0.5) THEN 'ADEQUATE'
                        ELSE 'NORMAL'
                    END) = 'CRITICAL' THEN 1
                    WHEN (CASE 
                        WHEN current_stock < (monthly_required_quantity * 0.1) THEN 'CRITICAL'
                        WHEN current_stock < (monthly_required_quantity * 0.2) THEN 'LOW'
                        WHEN current_stock < (monthly_required_quantity * 0.5) THEN 'ADEQUATE'
                        ELSE 'NORMAL'
                    END) = 'LOW' THEN 2
                    WHEN (CASE 
                        WHEN current_stock < (monthly_required_quantity * 0.1) THEN 'CRITICAL'
                        WHEN current_stock < (monthly_required_quantity * 0.2) THEN 'LOW'
                        WHEN current_stock < (monthly_required_quantity * 0.5) THEN 'ADEQUATE'
                        ELSE 'NORMAL'
                    END) = 'ADEQUATE' THEN 3
                    ELSE 4
                END
        `);

        console.log('📊 Stock Status Distribution:');
        console.log('─────────────────────────────');
        statusResult.rows.forEach(row => {
            const emoji = row.stock_status === 'CRITICAL' ? '🔴' :
                row.stock_status === 'LOW' ? '🟠' :
                    row.stock_status === 'ADEQUATE' ? '🟡' : '🟢';
            console.log(`${emoji} ${row.stock_status.padEnd(10)} : ${row.count} components`);
        });

        // Show sample components
        const sampleResult = await query(`
            SELECT 
                component_name,
                current_stock,
                monthly_required_quantity,
                ROUND((current_stock::numeric / NULLIF(monthly_required_quantity, 0)::numeric * 100), 1) as stock_percentage,
                CASE 
                    WHEN current_stock < (monthly_required_quantity * 0.1) THEN 'CRITICAL'
                    WHEN current_stock < (monthly_required_quantity * 0.2) THEN 'LOW'
                    WHEN current_stock < (monthly_required_quantity * 0.5) THEN 'ADEQUATE'
                    ELSE 'NORMAL'
                END as stock_status
            FROM components
            WHERE monthly_required_quantity > 0
            ORDER BY stock_percentage ASC
            LIMIT 15
        `);

        console.log('\n📋 Sample Low Stock Components:');
        console.log('─────────────────────────────────────────────────────────────');
        sampleResult.rows.forEach(row => {
            const emoji = row.stock_status === 'CRITICAL' ? '🔴' :
                row.stock_status === 'LOW' ? '🟠' :
                    row.stock_status === 'ADEQUATE' ? '🟡' : '🟢';
            const name = row.component_name.substring(0, 30).padEnd(30);
            const stock = String(row.current_stock).padStart(5);
            const required = String(row.monthly_required_quantity).padStart(5);
            const percentage = String(row.stock_percentage || 0).padStart(5);
            console.log(`${emoji} ${name} | Stock: ${stock} / ${required} (${percentage}%)`);
        });

        console.log('\n✅ Demo stock data created successfully!');
        console.log('💡 Refresh your dashboard to see the updated counts.');

    } catch (error) {
        console.error('❌ Error creating demo data:', error.message);
        throw error;
    } finally {
        process.exit(0);
    }
}

createDemoStockData();
