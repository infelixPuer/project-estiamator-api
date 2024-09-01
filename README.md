# Project Estimator API documentation

## Content

---

## Description



---

## Technical Requirments

- Programming language: Javascript (Node.js)
- Database: PostgreSQL
- Docker

---

## Base URL

`http://localhost:3000`

---

## API Documentation

### 1. Endpoint `api/login`:

- Endpoint: `api/login`
- Standard: JWT

> Request
>
> ```
> curl -X 'POST' \\
> '/login' \\
> {
>    "username": "username",
>    "password": "password"
> }
> ```

> Response body
> ```
> { 
>    "token": " 
>        eyJhbGciOiJSUzI1NiIsInR5cCI6Imp3dCJ9.
>        eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOmZhbHNlfQ.
>        TVZmYTJCTHIvUjVSTk1HWU45UkhrY3RRNVBpRU9DUTFlWGxLY3BIcC84TzJGL1g4b0xyWkV0Y1NMVl"
> }
> ```

### 2. Endpoint `api/users1`:

- GET `api/users` - get all registered users
    - Server should respond with status code 200 and all users records.
    - Possible parameters:

| Parameter | Type | Required | Description|
| --- | --- | --- | --- |
| `first_name` | string | Yes | Part of the first name of the user to search for. |
| `last_name` | string | Yes | Part of the last name of the user to search for. |
| `email` | string | Yes | Part of the email of the user to search for. |
| `role` | string | Yes | Part of the role of the user to search for. |

### **Example 1:**

> Request
>
> ```
> curl -X 'GET' \\
> '/users' \\
> ```

> Response body 
>
> ```
> [{
>     "user_id": 1,
>     "first_name": "string",
>     "last_name": "string",
>     "email": "string",
>     "password": "string",
>     "role": "string",
>     "created_at": "datetime"
> },
> {
>     "user_id": 2,
>     "first_name": "string",
>     "last_name": "string",
>     "email": "string",
>     "password": "string",
>     "role": "string",
>     "created_at": "datetime"
> }]
> ```


### **Example 2:**

> Request
>
> ```
> curl -X 'GET' \\
> 'api/users?name=st' \\
> ```

> Response body 
>
> ```
> [{
>     "user_id": 1,
>     "first_name": "Steve",
>     "last_name": "Brown",
>     "email": "steve.brown@example.com",
>     "password": "password1",
>     "role": "delevoper",
>     "created_at": "datetime"
> },
> {
>     "user_id": 3,
>     "first_name": "Stan",
>     "last_name": "Lee",
>     "email": "stan.lee@example.com",
>     "password": "password3",
>     "role": "designer",
>     "created_at": "datetime"
> }]
> ```

- GET `api/users/{userId}` - get one user by ID
    - Server should anwser with status code 200 and record with id == userId if it exists
    - Server should anwser with status code 404 and corresponding message if record with id == userId doesn't exist

| Parameter | Type | Required | Description|
| --- | --- | --- | --- |
| `userId` | string | Yes | user's ID |

> Request
>
> ```
> curl -X 'GET' \\
> 'api/users/1' \\
> ```

> Response body 
>
> ```
> {
>     "user_id": 1,
>     "first_name": "string",
>     "last_name": "string",
>     "email": "string",
>     "password": "string",
>     "role": "string",
>     "created_at": "datetime"
> }
> ```

- POST `api/users` - create a record with new user and put it in database. The request body should contain the required information for creating a new user, such as username, email, password and role.
    - Server should answer with status code 201 and newly created record.
    - Server should answer with status code 400 and corresponding message if request body does not constain required fields


> Request
>
> ```
> curl -X 'POST' \\
> 'api/users/0' \\
> -d '{
>     "user_id": 0,
>     "first_name": "string",
>     "last_name": "string",
>     "email": "string",
>     "password": "string",
>     "role": "string",
>     "created_at": "datetime"
> }'
> ```

