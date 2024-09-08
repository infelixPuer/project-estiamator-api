const request = require('supertest');
const express = require('express');
const { sign_jwt, verify_jwt } = require('./jwt');
const { Pool } = require('pg');
const { app, authenticateToken } = require('./server');

jest.mock('pg', () => {
    const mPool = { query: jest.fn() };
    return { Pool: jest.fn(() => mPool) };
});

jest.mock('./jwt', () => ({
    sign_jwt: jest.fn(),
    verify_jwt: jest.fn(),
}));

jest.mock('fs', () => ({
    readFileSync: jest.fn(() => 'mocked-key'),
}));

jest.mock('./server', () => {
    const original = jest.requireActual('./server');
    return {
	...original,
	authenticateToken: jest.fn()
    }
});

describe('API endpoints', () => {
    let pool;

    beforeEach(() => {
	pool = new Pool();
    });

    afterEach(() => {
	jest.clearAllMocks();
    });

    describe('/api/login', () => {
	it('should authenticate a user and return a token', async () => {
	    const username = 'user';
	    const password = 'password123';
	    const token = 'mocked_token';

	    pool.query.mockResolvedValueOnce({
		rows: [{ username, password }],
	    });

	    sign_jwt.mockReturnValue(token);

	    const res = await request(app)
		.post('/api/login')
		.send({ username, password });

	    expect(res.statusCode).toBe(200);
	    expect(res.body).toHaveProperty('token', token);
	});

	it('should return 400 if username or password is missing', async () => {
	    const res = await request(app)
		.post('/api/login')
		.send({ username: '' });

	    expect(res.statusCode).toBe(400);
	    expect(res.body).toHaveProperty('message', 'Username and password are required');
	});

	it('should return 404 if username is not found', async () => {
	    pool.query.mockResolvedValueOnce({ rows: [] });

	    const res = await request(app)
		.post('/api/login')
		.send({ username: 'nonexistent', password: 'password123' });

	    expect(res.statusCode).toBe(404);
	    expect(res.body).toHaveProperty('message', 'Username was not found!');
	});

	it('should return 401 if the password is incorrect', async () => {
	    pool.query.mockResolvedValueOnce({
		rows: [{ username: 'testuser', password: 'wrongpassword' }],
	    });

	    const res = await request(app)
		.post('/api/login')
		.send({ username: 'testuser', password: 'password123' });

	    expect(res.statusCode).toBe(401);
	    expect(res.body).toHaveProperty('message', 'Invalid password');
	});

	it('should return 500 on server error', async () => {
	    pool.query.mockRejectedValueOnce(new Error('Database error'));

	    const res = await request(app)
		.post('/api/login')
		.send({ username: 'testuser', password: 'password123' });

	    expect(res.statusCode).toBe(500);
	    expect(res.body).toHaveProperty('message', 'Server error');
	});
    });

    describe('/api/users', () => {
	it('should get all users', async () => {
	    authenticateToken.mockReturnValue({ username: 'user' });
	    pool.query.mockResolvedValueOnce({
		rows: [
		    { username: 'user1', password: 'pass1', email: 'email1', role: 'role1' },
		    { username: 'user2', password: 'pass2', email: 'email2', role: 'role2' }
		]
	    });

	    const res = await request(app)
		.get('/api/users')
		.set('Authorization', 'Bearer token');
	    
	    expect(res.statusCode).toBe(200);
	    expect(res.body).toBeEqual([
		{ username: 'user1', password: 'pass1', email: 'email1', role: 'role1' },
		{ username: 'user2', password: 'pass2', email: 'email2', role: 'role2' }
	    ]);
	});
    });
});

