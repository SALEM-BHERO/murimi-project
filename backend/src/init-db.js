const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for some hosted PG providers like Render/ElephantSQL
    }
});

async function init() {
    console.log('🚀 Starting Database Initialization...');

    try {
        // 1. Read Schema
        const schemaPath = path.join(__dirname, '../../db/schema.sql');
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Schema file not found at ${schemaPath}`);
        }

        const schema = fs.readFileSync(schemaPath, 'utf8');
        console.log('📖 Reading schema.sql...');

        // 2. Execute Schema
        console.log('🏗️ Creating tables...');
        await pool.query(schema);
        console.log('✅ Tables created successfully.');

        // 3. Run Seeding logic
        console.log('🌱 Starting seeding...');
        // We can require the seed logic if we refactor it, or just run node src/seed.js next.
        // To keep it simple, we'll just close this and tell user to run seed.

    } catch (err) {
        console.error('❌ Initialization failed:', err.message);
    } finally {
        await pool.end();
        console.log('🏁 Database initialization finished.');
    }
}

init();
