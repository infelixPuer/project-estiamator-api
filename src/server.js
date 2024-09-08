const express = require('express');
const fs = require('fs');
const dotenv = require('dotenv');
const jwt = require('./src/jwt.js');
const { Pool } = require('pg');

const app = express();
const port = 3000;


const privateKey = fs.readFileSync('./private_key.pem', 'utf-8');
const publicKey = fs.readFileSync('./public_key.pem', 'utf-8');

dotenv.config();

const pool = new Pool({
    host: process.env.HOST,
    user: process.env.USER,
    port: process.env.PORT,
    password: process.env.PASSWORD, 
    database: process.env.DATABASE
});

app.use(express.json());

// 
// /api/login enpoint
//

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
	return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
	const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

	if (result.rows.length === 0) {
	    return res.status(404).json({ message: 'Username was not found!' });
	}

	// do i need to check this?
	if (!result.rows[0] || result.rows[0].username !== username) {
	    return res.status(404).json({ message: 'Username was not found!' });
	}

	const isMatch = password === result.rows[0].password;

	if (!isMatch) {
	    return res.status(401).json({ message: 'Invalid password' });
	}

	const header = {
	    alg: 'RSA256',
	    typ: 'JWT'
	};

	const payload = {
	    name: username
	};

	const token = jwt.sign_jwt(header, payload, privateKey);

	return res.json({ token });
    } catch (err) {
	console.error('Error authenticating a user: ', err);
	return res.status(500).json({ message: 'Server error' });
    }
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']; 
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) { 
	return res.sendStatus(401).json({ message: 'You are not authorized' });
    }

    if (!jwt.verify_jwt(token, publicKey)) {
	return res.sendStatus(403).json({ message: 'Error while verifying the token' });
    }

    next();
}

// function estimate(description) {
//     const complexityMap = {
// 	'authentication': 40,
// 	'database': 60,
// 	'api': 100,
// 	'frontend': 120,
// 	'backend': 100,
// 	'payment integration': 80,
// 	'third-party services': 60,
// 	'real-time': 100,
// 	'admin panel': 80,
// 	'analytics':50,
// 	'testing': 60,
// 	'deployment': 40,
// 	'user management': 70,
// 	'notifications': 50,
// 	'file upload': 30,
//     };
// 
//     let totalHours = 0;
// 
//     for (const keyword in complexityMap) {
// 	if (description.toLowerCase().includes(keyword)) {
// 	    totalHours += complexityMap[keyword];
// 	}
//     }
// 
//     totalHours = totalHours === 0 ? 100 : totalHours;
// 
//     const hoursPerDay = 6;
//     const daysPerMonth = 20;
//     const totalManMonth = (totalHours / hoursPerDay) / daysPerMonth;
// 
//     return totalManMonth;
// };

// 
// /api/users enpoint
//
// GET api/users - get all resgistered users
app.get('/api/users', authenticateToken, async (req, res) => {
    const { username, email, role } = req.body;
    let query = 'SELECT * FROM users';
    let conditions = [];
    let values = [];

    if (username) {
	conditions.push(`username LIKE ${conditions.length + 1}%`);
	values.push(username);
    }

    if (email) {
	conditions.push(`email LIKE ${conditions.length + 1}%`);
	values.push(email);
    }

    if (role) {
	conditions.push(`role LIKE ${conditions.length + 1}%`);
	values.push(role);
    }

    if (conditions.length > 0) {
	query += ' WHERE' + conditions.join(' AND ');
    }

    try {
	const result = await pool.query(query, values);
	return res.json(result.rows);
    } catch (err) {
	console.error('Error fetching users: ', err);
	return res.status(500).json({ message: 'Server error' });
    }
});

