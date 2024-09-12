const waitPort = require('wait-port')
const fs = require('fs');
const { Client } = require('pg');
const { path } = require('path');

// const {
//     POSTGRES_HOST: HOST,
//     POSTGRES_USER: USER,
//     POSTGRES_PASSWORD: PASSWORD,
//     POSTGRES_DB: DB,
// } = process.env;



async function init() {
    const config = {
	host: process.env.POSTGRES_HOST,
	user: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD,
	port: 5432,
	database: process.env.POSTGRES_DB,
    };
    console.log(typeof process.env.POSTGRES_PASSWORD);
    const host = process.env.POSTGRES_HOST;
    const user = process.env.POSTGRES_USER;
    const password = process.env.POSTGRES_PASSWORD;
    const db = process.env.POSTGRES_DB;

    await waitPort({
	HOST: host,
	port: 5432,
	timeout: 10000,
	waitForDns: true,
    });

    console.log(host);
    console.log(user);
    console.log(password);
    console.log(db);
    console.log(typeof password);

    const client = new Client(config);

    client.connect().then(async () => {
	console.log(`Connected to postgres db at host ${host}`);

	const query = fs.readFileSync(__dirname + '/dbsetup.sql', 'utf-8');
	const checkQuery = 'SELECT 1 FROM pg_database WHERE datname = \'project_estimator\'';

	const result = client.query(checkQuery);

	await client.query(query);

	if (result.rowCount === 0) {
	    console.log('creating db');
	    await client.query('CREATE DATABASE project_estimator');
	    console.log('populating db');
	    await client.query(query);
	} else {
	    console.log('Database project_estimator already exists');
	}
	
    }).catch(err => {
	console.error('Unable to connect to the database: ', err);
    });
    client.end();

    return config;
}

module.exports = { init };
