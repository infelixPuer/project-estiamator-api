const express = require('express');
const assignmentController = require('../controllers/assignmentController.js');
const router = express.Router();

router.get('/assignments', assignmentController.getAllAssignments);
router.get('/assignments/:id', assignmentController.getAssignmentById);
router.post('/assignments', assignmentController.createAssignment);
router.put('/assignments/:id', assignmentController.updateAssignment);
router.delete('/assignments/:id', assignmentController.deleteAssignment);

module.exports = router;
