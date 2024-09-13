const userRepository = require('../repositories/userRepository.js');

class UserService {
    async getAllUsers() {
	return await userRepository.findAll();
    }

    async getUserById(id) {
	return await userRepository.findById(id);
    }
    
    async createUser(username, email, role) {
	return await userRepository.create(username, email, role);
    }

    async updateUser(id, username, email, role) {
	return await userRepository.update(id, username, email, role);
    }

    async deleteUser(id) {
	return await userRepository.delete(id);
    }
}

module.exports = new UserService();
