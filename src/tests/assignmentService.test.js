const assignmentRepository = require('../repositories/assignmentRepository');
const AssignmentService = require('../services/assignmentService');
const Assignment = require('../models/assignment');

jest.mock('../repositories/assignmentRepository');

describe('AssignmentService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllAssignments', () => {
    it('should return all assignments', async () => {
      const mockAssignments = [
        new Assignment(1, 1, 1, 1000, '2023-09-01', null),
        new Assignment(2, 2, 2, 1500, '2023-08-15', '2023-09-05')
      ];

      assignmentRepository.findAll.mockResolvedValue(mockAssignments);

      const result = await AssignmentService.getAllAssignments();

      expect(assignmentRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockAssignments);
    });
  });

  describe('getAssignmentById', () => {
    it('should return an assignment if found', async () => {
      const mockAssignment = new Assignment(1, 1, 1, 1000, '2023-09-01', null);

      assignmentRepository.findById.mockResolvedValue(mockAssignment);

      const result = await AssignmentService.getAssignmentById(1);

      expect(assignmentRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockAssignment);
    });

    it('should return null if assignment is not found', async () => {
      assignmentRepository.findById.mockResolvedValue(null);

      const result = await AssignmentService.getAssignmentById(1);

      expect(assignmentRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toBeNull();
    });
  });

  describe('createAssignment', () => {
    it('should create and return a new assignment', async () => {
      const mockAssignment = new Assignment(1, 1, 1, 1000, '2023-09-01', null);

      assignmentRepository.create.mockResolvedValue(mockAssignment);

      const result = await AssignmentService.createAssignment(1, 1, 1000);

      expect(assignmentRepository.create).toHaveBeenCalledWith(1, 1, 1000);
      expect(result).toEqual(mockAssignment);
    });
  });

  describe('updateAssignment', () => {
    it('should update and return the assignment', async () => {
      const mockAssignment = new Assignment(1, 1, 1, 1200, '2023-09-01', '2023-09-10');

      assignmentRepository.update.mockResolvedValue(mockAssignment);

      const result = await AssignmentService.updateAssignment(1, 1, 1, 1200, '2023-09-01', '2023-09-10');

      expect(assignmentRepository.update).toHaveBeenCalledWith(1, 1, 1, 1200, '2023-09-01', '2023-09-10');
      expect(result).toEqual(mockAssignment);
    });
  });

  describe('deleteAssignment', () => {
    it('should delete the assignment', async () => {
      assignmentRepository.delete.mockResolvedValue();

      await AssignmentService.deleteAssignment(1);

      expect(assignmentRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
