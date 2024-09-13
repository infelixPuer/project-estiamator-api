const userService = require('../services/userService.js');

class UserController {
    async getAllUsers(req, res) {
	const users = await userService.getAllUsers();
	return res.status(200).json(users);
    }

    async getUserById(req, res) {
	const { id } = req.params;
	const user = await userService.getUserById(id);
	if (!user) return res.status(404).json({ message: 'User not found'});
	return res.status(200).json(user);
    }
    
    async createUser(req, res) {
	const { username, email, role } = req.body;
	const user = await userService.create(username, email, role);
	return res.status(201).json(user);
    }

    async updateUser(req, res) {
	const { id } = req.params;
	const { username, email, role } = req.body;
	const user = await userService.update(id, username, email, role);
	if (!user) return res.status(404).json({ message: 'User not found'});
	return res.status(202).json(user);
    }

    async deleteUser(req, res) {
	const { id } = req.params;
	await userService.delete(id);
	return res.status(204).send();
    }
}

module.exports = new UserController();
