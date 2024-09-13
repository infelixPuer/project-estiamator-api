const employeeRepository = require('../repositories/employeeRepository.js');

class EmployeeService {
    async getAllEmployees() {
	return await employeeRepository.findAll();
    }

    async getEmployeeById(id) {
	return await employeeRepository.findById(id);
    }
    
    async createEmployee(firstName, lastName, email, isAvailable, role) {
	return await employeeRepository.create(firstName, lastName, email, isAvailable, role);
    }

    async updateEmployee(id, firstName, lastName, email, isAvailable, role) {
	return await employeeRepository.update(id, firstName, lastName, email, isAvailable, role);
    }

    async deleteEmployee(id) {
	return await employeeRepository.delete(id);
    }
}

module.exports = new EmployeeService();
