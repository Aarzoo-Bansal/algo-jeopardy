
// Database Connection and Schema Setup
const Database = require('better-sqlite3');
const path = require('path');

// Creates (or opens) a file called jeopardy.db in the project root
const db = new Database(path.join(__dirname, 'jeopardy.db'));

// Enable WAL mode for better concurrent READ and WRITE performance
db.pragma('journal_mode = WAL')

// Create table if they do not exist
db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        category_id INTEGER NOT NULL, 
        difficulty INTEGER NOT NULL CHECK (difficulty IN (100, 200, 300, 400, 500)), 
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        time_limit INTEGER DEFAULT 30,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
`);

// Query Functions
// Function returns all the categories present in the database
const getCategories = () => db.prepare(
    'SELECT id, name FROM categories'
).all();

// Function to create categories
const createCategory = (name) => db.prepare(
    'INSERT INTO categories (name) VALUES (?)'
).run(name);

// Function to update a category value
const updateCategory = (id, name) => db.prepare(
    'UPDATE categories SET name = ? WHERE id = ?'
).run(name, id);

// Function to delete a category
const deleteCategory = (id) => db.prepare(
    'DELETE FROM categories WHERE id = ?'
).run(id);

const getCategory = (id) => db.prepare(
    'SELECT id FROM categories WHERE id = ?'
).run(id);

// Function to fetch all the questions
const getQuestions = () => db.prepare(`
    SELECT q.id, q.category_id, c.name AS category_name, q.difficulty, q.question, q.answer, q.time_limit
    FROM questions q
    JOIN categories c ON q.category_id = c.id
    ORDER BY q.difficulty
`).all();

// Function to create Question for category
const createQuestions = (category_id, difficulty, question, answer, time_limit) => db.prepare(
    'INSERT INTO questions (category_id, difficulty, question, answer, time_limit) VALUES (?, ?, ?, ?, ?)'
).run(category_id, difficulty, question, answer, time_limit);

// Function to update question
const updateQuestion = (id, fields) => {
    const updates = []
    const values = []

    for (const [key, val] of Object.entries(fields)) {
        updates.push(`${key} = ?`);
        values.push(val)
    }

    values.push(id);

    return db.prepare(
        `UPDATE questions SET ${updates.join(', ')} WHERE id = ?`
    ).run(...values);
}

// Function to delete a question
const deleteQuestion = (id) => db.prepare(
    'DELETE FROM questions WHERE id = ?'
).run(id);

module.exports = {
    db, 
    getCategories, createCategory, updateCategory, deleteCategory, getCategory,
    getQuestions, createQuestions, updateQuestion, deleteQuestion
};