// GET api/users/:userId - get a user by id
app.get('/api/users/:userId', authenticateToken, async (req, res) => {
    try {
	const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [req.params.userId]);

	if (!result.rows)
	    return res.status(404).json({ message: 'User not found' });

	res.status(200).json(result.rows);
    } catch (err) {
	console.error('Error while fetching a user by id', err);
	res.status(500).json({ message: 'Server error' });
    }
});

// POST api/users - add a new user record
app.post('/api/users', authenticateToken, async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
	res.status(400).json({ message: 'Request doesn\'t containt required fields' });
	return;
    }

    try {
	const result = await pool.query('INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *', [username, email, password, role]);
	res.status(201).json(result.rows[0]);
    } catch (err) {
	console.error('Error inserting new user', err);
	res.status(500).json({ message: 'Server error' });
    }
});

// PUT api/users/:userId - update a user record
app.put('/api/users/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;
    const { username, email, password, role } = req.body;

    try {
	const check = await pool.query(`
	    SELECT * FROM users WHERE user_id = $1
	    `, [userId]);

	if (check.rows.length === 0) {
	    await pool.end();
	    return res.status(404).json({ message: 'User not found' });
	}

	const result = await pool.query(`
	    UPDATE users
	    SET username = $1, email = $2, password = $3, role = $4
	    WHERE user_id = $5
	    RETURNING *
	    `, [username, email, password, role, userId]);

	return res.status(200).json(result.rows[0]);
    } catch (err) {
	console.error('Error updating new user', err);
	return res.status(500).json({ message: 'Server error' });
    }
});

// DELETE - delete a user record
app.delete('/api/users/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;

    try {
	const check = await pool.query(`
	    SELECT * FROM users
	    WHERE user_id = $1
	    `, [userId]);

	if (check.rows.length === 0) {
	    return res.status(404).json({ message: 'User not found' });
	}


	await pool.query(`
	    DELETE FROM users 
	    WHERE user_id = $1
	    `, [userId]);
	return res.status(204);
    } catch (err) {
	console.error(err);
	res.status(500).json({ message: 'Server error' });
    }
});

// 
// /api/projects endpoint
//
// GET api/projects - get all resgistered projects 
app.get('/api/projects', authenticateToken, async (req, res) => {
    const { title, userId, description, status } = req.body;
    let query = 'SELECT * FROM projects';
    let conditions = [];
    let values = [];

    if (title) {
	conditions.push(`title LIKE ${conditions.length + 1}%`);
	values.push(title);
    }

    if (userId) {
	conditions.push(`userId = ${conditions.length + 1}`);
	values.push(userId);
    }

    if (description) {
	conditions.push(`description LIKE ${conditions.length + 1}%`);
	values.push(description);
    }

    if (status) {
	conditions.push(`status LIKE ${conditions.length + 1}%`);
	values.push(status);
    }

    if (conditions.length > 0) {
	query += ' WHERE' + conditions.join(' AND ');
    }

    try {
	const result = await pool.query(query, values);
	res.status(200).json(result.rows);
    } catch (err) {
	console.error('Error fetching projects: ', err);
	res.status(500).json({ message: 'Server error' });
    }
});

// 
// /api/projects endpoint
//
// GET api/projects/:projectId - get a project by ID
app.get('/api/projects/:projectId', authenticateToken, async (req, res) => {
    const projectId = req.params;

    try {
	const result = await pool.query('SELECT * FROM projects WHERE projectd_id = $1', [projectId]);

	if (!result.rows) {
	    return res.status(404).json({ message: 'Project not found' });
	}

	return res.status(200).json(result.rows);
    } catch (err) {
	console.error('Error fetching a project: ', err);
	return res.status(500).json({ message: 'Server error' });
    }
});

// GET api/projects/:status- get a projects by status 
app.get('/api/projects/:status', authenticateToken, async (req, res) => {
    const status = req.params;

    try {
	const result = await pool.query(`
	SELECT * FROM projects 
	WHERE status = $1`, [status]);

	if (result.rows.length === 0) {
	    return res.status(404).json({ message: 'Projects not found' });
	}

	return res.status(200).json(result.rows);
    } catch (err) {
	console.error('Error fetching projects by status', err);
	return res.status(500).json({ message: 'Server error' });
    }
});