> Response body 
>
> ```
> {
>     "user_id": 0,
>     "first_name": "string",
>     "last_name": "string",
>     "email": "string",
>     "password": "string",
>     "role": "string",
>     "created_at": "datetime"
> }
> ```

- PUT `api/users/{userId}` - update existing user. The request body should contain the updated information for the user.
    - Server should answer with status code 200 and update the record
    - Server should answer with status code 404 and corresponding message if record with id == userId doesn't exist

| Parameter | Type | Required | Description|
| --- | --- | --- | --- |
| `userId` | string | Yes | user's ID |

> Request
>
> ```
> curl -X 'PUT' \\
> 'api/users/3' \\
> -d '{
>     "user_id": 3,
>     "first_name": "string",
>     "last_name": "string",
>     "email": "string",
>     "password": "string",
>     "role": "string",
>     "created_at": "datetime"
> }'
> ```

> Response body 
>
> ```
> {
>     "user_id": 3,
>     "first_name": "string",
>     "last_name": "string",
>     "email": "string",
>     "password": "string",
>     "role": "string",
>     "created_at": "datetime"
> }
> ```

- DELETE `api/users/{userId}` - delete existing user from databse
    - Server should answer with status code 204 if the record was found and delete the record
    - Server should answer with status code 404 and corresponding message if record with id == userId doesn't exist 

| Parameter | Type | Required | Description|
| --- | --- | --- | --- |
| `userId` | string | Yes | user's ID |

> Request
>
> ```
> curl -X 'DELETE' \\
> 'api/users/3' \\
> ```

> Response body 
>
> ```
> No Content
> ```

### 3. Endpoint `api/projects`:

- GET `api/projects` - get all projects 
    - Server should respond with status code 200 and all projects records.
    - Possible parameters:

| Parameter | Type | Required | Description|
| --- | --- | --- | --- |
| `title` | string | Yes | Part of the title of the project to search for. |
| `user_id` | string | Yes | User associated with the project to search for. |
| `description` | string | Yes | Part of the description of the project to search for. |
| `` | string | Yes | Part of the description of the project to search for. |
| `status` | string | Yes | Status of the project to search for. |

> Request
>
> ```
> curl -X 'GET' \\
> '/projects' \\
> ```

> Response body 
>
> ```
> [{
>     "project_id": 1,
>     "user_id": 1,
>     "title": string,
>     "description": string,
>     "status": string,
>     "created_at": datetime,
> },
> {
>     "project_id": 3,
>     "user_id": 2,
>     "title": string,
>     "description": string,
>     "status": string,
>     "created_at": datetime,
> }]
> ```

- GET `api/projects/{projectId}` - get one project by ID
    - Server should anwser with status code 200 and record with id == projectId if it exists
    - Server should anwser with status code 404 and corresponding message if record with id == projectId doesn't exist

| Parameter | Type | Required | Description|
| --- | --- | --- | --- |
| `projectId` | string | Yes | user's ID |

> Request
>
> ```
> curl -X 'GET' \\
> 'api/projects/1' \\
> ```

> Response body 
>
> ```
> {
>     "project_id": 1,
>     "user_id": 1,
>     "title": string,
>     "description": string,
>     "status": string,
>     "created_at": datetime,
> }
> ```

- GET `api/projects?status=:status` - get a list of projects with the specified status 
    - Server should anwser with status code 200 and array of records with status == status if it exists
    - Server should anwser with status code 404 and corresponding message if record with status == status doesn't exist

| Parameter | Type | Required | Description|
| --- | --- | --- | --- |
| `status` | string | Yes | Current status of the project. |

> Request
>
> ```
> curl -X 'GET' \\
> 'api/projects?status=pending' \\
> ```

> Response body 
>
> ```
> [{
>     "project_id": 1,
>     "user_id": 1,
>     "title": string,
>     "description": string,
>     "status": "pending",
>     "created_at": datetime,
> },
> {
>     "project_id": 2,
>     "user_id": 3,
>     "title": string,
>     "description": string,
>     "status": "pending",
>     "created_at": datetime,
> }]
> ```

