// app.js — exports the Express app

const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET is not set. Exiting.');
    process.exit(1);
}

const isTest = process.env.NODE_ENV === 'test';

const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests. Please try again later'}
});

// Import route files
const categoriesRouter = require('./routes/categories');
const questionsRouter = require('./routes/questions');
const authRouter = require('./routes/auth');

const app = express();

// ─── MIDDLEWARE ──────────────────────────────────────────────────
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};
app.use(cors(corsOptions)); // Allow cross-origin requests from Frontend
app.use(express.json()); // Parse JSON request bodies
app.use(express.static(path.join(__dirname, 'public'))); // Servers admin panel

// ─── ROUTES ─────────────────────────────────────────────────────
if (!isTest) {
    app.use('/api/categories', apiLimiter);
    app.use('/api/questions', apiLimiter);
}

app.use('/api/categories', categoriesRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/auth', authRouter);

// ─── HEALTH CHECK ────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timeStamp: new Date()
    });
});

// ─── 404 HANDLER ────────────────────────────────────────────────
app.use((req, res) => {
    console.error(`Route ${req.method} ${req.url} not found`);
    res.status(404).json({
        error: `Route not found`
    });
});

// ─── GLOBAL ERROR HANDLER ────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({
        error: 'Internal Server Error'
    });
});

module.exports = app;