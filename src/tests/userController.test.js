const userController = require('../controllers/userController.js');
const userService = require('../services/userService.js');

jest.mock('../services/userService.js');

describe('User Controller Test', () => {
    beforeEach(() => {
	jest.clearAllMocks();
    });

    describe('getUsers', () => {
	it('should return a list of users with status 200', async () => {
	    const mockUsers = [
		{ user_id: 1, username: 'testUser', email: 'test@example.com', role: 'testRole' },
		{ user_id: 2, username: 'adminUser', email: 'admin@example.com', role: 'admin' },
	    ]

	    userService.getAllUsers.mockResolvedValueOnce(mockUsers);

	    const req = {};
	    const res = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn(),
	    };

	    await userController.getAllUsers(req, res);

	    expect(res.status).toHaveBeenCalledWith(200);
	    expect(res.json).toHaveBeenCalledWith(mockUsers);
	});

	it('should return a 500 error if service throws an error', async () => {
	    userService.getAllUsers.mockRejectedValue(null);

	    const req = {};
	    const res = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn(),
	    };

	    await userController.getAllUsers(req, res);

	    expect(res.status).toHaveBeenCalledWith(500);
	    expect(res.json).toHaveBeenCalledWith('Error fetching users');
	})
    });

    describe('getUserById', () => {
	it('should return a user with status 200 if user is found', async () => {
	    const mockUser = { id: 1, username: 'Alice', email: 'alice@example.com', role: 'admin' };
	    userService.getUserById.mockResolvedValue(mockUser);

	    const req = { params: { id: '1' } };
	    const res = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn()
	    };

	    await userController.getUserById(req, res);

	    expect(res.status).toHaveBeenCalledWith(200);
	    expect(res.json).toHaveBeenCalledWith(mockUser);
	});

	it('should return a 404 error if user is not found', async () => {
	    userService.getUserById.mockResolvedValue(null);

	    const req = { params: { id: '999' } };
	    const res = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn()
	    };

	    await userController.getUserById(req, res);

	    expect(res.status).toHaveBeenCalledWith(404);
	    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
	});

	it('should return a 500 error if service throws an error', async () => {
	    userService.getUserById.mockRejectedValueOnce(new Error('Service error'));

	    const req = { params: { id: '1' } };
	    const res = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn()
	    };

	    await userController.getUserById(req, res);

	    expect(res.status).toHaveBeenCalledWith(500);
	    expect(res.json).toHaveBeenCalledWith('Error fetching user');
	});
    });

    describe('createUser', () => {
	it('should create a user and return it with status 201', async () => {
	    const mockUser = { id: 1, username: 'Alice', email: 'alice@example.com', role: 'admin' };
	    userService.createUser.mockResolvedValue(mockUser);

	    const req = { body: { username: 'Alice', email: 'alice@example.com', role: 'admin' } };
	    const res = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn()
	    };

	    await userController.createUser(req, res);

	    expect(res.status).toHaveBeenCalledWith(201);
	    expect(res.json).toHaveBeenCalledWith(mockUser);
	});

	it('should return a 500 error if service throws an error', async () => {
	    userService.createUser.mockRejectedValueOnce(new Error('Service error'));

	    const req = { body: { username: 'Alice', email: 'alice@example.com', role: 'admin' } };
	    const res = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn()
	    };

	    await userController.createUser(req, res);

	    expect(res.status).toHaveBeenCalledWith(500);
	    expect(res.json).toHaveBeenCalledWith('Error creating user');
	});
    });

    describe('updateUser', () => {
	it('should update a user and return it with status 202 if user is found', async () => {
	    const mockUser = { id: 1, username: 'Alice', email: 'alice@example.com', role: 'admin' };
	    userService.updateUser.mockResolvedValue(mockUser);

	    const req = { params: { id: '1' }, body: { username: 'Alice', email: 'alice@example.com', role: 'admin' } };
	    const res = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn()
	    };

	    await userController.updateUser(req, res);

	    expect(res.status).toHaveBeenCalledWith(202);
	    expect(res.json).toHaveBeenCalledWith(mockUser);
	});

	it('should return a 404 error if user is not found', async () => {
	    userService.updateUser.mockResolvedValue(null);

	    const req = { params: { id: '999' }, body: { username: 'Alice', email: 'alice@example.com', role: 'admin' } };
	    const res = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn()
	    };

	    await userController.updateUser(req, res);

	    expect(res.status).toHaveBeenCalledWith(404);
	    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
	});

	it('should return a 500 error if service throws an error', async () => {
	    userService.updateUser.mockRejectedValueOnce(new Error('Service error'));

	    const req = { params: { id: '1' }, body: { username: 'Alice', email: 'alice@example.com', role: 'admin' } };
	    const res = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn()
	    };

	    await userController.updateUser(req, res);

	    expect(res.status).toHaveBeenCalledWith(500);
	    expect(res.json).toHaveBeenCalledWith('Error updating user');
	});
    });

    describe('deleteUser', () => {
	it('should delete a user and return status 204', async () => {
	    userService.deleteUser.mockResolvedValue();

	    const req = { params: { id: '1' } };
	    const res = {
		status: jest.fn().mockReturnThis(),
		send: jest.fn()
	    };

	    await userController.deleteUser(req, res);

	    expect(res.status).toHaveBeenCalledWith(204);
	    expect(res.send).toHaveBeenCalled();
	});

	it('should return a 500 error if service throws an error', async () => {
	    userService.deleteUser.mockRejectedValueOnce(new Error('Service error'));

	    const req = { params: { id: '1' } };
	    const res = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn()
	    };

	    await userController.deleteUser(req, res);

	    expect(res.status).toHaveBeenCalledWith(500);
	    expect(res.json).toHaveBeenCalledWith('Error deleting user');
	});
    });
});
