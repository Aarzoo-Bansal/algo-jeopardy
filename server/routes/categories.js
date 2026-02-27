const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const verifyToken = require('../middleware/auth');

// GET /api/categories - Public, returns all categories for the logged in user
router.get('/', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name FROM categories WHERE user_id = $1 ORDER BY name ASC',
            [req.user.userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// POST /api/categories - Create a new category
router.post('/', verifyToken, async (req, res) => {
    const { name } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({
            error: 'Category name is required.'
        });
    }

    try {
        const result = await pool.query(
            'INSERT INTO categories (name, user_id) VALUES ($1, $2) RETURNING id, name',
            [name.trim(), req.user.userId]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({
                error: 'Category already exists'
            })
        }

        res.status(500).json({
            error: err.message
        });
    }
});

// PUT /api/categories/:id - Update a category
router.put('/:id', verifyToken, async (req, res) => {
    const { name } = req.body;
    const { id } = req.params;

    if (!name || !name.trim()) {
        return res.status(400).json({
            error: 'Name is required.'
        });
    }

    try {
        const result = await pool.query(
            'UPDATE categories SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING id, name',
            [name.trim(), id, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({
                error: 'Not authorized'
            });
        }

        return res.json(result.rows[0]);
    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
});

// DELETE /api/categories/:id - Delete a category
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({
                error: 'Not authorized'
            });
        }

        res.status(204).send();
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

module.exports = router;