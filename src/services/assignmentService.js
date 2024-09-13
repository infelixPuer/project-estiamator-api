const assignmentRepository = require('../repositories/assignmentRepository.js');

class AssignmentService {
    async getAllAssignments() {
	return await assignmentRepository.findAll();
    }

    async getAssignmentById(id) {
	return await assignmentRepository.findById(id);
    }
    
    async createAssignment(projectId, employeeId, cost) {
	return await assignmentRepository.create(projectId, employeeId, cost);
    }

    async updateAssignment(id, projectId, employeeId, cost, assignedAt, finishedAt) {
	return await assignmentRepository.update(id, projectId, employeeId, cost, assignedAt, finishedAt);
    }

    async deleteAssignment(id) {
	return await assignmentRepository.delete(id);
    }
}

module.exports = new AssignmentService();