// POST api/project - add a new project record
app.post('/api/projects', authenticateToken, async (req, res) => {
    const { userId, title, description} = req.body;

    if (!userId || !title || !description) {
	res.status(400).json({ message: 'Request doesn\'t containt required fields' });
	return;
    }

    const userCheck = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
    
    if (!userCheck.rows) 
	return res.status(400).json({ message: 'User with provided user id does not exist'});	

    try {
	const result = await pool.query('INSERT INTO projects (user_id, title, description) VALUES ($1, $2, $3) RETURNING *', [userId, title, description]);
	res.status(201).json(result.rows[0]);
    } catch (err) {
	console.error('Error inserting new project', err);
	res.status(500).json({ message: 'Server error' });
    }
});

// PUT api/projects/:projectId- update a project record
app.put('/api/projects/:projectId', authenticateToken, async (req, res) => {
    const { projectId } = req.params;
    const { userId, title, description, status } = req.body;

    try {
	const projectCheck = await pool.query(`
	    SELECT * FROM projects WHERE project_id = $1
	    `, [projectId]);

	if (projectCheck.rows.length === 0)
	    return res.status(404).json({ message: 'Project not found' });

	const result = await pool.query(`
	    UPDATE projects
	    SET user_id = $1, title = $2, description = $3, status = $4
	    WHERE project_id = $5
	    RETURNING *
	    `, [userId, title, description, status, projectId]);

	return res.status(200).json(result.rows[0]);
    } catch (err) {
	console.error('Error updating a project', err);
	return res.status(500).json({ message: 'Server error' });
    }
});

// DELETE - delete a project record
app.delete('/api/projects/:projectId', authenticateToken, async (req, res) => {
    const { projectId } = req.params;

    try {
	const check = await pool.query(`
	    SELECT * FROM projects
	    WHERE project_id = $1
	    `, [projectId]);

	if (check.rows.length === 0) {
	    return res.status(404).json({ message: 'Project not found' });
	}

	await pool.query(`
	    DELETE FROM projects 
	    WHERE project_id = $1
	    `, [projectId]);
	return res.status(204);
    } catch (err) {
	console.error(err);
	res.status(500).json({ message: 'Server error' });
    }
});

