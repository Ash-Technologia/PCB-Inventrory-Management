const xlsx = require('xlsx');
const path = require('path');
const { pool } = require('../config/database');

/**
 * WORKING DATA IMPORT - Handles duplicates properly
 */

function parseComponents(componentString) {
    if (!componentString || componentString === 'NA' || componentString === 'N/A') return [];
    const parts = componentString.split(/[\/,]/).map(s => s.trim()).filter(s => s && s !== 'FAULTY' && s !== 'NA');
    const componentCounts = {};
    parts.forEach(comp => {
        componentCounts[comp] = (componentCounts[comp] || 0) + 1;
    });
    return Object.entries(componentCounts).map(([name, qty]) => ({ name, quantity: qty }));
}

async function importAllData() {
    const client = await pool.connect();

    try {
        console.log('🚀 Starting Data Import...\n');

        await client.query('BEGIN');

        // Clear data
        console.log('🗑️  Clearing...');
        await client.query('TRUNCATE TABLE consumption_history, production_entries, pcb_components, procurement_triggers, components, pcbs RESTART IDENTITY CASCADE');
        console.log('  ✅ Cleared\n');

        // Track all components globally to avoid duplicates
        const globalComponentMap = {};

        // === BAJAJ DATA ===
        console.log('📦 Bajaj Data...');
        const bajajFile = path.join(__dirname, '../../dataset/Bajaj PCB Dec 25 Data.xlsm');
        const bajajWorkbook = xlsx.readFile(bajajFile);

        const bajajSheets = ['974290', '971039', '971065', '971089'];
        const bajajDescs = {
            '974290': 'Display PCB ICX 190 TS Induction',
            '971039': 'Main PCB IRX 220F Infrared',
            '971065': 'Display PCB Splendid 140 TS',
            '971089': 'Control PCB Assembly'
        };

        for (const sheet of bajajSheets) {
            if (!bajajWorkbook.SheetNames.includes(sheet)) continue;

            console.log(`  ${sheet}...`);
            const data = xlsx.utils.sheet_to_json(bajajWorkbook.Sheets[sheet]);
            if (data.length === 0) continue;

            // Create PCB
            const pcbRes = await client.query(
                `INSERT INTO pcbs (pcb_name, pcb_code, description) VALUES ($1, $2, $3) RETURNING id`,
                [bajajDescs[sheet], `BAJAJ-${sheet}`, `Bajaj Electricals`]
            );
            const pcbId = pcbRes.rows[0].id;

            // Get components
            const allComps = new Set();
            data.forEach(row => {
                const comps = parseComponents(row['Component Consumption'] || row['Analysis'] || '');
                comps.forEach(c => allComps.add(c.name));
            });

            // Create/get components
            for (const compName of allComps) {
                if (globalComponentMap[compName]) {
                    // Already exists, just map to PCB
                    await client.query(
                        `INSERT INTO pcb_components (pcb_id, component_id, quantity_per_pcb) VALUES ($1, $2, 1)`,
                        [pcbId, globalComponentMap[compName]]
                    );
                    continue;
                }

                let cat = 'Other';
                if (compName.match(/^S\d+$/)) cat = 'Switch';
                else if (compName.includes('LED')) cat = 'LED';
                else if (compName.match(/^(IC|U)\d+/)) cat = 'IC';
                else if (compName.match(/^R\d+/)) cat = 'Resistor';
                else if (compName.match(/^C\d+/)) cat = 'Capacitor';
                else if (compName.includes('CN') || compName.includes('CON')) cat = 'Connector';
                else if (compName.includes('BZ')) cat = 'Buzzer';
                else if (compName.includes('EC')) cat = 'Electrolytic Capacitor';

                const partNum = `COMP-${compName}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                const res = await client.query(
                    `INSERT INTO components (component_name, part_number, current_stock, monthly_required_quantity, category, unit_price)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
                    [compName, partNum, 1000, 50, cat, cat === 'IC' ? 25 : cat === 'LED' ? 5 : 2]
                );
                globalComponentMap[compName] = res.rows[0].id;

                // Map to PCB
                await client.query(
                    `INSERT INTO pcb_components (pcb_id, component_id, quantity_per_pcb) VALUES ($1, $2, 1)`,
                    [pcbId, res.rows[0].id]
                );
            }

            console.log(`    ✅ ${allComps.size} components`);
        }

        // === ATOMBERG DATA ===
        console.log('\n📦 Atomberg Data...');
        const atombergFile = path.join(__dirname, '../../dataset/Atomberg Data.xlsm');
        const atombergWorkbook = xlsx.readFile(atombergFile);
        const atombergData = xlsx.utils.sheet_to_json(atombergWorkbook.Sheets['PCB-Serial-No-1']);

        const partCodes = [...new Set(atombergData.map(r => r['Part code']).filter(Boolean))].slice(0, 5);
        console.log(`  Part Codes: ${partCodes.join(', ')}\n`);

        for (const partCode of partCodes) {
            console.log(`  ${partCode}...`);

            const pcbRes = await client.query(
                `INSERT INTO pcbs (pcb_name, pcb_code, description) VALUES ($1, $2, $3) RETURNING id`,
                [`Atomberg Fan PCB ${partCode}`, `ATOMBERG-${partCode}`, `Atomberg BLDC Fan`]
            );
            const pcbId = pcbRes.rows[0].id;

            const pcbData = atombergData.filter(r => r['Part code'] === partCode);
            const allComps = new Set();
            pcbData.forEach(row => {
                const comps = parseComponents(row['Component Change'] || row['Analysis'] || '');
                comps.forEach(c => allComps.add(c.name));
            });

            for (const compName of allComps) {
                if (globalComponentMap[compName]) {
                    await client.query(
                        `INSERT INTO pcb_components (pcb_id, component_id, quantity_per_pcb) VALUES ($1, $2, 1)`,
                        [pcbId, globalComponentMap[compName]]
                    );
                    continue;
                }

                let cat = 'Other';
                if (compName.includes('DRV')) cat = 'Driver IC';
                else if (compName.includes('WIRE')) cat = 'Wire';
                else if (compName.match(/^F\d+/)) cat = 'Fuse';
                else if (compName.match(/^BD\d+/)) cat = 'Bridge Diode';
                else if (compName.match(/^R\d+/)) cat = 'Resistor';
                else if (compName.match(/^C\d+/)) cat = 'Capacitor';
                else if (compName.match(/^Q\d+/)) cat = 'Transistor';
                else if (compName.match(/^L\d+/)) cat = 'Inductor';
                else if (compName.match(/^J\d+/)) cat = 'Connector';
                else if (compName.includes('MOV')) cat = 'MOV';

                const partNum = `COMP-${compName}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                const res = await client.query(
                    `INSERT INTO components (component_name, part_number, current_stock, monthly_required_quantity, category, unit_price)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
                    [compName, partNum, 2000, 100, cat, cat === 'Driver IC' ? 50 : 3]
                );
                globalComponentMap[compName] = res.rows[0].id;

                await client.query(
                    `INSERT INTO pcb_components (pcb_id, component_id, quantity_per_pcb) VALUES ($1, $2, 1)`,
                    [pcbId, res.rows[0].id]
                );
            }

            console.log(`    ✅ ${allComps.size} components`);
        }

        await client.query('COMMIT');

        console.log('\n✅ COMPLETE!\n');
        const stats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM components) as comps,
        (SELECT COUNT(*) FROM pcbs) as pcbs,
        (SELECT COUNT(*) FROM pcb_components) as mappings
    `);
        console.log(`📊 Summary:`);
        console.log(`  Components: ${stats.rows[0].comps}`);
        console.log(`  PCBs: ${stats.rows[0].pcbs}`);
        console.log(`  BOM Mappings: ${stats.rows[0].mappings}\n`);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('\n❌ Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

importAllData();
