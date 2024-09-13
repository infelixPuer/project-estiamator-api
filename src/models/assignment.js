class Assignment {
    constructor(assignment_id, project_id, employee_id, cost, assigned_at, finished_at) {
	this.assignment_id = assignment_id;
	this.project_id = project_id;
	this.employee_id = employee_id;
	this.cost = cost;
	this.assigned_at = assigned_at;
	this.finished_at = finished_at;
    }
}

module.exports = Assignment;
