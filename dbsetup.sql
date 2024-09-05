DROP DATABASE project_estimator;

CREATE DATABASE project_estimator;

\c project_estimator;

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    project_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    title VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assignments (
    assignment_id SERIAL NOT NULL,
    project_id INT REFERENCES projects(project_id) ON DELETE CASCADE,
    employee_id INT REFERENCES employees(employee_id) ON DELETE CASCADE,
    cost NUMERIC(10, 2) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP,
    PRIMARY KEY (assignment_id, project_id, employee_id)
);

INSERT INTO users (username, email, password, role)
VALUES
('estimator1', 'estimator1@example.com', 'hashed_password1', 'estimator'),
('admin1', 'admin1@example.com', 'hashed_password2', 'admin'),
('test', 'test@example.com', 'test_password', 'test');

INSERT INTO projects (user_id, title, description)
VALUES
('1', 'Website Redesign', 'Redesign the company website to improve UX'),
('2', 'Mobile App Development', 'Develop a new mobile application for our services');

INSERT INTO employees (first_name, last_name, email, role)
VALUES
('Alice', 'Smith', 'alice.smith@example.com', 'developer'),
('Bob', 'Johnson', 'bob.johnson@example.com', 'designer'),
('Charlie', 'Brown', 'charlie.brown@example.com', 'QA engineer');

INSERT INTO assignments (project_id, employee_id, cost)
VALUES
(1, 1, 2000),
(2, 2, 3000);

UPDATE employees SET is_available = FALSE WHERE employee_id IN (1, 2);
