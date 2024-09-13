const userService = require('../services/userService.js');

class UserController {
    async getAllUsers(req, res) {
	try {
	    const users = await userService.getAllUsers();
	    return res.status(200).json(users);
	} catch (err) {
	    console.log('Server error: ', err)
	    return res.status(500).json('Error fetching users');
	}
    }

    async getUserById(req, res) {
	try {
	    const { id } = req.params;
	    const user = await userService.getUserById(id);
	    if (!user) return res.status(404).json({ message: 'User not found'});
	    return res.status(200).json(user);
	} catch (err) {
	    console.log('Server error: ', err)
	    return res.status(500).json('Error fetching user');
	}
    }
    
    async createUser(req, res) {
	try {
	    const { username, email, role } = req.body;
	    const user = await userService.createUser(username, email, role);
	    return res.status(201).json(user);
	} catch (err) {
	    console.log('Server error: ', err)
	    return res.status(500).json('Error creating user');
	}
    }

    async updateUser(req, res) {
	try { 
	    const { id } = req.params;
	    const { username, email, role } = req.body;
	    const user = await userService.updateUser(id, username, email, role);
	    if (!user) return res.status(404).json({ message: 'User not found'});
	    return res.status(202).json(user);
	} catch (err) {
	    console.log('Server error: ', err)
	    return res.status(500).json('Error updating user');
	}
    }

    async deleteUser(req, res) {
	try {
	    const { id } = req.params;
	    await userService.deleteUser(id);
	    return res.status(204).send();
	} catch (err) {
	    console.log('Server error: ', err)
	    return res.status(500).json('Error deleting user');
	}
    }
}

module.exports = new UserController();
