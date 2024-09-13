const employeeService = require('../services/employeeService.js');

class EmployeeController {
    async getAllEmployees(req, res) {
	const employees = await employeeService.getAllEmployees();
	return res.status(200).json(employees);
    }

    async getEmployeeById(req, res) {
	const { id } = req.params;
	const employee = await employeeService.getEmployeeById(id);
	if (!employee) return res.status(404).json({ message: 'Employee not found'});
	return res.status(200).json(employee);
    }
    
    async createEmployee(req, res) {
	const { firstName, lastName, email, isAvailable, role } = req.body;
	const employee = await employeeService.create(firstName, lastName, email, isAvailable, role);
	return res.status(201).json(employee);
    }

    async updateEmployee(req, res) {
	const { id } = req.params;
	const { firstName, lastName, email, isAvailable, role  } = req.body;
	const employee = await employeeService.update(id, firstName, lastName, email, isAvailable, role );
	if (!employee) return res.status(404).json({ message: 'Employee not found'});
	return res.status(202).json(employee);
    }

    async deleteEmployee(req, res) {
	const { id } = req.params;
	await employeeService.delete(id);
	return res.status(204).send();
    }
}

module.exports = new EmployeeController();
