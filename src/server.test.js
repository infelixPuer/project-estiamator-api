const { Pool } = require('pg');
const { sign_jwt } = require('./jwt');
const { readFileSync } = require('fs');
const request = require('supertest');
const { app, authenticateToken } = require('./server');

jest.mock('./server', () => {
    const original = jest.requireActual('./server');
    return {
	...original,
	authenticateToken: jest.fn(),
    };
});

jest.mock('pg', () => {
    const mPool = { query: jest.fn(), end: jest.fn() };
    return { Pool: jest.fn(() => mPool) };
});

jest.mock('./jwt', () => {
    return {
	sign_jwt: jest.fn(),
	verify_jwt: jest.fn((token) => {
	    if (token === 'mocked_token')
		return true;

	    return false;
	}),
    }
});

describe('API tests', () => {
    let pool;

    beforeEach(() => {
	pool = new Pool();	
	sign_jwt.mockReturnValue('mocked_token');
    });

    afterEach(() => {
	jest.clearAllMocks();
    });

    describe('/api/login', () => {
	describe('POST /api/login', () => {
	    it('should authenticate a user and return token with code 200', async () => {
		const username = 'test';
		const password = 'test';

		pool.query.mockReturnValue({
		    rows: [{ username, password }],
		});

		sign_jwt.mockReturnValue('mocked_token');;

		const header = {
		    alg: 'RS246',
		    typ: 'JWT'
		};

		const payload = {
		    name: username 
		};

		const privateKey = readFileSync('./private_key.pem', 'utf-8');

		let token = sign_jwt(header, payload, privateKey);
		const res = await request(app)
		    .post('/api/login')
		    .send({ username, password });

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty('token', token);
	    });

	    it('should return 400 code if username or password is missing', async () => {

		const res = await request(app)
		    .post('/api/login')
		    .send({});

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty('message', 'Username and password are required');
	    });

	    it('should return 404 if username is not found', async () => {
		const username = 'no such username';
		const password = 'no such password';

		const res = await request(app)
		    .post('/api/login')
		    .send({ username, password });

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty('message', 'Username was not found');
	    });

	    it('should return 401 if password is incorrect', async () => {
		const username = 'test';
		const password = 'incorrect_password';
		const res = await request(app)
		    .post('/api/login')
		    .send({ username, password });

		expect(res.statusCode).toBe(401);
		expect(res.body).toHaveProperty('message', 'Invalid password');
	    });
	});
    });

    describe('/api/users', () => {
	describe('GET /api/users ', () => {
	    it('should get all users', async () => {
		pool.query.mockReturnValue({
		    rows: [
			{ user_id: 1, username: 'user1', password: 'pass1', email: 'email1', role: 'role1' },
			{ user_id: 2, username: 'user2', password: 'pass2', email: 'email2', role: 'role2' }
		    ]
		});

		const res = await request(app)
		    .get('/api/users')
		    .set('Authorization', `Bearer mocked_token`);

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual([
		    { user_id: 1, username: 'user1', password: 'pass1', email: 'email1', role: 'role1' },
		    { user_id: 2, username: 'user2', password: 'pass2', email: 'email2', role: 'role2' }
		]);

		jest.clearAllMocks();
	    });

	    it('should return 500 on server error', async () => {
		pool.query.mockRejectedValue(new Error('Database error'));

		const res = await request(app)
		    .get('/api/users')
		    .set('Authorization', 'Bearer mocked_token');

		expect(res.statusCode).toBe(500);
		expect(res.body).toEqual({ message: 'Server error' });
	    });
	});

	describe('GET /api/users/:userId', () => {
	    it('should return 200 and a user with passed userId', async () => {
		const userId = 3;
		pool.query.mockReturnValueOnce({ rows: [
		    { user_id: userId, username: 'user3', password: 'pass3', email: 'email3', role: 'role3' },
		]});

		const res = await request(app)
		    .get(`/api/users/3`)
		    .set('Authorization', 'Bearer mocked_token');

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual([
		    { user_id: userId, username: 'user3', password: 'pass3', email: 'email3', role: 'role3' },
		]);
	    });

	    it('should return 404 if user was not found', async () => {
		const userId = 3;
		pool.query.mockReturnValueOnce({ rows: [] });

		const res = await request(app)
		    .get(`/api/users/3`)
		    .set('Authorization', 'Bearer mocked_token');

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty('message', 'User not found');
	    });
	});

	describe('POST /api/users', () => {
	    it('should create a new user and return 201 with the user data', async () => {
		const newUser = { username: 'newuser', password: 'newpass', email: 'newemail', role: 'user' };

		pool.query.mockReturnValueOnce({ 
		    rows: [{ user_id: 1, ...newUser }] 
		});

		const res = await request(app)
		    .post('/api/users')
		    .set('Authorization', 'Bearer mocked_token')
		    .send(newUser);

		expect(res.statusCode).toBe(201);
		expect(res.body).toEqual({ user_id: 1, ...newUser });
	    });

	    it('should return 400 if required fields are missing', async () => {
		const incompleteUser = { username: 'newuser', email: 'newemail' };

		const res = await request(app)
		    .post('/api/users')
		    .set('Authorization', 'Bearer mocked_token')
		    .send(incompleteUser);

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty('message', 'Request doesn\'t contain required fields');
	    });

	    it('should return 500 if there is a database error', async () => {
		const newUser = { username: 'newuser', password: 'newpass', email: 'newemail', role: 'user' };

		pool.query.mockRejectedValue(new Error('Database error'));

		const res = await request(app)
		    .post('/api/users')
		    .set('Authorization', 'Bearer mocked_token')
		    .send(newUser);

		expect(res.statusCode).toBe(500);
		expect(res.body).toEqual({ message: 'Server error' });
	    });
	});

	describe('PUT /api/users/:userId', () => {
	    it('should update the user and return 200 with the updated user data', async () => {
		const updatedUser = { username: 'updateduser', password: 'updatedpass', email: 'updatedemail', role: 'admin' };

		pool.query.mockReturnValue({ 
		    rows: [{ user_id: 1, ...updatedUser }] 
		});

		const res = await request(app)
		    .put('/api/users/1')
		    .set('Authorization', 'Bearer mocked_token')
		    .send(updatedUser);

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ user_id: 1, ...updatedUser });
	    });

	    it('should return 404 if the user was not found', async () => {
		pool.query.mockReturnValue({ rows: [] });

		const updatedUser = { username: 'updateduser', password: 'updatedpass', email: 'updatedemail', role: 'admin' };

		const res = await request(app)
		    .put('/api/users/3')
		    .set('Authorization', 'Bearer mocked_token')
		    .send(updatedUser);

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty('message', 'User not found');
	    });

	    it('should return 500 if there is a database error', async () => {
		pool.query.mockRejectedValue(new Error('Database error'));

		const updatedUser = { username: 'updateduser', password: 'updatedpass', email: 'updatedemail', role: 'admin' };

		const res = await request(app)
		    .put('/api/users/1')
		    .set('Authorization', 'Bearer mocked_token')
		    .send(updatedUser);

		expect(res.statusCode).toBe(500);
		expect(res.body).toEqual({ message: 'Server error' });
	    });
	});

	describe('DELETE /api/users/:userId', () => {
	    it('should delete a user and return 204', async () => {
		pool.query.mockReturnValue({ rows: [1]});

		const res = await request(app)
		    .del('/api/users/1')
		    .set('Authorization', 'Bearer mocked_token');

		expect(res.statusCode).toBe(204);
	    });

	    it('should return 404 if the user was not found', async () => {
		pool.query.mockReturnValueOnce({ rows: [] });

		const res = await request(app)
		    .delete('/api/users/999')
		    .set('Authorization', 'Bearer mocked_token');

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty('message', 'User not found');
	    });

	    it('should return 500 if there is a database error', async () => {
		pool.query.mockRejectedValue(new Error('Database error'));

		const res = await request(app)
		    .del('/api/users/1')
		    .set('Authorization', 'Bearer mocked_token');

		expect(res.statusCode).toBe(500);
		expect(res.body).toEqual({ message: 'Server error' });
	    });
	});
    });

    describe('/api/projects', () => {
	describe('GET /api/projects', () => {
	    it('should retrieve all projects', async () => {
		pool.query.mockReturnValueOnce({
		    rows: [
			{ project_id: 1, title: 'Project1', description: 'Desc1', status: 'pending' },
			{ project_id: 2, title: 'Project2', description: 'Desc2', status: 'finished' }
		    ]
		});

		const res = await request(app)
		    .get('/api/projects')
		    .set('Authorization', `Bearer mocked_token`);

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual([
		    { project_id: 1, title: 'Project1', description: 'Desc1', status: 'pending' },
		    { project_id: 2, title: 'Project2', description: 'Desc2', status: 'finished' }
		]);
	    });

	    it('should return 500 on server error', async () => {
		pool.query.mockRejectedValueOnce(new Error('Database error'));

		const res = await request(app)
		    .get('/api/projects')
		    .set('Authorization', `Bearer mocked_token`);

		expect(res.statusCode).toBe(500);
		expect(res.body).toEqual({ message: 'Server error' });
	    });
	});

	describe('GET /api/projects/:projectId', () => {
	    it('should retrieve a specific project by projectId', async () => {
		const projectId = 1;
		pool.query.mockReturnValueOnce({
		    rows: [
			{ project_id: projectId, title: 'Project1', description: 'Desc1', status: 'pending' }
		    ]
		});

		const res = await request(app)
		    .get(`/api/projects/${projectId}`)
		    .set('Authorization', `Bearer mocked_token`);

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual([{
		    project_id: projectId,
		    title: 'Project1',
		    description: 'Desc1',
		    status: 'pending'
		}]);
	    });

	    it('should return 404 if project not found', async () => {
		const projectId = 99;
		pool.query.mockReturnValueOnce({ rows: [] });

		const res = await request(app)
		    .get(`/api/projects/${projectId}`)
		    .set('Authorization', `Bearer mocked_token`);

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty('message', 'Project not found');
	    });
	});

	describe('POST /api/projects', () => {
	    it('should create a new project', async () => {
		const newProject = { userId: 1, title: 'New Project', description: 'New Description', status: 'pending' };
		pool.query.mockReturnValue({
		    rows: [{ project_id: 1, ...newProject }]
		});

		const res = await request(app)
		    .post('/api/projects')
		    .set('Authorization', `Bearer mocked_token`)
		    .send(newProject);

		expect(res.body).toEqual({ project_id: 1, ...newProject });
		expect(res.statusCode).toBe(201);
		expect(res.body).toEqual({ project_id: 1, ...newProject });
	    });

	    it('should return 400 if required fields are missing', async () => {
		const newProject = { description: 'New Description' };

		const res = await request(app)
		    .post('/api/projects')
		    .set('Authorization', `Bearer mocked_token`)
		    .send(newProject);

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty('message', 'Request doesn\'t contain required fields');
	    });
	});

	describe('PUT /api/projects/:projectId', () => {
	    it('should update an existing project', async () => {
		const projectId = 1;
		const updatedProject = { title: 'Updated Project', description: 'Updated Desc', status: 'pending' };
		pool.query.mockReturnValue({
		    rows: [{ project_id: projectId, ...updatedProject }]
		});

		const res = await request(app)
		    .put(`/api/projects/${projectId}`)
		    .set('Authorization', `Bearer mocked_token`)
		    .send(updatedProject);

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ project_id: projectId, ...updatedProject });
	    });

	    it('should return 404 if project to update is not found', async () => {
		const projectId = 99;
		const updatedProject = { title: 'Updated Project', description: 'Updated Desc', status: 'active' };
		pool.query.mockReturnValueOnce({ rows: [] });

		const res = await request(app)
		    .put(`/api/projects/${projectId}`)
		    .set('Authorization', `Bearer mocked_token`)
		    .send(updatedProject);

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty('message', 'Project not found');
	    });
	});

	describe('DELETE /api/projects/:projectId', () => {
	    it('should delete an existing project', async () => {
		const projectId = 1;
		pool.query.mockReturnValueOnce({
		    rows: [{ project_id: projectId }]
		});

		const res = await request(app)
		    .delete(`/api/projects/${projectId}`)
		    .set('Authorization', `Bearer mocked_token`);

		expect(res.statusCode).toBe(204);
		expect(res.body).toEqual({});
	    });

	    it('should return 404 if project to delete is not found', async () => {
		const projectId = 99;
		pool.query.mockReturnValueOnce({ rows: [] });

		const res = await request(app)
		    .delete(`/api/projects/${projectId}`)
		    .set('Authorization', `Bearer mocked_token`);

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty('message', 'Project not found');
	    });
	});
    });

    describe('/api/employees', () => {
	describe('GET /api/employees', () => {
	    it('should get all employees', async () => {
		pool.query.mockReturnValue({
		    rows: [
			{ employee_id: 1, first_name: 'testName', last_name: 'testLastName', email: 'testemail', role: 'testRole'},
			{ employee_id: 2, first_name: 'anotherName', last_name: 'anotherLastName', email: 'testemail', role: 'testRole2'}
		    ]
		});

		const res = await request(app)
		    .get('/api/employees')
		    .set('Authorization', 'Bearer mocked_token');

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual([
		    { employee_id: 1, first_name: 'testName', last_name: 'testLastName', email: 'testemail', role: 'testRole'},
		    { employee_id: 2, first_name: 'anotherName', last_name: 'anotherLastName', email: 'testemail', role: 'testRole2'}
		]);
	    });

	    it('should return 500 on server error', async () => {
		pool.query.mockRejectedValue(new Error('Database error'));

		const res = await request(app)
		    .get('/api/employees')
		    .set('Authorization', 'Bearer mocked_token');

		expect(res.statusCode).toBe(500);
		expect(res.body).toEqual({ message: 'Server error' });
	    });
	});

	describe('GET /api/employees/:employeeId', () => {
	    it('should return 200 and the employee with the specified employeeId', async () => {
		const employeeId = 3;
		pool.query.mockReturnValueOnce({
		    rows: [
			{ employee_id: 3, first_name: 'name3', last_name: 'lastName3', email: 'email3', role: 'role3' }
		    ]
		});

		const res = await request(app)
		    .get(`/api/employees/${employeeId}`)
		    .set('Authorization', 'Bearer mocked_token');

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual([
		    { employee_id: 3, first_name: 'name3', last_name: 'lastName3', email: 'email3', role: 'role3' }
		]);
	    });

	    it('should return 404 if the employee is not found', async () => {
		const employeeId = 3;
		pool.query.mockReturnValueOnce({ rows: [] });

		const res = await request(app)
		    .get(`/api/employees/${employeeId}`)
		    .set('Authorization', 'Bearer mocked_token');

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty('message', 'Employee not found');
	    });
	});

	describe('POST /api/employees/', () => {
	    it('should create a new employee and return 201', async () => {
		    const newEmployee = { firstName: 'name', lastName: 'lastName', email: 'email', isAvailable: true, role: 'role' };

		pool.query.mockReturnValueOnce({
		    rows: [{ employee_id: 4, ...newEmployee }]
		});

		const res = await request(app)
		    .post('/api/employees')
		    .set('Authorization', 'Bearer mocked_token')
		    .send(newEmployee);

		expect(res.statusCode).toBe(201);
		expect(res.body).toEqual({ employee_id: 4, ...newEmployee });
	    });

	    it('should return 400 if required fields are missing', async () => {
		const res = await request(app)
		    .post('/api/employees')
		    .set('Authorization', 'Bearer mocked_token')
		    .send({});  // Missing required fields

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty('message', 'Request doesn\'t contain required fields');
	    });
	});

	describe('PUT /api/employees/:employeeId', () => {
	    it('should update an existing employee and return 200', async () => {
		const updatedEmployee = { firstName: 'name', lastName: 'lastName', email: 'email', isAvailable: true, role: 'role' };
		const employeeId = 4;

		pool.query.mockReturnValue({
		    rows: [{ employee_id: employeeId, ...updatedEmployee }]
		});

		const res = await request(app)
		    .put(`/api/employees/${employeeId}`)
		    .set('Authorization', 'Bearer mocked_token')
		    .send(updatedEmployee);

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ employee_id: employeeId, ...updatedEmployee });
	    });

	    it('should return 404 if the employee to update is not found', async () => {
		const updatedEmployee = { firstName: 'name', lastName: 'lastName', email: 'email', isAvailable: true, role: 'role' };
		const employeeId = 99;

		pool.query.mockReturnValueOnce({ rows: [] });

		const res = await request(app)
		    .put(`/api/employees/${employeeId}`)
		    .set('Authorization', 'Bearer mocked_token')
		    .send(updatedEmployee);

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty('message', 'Employee not found');
	    });
	});

	describe('DELETE /api/employees/:employeeId', () => {
	    it('should delete an existing employee and return 204', async () => {
		const employeeId = 5;

		pool.query.mockReturnValueOnce({ rows: [{ first_name: 'test'} ]});
		pool.query.mockReturnValueOnce({ rowCount: 1 });

		const res = await request(app)
		    .del(`/api/employees/${employeeId}`)
		    .set('Authorization', 'Bearer mocked_token');

		expect(res.statusCode).toBe(204);
		expect(res.body).toEqual({});
	    });

	    it('should return 404 if the employee to delete is not found', async () => {
		const employeeId = 99;

		pool.query.mockReturnValueOnce({ rows: []});

		const res = await request(app)
		    .del(`/api/employees/${employeeId}`)
		    .set('Authorization', 'Bearer mocked_token');

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty('message', 'Employee not found');
	    });
	});
    });

    describe('/api/assignments/', () => {
	describe('GET /api/assignments', () => {
	    it('should retrieve all assignments', async () => {
		pool.query.mockReturnValueOnce({
		    rows: [
			{ assignment_id: 1, project_id: 1, employee_id: 1, role: 'Developer' },
			{ assignment_id: 2, project_id: 2, employee_id: 2, role: 'Manager' }
		    ]
		});

		const res = await request(app)
		    .get('/api/assignments')
		    .set('Authorization', `Bearer mocked_token`);

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual([
		    { assignment_id: 1, project_id: 1, employee_id: 1, role: 'Developer' },
		    { assignment_id: 2, project_id: 2, employee_id: 2, role: 'Manager' }
		]);
	    });

	    it('should return 500 on server error', async () => {
		pool.query.mockRejectedValueOnce(new Error('Database error'));

		const res = await request(app)
		    .get('/api/assignments')
		    .set('Authorization', `Bearer mocked_token`);

		expect(res.statusCode).toBe(500);
		expect(res.body).toEqual({ message: 'Server error' });
	    });
	});

	describe('GET /api/assignments/:assignmentId', () => {
	    it('should retrieve a specific assignment by assignmentId', async () => {
		const assignmentId = 1;
		pool.query.mockReturnValueOnce({
		    rows: [{ assignment_id: assignmentId, project_id: 1, employee_id: 1, role: 'Developer' }]
		});

		const res = await request(app)
		    .get(`/api/assignments/${assignmentId}`)
		    .set('Authorization', `Bearer mocked_token`);

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual([{
		    assignment_id: assignmentId,
		    project_id: 1,
		    employee_id: 1,
		    role: 'Developer'
		}]);
	    });

	    it('should return 404 if assignment is not found', async () => {
		const assignmentId = 99;
		pool.query.mockReturnValueOnce({ rows: [] });

		const res = await request(app)
		    .get(`/api/assignments/${assignmentId}`)
		    .set('Authorization', `Bearer mocked_token`);

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty('message', 'Assignment not found');
	    });
	});

	describe('POST /api/assignments', () => {
	    it('should create a new assignment', async () => {
		const newAssignment = { projectId: 1, employeeId: 1, cost: 40000 };
		pool.query.mockReturnValue({
		    rows: [{ assignment_id: 1, ...newAssignment }]
		});

		const res = await request(app)
		    .post('/api/assignments')
		    .set('Authorization', `Bearer mocked_token`)
		    .send(newAssignment);

		expect(res.statusCode).toBe(201);
		expect(res.body).toEqual({ assignment_id: 1, ...newAssignment });
	    });

	    it('should return 400 if required fields are missing', async () => {
		const newAssignment = { role: 'Tester' };

		const res = await request(app)
		    .post('/api/assignments')
		    .set('Authorization', `Bearer mocked_token`)
		    .send(newAssignment);

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty('message', 'Request doesn\'t contain required fields');
	    });
	});

	describe('PUT /api/assignments/:assignmentId', () => {
	    it('should update an existing assignment', async () => {
		const assignmentId = 1;
		const updatedAssignment = { project_id: 1, employee_id: 2, cost: 5000 };
		pool.query.mockReturnValue({
		    rows: [{ assignment_id: assignmentId, ...updatedAssignment }]
		});

		const res = await request(app)
		    .put(`/api/assignments/${assignmentId}`)
		    .set('Authorization', `Bearer mocked_token`)
		    .send(updatedAssignment);

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ assignment_id: assignmentId, ...updatedAssignment });
	    });

	    it('should return 404 if assignment to update is not found', async () => {
		const assignmentId = 99;
		const updatedAssignment = { project_id: 1, employee_id: 2, cost: 6000};
		pool.query.mockReturnValueOnce({ rows: [] });

		const res = await request(app)
		    .put(`/api/assignments/${assignmentId}`)
		    .set('Authorization', `Bearer mocked_token`)
		    .send(updatedAssignment);

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty('message', 'Assignment not found');
	    });
	});

	describe('DELETE /api/assignments/:assignmentId', () => {
	    it('should delete an existing assignment', async () => {
		const assignmentId = 1;
		pool.query.mockReturnValueOnce({
		    rows: [{ assignment_id: assignmentId }]
		});

		const res = await request(app)
		    .delete(`/api/assignments/${assignmentId}`)
		    .set('Authorization', `Bearer mocked_token`);

		expect(res.statusCode).toBe(204);
		expect(res.body).toEqual({});
	    });

	    it('should return 404 if assignment to delete is not found', async () => {
		const assignmentId = 99;
		pool.query.mockReturnValueOnce({ rows: [] });

		const res = await request(app)
		    .delete(`/api/assignments/${assignmentId}`)
		    .set('Authorization', `Bearer mocked_token`);

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty('message', 'Assignment not found');
	    });
	});
    });
});
