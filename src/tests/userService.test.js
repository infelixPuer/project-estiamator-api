const userService = require('../services/userService');
const userRepository = require('../repositories/userRepository');

jest.mock('../repositories/userRepository');

describe('UserService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllUsers', () => {
        it('should return a list of users', async () => {
            const mockUsers = [
                { id: 1, username: 'Alice', email: 'alice@example.com', role: 'admin' },
                { id: 2, username: 'Bob', email: 'bob@example.com', role: 'user' }
            ];
            userRepository.findAll.mockResolvedValue(mockUsers);

            const users = await userService.getAllUsers();

            expect(users).toEqual(mockUsers);
        });

        it('should throw an error if repository throws an error', async () => {
            userRepository.findAll.mockRejectedValueOnce(new Error('Repository error'));

            await expect(userService.getAllUsers()).rejects.toThrow('Repository error');
        });
    });

    describe('getUserById', () => {
        it('should return a user if found', async () => {
            const mockUser = { id: 1, username: 'Alice', email: 'alice@example.com', role: 'admin' };
            userRepository.findById.mockResolvedValue(mockUser);

            const user = await userService.getUserById(1);

            expect(user).toEqual(mockUser);
        });

        it('should return null if user is not found', async () => {
            userRepository.findById.mockResolvedValue(null);

            const user = await userService.getUserById(999);

            expect(user).toBeNull();
        });

        it('should throw an error if repository throws an error', async () => {
            userRepository.findById.mockRejectedValueOnce(new Error('Repository error'));

            await expect(userService.getUserById(1)).rejects.toThrow('Repository error');
        });
    });

    describe('createUser', () => {
        it('should create a user and return it', async () => {
            const newUser = { id: 1, username: 'Alice', email: 'alice@example.com', role: 'admin' };
            userRepository.create.mockResolvedValue(newUser);

            const user = await userService.createUser('Alice', 'alice@example.com', 'admin');

            expect(user).toEqual(newUser);
        });

        it('should throw an error if repository throws an error', async () => {
            userRepository.create.mockRejectedValueOnce(new Error('Repository error'));

            await expect(userService.createUser('Alice', 'alice@example.com', 'admin')).rejects.toThrow('Repository error');
        });
    });

    describe('updateUser', () => {
        it('should update a user and return the updated user if user is found', async () => {
            const updatedUser = { id: 1, username: 'Alice', email: 'alice@example.com', role: 'admin' };
            userRepository.update.mockResolvedValue(updatedUser);

            const user = await userService.updateUser(1, 'Alice', 'alice@example.com', 'admin');

            expect(user).toEqual(updatedUser);
        });

        it('should return null if user is not found', async () => {
            userRepository.update.mockResolvedValue(null);

            const user = await userService.updateUser(999, 'Alice', 'alice@example.com', 'admin');

            expect(user).toBeNull();
        });

        it('should throw an error if repository throws an error', async () => {
            userRepository.update.mockRejectedValueOnce(new Error('Repository error'));

            await expect(userService.updateUser(1, 'Alice', 'alice@example.com', 'admin')).rejects.toThrow('Repository error');
        });
    });

    describe('deleteUser', () => {
        it('should delete a user successfully', async () => {
            userRepository.delete.mockResolvedValue();

            await userService.deleteUser(1);

            expect(userRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw an error if repository throws an error', async () => {
            userRepository.delete.mockRejectedValueOnce(new Error('Repository error'));

            await expect(userService.deleteUser(1)).rejects.toThrow('Repository error');
        });
    });
});
