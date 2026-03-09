const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

console.log('Testing connection to:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function test() {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('✅ Connection successful:', res.rows[0]);
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    }
}

test();
