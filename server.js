const express = require('express');
const fs = require('fs');
const pg = require('pg');
const dotenv = require('dotenv');
const jwt = require('./jwt.js');
const { Pool } = require('pg');

const app = express();
const port = 3000;

const description = 'api';

const privateKey = fs.readFileSync('private_key.pem', 'utf-8');
const publicKey = fs.readFileSync('public_key.pem', 'utf-8');

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
	res.sendStatus(401);
	return;
    }

    if (!jwt.verify_jwt(token, publicKey)) {
	res.sendStatus(403);
	return; 
    }

    next();
}

function estimate(description) {
    const complexityMap = {
	'authentication': 40,
	'database': 60,
	'api': 100,
	'frontend': 120,
	'backend': 100,
	'payment integration': 80,
	'third-party services': 60,
	'real-time': 100,
	'admin panel': 80,
	'analytics':50,
	'testing': 60,
	'deployment': 40,
	'user management': 70,
	'notifications': 50,
	'file upload': 30,
    };

    let totalHours = 0;

    for (const keyword in complexityMap) {
	if (description.toLowerCase().includes(keyword)) {
	    totalHours += complexityMap[keyword];
	}
    }

    totalHours = totalHours === 0 ? 100 : totalHours;

    const hoursPerDay = 6;
    const daysPerMonth = 20;
    const totalManMonth = (totalHours / hoursPerDay) / daysPerMonth;

    return totalManMonth;
};

// 
// /api/users enpoint
//
// GET api/users - get all resgistered users
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
	const result = await pool.query('SELECT * FROM users');
	return res.json(result.rows);
    } catch (err) {
	console.error('Error fetching users: ', err);
	return res.status(500).json({ message: 'Server error' });
    }
});

// GET api/users/:userId - get a user by id
app.get('/api/users/:userId', authenticateToken, async (req, res) => {
    const respond = await pool.query('SELECT * FROM users WHERE user_id = $1', [req.params.userId]);
    res.json(respond.rows);
});

// POST api/users - add a new user record
app.post('/api/users', authenticateToken, async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
	res.status(400).json({ message: 'Request doesn\'t containt required fields' });
	return;
    }

    try {
	const result = await pool.query('INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)', [username, email, password, role]);
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
	    `, [username, email, password, role, userId]);

	return res.status(200);
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


	const result = await pool.query(`
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
// GET api/projects - get all resgistered users
app.get('/api/projects', authenticateToken, async (req, res) => {
    try {
	const result = await pool.query('SELECT * FROM projects');
	res.status(200).json(result.rows);
    } catch (err) {
	console.error('Error fetching projects: ', err);
	res.status(500).json({ message: 'Server error' });
    }
});

// GET api/projects/:status- get a projects by status 
app.get('/api/projects/:status', authenticateToken, async (req, res) => {
    const { status } = req.params;

    if (!status) {
	return res.status(400).json({ message: 'Request doesn\'t contain required field' });
    }	

    try {
	const respond = await pool.query(`
	SELECT * FROM projects 
	WHERE status = $1`, [status]);

	if (respond.rows.length === 0) {
	    return res.status(404).json({ message: 'Projects not found' });
	}

	return res.status(200).json(respond.rows);
    } catch (err) {
	console.error('Error fetching projects', err);
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
	const check = await pool.query(`
	    SELECT * FROM projects WHERE project_id = $1
	    `, [projectId]);

	if (check.rows.length === 0) {
	    await pool.end();
	    return res.status(404).json({ message: 'Project not found' });
	}

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
	    return res.status(404).json({ message: 'project not found' });
	}


	const result = await pool.query(`
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
// GET api/employees - get all resgistered employees 
app.get('/api/employees', authenticateToken, async (req, res) => {
    try {
	const result = await pool.query('SELECT * FROM employees ORDER BY employee_id');
	res.status(200).json(result.rows);
    } catch (err) {
	console.error('Error fetching employees: ', err);
	res.status(500).json({ message: 'Server error' });
    }
});

// GET api/employees/:employeeId - get an employee by ID
app.get('/api/employees/:employeeId', authenticateToken, async (req, res) => {
    const { employeeId } = req.params;

    if (!employeeId) {
	return res.status(400).json({ message: 'Request doesn\'t contain required field' });
    }	

    try {
	const respond = await pool.query(`
	SELECT * FROM employees 
	WHERE employee_id = $1`, [employeeId]);

	if (respond.rows.length === 0) {
	    return res.status(404).json({ message: 'Employee not found' });
	}

	return res.status(200).json(respond.rows);
    } catch (err) {
	console.error('Error fetching employee', err);
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
	const result = await pool.query('INSERT INTO employees (first_name, last_name, email, is_available, role) VALUES ($1, $2, $3, $4, $5) RETURNING *', [firstName, lastName, email, isAvailable, role]);
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
	const check = await pool.query(`
	    SELECT * FROM employees
	    WHERE employee_id = $1
	    `, [employeeId]);

	if (check.rows.length === 0) {
	    return res.status(404).json({ message: 'Employee not found' });
	}


	const result = await pool.query(`
	    DELETE FROM employees 
	    WHERE employee_id = $1
	    `, [employeeId]);
	return res.status(204);
    } catch (err) {
	console.error(err);
	res.status(500).json({ message: 'Server error' });
    }
});

// 
// /api/assignments endpoint
//
// GET api/assignments - get all resgistered assignments 
app.get('/api/assignments', authenticateToken, async (req, res) => {
    try {
	const result = await pool.query('SELECT * FROM assignments ORDER BY assignment_id');
	res.status(200).json(result.rows);
    } catch (err) {
	console.error('Error fetching assignments: ', err);
	res.status(500).json({ message: 'Server error' });
    }
});

// GET api/assignments/:assignmentId - get an assignment by ID
app.get('/api/assignments/:assignmentId', authenticateToken, async (req, res) => {
    const { assignmentId } = req.params;

    if (!assignmentId) {
	return res.status(400).json({ message: 'Request doesn\'t contain required field' });
    }	

    try {
	const respond = await pool.query(`
	SELECT * FROM assignments 
	WHERE assignment_id = $1`, [assignmentId]);

	if (respond.rows.length === 0) {
	    return res.status(404).json({ message: 'assignment not found' });
	}

	return res.status(200).json(respond.rows);
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
	const respond = await pool.query(`
	SELECT * FROM assignments 
	WHERE cost BETWEEN $1 AND $2`, [costMin, costMax]);

	if (respond.rows.length === 0) {
	    return res.status(404).json({ message: 'assignment not found' });
	}

	return res.status(200).json(respond.rows);
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


	const result = await pool.query(`
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
