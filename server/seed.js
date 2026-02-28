/**
 * seed.js — PostgreSQL seed script for Jeopardy
 *
 * Creates a demo user and populates their account with sample
 * categories and questions. Safe to run multiple times — checks
 * for existing demo user before inserting.
 *
 * Usage:  node seed.js
 * Requires: DATABASE_URL or individual DB_* env vars in .env
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./config/db');

// ─── Demo user credentials ──────────────────────────────────────
const DEMO_EMAIL = 'demo@jeopardy.com';
const DEMO_PASSWORD = 'demo1234';

// ─── Sample data (original question bank) ───────────────────────
const CATEGORIES = [
  {
    name: 'Memory Lane',
    questions: [
      { difficulty: 100, question: 'What is the time complexity of finding the maximum element in an unsorted array?', answer: 'O(n)', time_limit: 30 },
      { difficulty: 200, question: 'What is the best-case time complexity of binary search? In which scenario?', answer: 'O(1) — when the first mid is the required element.', time_limit: 30 },
      { difficulty: 300, question: 'What is the time complexity of accessing the kth element in a singly linked list?', answer: 'O(k) or O(n)', time_limit: 45 },
      { difficulty: 400, question: 'Arrange in ascending order: nlogn, n!, log log n', answer: 'log log n < n log n < n!', time_limit: 45 },
      { difficulty: 500, question: 'What is the time complexity of deleting the minimum element from a min heap?', answer: 'O(log n)\n\nRemove root O(1), replace with last O(1), heapify down O(log n)', time_limit: 60 },
    ],
  },
  {
    name: 'Building Blocks',
    questions: [
      { difficulty: 100, question: 'Name two data structures that access an element with O(1) complexity.', answer: 'Arrays and HashMap', time_limit: 30 },
      { difficulty: 200, question: 'What data structure can be used to represent a graph?', answer: 'Adjacency List, Adjacency Matrix, Edge List', time_limit: 30 },
      { difficulty: 300, question: 'What abstract data structure supports insert with priority and remove highest/lowest priority?', answer: 'Priority Queue (or Heap)', time_limit: 45 },
      { difficulty: 400, question: 'When two keys produce the same hash value, what is it called, and which technique handles it?', answer: 'Collision; Chaining or Open Addressing', time_limit: 45 },
      { difficulty: 500, question: 'What data structure allows efficient implementation of both LIFO and FIFO operations?', answer: 'Deque (Double-ended Queue)', time_limit: 60 },
    ],
  },
  {
    name: 'Hunt & Find',
    questions: [
      { difficulty: 100, question: 'What is the prerequisite condition for binary search to work on an array?', answer: 'Array must be sorted', time_limit: 30 },
      { difficulty: 200, question: 'What is the time complexity of searching for an element in a sorted linked list?', answer: 'O(n)', time_limit: 30 },
      { difficulty: 300, question: 'In a Binary Search Tree, which traversal visits nodes in sorted order?', answer: 'In-order Traversal', time_limit: 45 },
      { difficulty: 400, question: 'In DFS on a graph, what structure tracks nodes to visit next (non-recursive)?', answer: 'Stack', time_limit: 45 },
      { difficulty: 500, question: 'When using binary search to find the first occurrence of a duplicate, what adjustment after finding target?', answer: 'Continue searching in the left subarray', time_limit: 60 },
    ],
  },
  {
    name: 'Algorithms Showdown',
    questions: [
      { difficulty: 100, question: 'For finding duplicates in an array, which is more space-efficient: sorting or hash set?', answer: 'Sorting', time_limit: 30 },
      { difficulty: 200, question: 'For checking if two strings are anagrams, which is faster: sorting both or frequency map?', answer: 'Frequency map — O(n) vs O(n log n)', time_limit: 30 },
      { difficulty: 300, question: 'For checking if a number is prime, checking up to n or up to sqrt(n)? Why?', answer: 'Up to sqrt(n). If no divisor found till sqrt(n), none exists after.', time_limit: 45 },
      { difficulty: 400, question: 'Shortest path in a weighted graph with negative edges: Dijkstra or Bellman-Ford?', answer: 'Bellman-Ford', time_limit: 45 },
      { difficulty: 500, question: 'Sorting millions of employee records by age (18-65) in O(n)?', answer: 'Counting Sort — count array O(k), count occurrences O(n), place sorted O(n)', time_limit: 60 },
    ],
  },
  {
    name: 'Bit Magic',
    questions: [
      { difficulty: 100, question: 'What bitwise operation returns 1 only when both bits are 1?', answer: 'AND', time_limit: 30 },
      { difficulty: 200, question: 'What is the result of n XOR n?', answer: '0', time_limit: 30 },
      { difficulty: 300, question: 'Difference between & (bitwise AND) and && (logical AND)?', answer: '& operates on each bit, && operates on booleans with short-circuit evaluation', time_limit: 45 },
      { difficulty: 400, question: 'What is the output of (5 & 4)?', answer: '4 — binary: 101 & 100 = 100 = 4', time_limit: 45 },
      { difficulty: 500, question: 'Why is n & (n-1) used to check if a number is a power of 2?', answer: 'Power of 2 has one bit set. n-1 flips that bit and all lower. AND gives 0.', time_limit: 60 },
    ],
  },
  {
    name: 'Branch & Connect',
    questions: [
      { difficulty: 100, question: 'What is a graph with direction on its edges called?', answer: 'Directed Graph (Digraph)', time_limit: 30 },
      { difficulty: 200, question: 'What is an Eulerian path in a graph?', answer: 'A path that visits every edge exactly once', time_limit: 30 },
      { difficulty: 300, question: 'Max edges in a complete undirected graph with n vertices?', answer: 'n * (n - 1) / 2', time_limit: 45 },
      { difficulty: 400, question: 'In a BST, which node has no left child?', answer: 'The minimum value node (leftmost)', time_limit: 45 },
      { difficulty: 500, question: 'How many edges will a tree of n vertices have?', answer: 'n - 1', time_limit: 60 },
    ],
  },
];

// ─── Seed logic ─────────────────────────────────────────────────
async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create or find the demo user
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

    const userResult = await client.query(
      `INSERT INTO users (email, password)
       VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
       RETURNING id`,
      [DEMO_EMAIL, hashedPassword]
    );

    const userId = userResult.rows[0].id;
    console.log(`✓ Demo user ready (id: ${userId}, email: ${DEMO_EMAIL})`);

    // Clear existing data for this user (fresh seed every run)
    await client.query(
      'DELETE FROM categories WHERE user_id = $1',
      [userId]
    );
    console.log('✓ Cleared existing categories and questions (CASCADE)');

    // Insert categories and questions
    let totalQuestions = 0;

    for (const cat of CATEGORIES) {
      const catResult = await client.query(
        `INSERT INTO categories (name, user_id)
        VALUES ($1, $2)
        RETURNING id`,
        [cat.name, userId]
      );

      const categoryId = catResult.rows[0].id;

      // inserting all the questions of that particular category
      for (const q of cat.questions) {
        await client.query(
          `INSERT INTO questions (category_id, question, answer, difficulty, time_limit, user_id)
          VALUES ($1, $2, $3, $4, $5, $6)`,
          [categoryId, q.question, q.answer, q.difficulty, q.time_limit, userId]
        );
        totalQuestions++;
      }

      console.log(`  ✓ ${cat.name}: ${cat.questions.length} questions`);
    }
    await client.query('COMMIT');

    console.log('─'.repeat(45));
    console.log(`✓ Seed complete: ${CATEGORIES.length} categories, ${totalQuestions} questions`);
    console.log(`  Login with: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('✗ Seed failed, rolled back:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(() => process.exit(1));