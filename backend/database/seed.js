const bcrypt = require('bcrypt');
const { query } = require('../config/database');

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');

        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await query(
            'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
            ['admin', 'admin@electrolyte.com', hashedPassword, 'ADMIN']
        );
        console.log('✅ Admin user created (email: admin@electrolyte.com, password: admin123)');

        // Seed components
        const components = [
            { name: 'Resistor 10kΩ', part: 'R-10K-001', stock: 5000, monthly: 10000, category: 'Resistors', supplier: 'Component Supplier A', price: 0.05 },
            { name: 'Capacitor 10μF', part: 'C-10UF-001', stock: 3000, monthly: 8000, category: 'Capacitors', supplier: 'Component Supplier B', price: 0.15 },
            { name: 'Capacitor 100μF', part: 'C-100UF-001', stock: 1500, monthly: 5000, category: 'Capacitors', supplier: 'Component Supplier B', price: 0.25 },
            { name: 'LED Red 5mm', part: 'LED-RED-5MM', stock: 2000, monthly: 6000, category: 'LEDs', supplier: 'Component Supplier C', price: 0.10 },
            { name: 'IC ATmega328P', part: 'IC-ATMEGA328P', stock: 500, monthly: 2000, category: 'ICs', supplier: 'Component Supplier D', price: 2.50 },
            { name: 'Transistor BC547', part: 'TR-BC547', stock: 4000, monthly: 12000, category: 'Transistors', supplier: 'Component Supplier A', price: 0.08 },
            { name: 'Diode 1N4007', part: 'D-1N4007', stock: 3500, monthly: 9000, category: 'Diodes', supplier: 'Component Supplier A', price: 0.06 },
            { name: 'Crystal 16MHz', part: 'XTAL-16MHZ', stock: 800, monthly: 2500, category: 'Crystals', supplier: 'Component Supplier E', price: 0.50 },
            { name: 'Resistor 1kΩ', part: 'R-1K-001', stock: 6000, monthly: 15000, category: 'Resistors', supplier: 'Component Supplier A', price: 0.05 },
            { name: 'Capacitor 22pF', part: 'C-22PF-001', stock: 2500, monthly: 7000, category: 'Capacitors', supplier: 'Component Supplier B', price: 0.12 },
            { name: 'Voltage Regulator 7805', part: 'VR-7805', stock: 1000, monthly: 3000, category: 'Voltage Regulators', supplier: 'Component Supplier F', price: 0.35 },
            { name: 'Push Button Switch', part: 'SW-PUSH-001', stock: 1800, monthly: 5000, category: 'Switches', supplier: 'Component Supplier G', price: 0.20 },
        ];

        for (const comp of components) {
            await query(
                'INSERT INTO components (component_name, part_number, current_stock, monthly_required_quantity, category, supplier, unit_price) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (part_number) DO NOTHING',
                [comp.name, comp.part, comp.stock, comp.monthly, comp.category, comp.supplier, comp.price]
            );
        }
        console.log(`✅ Seeded ${components.length} components`);

        // Seed PCBs
        const pcbs = [
            { name: 'Arduino Uno Clone', code: 'PCB-ARDUINO-UNO', desc: 'ATmega328P based development board' },
            { name: 'LED Blinker Circuit', code: 'PCB-LED-BLINK', desc: 'Simple LED blinking circuit with timer' },
            { name: 'Power Supply Module', code: 'PCB-PSU-5V', desc: '5V regulated power supply module' },
        ];

        for (const pcb of pcbs) {
            await query(
                'INSERT INTO pcbs (pcb_name, pcb_code, description) VALUES ($1, $2, $3) ON CONFLICT (pcb_code) DO NOTHING',
                [pcb.name, pcb.code, pcb.desc]
            );
        }
        console.log(`✅ Seeded ${pcbs.length} PCBs`);

        // Seed PCB-Component mappings (Bill of Materials)
        const pcbResult = await query('SELECT id, pcb_code FROM pcbs');
        const componentResult = await query('SELECT id, part_number FROM components');

        const pcbMap = {};
        pcbResult.rows.forEach(row => pcbMap[row.pcb_code] = row.id);

        const compMap = {};
        componentResult.rows.forEach(row => compMap[row.part_number] = row.id);

        // Arduino Uno BOM
        const arduinoBOM = [
            { part: 'IC-ATMEGA328P', qty: 1 },
            { part: 'XTAL-16MHZ', qty: 1 },
            { part: 'C-22PF-001', qty: 2 },
            { part: 'R-10K-001', qty: 3 },
            { part: 'LED-RED-5MM', qty: 2 },
            { part: 'R-1K-001', qty: 2 },
            { part: 'VR-7805', qty: 1 },
            { part: 'C-100UF-001', qty: 2 },
        ];

        for (const item of arduinoBOM) {
            if (pcbMap['PCB-ARDUINO-UNO'] && compMap[item.part]) {
                await query(
                    'INSERT INTO pcb_components (pcb_id, component_id, quantity_per_pcb) VALUES ($1, $2, $3) ON CONFLICT (pcb_id, component_id) DO NOTHING',
                    [pcbMap['PCB-ARDUINO-UNO'], compMap[item.part], item.qty]
                );
            }
        }

        // LED Blinker BOM
        const ledBOM = [
            { part: 'LED-RED-5MM', qty: 5 },
            { part: 'R-1K-001', qty: 5 },
            { part: 'TR-BC547', qty: 2 },
            { part: 'C-10UF-001', qty: 2 },
            { part: 'R-10K-001', qty: 2 },
        ];

        for (const item of ledBOM) {
            if (pcbMap['PCB-LED-BLINK'] && compMap[item.part]) {
                await query(
                    'INSERT INTO pcb_components (pcb_id, component_id, quantity_per_pcb) VALUES ($1, $2, $3) ON CONFLICT (pcb_id, component_id) DO NOTHING',
                    [pcbMap['PCB-LED-BLINK'], compMap[item.part], item.qty]
                );
            }
        }

        // Power Supply BOM
        const psuBOM = [
            { part: 'VR-7805', qty: 1 },
            { part: 'C-100UF-001', qty: 2 },
            { part: 'C-10UF-001', qty: 2 },
            { part: 'D-1N4007', qty: 4 },
            { part: 'LED-RED-5MM', qty: 1 },
            { part: 'R-1K-001', qty: 1 },
        ];

        for (const item of psuBOM) {
            if (pcbMap['PCB-PSU-5V'] && compMap[item.part]) {
                await query(
                    'INSERT INTO pcb_components (pcb_id, component_id, quantity_per_pcb) VALUES ($1, $2, $3) ON CONFLICT (pcb_id, component_id) DO NOTHING',
                    [pcbMap['PCB-PSU-5V'], compMap[item.part], item.qty]
                );
            }
        }

        console.log('✅ Seeded PCB-Component mappings (Bill of Materials)');
        console.log('');
        console.log('🎉 Database seeding completed successfully!');
        console.log('');
        console.log('📝 Login credentials:');
        console.log('   Email: admin@electrolyte.com');
        console.log('   Password: admin123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedDatabase();
