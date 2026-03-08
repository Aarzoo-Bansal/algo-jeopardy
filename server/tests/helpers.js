const supertest = require('supertest');
const app = require('../app');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const request = supertest(app);

/**
 * Creates a user directly in DB
 * Use when we need an existing user
 */
async function createTestUser (overrides = {}) {
    const defaults = {
        email: 'test@example.com',
        password: 'Password123!'
    };

    const data = { ...defaults, ...overrides };
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const result = await pool.query(
        `INSERT INTO users (email, password)
        VALUES ($1, $2)
        RETURNING id, email`,
        [data.email, hashedPassword]
    );

    return {
        ...result.rows[0],
        plainPassword: data.password
    };
}

/**
 * Creates a user and returns a valid JWT.
 * Use for any test that needs to hit a protected endpoint.
 */
async function getAuthToken(userOverrides = {}) {
    const user = await createTestUser(userOverrides);
    const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h'}
    );

    return { user, token };
}

/**
 * Creates a category owned by a specific user.
 * Use when testing questions (which require a category to exist)
 */
async function createTestCategory (userId, overrides = {}) {
    const defaults = { name: 'Science' };
    const data = { ...defaults, ...overrides};

    const result = await pool.query(
        `INSERT INTO categories (name, user_id)
        VALUES ($1, $2)
        RETURNING *`,
        [data.name, userId]
    );
    return result.rows[0];
}

/**
 * Creates a question under a specific category.
 */
async function createTestQuestion (categoryId, userId, overrides = {}) {
    const defaults = {
        difficulty : 200,
        question : 'What is the speed of light?',
        answer : '299,792,458 m/s',
        time_limit : 30
    };

    const data = { ...defaults, ...overrides};

    const result = await pool.query(
        `INSERT INTO questions (category_id, user_id, difficulty, question, answer, time_limit)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [categoryId, userId, data.difficulty, data.question, data.answer, data.time_limit]
    );
    return result.rows[0];
}

module.exports = {
    request,
    pool,
    createTestUser,
    getAuthToken,
    createTestCategory,
    createTestQuestion
};