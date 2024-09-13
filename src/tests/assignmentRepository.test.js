const db = require('../db/postgres');
const AssignmentRepository = require('../repositories/assignmentRepository');
const Assignment = require('../models/assignment');

jest.mock('../db/postgres');

describe('AssignmentRepository', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all assignments', async () => {
      const mockAssignments = [
        { assignment_id: 1, project_id: 1, employee_id: 1, cost: 1000, assigned_at: '2023-09-01', finished_at: null },
        { assignment_id: 2, project_id: 2, employee_id: 2, cost: 1500, assigned_at: '2023-08-15', finished_at: '2023-09-05' }
      ];

      db.query.mockResolvedValue({ rows: mockAssignments });

      const result = await AssignmentRepository.findAll();

      expect(db.query).toHaveBeenCalledWith('SELECT * FROM assignments');
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Assignment);
      expect(result[0]).toEqual(new Assignment(1, 1, 1, 1000, '2023-09-01', null));
    });
  });

  describe('findById', () => {
    it('should return an assignment if found', async () => {
      const mockAssignment = { assignment_id: 1, project_id: 1, employee_id: 1, cost: 1000, assigned_at: '2023-09-01', finished_at: null };

      db.query.mockResolvedValue({ rows: [mockAssignment] });

      const result = await AssignmentRepository.findById(1);

      expect(db.query).toHaveBeenCalledWith('SELECT * FROM assignments WHERE assignment_id = $1', [1]);
      expect(result).toBeInstanceOf(Assignment);
      expect(result).toEqual(new Assignment(1, 1, 1, 1000, '2023-09-01', null));
    });

    it('should return null if assignment is not found', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await AssignmentRepository.findById(1);

      expect(db.query).toHaveBeenCalledWith('SELECT * FROM assignments WHERE assignment_id = $1', [1]);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new assignment and return it', async () => {
      const mockAssignment = {
        assignment_id: 1,
        project_id: 1,
        employee_id: 1,
        cost: 1000,
        assigned_at: '2023-09-01',
        finished_at: null
      };

      db.query.mockResolvedValue({ rows: [mockAssignment] });

      const result = await AssignmentRepository.create(1, 1, 1000);

      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO assignments (project_id, employee_id, cost) VALUES $1, $2, $3 RETURNING *',
        [1, 1, 1000]
      );
      expect(result).toBeInstanceOf(Assignment);
      expect(result).toEqual(new Assignment(1, 1, 1, 1000, '2023-09-01', null));
    });
  });

  describe('update', () => {
    it('should update an assignment and return it', async () => {
      const mockAssignment = {
        assignment_id: 1,
        project_id: 1,
        employee_id: 1,
        cost: 1200,
        assigned_at: '2023-09-01',
        finished_at: '2023-09-10'
      };

      db.query.mockResolvedValue({ rows: [mockAssignment] });

      const result = await AssignmentRepository.update(1, 1, 1, 1200, '2023-09-01', '2023-09-10');

      expect(db.query).toHaveBeenCalledWith(
        'UPDATE assignments SET project_id = $1, employee_id = $2, cost = $3, assigned_at = $4, finished_at = $5 WHERE assignment_id = $6 RETURNING *',
        [1, 1, 1200, '2023-09-01', '2023-09-10', 1]
      );
      expect(result).toBeInstanceOf(Assignment);
      expect(result).toEqual(new Assignment(1, 1, 1, 1200, '2023-09-01', '2023-09-10'));
    });
  });

  describe('delete', () => {
    it('should delete an assignment', async () => {
      db.query.mockResolvedValue();

      await AssignmentRepository.delete(1);

      expect(db.query).toHaveBeenCalledWith('DELETE FROM assignments WHERE assignment_id = $1', [1]);
    });
  });
});
