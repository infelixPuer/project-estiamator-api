const projectService = require('../services/projectService.js');

class ProjectController {
    async getAllProjects(req, res) {
	const projects = await projectService.getAllProjects();
	return res.status(200).json(projects);
    }

    async getProjectById(req, res) {
	const { id } = req.params;
	const project = await projectService.getProjectById(id);
	if (!project) return res.status(404).json({ message: 'Project not found'});
	return res.status(200).json(project);
    }
    
    async createProject(req, res) {
	const { title, userId, description, status } = req.body;
	const project = await projectService.create(title, userId, description, status);
	return res.status(201).json(project);
    }

    async updateProject(req, res) {
	const { id } = req.params;
	const { title, userId, description, status } = req.body;
	const project = await projectService.update(id, title, userId, description, status);
	if (!project) return res.status(404).json({ message: 'Project not found'});
	return res.status(202).json(project);
    }

    async deleteProject(req, res) {
	const { id } = req.params;
	await projectService.delete(id);
	return res.status(204).send();
    }
}

module.exports = new ProjectController();
