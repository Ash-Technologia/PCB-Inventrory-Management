const { getClient } = require('./config/database');

async function checkDb() {
    try {
        console.log('Testing database connection...');
        const client = await getClient();
        console.log('✅ Database connected successfully!');
        const res = await client.query('SELECT NOW()');
        console.log('Database time:', res.rows[0].now);
        client.release();
        process.exit(0);
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    }
}

checkDb();