- POST `api/projects` - create a record with new project and put it in database. The request body should contain the required information for creating a new project, such as user id, title, description and status.
    - Server should answer with status code 201 and newly created record.
    - Server should answer with status code 400 and corresponding message if request body does not constain required fields


> Request
>
> ```
> curl -X 'POST' \\
> 'api/projects/0' \\
> -d '{
>     "project_id": 1,
>     "user_id": 1,
>     "title": string,
>     "description": string,
>     "status": string,
>     "created_at": datetime,
> }'
> ```

> Response body 
>
> ```
> {
>     "project_id": 1,
>     "user_id": 1,
>     "title": string,
>     "description": string,
>     "status": string,
>     "created_at": datetime,
> }
> ```

- PUT `api/projects/{projectId}` - update existing project. The request body should contain the updated information for the project.
    - Server should answer with status code 200 and update the record
    - Server should answer with status code 404 and corresponding message if record with id == projectId doesn't exist

| Parameter | Type | Required | Description|
| --- | --- | --- | --- |
| `projectId` | string | Yes | project's ID |

> Request
>
> ```
> curl -X 'PUT' \\
> 'api/projects/3' \\
> -d '{
>     "project_id": 3,
>     "user_id": 2,
>     "title": string,
>     "description": string,
>     "status": finished,
>     "created_at": datetime,
> }'
> ```

> Response body 
>
> ```
> {
>     "project_id": 3,
>     "user_id": 2,
>     "title": string,
>     "description": string,
>     "status": finished,
>     "created_at": datetime,
> }
> ```

- DELETE `api/projects/{projectId}` - delete existing project from databse
    - Server should answer with status code 204 if the record was found and delete the record
    - Server should answer with status code 404 and corresponding message if record with id == project doesn't exist 

| Parameter | Type | Required | Description|
| --- | --- | --- | --- |
| `projectId` | string | Yes | project's ID |

> Request
>
> ```
> curl -X 'DELETE' \\
> 'api/projects/3' \\
> ```

> Response body 
>
> ```
> No Content
> ```

### 4. Endpoint `api/employees`:

- GET `api/employees` - get all registered employees
    - Server should respond with status code 200 and all employees records.
    - Possible parameters:

| Parameter | Type | Required | Description|
| --- | --- | --- | --- |
| `first_name` | string | Yes | Part of the first name of the employee to search for. |
| `last_name` | string | Yes | Part of the last name of the employee to search for. |
| `email` | string | Yes | Part of the email of the employee to search for. |
| `role` | string | Yes | Part of the role of the employee to search for. |

### **Example 1:**

> Request
>
> ```
> curl -X 'GET' \\
> '/employees' \\
> ```

> Response body 
>
> ```
> [{
>     "employee_id": 1,
>     "first_name": "string",
>     "last_name": "string",
>     "email": "string",
>     "is_available": boolean,
>     "role": "string",
>     "created_at": "datetime"
> },
> {
>     "employee_id": 2,
>     "first_name": "string",
>     "last_name": "string",
>     "email": "string",
>     "is_available": boolean,
>     "role": "string",
>     "created_at": "datetime"
> }]
> ```


### **Example 2:**

> Request
>
> ```
> curl -X 'GET' \\
> 'api/employees?name=st' \\
> ```

> Response body 
>
> ```
> [{
>     "employee_id": 1,
>     "first_name": "Steve",
>     "last_name": "Brown",
>     "email": "steve.brown@example.com",
>     "is_available": true,
>     "role": "delevoper",
>     "created_at": "datetime"
> },
> {
>     "employee_id": 3,
>     "first_name": "Stan",
>     "last_name": "Lee",
>     "email": "stan.lee@example.com",
>     "is_available": true,
>     "role": "designer",
>     "created_at": "datetime"
> }]
> ```

- GET `api/employees/{employeeId}` - get one employee by ID
    - Server should anwser with status code 200 and record with id == employeeId if it exists
    - Server should anwser with status code 404 and corresponding message if record with id == employeeId doesn't exist

