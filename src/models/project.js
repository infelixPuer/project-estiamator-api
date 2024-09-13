class Project {
    constructor(project_id, title, user_id, description, status) {
	this.project_id = project_id;
	this.title = title;
	this.user_id= user_id;
	this.description = description;
	this.status = status;
    }
}

module.exports = Project;
