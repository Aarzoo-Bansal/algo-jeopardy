const {
    request,
    pool,
    getAuthToken,
    createTestCategory
} = require('../helpers');

describe('Categories API', () => {
    let authUser, token;

    beforeEach(async () => {
        ({ user: authUser, token } = await getAuthToken());
    });

    // ─── CREATE ──────────────────────────────────────────────────
    describe('POST /api/categories', () => {
        it('creates a category with authentication', async () => {
            const res = await request
                .post('/api/categories')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'History ' });

            expect(res.status).toBe(201);
            expect(res.body).toMatchObject({
                name: 'History',
            });
        });

        it('rejects creation without token', async () => {
            const res = await request
                .post('/api/categories')
                .send({ name: 'History' });

            expect(res.status).toBe(401);
        });

        it('rejects reation with an expired token', async () => {
            const jwt = require('jsonwebtoken');
            const expiredToken = jwt.sign(
                { userId: authUser.id },
                process.env.JWT_SECRET || 'test-secret',
                { expiresIn: '0s' }
            );

            const res = await request
                .post('/api/categories')
                .set('Authorization', `Bearer ${expiredToken}`)
                .send({ name: 'History' });

            expect(res.status).toBe(401);
        });

        it('rejects creation with missing name', async () => {
            const res = await request
                .post('/api/categories')
                .set('Authorization', `Bearer ${token}`)
                .send({});

            expect(res.status).toBe(400);
        });

        it('rejects duplicate category for the same user', async () => {
            await createTestCategory(authUser.id, { name: 'History' });

            const res = await request
                .post('/api/categories')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'History'
                });

            expect(res.status).toBe(409);
        });

        it('allows same category name for different users', async () => {
            await createTestCategory(authUser.id, { name: 'History' });

            // User B creates a same category
            const { token: otherToken } = await getAuthToken({
                email: 'other@example.com'
            });

            const res = await request
                .post('/api/categories')
                .set('Authorization', `Bearer ${otherToken}`)
                .send({
                    name: 'History'
                });

            expect(res.status).toBe(201);
        });
    });

    // ─── READ ──────────────────────────────────────────────────
    describe('GET /api/categories', () => {
        it('returns all categories for the authenticated user', async () => {
            await createTestCategory(authUser.id, { name: 'Science' });
            await createTestCategory(authUser.id, { name: 'History' });

            const res = await request
                .get('/api/categories')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);

            // Verify if the returned categories match 
            const names = res.body.map(c => c.name).sort();
            expect(names).toEqual(['History', 'Science']);
        });

        it('does not return categories owned by other users (multi-tenancy', async () => {
            await createTestCategory(authUser.id, { name: 'My Category' });

            // Create another user with their own category
            const { user: otherUser } = await getAuthToken({
                email: 'other@example.com',
            });
            await createTestCategory(otherUser.id, { name: 'Their Category' });

            const res = await request
                .get('/api/categories')
                .set('Authorization', `Bearer ${token}`);

            expect(res.body).toHaveLength(1);
            expect(res.body[0].name).toBe('My Category');
        });

        it('returns empty array when user has no categories', async () => {
            const res = await request
                .get('/api/categories')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        });
    });

    // ─── UPDATE ──────────────────────────────────────────────────
    describe('PUT /api/categories/:id', () => {
        it('updates own category', async () => {
            const category = await createTestCategory(authUser.id, {
                name: 'Old name'
            });

            const res = await request
                .put(`/api/categories/${category.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'New Name' });
            
            expect(res.status).toBe(200);
            expect(res.body.name).toBe('New Name');
        });

        it('returns 404 for another user\'s category (hides existence)', async () => {
            const { user: other } = await getAuthToken({
                email: 'other@example.com'
            });

            const theirCategory = await createTestCategory(other.id, {
                name: 'Not yours'
            });

            const res = await request
                .put(`/api/categories/${theirCategory.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Hacked' });
            
            expect(res.status).toBe(404);
        });

        it('returns 404 for non-existent category', async () => {
            const res = await request
                .put('/api/categories/99999')
                .set('Authorization', `Bearer ${token}`)
                .send( { name: 'Ghost'});
            
            expect(res.status).toBe(404);
        });
    });

    // ─── DELETE ──────────────────────────────────────────────────
    describe('DELETE /api/categories/:id', () => {
        it('deletes own category', async () => {
            const category = await createTestCategory(authUser.id);

            const res = await request
                .delete(`/api/categories/${category.id}`)
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.status).toBe(204);

            // Verify that the category is not present in the database
            const dbCheck = await pool.query(
                'SELECT * FROM categories WHERE id = $1',
                [category.id]
            );
            expect(dbCheck.rows).toHaveLength(0);
        });

        it('cascade delete questions where category is deleted', async () => {
            const category = await createTestCategory(authUser.id);

            const { createTestQuestion } = require('../helpers');
            await createTestQuestion(category.id, authUser.id);

            await request
                .delete(`/api/categories/${category.id}`)
                .set('Authorization', `Bearer ${token}`);

            const remainingQuestions = await pool.query(
                'SELECT * FROM questions WHERE category_id = $1',
                [category.id]
            );

            expect(remainingQuestions.rows).toHaveLength(0);
        });

        it('returns 404 for another user\'s category', async () => {
            const { user:other } = await getAuthToken({
                email: 'other@example.com'
            });

            const theirCategory = await createTestCategory(other.id);

            const res = await request
                .delete(`/api/categories/${theirCategory.id}`)
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.status).toBe(404);
        });
    });
});