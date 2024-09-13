class Employee {
    constructor(employee_id, first_name, last_name, email, is_available, role) {
	this.employee_id = employee_id;
	this.first_name = first_name;
	this.last_name = last_name;
	this.email = email;
	this.is_available = is_available;
	this.role = role;
    }
}

module.exports = Employee;
