const projectService = require('../services/projectService');
const projectRepository = require('../repositories/projectRepository');
const Project = require('../models/project');

jest.mock('../repositories/projectRepository');

describe('ProjectService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProjects', () => {
    it('should return all projects', async () => {
      const mockProjects = [
        new Project(1, 'Project 1', 1, 'Description 1', 'active'),
        new Project(2, 'Project 2', 2, 'Description 2', 'completed')
      ];

      projectRepository.findAll.mockResolvedValue(mockProjects);

      const projects = await projectService.getAllProjects();
      expect(projectRepository.findAll).toHaveBeenCalled();
      expect(projects).toEqual(mockProjects);
    });
  });

  describe('getProjectById', () => {
    it('should return the project if found', async () => {
      const mockProject = new Project(1, 'Project 1', 1, 'Description 1', 'active');

      projectRepository.findById.mockResolvedValue(mockProject);

      const project = await projectService.getProjectById(1);
      expect(projectRepository.findById).toHaveBeenCalledWith(1);
      expect(project).toEqual(mockProject);
    });

    it('should return null if project is not found', async () => {
      projectRepository.findById.mockResolvedValue(null);

      const project = await projectService.getProjectById(1);
      expect(projectRepository.findById).toHaveBeenCalledWith(1);
      expect(project).toBeNull();
    });
  });

  describe('createProject', () => {
    it('should create and return a new project', async () => {
      const mockProject = new Project(1, 'Project 1', 1, 'Description 1', 'active');

      projectRepository.create.mockResolvedValue(mockProject);

      const project = await projectService.createProject('Project 1', 1, 'Description 1', 'active');
      expect(projectRepository.create).toHaveBeenCalledWith('Project 1', 1, 'Description 1', 'active');
      expect(project).toEqual(mockProject);
    });
  });

  describe('updateProject', () => {
    it('should update and return the project', async () => {
      const mockProject = new Project(1, 'Updated Project', 1, 'Updated Description', 'active');

      projectRepository.update.mockResolvedValue(mockProject);

      const project = await projectService.updateProject(1, 'Updated Project', 1, 'Updated Description', 'active');
      expect(projectRepository.update).toHaveBeenCalledWith(1, 'Updated Project', 1, 'Updated Description', 'active');
      expect(project).toEqual(mockProject);
    });
  });

  describe('deleteProject', () => {
    it('should delete a project', async () => {
      projectRepository.delete.mockResolvedValue();

      await projectService.deleteProject(1);
      expect(projectRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
