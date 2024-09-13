const db = require('../db/postgres.js');
const User = require('../models/user.js');

class UserRepository {
    async findAll() {
	const result = await db.query('SELECT * FROM users');
	return result.rows.map(row => new User(row.user_id, row.username, row.email, row.role));
    }

    async findById(id) {
	const result = await db.query('SELECT * FROM users WHERE user_id = $1', [id]);
	if (result.rows.length === 0) {
	    return null
	}

	const { user_id, username, email, role } = result.rows[0];

	return new User(user_id, username, email, role);
    }

    async create(username, email, role) {
	const result = await db.query('INSERT INTO users (username, email, role) VALUES ($1, $2, $3) RETURNING *', [username, email, role]);
	const { user_id, username: userUsername, email: userEmail, role: userRole } = result.rows[0];

	return new User(user_id, userUsername, userEmail, userRole);
    }

    async update(id, username, email, role) {
	const result = await db.query('UPDATE users SET username = $1, email = $2, role = $3 WHERE user_id = $4 RETURNING *', [username, email, role, id]);

	if (result.rows.length === 0) {
	    return null;
	}

	const { user_id, username: userUsername, email: userEmail, role: userRole } = result.rows[0];

	return new User(user_id, userUsername, userEmail, userRole);
    }

    async delete(id) {
	await db.query('DELETE FROM users WHERE user_id = $1', [id]);
    }
}

module.exports = new UserRepository();
