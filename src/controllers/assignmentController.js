const assignmentService = require('../services/assignmentService.js');

class AssignmentController {
    async getAllAssignments(req, res) {
	const assignments = await assignmentService.getAllAssignments();
	return res.status(200).json(assignments);
    }

    async getAssignmentById(req, res) {
	const { id } = req.params;
	const assignment = await assignmentService.getAssignmentById(id);
	if (!assignment) return res.status(404).json({ message: 'Assignment not found'});
	return res.status(200).json(assignment);
    }
    
    async createAssignment(req, res) {
	const { projectId, employeeId, cost } = req.body;
	const assignment = await assignmentService.create(projectId, employeeId, cost);
	return res.status(201).json(assignment);
    }

    async updateAssignment(req, res) {
	const { id } = req.params;
	const { projectId, employeeId, cost, assignedAt, finishedAt } = req.body;
	const assignment = await assignmentService.update(id, projectId, employeeId, cost, assignedAt, finishedAt);
	if (!assignment) return res.status(404).json({ message: 'Assignment not found'});
	return res.status(202).json(assignment);
    }

    async deleteAssignment(req, res) {
	const { id } = req.params;
	await assignmentService.delete(id);
	return res.status(204).send();
    }
}

module.exports = new AssignmentController();
