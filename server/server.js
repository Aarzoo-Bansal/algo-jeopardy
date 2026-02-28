const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import route files
const categoriesRouter = require('./routes/categories');
const questionsRouter = require('./routes/questions');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

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
    res.status(404).json({
        error: `Route ${req.method} ${req.url} not found`
    });
});

// ─── GLOBAL ERROR HANDLER ────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({
        error: 'Internal Server Error'
    });
});

// ─── START SERVER ────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});