| Parameter | Type | Required | Description|
| --- | --- | --- | --- |
| `employeeId` | string | Yes | employee's ID |

> Request
>
> ```
> curl -X 'GET' \\
> 'api/employees/1' \\
> ```

> Response body 
>
> ```
> {
>     "employee_id": 1,
>     "first_name": "string",
>     "last_name": "string",
>     "email": "string",
>     "is_available": boolean,
>     "role": "string",
>     "created_at": "datetime"
> }
> ```

- POST `api/employees` - create a record with new employee and put it in database. The request body should contain the required information for creating a new employee, such as employeename, email, is_available and role.
    - Server should answer with status code 201 and newly created record.
    - Server should answer with status code 400 and corresponding message if request body does not constain required fields


> Request
>
> ```
> curl -X 'POST' \\
> 'api/employees/0' \\
> -d '{
>     "employee_id": 0,
>     "first_name": "string",
>     "last_name": "string",
>     "email": "string",
>     "is_available": boolean,
>     "role": "string",
>     "created_at": "datetime"
> }'
> ```

> Response body 
>
> ```
> {
>     "employee_id": 0,
>     "first_name": "string",
>     "last_name": "string",
>     "email": "string",
>     "is_available": boolean,
>     "role": "string",
>     "created_at": "datetime"
> }
> ```

- PUT `api/employees/{employeeId}` - update existing employee. The request body should contain the updated information for the employee.
    - Server should answer with status code 200 and update the record
    - Server should answer with status code 404 and corresponding message if record with id == employeeId doesn't exist

| Parameter | Type | Required | Description|
| --- | --- | --- | --- |
| `employeeId` | string | Yes | employee's ID |

> Request
>
> ```
> curl -X 'PUT' \\
> 'api/employees/3' \\
> -d '{
>     "employee_id": 3,
>     "first_name": "string",
>     "last_name": "string",
>     "email": "string",
>     "is_available": boolean,
>     "role": "string",
>     "created_at": "datetime"
> }'
> ```

> Response body 
>
> ```
> {
>     "employee_id": 3,
>     "first_name": "string",
>     "last_name": "string",
>     "email": "string",
>     "is_available": boolean,
>     "role": "string",
>     "created_at": "datetime"
> }
> ```

- DELETE `api/employees/{employeeId}` - delete existing employee from databse
    - Server should answer with status code 204 if the record was found and delete the record
    - Server should answer with status code 404 and corresponding message if record with id == employeeId doesn't exist 

| Parameter | Type | Required | Description|
| --- | --- | --- | --- |
| `employeeId` | string | Yes | employee's ID |

> Request
>
> ```
> curl -X 'DELETE' \\
> 'api/employees/3' \\
> ```

> Response body 
>
> ```
> No Content
> ```

### 5. Endpoint `api/assingments`:

- GET `api/assingments` - get all assingments 
    - Server should respond with status code 200 and all assingments records.
    - Possible parameters:

| Parameter | Type | Required | Description|
| --- | --- | --- | --- |
| `cost` | string | Yes | Part of the cost of the assingment to search for. |

> Request
>
> ```
> curl -X 'GET' \\
> '/assingments' \\
> ```

> Response body 
>
> ```
> [{
>     "assignment_id": 1,
>     "project_id": 1,
>     "employee_id": 1,
>     "cost": "string",
>     "assigned_at": datetime,
>     "assigned_at": datetime,
> },
> {
>     "assignment_id": 1,
>     "project_id": 1,
>     "employee_id": 7,
>     "cost": "string",
>     "assigned_at": datetime,
>     "assigned_at": datetime,
> }]
> ```

- GET `api/assingments/{assignmentId}` - get one assingment by ID
    - Server should anwser with status code 200 and record with id == assingmentId if it exists
    - Server should anwser with status code 404 and corresponding message if record with id == assignmentId doesn't exist

| Parameter | Type | Required | Description|
| --- | --- | --- | --- |
| `assingmentId` | string | Yes | assingment's ID |

