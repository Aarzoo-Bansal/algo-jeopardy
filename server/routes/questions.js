const pool = require('../config/db')
const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/auth');

const DIFFICULTIES = [100, 200, 300, 400, 500]

// GET /api/questions - Returns all questions with category name
router.get('/', verifyToken,  async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT q.id, q.category_id, c.name AS category_name, q.difficulty, q.question, q.answer, q.time_limit
            FROM questions q 
            JOIN categories c ON q.category_id = c.id
            WHERE q.user_id = $1
            ORDER BY q.difficulty ASC
            `, [req.user.userId]
        );

        res.json(result.rows)
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// POST /api/questions - Create a new question
router.post('/', verifyToken, async (req, res) => {
    const { category_id, difficulty, question, answer, time_limit } = req.body;

    if (!category_id || !difficulty || !question || !answer) {
        return res.status(400).json({
            error: 'category_id, difficulty, question, and answer are required'
        })
    }

    if (!DIFFICULTIES.includes(Number(difficulty))) {
        return res.status(400).json({
            error: 'Difficulty must be 100, 200, 300, 400, or 500'
        });
    }

    try {
        // Check if category exists
        const category = await pool.query(
            'SELECT id FROM categories WHERE id = $1 AND user_id = $2',
            [category_id, req.user.userId]
            );
        
        if (category.rows.length === 0) {
            return res.status(403).json({
                error: 'Not authorized'
            });
        }

        const result = await pool.query (
            `INSERT INTO questions (category_id, difficulty, question, answer, time_limit, user_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, category_id, difficulty, question, answer, time_limit`,
            [category_id, difficulty, question, answer, time_limit || 30, req.user.userId]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// PUT /api/questions/:id - Update a question
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { category_id, difficulty, question, answer, time_limit } = req.body;

    // Build only the fields that were sent
    const fields = [];
    const values = [];
    let counter = 1;

    if (category_id !== undefined) {
        fields.push(`category_id = $${counter++}`);
        values.push(category_id);
    }

    if (difficulty !== undefined) {
        fields.push(`difficulty = $${counter++}`);
        values.push(difficulty)
    }

    if (question !== undefined) {
        fields.push(`question = $${counter++}`);
        values.push(question)
    }

    if (answer !== undefined) {
        fields.push(`answer = $${counter++}`);
        values.push(answer)
    }

    if (time_limit !== undefined) {
        fields.push(`time_limit = $${counter++}`);
        values.push(time_limit);
    }

    if (fields.length === 0) {
        return res.status(400).json({
            error: 'Nothing to update'
        })
    }

    values.push(id);
    values.push(req.user.userId);

    try {
        const result = await pool.query(
        `UPDATE questions SET ${fields.join(', ')} WHERE id = $${counter} AND user_id = $${counter + 1} RETURNING id`,
        values
        );

        if (result.rows.length === 0) {
            return res.status(403).json({
                error: 'Not authorized'
            });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });    
    }
});

// DELETE /api/questions/:id - Delete a question
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE from questions WHERE id = $1 AND user_id = $2 RETURNING id',
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