const express = require('express');
const userRoutes = require('./routes/userRoutes.js');
const employeeRoutes = require('./routes/employeeRoutes.js');
const projectRoutes = require('./routes/projectRoutes.js');
const assignmentRoutes = require('./routes/assignmentRoutes.js');

const app = express();
app.use(express.json());
app.use('/api', userRoutes);
app.use('/api', employeeRoutes);
app.use('/api', projectRoutes);
app.use('/api', assignmentRoutes);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`);
});
