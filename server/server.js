/* server.js - Express API for Algo Jeopardy */
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Allow cross-origin requests from Frontend
app.use(express.json()); // Parse JSON request bodies
app.use(express.static(path.join(__dirname, 'public'))); // Servers admin panel

// ─── READ ENDPOINTS (used by the game frontend) ─────────────────

// GET /api/categories - Returns all categories sorted by display_order
app.get('/api/categories', (req, res) => {
    const categories = db.getCategories();
    res.json(categories);
});

// GET /api/questions - Returns all questions with category name joined
app.get('/api/questions', (req, res) => {
    const questions = db.getQuestions();
    res.json(questions);
});


// ─── ADMIN: CATEGORY ENDPOINTS ──────────────────────────────────

// POST /api/categories - Create a new category
app.post('/api/categories', (req, res) => {
    const { name } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({
            error : 'Category name is required'
        });
    }

    try {
        const result = db.createCategory(name.trim())
        res.status(201).json({
            id: result.lastInsertRowid,
            name: name.trim()
        });
    } catch (err) {
        if (err.message.includes('UNIQUE')) {
            return res.status(409).json({
                error: 'Category already exists.'
            });
        }
        res.status(500).json({
            error: err.message
        });
    }
});

// PUT /api/categories/:id - Update a Category
app.put('/api/categories/:id', (req, res) => {
    const { name } = req.body;
    
    if (!name || !name.trim()) {
        return res.status(400).json({
            error: 'Name is required'
        });
    }

    const result = db.updateCategory(req.params.id, name.trim());

    if (result.changes === 0) {
        return res.status(404).json({
            error: 'Category not found.'
        });
    }

    res.json({ success: true });
});

// DELETE /api/categories/:id - Delete a Category
app.delete('/api/categories/:id', (req, res) => {

    const result = db.deleteCategory(req.params.id);

    if (result.changes === 0) {
        return res.status(404).json({
            error: 'Category not found.'
        });
    }

    res.json({
        success: true,
        message: 'Category and its questions are deleted'
    });
});

// ─── ADMIN: QUESTION ENDPOINTS ──────────────────────────────────

// POST /api/questions - Create a new question
app.post('/api/questions', (req, res) => {
    const { category_id, difficulty, question, answer, time_limit } = req.body;

    if (!category_id || !difficulty || !question || !answer) {
        return res.status(400).json({
            error : 'category_id, difficulty, question, and answer are required'
        });
    }

    if (![100, 200, 300, 400, 500].includes(difficulty)) {
        return res.status(400).json({
            error: 'Difficulty must be 100, 200, 300, 400, or 500'
        });
    }

    // Check if the Category exists
    const is_category_present = db.getCategory(category_id);

    if (!is_category_present) {
        return res.status(404).json({
            error: 'Category not found.'
        })
    }

    // Calling DB function to create questions
    const result = db.createQuestions(category_id, difficulty, question, answer, time_limit || 30);

    res.status(201).json({
        id: result.lastInsertRowid
    });
});

// PUT /api/questions/:id - Update a Question
app.put('/api/questions/:id', (req, res) => {
    const { category_id, difficulty, question, answer, time_limit } = req.body;
    const { id } = req.params;

    const fields = {};

    if (category_id !== undefined) {
        fields.category_id = category_id;
    }

    if (difficulty !== undefined) {
        fields.difficulty = difficulty;
    }

    if (question !== undefined) {
        fields.question = question;
    }

    if (answer !== undefined) {
        fields.answer = answer;
    }

    if (time_limit !== undefined) {
        fields.time_limit = time_limit;
    }

    if (Object.keys(fields).length === 0) {
        return res.status(400).json({
            error: 'Nothing to update.'
        });
    }

    const result = db.updateQuestion(req.params.id, fields);

    if (result.changes === 0) return res.status(404).json({
        error: 'Question not found.'
    })

    res.json({ success: true });
})

// DELETE /api/questions/:id - Delete a Question
app.delete('/api/questions/:id', (req, res) => {
    const result = db.deleteQuestion(req.params.id);

    if (result.changes === 0) {
        return res.status(404).json({
            error: 'Question not found.'
        });
    }

    res.json({success: true})
})

// ─── START SERVER ────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
})