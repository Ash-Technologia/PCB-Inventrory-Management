const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function runMigration() {
    try {
        console.log('🚀 Starting database migration...');

        // Read the schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Execute the schema
        await pool.query(schema);

        console.log('✅ Database migration completed successfully!');
        console.log('📊 Tables created:');
        console.log('   - users');
        console.log('   - components');
        console.log('   - pcbs');
        console.log('   - pcb_components');
        console.log('   - production_entries');
        console.log('   - consumption_history');
        console.log('   - procurement_triggers');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