// 
// /api/employees endpoint
//
// GET api/employees - get all registered employees 
app.get('/api/employees', authenticateToken, async (req, res) => {
    try {
	const result = await pool.query('SELECT * FROM employees ORDER BY employee_id');
	res.status(200).json(result.rows);
    } catch (err) {
	console.error('Error fetching employees: ', err);
	res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/employees', authenticateToken, async (req, res) => {
    const { firstName, lastName, email, isAvailable, role } = req.body;
    let query = 'SELECT * FROM employees';
    let conditions = [];
    let values = [];

    if (firstName) {
	conditions.push(`first_name LIKE ${conditions.length + 1}%`);
	values.push(firstName);
    }

    if (lastName) {
	conditions.push(`last_name LIKE ${conditions.length + 1}%`);
	values.push(lastName);
    }

    if (email) {
	conditions.push(`email LIKE ${conditions.length + 1}%`);
	values.push(email);
    }

    if (isAvailable) {
	conditions.push(`is_available = ${conditions.length + 1}%`);
	values.push(isAvailable);
    }

    if (role) {
	conditions.push(`role LIKE ${conditions.length + 1}%`);
	values.push(role);
    }

    if (conditions.length > 0) {
	query += ' WHERE' + conditions.join(' AND ');
    }

    query += ' ORDER BY employee_id';

    try {
	const result = await pool.query(query, values);
	res.status(200).json(result.rows);
    } catch (err) {
	console.error('Error fetching employees: ', err);
	res.status(500).json({ message: 'Server error' });
    }
});

// GET api/employees/:employeeId - get an employee by ID
app.get('/api/employees/:employeeId', authenticateToken, async (req, res) => {
    const employeeId = req.params;

    if (!employeeId) {
	return res.status(400).json({ message: 'Request doesn\'t contain required field' });
    }	

    try {
	const result = await pool.query(`
	    SELECT * FROM employees 
	    WHERE employee_id = $1
	    `, [employeeId]);

	if (result.rows.length === 0) {
	    return res.status(404).json({ message: 'Employee not found' });
	}

	return res.status(200).json(result.rows);
    } catch (err) {
	console.error('Error fetching an employee', err);
	return res.status(500).json({ message: 'Server error' });
    }
});

// POST api/employee - add a new employee record
app.post('/api/employees', authenticateToken, async (req, res) => {
    const { firstName, lastName, email, isAvailable, role } = req.body;

    if (!firstName || !lastName || !email || !isAvailable || !role) {
	res.status(400).json({ message: 'Request doesn\'t containt required fields' });
	return;
    }

    try {
	const result = await pool.query(`
	    INSERT INTO employees (first_name, last_name, email, is_available, role) 
	    VALUES ($1, $2, $3, $4, $5) RETURNING *
	    `, [firstName, lastName, email, isAvailable, role]);
	res.status(201).json(result.rows[0]);
    } catch (err) {
	console.error('Error inserting new employee', err);
	res.status(500).json({ message: 'Server error' });
    }
});

// PUT api/employees/:employeeId - update an employee record
app.put('/api/employees/:employeeId', authenticateToken, async (req, res) => {
    const { employeeId } = req.params;
    const { firstName, lastName, email, isAvailable, role} = req.body;

    try {
	const check = await pool.query(`
	    SELECT * FROM employees WHERE employee_id = $1
	    `, [employeeId]);

	if (check.rows.length === 0) {
	    await pool.end();
	    return res.status(404).json({ message: 'Employee not found' });
	}

	const result = await pool.query(`
	    UPDATE employees
	    SET first_name = $1, last_name = $2, email = $3, is_available = $4, role = $5
	    WHERE employee_id = $6
	    RETURNING *
	    `, [firstName, lastName, email, isAvailable, role, employeeId]);

	return res.status(200).json(result.rows[0]);
    } catch (err) {
	console.error('Error updating a employee', err);
	return res.status(500).json({ message: 'Server error' });
    }
});

// DELETE - delete a employee record
app.delete('/api/employees/:employeeId', authenticateToken, async (req, res) => {
    const { employeeId } = req.params;

    try {
	const employeeCheck = await pool.query(`
	    SELECT * FROM employees
	    WHERE employee_id = $1
	    `, [employeeId]);

	if (employeeCheck.rows.length === 0) {
	    return res.status(404).json({ message: 'Employee not found' });
	}

	await pool.query(`
	    DELETE FROM employees 
	    WHERE employee_id = $1
	    `, [employeeId]);

	return res.status(204);
    } catch (err) {
	console.error(err);
	return res.status(500).json({ message: 'Server error' });
    }
});

// 
// /api/assignments endpoint
//
// GET api/assignments - get all assignments 
app.get('/api/assignments', authenticateToken, async (req, res) => {
    const { minCost, maxCost, cost, condition } = req.body;
    let query = 'SELECT * FROM assignments';
    let values = [];

    if (minCost && maxCost) {
	query += ' WHERE cost >= $1 AND cost <= $2';
	values.push(minCost);
	values.push(maxCost);
    } else if (cost && condition) {
	query += ' WHERE cost = $1';	
	values.push(cost);
    }

    query += ' ORDER BY assignment_id';

    try {
	const result = await pool.query(query, values);
	return res.status(202).json(result.rows);
    } catch (err) {
	console.error('Error while fetching assignments')
	return res.status(500).json({ message: 'Server error' });
    }
});

// GET api/assignments/:assignmentId - get an assignment by ID
app.get('/api/assignments/:assignmentId', authenticateToken, async (req, res) => {
    const { assignmentId } = req.params;

    if (!assignmentId) {
	return res.status(400).json({ message: 'Request doesn\'t contain required field' });
    }	

    try {
	const result = await pool.query(`
	SELECT * FROM assignments 
	WHERE assignment_id = $1`, [assignmentId]);

	if (result.rows.length === 0) {
	    return res.status(404).json({ message: 'assignment not found' });
	}

	return res.status(200).json(result.rows);
    } catch (err) {
	console.error('Error fetching assignment', err);
	return res.status(500).json({ message: 'Server error' });
    }
});

// GET api/assignments?costMin=costMin&costMax=costMax - get an assignment with cost in range between cost min and cost max
app.get('/api/assignments/:costMin/:costMax', authenticateToken, async (req, res) => {
    const { costMin, costMax } = req.params;

    if (!costMin || !costMax) {
	return res.status(400).json({ message: 'Request doesn\'t contain required field' });
    }	

    try {
	const result = await pool.query(`
	SELECT * FROM assignments 
	WHERE cost BETWEEN $1 AND $2`, [costMin, costMax]);

	if (result.rows.length === 0) {
	    return res.status(404).json({ message: 'assignment not found' });
	}

	return res.status(200).json(result.rows);
    } catch (err) {
	console.error('Error fetching assignment', err);
	return res.status(500).json({ message: 'Server error' });
    }
});

// POST api/assignment - add a new assignment record
app.post('/api/assignments', authenticateToken, async (req, res) => {
    const { projectId, employeeId, cost } = req.body;

    if (!projectId || !employeeId || !cost) {
	res.status(400).json({ message: 'Request doesn\'t containt required fields' });
	return;
    }

    try {
	const result = await pool.query('INSERT INTO assignments (project_id, employee_id, cost) VALUES ($1, $2, $3) RETURNING *', [projectId, employeeId, cost]);
	res.status(201).json(result.rows[0]);
    } catch (err) {
	console.error('Error inserting new assignment', err);
	res.status(500).json({ message: 'Server error' });
    }
});

// PUT api/assignments/:assignmentId - update an assignment record
app.put('/api/assignments/:assignmentId', authenticateToken, async (req, res) => {
    const { assignmentId } = req.params;
    const { projectId, employeeId, cost } = req.body;

    try {
	const check = await pool.query(`
	    SELECT * FROM assignments WHERE assignment_id = $1
	    `, [assignmentId]);

	if (check.rows.length === 0) {
	    await pool.end();
	    return res.status(404).json({ message: 'assignment not found' });
	}

	const result = await pool.query(`
	    UPDATE assignments
	    SET project_id = $1, employee_id = $2, cost = $3
	    WHERE assignment_id = $4
	    RETURNING *
	    `, [projectId, employeeId, cost, assignmentId]);

	return res.status(200).json(result.rows[0]);
    } catch (err) {
	console.error('Error updating a assignment', err);
	return res.status(500).json({ message: 'Server error' });
    }
});

// DELETE - delete a assignment record
app.delete('/api/assignments/:assignmentId', authenticateToken, async (req, res) => {
    const { assignmentId } = req.params;

    try {
	const check = await pool.query(`
	    SELECT * FROM assignments
	    WHERE assignment_id = $1
	    `, [assignmentId]);

	if (check.rows.length === 0) {
	    return res.status(404).json({ message: 'assignment not found' });
	}


	await pool.query(`
	    DELETE FROM assignments 
	    WHERE assignment_id = $1
	    `, [assignmentId]);
	return res.status(204);
    } catch (err) {
	console.error(err);
	res.status(500).json({ message: 'Server error' });
    }
});

if (require.main === module) {
    app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
    });
}

module.exports = { app, authenticateToken };
