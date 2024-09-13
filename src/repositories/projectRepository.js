const db = require('../db/postgres.js');
const Project = require('../models/project.js');

class ProjectRepository {
    async findAll() {
	const result = await db.query('SELECT * FROM projects');
	return result.rows.map(row => new Project(row.project_id, row.title, row.user_id, row.description, row.status));
    }

    async findById(id) {
	const result = await db.query('SELECT * FROM projects WHERE project_id = $1', [id]);
	if (result.rows.length === 0) return null;
	const { project_id, title, user_id, description, status } = result.rows[0];
	return new Project(project_id, title, user_id, description, status);
    }

    async create(title, userId, description, status) {
	const result = db.query('INSERT INTO projects (title, user_id, description, status) VALUES $1, $2, $3, $4 RETURNING *', [title, userId, description, status]);
	const { project_id, title: projectTitle, user_id, description: projectDescription, status: projectStatus } = result.rows[0];
	return new Project(project_id, projectTitle, user_id, projectDescription, projectStatus);
    }

    async update(id, title, userId, description, status) {
	const result = db.query('UPDATE projects SET title = $1, user_id = $2, description = $3, status = $4 RETURNING *', [title, userId, description, status, id]);
	const { project_id, title: projectTitle, user_id, description: projectDescription, status: projectStatus } = result.rows[0];
	return new Project(project_id, projectTitle, user_id, projectDescription, projectStatus);
    }

    async delete(id) {
	const result = db.query('DELETE FROM projects WHERE project_id = $1', [id]);
    }
}

module.exports = new ProjectRepository();
