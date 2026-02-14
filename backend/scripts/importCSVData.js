const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { pool } = require('../config/database');

/**
 * CSV DATA IMPORT SCRIPT
 * Imports real Bajaj and Atomberg production data from CSV files
 */

// Parse component string
function parseComponents(componentString) {
    if (!componentString || componentString === 'NA' || componentString === 'N/A') return [];
    const parts = componentString.split(/[\/,]/).map(s => s.trim()).filter(s => s && s !== 'FAULTY' && s !== 'NA');
    const componentCounts = {};
    parts.forEach(comp => {
        componentCounts[comp] = (componentCounts[comp] || 0) + 1;
    });
    return Object.entries(componentCounts).map(([name, qty]) => ({ name, quantity: qty }));
}

// Read CSV file
function readCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', reject);
    });
}

// Main import function
async function importAllData() {
    const client = await pool.connect();

    try {
        console.log('🚀 Starting CSV Data Import...\n');

        await client.query('BEGIN');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await client.query('TRUNCATE TABLE consumption_history, production_entries, pcb_components, procurement_triggers, components, pcbs RESTART IDENTITY CASCADE');
        console.log('  ✅ Cleared\n');

        const datasetPath = path.join(__dirname, '../../dataset');
        const globalComponentMap = {}; // Track components globally to avoid duplicates

        // === BAJAJ DATA ===
        console.log('📦 Importing Bajaj PCB Data...\n');

        const bajajFiles = {
            '974290': 'Display PCB ICX 190 TS Induction',
            '971039': 'Main PCB IRX 220F Infrared Cooktop',
            '971065': 'Display PCB Splendid 140 TS',
            '971089': 'Control PCB Assembly',
            '974284': 'Power PCB Assembly',
            '971040': 'Display PCB Assembly',
            '971084': 'Main Control PCB',
            '974278': 'Touch Sensor PCB'
        };

        for (const [pcbCode, pcbDesc] of Object.entries(bajajFiles)) {
            const csvFile = path.join(datasetPath, `Bajaj_PCB_Dec_25_Data_${pcbCode}.csv`);

            if (!fs.existsSync(csvFile)) {
                console.log(`  ⚠️  Skipping ${pcbCode} - file not found`);
                continue;
            }

            console.log(`  Processing ${pcbCode}...`);
            const data = await readCSV(csvFile);

            if (data.length === 0) {
                console.log(`    ⚠️  No data found`);
                continue;
            }

            // Create PCB
            const pcbResult = await client.query(
                `INSERT INTO pcbs (pcb_name, pcb_code, description) VALUES ($1, $2, $3) RETURNING id`,
                [pcbDesc, `BAJAJ-${pcbCode}`, `Bajaj Electricals - ${pcbDesc}`]
            );
            const pcbId = pcbResult.rows[0].id;

            // Extract all unique components
            const componentSet = new Set();
            data.forEach(row => {
                const compString = row['Component Consumption'] || row['Analysis'] || '';
                const components = parseComponents(compString);
                components.forEach(c => componentSet.add(c.name));
            });

            // Create components and map to PCB
            for (const compName of componentSet) {
                let compId;

                if (globalComponentMap[compName]) {
                    // Component already exists
                    compId = globalComponentMap[compName];
                } else {
                    // Create new component
                    let category = 'Other';
                    if (compName.match(/^S\d+$/)) category = 'Switch';
                    else if (compName.includes('LED')) category = 'LED';
                    else if (compName.match(/^(IC|U)\d+/)) category = 'IC';
                    else if (compName.match(/^R\d+/)) category = 'Resistor';
                    else if (compName.match(/^C\d+/)) category = 'Capacitor';
                    else if (compName.includes('CN') || compName.includes('CON')) category = 'Connector';
                    else if (compName.includes('BZ')) category = 'Buzzer';
                    else if (compName.includes('EC')) category = 'Electrolytic Capacitor';
                    else if (compName.includes('VR')) category = 'Variable Resistor';
                    else if (compName.match(/^Q\d+/)) category = 'Transistor';
                    else if (compName.match(/^F\d+/)) category = 'Fuse';
                    else if (compName.includes('PCB_LUG')) category = 'PCB Connector';

                    const partNumber = `${pcbCode}-${compName}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

                    const compResult = await client.query(
                        `INSERT INTO components (component_name, part_number, current_stock, monthly_required_quantity, category, unit_price)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
                        [
                            compName,
                            partNumber,
                            1000, // Initial stock
                            50,   // Monthly requirement
                            category,
                            category === 'IC' ? 25.00 : category === 'LED' ? 5.00 : 2.00
                        ]
                    );
                    compId = compResult.rows[0].id;
                    globalComponentMap[compName] = compId;
                }

                // Map component to PCB
                await client.query(
                    `INSERT INTO pcb_components (pcb_id, component_id, quantity_per_pcb) VALUES ($1, $2, 1)
           ON CONFLICT (pcb_id, component_id) DO NOTHING`,
                    [pcbId, compId]
                );
            }

            console.log(`    ✅ ${componentSet.size} components, ${data.length} entries`);
        }

        // === ATOMBERG DATA ===
        console.log('\n📦 Importing Atomberg PCB Data...\n');

        const atombergFile = path.join(datasetPath, 'Atomberg_Data_PCB-Serial-No-1.csv');

        if (fs.existsSync(atombergFile)) {
            console.log('  Reading Atomberg data...');
            const atombergData = await readCSV(atombergFile);
            console.log(`  Total rows: ${atombergData.length}`);

            // Get unique part codes
            const partCodes = [...new Set(atombergData.map(r => r['Part code']).filter(Boolean))];
            console.log(`  Part codes: ${partCodes.join(', ')}\n`);

            for (const partCode of partCodes) {
                console.log(`  Processing ${partCode}...`);

                // Create PCB
                const pcbResult = await client.query(
                    `INSERT INTO pcbs (pcb_name, pcb_code, description) VALUES ($1, $2, $3) RETURNING id`,
                    [`Atomberg Fan PCB ${partCode}`, `ATOMBERG-${partCode}`, `Atomberg Technologies - BLDC Fan Controller`]
                );
                const pcbId = pcbResult.rows[0].id;

                // Get entries for this part code
                const pcbData = atombergData.filter(r => r['Part code'] === partCode);

                // Extract components
                const componentSet = new Set();
                pcbData.forEach(row => {
                    const compString = row['Component Change'] || row['Analysis'] || '';
                    const components = parseComponents(compString);
                    components.forEach(c => componentSet.add(c.name));
                });

                // Create components and map to PCB
                for (const compName of componentSet) {
                    let compId;

                    if (globalComponentMap[compName]) {
                        compId = globalComponentMap[compName];
                    } else {
                        let category = 'Other';
                        if (compName.includes('DRV')) category = 'Driver IC';
                        else if (compName.includes('WIRE')) category = 'Wire';
                        else if (compName.match(/^F\d+/)) category = 'Fuse';
                        else if (compName.match(/^BD\d+/)) category = 'Bridge Diode';
                        else if (compName.match(/^R\d+/)) category = 'Resistor';
                        else if (compName.match(/^C\d+/)) category = 'Capacitor';
                        else if (compName.match(/^Q\d+/)) category = 'Transistor';
                        else if (compName.match(/^L\d+/)) category = 'Inductor';
                        else if (compName.match(/^J\d+/)) category = 'Connector';
                        else if (compName.includes('MOV')) category = 'MOV';

                        const partNumber = `${partCode}-${compName}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

                        const compResult = await client.query(
                            `INSERT INTO components (component_name, part_number, current_stock, monthly_required_quantity, category, unit_price)
               VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
                            [
                                compName,
                                partNumber,
                                2000, // Higher stock for Atomberg
                                100,  // Higher monthly requirement
                                category,
                                category === 'Driver IC' ? 50.00 : category === 'Bridge Diode' ? 15.00 : 3.00
                            ]
                        );
                        compId = compResult.rows[0].id;
                        globalComponentMap[compName] = compId;
                    }

                    // Map to PCB
                    await client.query(
                        `INSERT INTO pcb_components (pcb_id, component_id, quantity_per_pcb) VALUES ($1, $2, 1)
             ON CONFLICT (pcb_id, component_id) DO NOTHING`,
                        [pcbId, compId]
                    );
                }

                console.log(`    ✅ ${componentSet.size} components, ${pcbData.length} entries`);
            }
        } else {
            console.log('  ⚠️  Atomberg file not found');
        }

        await client.query('COMMIT');

        console.log('\n✅ IMPORT COMPLETE!\n');

        // Show summary
        const stats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM components) as total_components,
        (SELECT COUNT(*) FROM pcbs) as total_pcbs,
        (SELECT COUNT(*) FROM pcb_components) as total_mappings
    `);

        const categoryStats = await client.query(`
      SELECT category, COUNT(*) as count 
      FROM components 
      GROUP BY category 
      ORDER BY count DESC
    `);

        const pcbList = await client.query(`
      SELECT pcb_code, pcb_name 
      FROM pcbs 
      ORDER BY id
    `);

        console.log('📊 Import Summary:');
        console.log(`  Total Components: ${stats.rows[0].total_components}`);
        console.log(`  Total PCBs: ${stats.rows[0].total_pcbs}`);
        console.log(`  BOM Mappings: ${stats.rows[0].total_mappings}`);

        console.log('\n🔧 Components by Category:');
        categoryStats.rows.forEach(r => {
            console.log(`  ${r.category}: ${r.count}`);
        });

        console.log('\n📦 PCB List:');
        pcbList.rows.forEach(r => {
            console.log(`  ${r.pcb_code} - ${r.pcb_name}`);
        });

        console.log('\n✅ Database successfully populated with real Bajaj and Atomberg data!');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('\n❌ Import failed:', error.message);
        console.error(error.stack);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run import
importAllData().catch(console.error);
