const db = require('../db/postgres.js');
const Assignment = require('../models/assignment.js');

class AssignmentRepository {
    async findAll() {
	const result = await db.query('SELECT * FROM assignments');
	return result.rows.map(row => new Assignment(row.assignment_id, row.project_id, row.employee_id, row.cost, row.assigned_at, row.finished_at));
    }

    async findById(id) {
	const result = await db.query('SELECT * FROM assignments WHERE assignment_id = $1', [id]);
	if (result.rows.length === 0) return null;
	const { project_id, employee_id, cost, assigned_at, finished_at } = result.rows[0];
	return new Assignment(id, project_id, employee_id, cost, assigned_at, finished_at);
    }

    async create(projectId, employeeId, cost) {
	const result = await db.query('INSERT INTO assignments (project_id, employee_id, cost) VALUES $1, $2, $3 RETURNING *', [projectId, employeeId, cost]);
	const { assignment_id, project_id, employee_id, cost: assignmentCost, assigned_at, finished_at } = result.rows[0];
	return new Assignment(assignment_id, project_id, employee_id, assignmentCost, assigned_at, finished_at);
    }

    async update(id, projectId, employeeId, cost, assignedAt, finishedAt) {
	const result = await db.query('UPDATE assignments SET project_id = $1, employee_id = $2, cost = $3, assigned_at = $4, finished_at = $5 WHERE assignment_id = $6 RETURNING *', [projectId, employeeId, cost, assignedAt, finishedAt, id]);
	const { assignment_id, project_id, employee_id, cost: assignmentCost, assigned_at, finished_at } = result.rows[0];
	return new Assignment(assignment_id, project_id, employee_id, assignmentCost, assigned_at, finished_at);
    }

    async delete(id) {
	const result = await db.query('DELETE FROM assignments WHERE assignment_id = $1', [id]);
    }
}

module.exports = new AssignmentRepository();
