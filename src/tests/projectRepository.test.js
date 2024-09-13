const db = require('../db/postgres.js');
const ProjectRepository = require('../repositories/projectRepository.js');
const Project = require('../models/project.js');

jest.mock('../db/postgres.js');

describe('ProjectRepository', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of projects', async () => {
      const mockProjects = [
        { project_id: 1, title: 'Project 1', user_id: 1, description: 'Description 1', status: 'active' },
        { project_id: 2, title: 'Project 2', user_id: 2, description: 'Description 2', status: 'completed' },
      ];

      db.query.mockResolvedValueOnce({ rows: mockProjects });

      const projects = await ProjectRepository.findAll();
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM projects');
      expect(projects).toEqual([
        new Project(1, 'Project 1', 1, 'Description 1', 'active'),
        new Project(2, 'Project 2', 2, 'Description 2', 'completed'),
      ]);
    });
  });

  describe('findById', () => {
    it('should return a project if found', async () => {
      const mockProject = { project_id: 1, title: 'Project 1', user_id: 1, description: 'Description 1', status: 'active' };

      db.query.mockResolvedValueOnce({ rows: [mockProject] });

      const project = await ProjectRepository.findById(1);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM projects WHERE project_id = $1', [1]);
      expect(project).toEqual(new Project(1, 'Project 1', 1, 'Description 1', 'active'));
    });

    it('should return null if no project is found', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const project = await ProjectRepository.findById(1);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM projects WHERE project_id = $1', [1]);
      expect(project).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return a new project', async () => {
      const mockProject = { project_id: 1, title: 'Project 1', user_id: 1, description: 'Description 1', status: 'active' };

      db.query.mockResolvedValueOnce({ rows: [mockProject] });

      const project = await ProjectRepository.create('Project 1', 1, 'Description 1', 'active');
      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO projects (title, user_id, description, status) VALUES $1, $2, $3, $4 RETURNING *',
        ['Project 1', 1, 'Description 1', 'active']
      );
      expect(project).toEqual(new Project(1, 'Project 1', 1, 'Description 1', 'active'));
    });
  });

  describe('update', () => {
    it('should update and return the project', async () => {
      const mockProject = { project_id: 1, title: 'Updated Project', user_id: 1, description: 'Updated Description', status: 'active' };

      db.query.mockResolvedValueOnce({ rows: [mockProject] });

      const project = await ProjectRepository.update(1, 'Updated Project', 1, 'Updated Description', 'active');
      expect(db.query).toHaveBeenCalledWith(
        'UPDATE projects SET title = $1, user_id = $2, description = $3, status = $4 RETURNING *',
        ['Updated Project', 1, 'Updated Description', 'active', 1]
      );
      expect(project).toEqual(new Project(1, 'Updated Project', 1, 'Updated Description', 'active'));
    });
  });

  describe('delete', () => {
    it('should delete a project', async () => {
      db.query.mockResolvedValueOnce({});

      await ProjectRepository.delete(1);
      expect(db.query).toHaveBeenCalledWith('DELETE FROM projects WHERE project_id = $1', [1]);
    });
  });
});
