const projectController = require('../controllers/projectController');
const projectService = require('../services/projectService');

jest.mock('../services/projectService');

describe('ProjectController', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe('getAllProjects', () => {
    it('should return all projects', async () => {
      const mockProjects = [
        { project_id: 1, title: 'Project 1', user_id: 1, description: 'Description 1', status: 'active' },
        { project_id: 2, title: 'Project 2', user_id: 2, description: 'Description 2', status: 'completed' },
      ];

      projectService.getAllProjects.mockResolvedValue(mockProjects);

      await projectController.getAllProjects(req, res);

      expect(projectService.getAllProjects).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProjects);
    });
  });

  describe('getProjectById', () => {
    it('should return the project if found', async () => {
      req.params = { id: '1' };
      const mockProject = { project_id: 1, title: 'Project 1', user_id: 1, description: 'Description 1', status: 'active' };

      projectService.getProjectById.mockResolvedValue(mockProject);

      await projectController.getProjectById(req, res);

      expect(projectService.getProjectById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProject);
    });

    it('should return 404 if the project is not found', async () => {
      req.params = { id: '1' };

      projectService.getProjectById.mockResolvedValue(null);

      await projectController.getProjectById(req, res);

      expect(projectService.getProjectById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Project not found' });
    });
  });

  describe('createProject', () => {
    it('should create and return a new project', async () => {
      req.body = { title: 'Project 1', userId: 1, description: 'Description 1', status: 'active' };
      const mockProject = { project_id: 1, title: 'Project 1', user_id: 1, description: 'Description 1', status: 'active' };

      projectService.createProject.mockResolvedValue(mockProject);

      await projectController.createProject(req, res);

      expect(projectService.createProject).toHaveBeenCalledWith('Project 1', 1, 'Description 1', 'active');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockProject);
    });
  });

  describe('updateProject', () => {
    it('should update and return the project', async () => {
      req.params = { id: '1' };
      req.body = { title: 'Updated Project', userId: 1, description: 'Updated Description', status: 'active' };
      const mockProject = { project_id: 1, title: 'Updated Project', user_id: 1, description: 'Updated Description', status: 'active' };

      projectService.updateProject.mockResolvedValue(mockProject);

      await projectController.updateProject(req, res);

      expect(projectService.updateProject).toHaveBeenCalledWith('1', 'Updated Project', 1, 'Updated Description', 'active');
      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.json).toHaveBeenCalledWith(mockProject);
    });

    it('should return 404 if the project is not found', async () => {
      req.params = { id: '1' };
      req.body = { title: 'Updated Project', userId: 1, description: 'Updated Description', status: 'active' };

      projectService.updateProject.mockResolvedValue(null);

      await projectController.updateProject(req, res);

      expect(projectService.updateProject).toHaveBeenCalledWith('1', 'Updated Project', 1, 'Updated Description', 'active');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Project not found' });
    });
  });

  describe('deleteProject', () => {
    it('should delete the project', async () => {
      req.params = { id: '1' };

      projectService.deleteProject.mockResolvedValue();

      await projectController.deleteProject(req, res);

      expect(projectService.deleteProject).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });
});
