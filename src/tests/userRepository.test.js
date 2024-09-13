const db = require('../db/postgres');
const UserRepository = require('../repositories/userRepository');
const User = require('../models/user');

jest.mock('../db/postgres');

describe('UserRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return a list of users', async () => {
            const mockRows = [
                { user_id: 1, username: 'Alice', email: 'alice@example.com', role: 'admin' },
                { user_id: 2, username: 'Bob', email: 'bob@example.com', role: 'user' }
            ];
            db.query.mockResolvedValue({ rows: mockRows });

            const users = await UserRepository.findAll();

            expect(users).toEqual(mockRows.map(row => new User(row.user_id, row.username, row.email, row.role)));
        });

        it('should handle database query errors', async () => {
            db.query.mockRejectedValueOnce(new Error('Database error'));

            await expect(UserRepository.findAll()).rejects.toThrow('Database error');
        });
    });

    describe('findById', () => {
        it('should return a user if found', async () => {
            const mockRow = { user_id: 1, username: 'Alice', email: 'alice@example.com', role: 'admin' };
            db.query.mockResolvedValue({ rows: [mockRow] });

            const user = await UserRepository.findById(1);

            expect(user).toEqual(new User(mockRow.user_id, mockRow.username, mockRow.email, mockRow.role));
        });

        it('should return null if user is not found', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const user = await UserRepository.findById(999);

            expect(user).toBeNull();
        });

        it('should handle database query errors', async () => {
            db.query.mockRejectedValueOnce(new Error('Database error'));

            await expect(UserRepository.findById(1)).rejects.toThrow('Database error');
        });
    });

    describe('create', () => {
        it('should create a user and return it', async () => {
            const mockRow = { user_id: 1, username: 'Alice', email: 'alice@example.com', role: 'admin' };
            db.query.mockResolvedValue({ rows: [mockRow] });

            const user = await UserRepository.create('Alice', 'alice@example.com', 'admin');

            expect(user).toEqual(new User(mockRow.user_id, mockRow.username, mockRow.email, mockRow.role));
        });

        it('should handle database query errors', async () => {
            db.query.mockRejectedValueOnce(new Error('Database error'));

            await expect(UserRepository.create('Alice', 'alice@example.com', 'admin')).rejects.toThrow('Database error');
        });
    });

    describe('update', () => {
        it('should update a user and return the updated user if user is found', async () => {
            const mockRow = { user_id: 1, username: 'Alice', email: 'alice@example.com', role: 'admin' };
            db.query.mockResolvedValue({ rows: [mockRow] });

            const user = await UserRepository.update(1, 'Alice', 'alice@example.com', 'admin');

            expect(user).toEqual(new User(mockRow.user_id, mockRow.username, mockRow.email, mockRow.role));
        });

        it('should return null if user is not found', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const user = await UserRepository.update(999, 'Alice', 'alice@example.com', 'admin');

            expect(user).toBeNull();
        });

        it('should handle database query errors', async () => {
            db.query.mockRejectedValueOnce(new Error('Database error'));

            await expect(UserRepository.update(1, 'Alice', 'alice@example.com', 'admin')).rejects.toThrow('Database error');
        });
    });

    describe('delete', () => {
        it('should delete a user successfully', async () => {
            db.query.mockResolvedValue();

            await UserRepository.delete(1);

            expect(db.query).toHaveBeenCalledWith('DELETE FROM users WHERE user_id = $1', [1]);
        });

        it('should handle database query errors', async () => {
            db.query.mockRejectedValueOnce(new Error('Database error'));

            await expect(UserRepository.delete(1)).rejects.toThrow('Database error');
        });
    });
});
