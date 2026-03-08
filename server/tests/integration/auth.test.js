const { request, pool, createTestUser } = require('../helpers');

describe('POST /api/auth/register', () => {
    it('creates a new user and returns a token', async () => {
        const res = await request
            .post('/api/auth/register')
            .send({
                email: 'new@example.com',
                password: 'SecurePass123!'
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('token');

        // Verify password is Not in the response
        expect(res.body).not.toHaveProperty('password');

        // Verify user actually exists in the database
        const dbCheck = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            ['new@example.com']
        );
        expect(dbCheck.rows).toHaveLength(1);
    });

    it('rejects duplicate email', async () => {
        await createTestUser({ email: 'taken@example.com' });

        const res = await request
            .post('/api/auth/register')
            .send({
                email: 'taken@example.com',
                password: 'SecurePass123!'
            });

        expect(res.status).toBe(409);
    });

    it('rejects missing email', async () => {
        const res = await request
            .post('/api/auth/register')
            .send({
                password: 'SecurePass123!'
            });

        expect(res.status).toBe(400);
    });

    it('rejects missing password', async () => {
        const res = await request
            .post('/api/auth/register')
            .send({
                email: 'taken@example.com',
            });

        expect(res.status).toBe(400);
    });

    it('rejects empty password', async () => {
        const res = await request
            .post('/api/auth/register')
            .send({
                email: 'test@example.com',
                password: ''
            });
        expect(res.status).toBe(400);
    });

    it('rejects password of length less than 8', async () => {
        const res = await request
            .post('/api/auth/register')
            .send({
                email: 'taken@example.com',
                password: 'hello'
            });

        expect(res.status).toBe(400);
    });
});

describe('POST /api/auth/login', () => {
    it('returns a token for valid credentials', async () => {
        await createTestUser({
            email: 'login@example.com',
            password: 'MyPassword1!'
        });

        const res = await request
            .post('/api/auth/login')
            .send({
                email: 'login@example.com',
                password: 'MyPassword1!'
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    it('rejects wrong password', async () => {
        await createTestUser({
            email: 'login@example.com',
            password: 'MyPassword1!'
        });

        const res = await request
            .post('/api/auth/login')
            .send({
                email: 'login@example.com',
                password: 'Hello!233'
            });

        expect(res.status).toBe(401);
    });

    it('rejects non-existent user', async () => {
        const res = await request
            .post('/api/auth/login')
            .send({
                email: 'nobody@example.com',
                password: 'Helllo@123'
            });

        expect(res.status).toBe(401);
    });
});