/* Run this Script to populate the database with Default Questions */

const { db } = require('./db');

// Clear existing data
db.exec('DELETE FROM questions');
db.exec('DELETE FROM categories');

const categories = [
    "Memory Lane",
    "Building Blocks",
    "Hunt & Find",
    "Algorithms Showdown",
    "Bit Magic",
    "Branch & Connect"
];

// Insert categories
const insertCategory = db.prepare(
    'INSERT INTO categories (name) VALUES (?)'
);

const categoryIds = {};
categories.forEach((name, index) => {
    const result = insertCategory.run(name);
    categoryIds[name] = result.lastInsertRowid;
});

// Insert Questions
const insertQuestion = db.prepare(
    'INSERT INTO questions (category_id, difficulty, question, answer, time_limit) VALUES (?, ?, ?, ?, ?)'
);

const questions = {
  'Memory Lane': [
    [100, 'What is the time complexity of finding the maximum element in an unsorted array?', 'O(n)', 30],
    [200, 'What is the best-case time complexity of binary search? In which scenario?', 'O(1) — when the first mid is the required element.', 30],
    [300, 'What is the time complexity of accessing the kth element in a singly linked list?', 'O(k) or O(n)', 45],
    [400, 'Arrange in ascending order: nlogn, n!, log log n', 'log log n < n log n < n!', 45],
    [500, 'What is the time complexity of deleting the minimum element from a min heap?', 'O(log n)\n\nRemove root O(1), replace with last O(1), heapify down O(log n)', 60],
  ],
  'Building Blocks': [
    [100, 'Name two data structures that access an element with O(1) complexity.', 'Arrays and HashMap', 30],
    [200, 'What data structure can be used to represent a graph?', 'Adjacency List, Adjacency Matrix, Edge List', 30],
    [300, 'What abstract data structure supports insert with priority and remove highest/lowest priority?', 'Priority Queue (or Heap)', 45],
    [400, 'When two keys produce the same hash value, what is it called, and which technique handles it?', 'Collision; Chaining or Open Addressing', 45],
    [500, 'What data structure allows efficient implementation of both LIFO and FIFO operations?', 'Deque (Double-ended Queue)', 60],
  ],
  'Hunt & Find': [
    [100, 'What is the prerequisite condition for binary search to work on an array?', 'Array must be sorted', 30],
    [200, 'What is the time complexity of searching for an element in a sorted linked list?', 'O(n)', 30],
    [300, 'In a Binary Search Tree, which traversal visits nodes in sorted order?', 'In-order Traversal', 45],
    [400, 'In DFS on a graph, what structure tracks nodes to visit next (non-recursive)?', 'Stack', 45],
    [500, 'When using binary search to find the first occurrence of a duplicate, what adjustment after finding target?', 'Continue searching in the left subarray', 60],
  ],
  'Algorithms Showdown': [
    [100, 'For finding duplicates in an array, which is more space-efficient: sorting or hash set?', 'Sorting', 30],
    [200, 'For checking if two strings are anagrams, which is faster: sorting both or frequency map?', 'Frequency map — O(n) vs O(n log n)', 30],
    [300, 'For checking if a number is prime, checking up to n or up to sqrt(n)? Why?', 'Up to sqrt(n). If no divisor found till sqrt(n), none exists after.', 45],
    [400, 'Shortest path in a weighted graph with negative edges: Dijkstra or Bellman-Ford?', 'Bellman-Ford', 45],
    [500, 'Sorting millions of employee records by age (18-65) in O(n)?', 'Counting Sort — count array O(k), count occurrences O(n), place sorted O(n)', 60],
  ],
  'Bit Magic': [
    [100, 'What bitwise operation returns 1 only when both bits are 1?', 'AND', 30],
    [200, 'What is the result of n XOR n?', '0', 30],
    [300, 'Difference between & (bitwise AND) and && (logical AND)?', '& operates on each bit, && operates on booleans with short-circuit evaluation', 45],
    [400, 'What is the output of (5 & 4)?', '4 — binary: 101 & 100 = 100 = 4', 45],
    [500, 'Why is n & (n-1) used to check if a number is a power of 2?', 'Power of 2 has one bit set. n-1 flips that bit and all lower. AND gives 0.', 60],
  ],
  'Branch & Connect': [
    [100, 'What is a graph with direction on its edges called?', 'Directed Graph (Digraph)', 30],
    [200, 'What is an Eulerian path in a graph?', 'A path that visits every edge exactly once', 30],
    [300, 'Max edges in a complete undirected graph with n vertices?', 'n * (n - 1) / 2', 45],
    [400, 'In a BST, which node has no left child?', 'The minimum value node (leftmost)', 45],
    [500, 'How many edges will a tree of n vertices have?', 'n - 1', 60],
  ],
};


const seedAll = db.transaction(() => {
    for (const [categoryName, qs] of Object.entries(questions)) {
        const catId = categoryIds[categoryName];

        for (const [difficulty, question, answer, time_limit] of qs) {
            insertQuestion.run(catId, difficulty, question, answer, time_limit);
        }
    }
});

seedAll();

const catCount = db.prepare('SELECT COUNT(*) AS count FROM categories').get().count;
const qCount = db.prepare('SELECT COUNT(*) AS count FROM questions').get().count;
console.log(`Seeded ${catCount} categories and ${qCount} questions.`);
