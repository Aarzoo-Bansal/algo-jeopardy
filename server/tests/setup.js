const { Pool } = require('pg');
const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

// Runs before all test cases starts
beforeAll(async () => {
    const migratorPool = new Pool({
        user: process.env.TEST_MIGRATOR_USER,
        password: process.env.TEST_MIGRATOR_PASSWORD,
        host: process.env.TEST_DB_HOST,
        port: process.env.TEST_DB_PORT,
        database: process.env.TEST_DB_NAME
    });

    // Drop table if exists
    await migratorPool.query(`
        DROP TABLE IF EXISTS questions CASCADE;
        DROP TABLE IF EXISTS categories CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
        `);

    // Running migration files to recreate tables
    const migratorDir = path.join(__dirname, '..', 'migrations');
    const files = fs.readdirSync(migratorDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

    for (const file of files) {
        const sql = fs.readFileSync(path.join(migratorDir, file), 'utf8');
        await migratorPool.query(sql);
    }

    migratorPool.end();
});

// Runs before each individual test
beforeEach(async () => {
    await pool.query(`
        TRUNCATE TABLE questions, categories, users
        CASCADE
        `);
});

// Run once after all tests finish
afterAll(async () => {
    await pool.end();
});