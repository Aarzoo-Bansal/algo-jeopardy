const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const rateLimit = require('express-rate-limit');
const SALTROUNDS = 10;

const isTest = process.env.NODE_ENV === 'test';
const noOp = (req, res, next) => next();

const baseConfig  = {
    windowMs: 15 * 60 * 1000,
    message: { error: 'Too many requests. Please try again later'}
};

const registerLimiter = isTest
    ? noOp
    : rateLimit({
        ...baseConfig,
        max: 10
    });

const loginLimiter = isTest
    ? noOp
    : rateLimit({
        ...baseConfig,
        max: 5
    });

// POST /api/auth/register - Create a new account
router.post('/register', registerLimiter, async (req, res) => {
    const { email, password } = req.body;

    // Validate Input
    if (!email || !password) {
        return res.status(400).json({
            error: 'Email and password are required'
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            error: 'Password must be atleast 8 characters long'
        });
    }

    try {
        // Check if email is already present
        const existing = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({
                error: 'Email already exists'
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, SALTROUNDS);

        // Store the details into the database
        const result = await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
            [email.toLowerCase(), hashedPassword]
        );

        const user = result.rows[0];

        // Create a JWT Token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '24h'
            }
        );

        // Send the token back to frontend
        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email
            }
        });
    } catch (err) {
        console.error(err)
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
});

// POST /api/auth/login - Log into existing account
router.post('/login', loginLimiter, async (req, res) => {
    const { email, password } = req.body;

    // Validate Input
    if (!email || !password) {
        return res.status(400).json({
            error: 'Email and password are required'
        });
    }

    try {
        
        // Find user by email
        const result = await pool.query(
            'SELECT id, email, password FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        const user = result.rows[0];

        // Compare the password entered with the stored password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h'}
        );

        // Send the token back
        res.json({
            token, 
            user: {
                id: user.id,
                email: user.email
            }
        });
    } catch (err) {
        console.error(err)
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
});

module.exports = router;