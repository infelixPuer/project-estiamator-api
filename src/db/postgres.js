const fs = require('fs');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config( { path: __dirname + '.env' });

const config = {
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: String(process.env.POSTGRES_PASSWORD),
    port: 5432,
    database: process.env.POSTGRES_DB,
};

const pool = new Pool(config);


async function init() {
    try {
	const sqlFilePath = path.join(__dirname, 'dbsetup.sql');
	const sql = fs.readFileSync(sqlFilePath, 'utf-8');

	await pool.query(sql);

	console.log('Database was initialized successfully');
    } catch (err) {
	console.log('Error initializing database: ', err);
    }
}

init();

module.exports = { 
    query: (text, params) => pool.query(text, params),
};
