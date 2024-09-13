const db = require('../db/postgres.js');
const Employee = require('../models/employee.js');

class EmployeeRepository {
    async findAll() {
	const result = await db.query('SELECT * FROM employees');
	return result.rows.map(row => new Employee(row.employee_id, row.first_name, row.last_name, row.email, row.is_available, row.role));
    }

    async findById(id) {
	const result = await db.query('SELECT * FROM employees WHERE employee_id = $1', [id]);
	if (result.rows.length === 0) return null;
	const { employee_id, first_name, last_name, email, is_available, role } = result.rows[0];
	return new Employee(employee_id, first_name, last_name, email, is_available, role);
    }

    async create(firstName, lastName, email, isAvailable, role) {
	const result = db.query('INSERT INTO employees (first_name, last_name, email, is_available, role) VALUES $1, $2, $3, $4, $5 RETURNING *', [firstName, lastName, email, isAvailable, role]);
	const { employee_id, first_name, last_name, email: employeeEmail, is_available, role: employeeRole } = result.rows[0];
	return new Employee(employee_id, first_name, last_name, employeeEmail, is_available, employeeRole);
    }

    async update(id, firstName, lastName, email, isAvailable, role) {
	const result = db.query('UPDATE employees SET first_name = $1, last_name = $2, email = $3, is_available = $4, role = $5 WHERE employee_id = $6 RETURNING *', [firstName, lastName, email, isAvailable, role, id]);
	const { employee_id, first_name, last_name, email: employeeEmail, is_available, role: employeeRole } = result.rows[0];
	return new Employee(employee_id, first_name, last_name, employeeEmail, is_available, employeeRole);
    }

    async delete(id) {
	const result = db.query('DELETE FROM employees WHERE employee_id = $1', [id]);
    }
}

module.exports = new EmployeeRepository();
