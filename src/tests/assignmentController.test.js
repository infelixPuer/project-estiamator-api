const AssignmentController = require('../controllers/assignmentController');
const assignmentService = require('../services/assignmentService');

jest.mock('../services/assignmentService');

let req, res;

beforeEach(() => {
    req = {
        params: {},
        body: {},
    };
    res = {
        statusCode: null,
        json: function (data) {
            this.jsonData = data;
            return this;
        },
        send: function () {
            return this;
        },
        status: function (code) {
            this.statusCode = code;
            return this;
        },
    };
});

describe('AssignmentController', () => {
    describe('getAllAssignments', () => {
        it('should return all assignments with status 200', async () => {
            const mockAssignments = [
                { assignmentId: 1, projectId: 1, employeeId: 1, cost: 100, assignedAt: '2024-01-01', finishedAt: null },
            ];
            assignmentService.getAllAssignments.mockResolvedValue(mockAssignments);

            await AssignmentController.getAllAssignments(req, res);

            expect(res.statusCode).toBe(200);
            expect(res.jsonData).toEqual(mockAssignments);
            expect(assignmentService.getAllAssignments).toHaveBeenCalled();
        });
    });

    describe('getAssignmentById', () => {
        it('should return the assignment if found with status 200', async () => {
            const mockAssignment = { assignmentId: 1, projectId: 1, employeeId: 1, cost: 100, assignedAt: '2024-01-01', finishedAt: null };
            assignmentService.getAssignmentById.mockResolvedValue(mockAssignment);
            req.params.id = 1;

            await AssignmentController.getAssignmentById(req, res);

            expect(res.statusCode).toBe(200);
            expect(res.jsonData).toEqual(mockAssignment);
            expect(assignmentService.getAssignmentById).toHaveBeenCalledWith(1);
        });

        it('should return 404 if assignment is not found', async () => {
            assignmentService.getAssignmentById.mockResolvedValue(null);
            req.params.id = 999;

            await AssignmentController.getAssignmentById(req, res);

            expect(res.statusCode).toBe(404);
            expect(res.jsonData).toEqual({ message: 'Assignment not found' });
        });
    });

    describe('createAssignment', () => {
        it('should create a new assignment with status 201', async () => {
            const mockAssignment = { assignmentId: 1, projectId: 1, employeeId: 1, cost: 100, assignedAt: '2024-01-01', finishedAt: null };
            assignmentService.createAssignment.mockResolvedValue(mockAssignment);
            req.body = { projectId: 1, employeeId: 1, cost: 100 };

            await AssignmentController.createAssignment(req, res);

            expect(res.statusCode).toBe(201);
            expect(res.jsonData).toEqual(mockAssignment);
            expect(assignmentService.createAssignment).toHaveBeenCalledWith(1, 1, 100);
        });
    });

    describe('updateAssignment', () => {
        it('should update the assignment with status 202 if found', async () => {
            const mockAssignment = { assignmentId: 1, projectId: 1, employeeId: 1, cost: 200, assignedAt: '2024-01-01', finishedAt: '2024-02-01' };
            assignmentService.updateAssignment.mockResolvedValue(mockAssignment);
            req.params.id = 1;
            req.body = { projectId: 1, employeeId: 1, cost: 200, assignedAt: '2024-01-01', finishedAt: '2024-02-01' };

            await AssignmentController.updateAssignment(req, res);

            expect(res.statusCode).toBe(202);
            expect(res.jsonData).toEqual(mockAssignment);
            expect(assignmentService.updateAssignment).toHaveBeenCalledWith(1, 1, 1, 200, '2024-01-01', '2024-02-01');
        });

        it('should return 404 if assignment is not found', async () => {
            assignmentService.updateAssignment.mockResolvedValue(null);
            req.params.id = 999;
            req.body = { projectId: 1, employeeId: 1, cost: 200, assignedAt: '2024-01-01', finishedAt: '2024-02-01' };

            await AssignmentController.updateAssignment(req, res);

            expect(res.statusCode).toBe(404);
            expect(res.jsonData).toEqual({ message: 'Assignment not found' });
        });
    });

    describe('deleteAssignment', () => {
        it('should delete the assignment and return status 204', async () => {
            assignmentService.deleteAssignment.mockResolvedValue();
            req.params.id = 1;

            await AssignmentController.deleteAssignment(req, res);

            expect(res.statusCode).toBe(204);
            expect(res.jsonData).toBeUndefined();
            expect(assignmentService.deleteAssignment).toHaveBeenCalledWith(1);
        });
    });
});