> Request
>
> ```
> curl -X 'GET' \\
> 'api/assingments/1' \\
> ```

> Response body 
>
> ```
> {
>     "assignment_id": 1,
>     "project_id": 1,
>     "employee_id": 1,
>     "cost": "string",
>     "assigned_at": datetime,
>     "assigned_at": datetime,
> }
> ```

- GET `api/assingments?cost=:cost` - get a list of assingments with the specified status 
    - Server should anwser with status code 200 and array of records with status == status if it exists
    - Server should anwser with status code 404 and corresponding message if record with status == status doesn't exist

| Parameter | Type | Required | Description|
| --- | --- | --- | --- |
| `costMin` | string | Yes | Minimum value of the assingment's cost. |
| `costMax` | string | Yes | Maximum value of the assingment's cost. |

> Request
>
> ```
> curl -X 'GET' \\
> 'api/assingments?costMin=1000&costMax=2000' \\
> ```

> Response body 
>
> ```
> [{
>     "assignment_id": 1,
>     "project_id": 1,
>     "employee_id": 1,
>     "cost": 1300,
>     "assigned_at": datetime,
>     "assigned_at": datetime,
> },
> {
>     "assignment_id": 2,
>     "project_id": 5,
>     "employee_id": 8,
>     "cost": 1700,
>     "assigned_at": datetime,
>     "assigned_at": datetime,
> }]
> ```

- POST `api/assingments` - create a record with new assingment and put it in database. The request body should contain the required information for creating a new assingment, such as project_id, employee_id and cost.
    - Server should answer with status code 201 and newly created record.
    - Server should answer with status code 400 and corresponding message if request body does not constain required fields


> Request
>
> ```
> curl -X 'POST' \\
> 'api/assingments/0' \\
> -d '{
>     "project_id": 1,
>     "employee_id": 2,
>     "cost": 3000,
> }'
> ```

> Response body 
>
> ```
> {
>     "assignment_id": 1,
>     "project_id": 1,
>     "employee_id": 2,
>     "cost": 3000,
>     "assigned_at": datetime,
>     "assigned_at": datetime,
> }
> ```

- PUT `api/assingments/{assingmentId}` - update existing assingment. The request body should contain the updated information for the assingment.
    - Server should answer with status code 200 and update the record
    - Server should answer with status code 404 and corresponding message if record with id == assingmentId doesn't exist

| Parameter | Type | Required | Description|
| --- | --- | --- | --- |
| `assingmentId` | string | Yes | assingment's ID |

> Request
>
> ```
> curl -X 'PUT' \\
> 'api/assingments/3' \\
> -d '{
>     "assignment_id": 3,
>     "project_id": 1,
>     "employee_id": 2,
>     "cost": 300,
>     "assigned_at": datetime,
>     "assigned_at": datetime,
> }'
> ```

> Response body 
>
> ```
> {
>     "assignment_id": 3,
>     "project_id": 1,
>     "employee_id": 2,
>     "cost": 300,
>     "assigned_at": datetime,
>     "assigned_at": datetime,
> }
> ```

- DELETE `api/assingments/{assingmentId}` - delete existing assingment from databse
    - Server should answer with status code 204 if the record was found and delete the record
    - Server should answer with status code 404 and corresponding message if record with id == assingment doesn't exist 

| Parameter | Type | Required | Description|
| --- | --- | --- | --- |
| `assingmentId` | string | Yes | assingment's ID |

> Request
>
> ```
> curl -X 'DELETE' \\
> 'api/assingments/3' \\
> ```

> Response body 
>
> ```
> No Content
> ```

### Install

Clone this repo with command
```
git clone <https://github.com/....>
```

Go to the project folder

```
cd project-estimator
```

Install dependencies

```
npm install
```

### Run in the Docker container

For running applicaiton in Docker container you should have Docker installed on your system

> **Run app**
> 
> ```
> docker compose up
> ```

> **Stop app**
> 
> ```
> docker compose down
> ```
