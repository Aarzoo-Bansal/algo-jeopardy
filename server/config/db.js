const { Pool } = require('pg');
require('dotenv').config();

const pool = process.env.DATABASE_URL
? new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false},
})
: new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

// Testing the connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection failed:', err.message)
    } else {
        console.log('Database connected at:', res.rows[0].now);
    }
});

module.exports = pool;