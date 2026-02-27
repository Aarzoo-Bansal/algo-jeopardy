const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const verifyToken = require('../middleware/auth');

// GET /api/categories - Return all categories for the logged in user
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name FROM categories ORDER BY name ASC'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// POST /api/categories - Create a new category
router.post('/', async (req, res) => {
    const { name } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({
            error: 'Category name is required.'
        });
    }

    try {
        const result = await pool.query(
            'INSERT INTO categories (name) VALUES ($1) RETURNING id, name',
            [name.trim()]
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
router.put('/:id', async (req, res) => {
    const { name } = req.body;
    const { id } = req.params;

    if (!name || !name.trim()) {
        return res.status(400).json({
            error: 'Name is required.'
        });
    }

    try {
        const result = await pool.query(
            'UPDATE categories SET name = $1 WHERE id = $2 RETURNING id, name',
            [name.trim(), id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Category not found'
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
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM categories WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Category not found'
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