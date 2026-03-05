const { Pool } = require('pg');
require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';

let pool;

if (isTest) {
    pool = new Pool({
        user: process.env.TEST_DB_USER,
        password: process.env.TEST_DB_PASSWORD,
        host: process.env.TEST_DB_HOST,
        port: process.env.TEST_DB_PORT,
        database: process.env.TEST_DB_NAME
    })

} else if (process.env.DATABASE_URL) {
    pool = new Pool ({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    })
} else {
    pool = new Pool({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME
        });
}

// Testing connection if not a test environment
if (!isTest) {
    pool.query('SELECT NOW()', (err, res) => {
        if (err) {
            console.error('Database connection failed:', err.message)
        } else {
            console.log('Database connected at:', res.rows[0].now);
        }
    });
}

module.exports = pool;