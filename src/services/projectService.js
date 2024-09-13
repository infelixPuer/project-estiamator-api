const projectRepository = require('../repositories/projectRepository.js');

class ProjectService {
    async getAllProjects() {
	return await projectRepository.findAll();
    }

    async getProjectById(id) {
	return await projectRepository.findById(id);
    }
    
    async createProject(title, userId, description, status) {
	return await projectRepository.create(title, userId, description, status);
    }

    async updateProject(id, title, userId, description, status) {
	return await projectRepository.update(id, title, userId, description, status);
    }

    async deleteProject(id) {
	return await projectRepository.delete(id);
    }
}

module.exports = new ProjectService();
