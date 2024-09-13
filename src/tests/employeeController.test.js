const EmployeeController = require('../controllers/employeeController');
const employeeService = require('../services/employeeService');

jest.mock('../services/employeeService');

describe('EmployeeController', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };
  });

  describe('getAllEmployees', () => {
    it('should return all employees with status 200', async () => {
      const employees = [{ id: 1, firstName: 'John', lastName: 'Doe' }];
      employeeService.getAllEmployees.mockResolvedValue(employees);

      await EmployeeController.getAllEmployees(req, res);

      expect(employeeService.getAllEmployees).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(employees);
    });
  });

  describe('getEmployeeById', () => {
    it('should return an employee with status 200', async () => {
      const employee = { id: 1, firstName: 'John', lastName: 'Doe' };
      req.params.id = 1;
      employeeService.getEmployeeById.mockResolvedValue(employee);

      await EmployeeController.getEmployeeById(req, res);

      expect(employeeService.getEmployeeById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(employee);
    });

    it('should return 404 if employee not found', async () => {
      req.params.id = 999;
      employeeService.getEmployeeById.mockResolvedValue(null);

      await EmployeeController.getEmployeeById(req, res);

      expect(employeeService.getEmployeeById).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Employee not found' });
    });
  });

  describe('createEmployee', () => {
    it('should create an employee and return status 201', async () => {
      const newEmployee = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', isAvailable: true, role: 'Manager' };
      req.body = newEmployee;
      employeeService.createEmployee.mockResolvedValue(newEmployee);

      await EmployeeController.createEmployee(req, res);

      expect(employeeService.createEmployee).toHaveBeenCalledWith('John', 'Doe', 'john@example.com', true, 'Manager');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newEmployee);
    });
  });

  describe('updateEmployee', () => {
    it('should update an employee and return status 202', async () => {
      const updatedEmployee = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', isAvailable: true, role: 'Manager' };
      req.params.id = 1;
      req.body = updatedEmployee;
      employeeService.updateEmployee.mockResolvedValue(updatedEmployee);

      await EmployeeController.updateEmployee(req, res);

      expect(employeeService.updateEmployee).toHaveBeenCalledWith(1, 'John', 'Doe', 'john@example.com', true, 'Manager');
      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.json).toHaveBeenCalledWith(updatedEmployee);
    });

    it('should return 404 if employee not found for update', async () => {
      req.params.id = 999;
      req.body = { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', isAvailable: false, role: 'Engineer' };
      employeeService.updateEmployee.mockResolvedValue(null);

      await EmployeeController.updateEmployee(req, res);

      expect(employeeService.updateEmployee).toHaveBeenCalledWith(999, 'Jane', 'Doe', 'jane@example.com', false, 'Engineer');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Employee not found' });
    });
  });

  describe('deleteEmployee', () => {
    it('should delete an employee and return status 204', async () => {
      req.params.id = 1;
      employeeService.deleteEmployee.mockResolvedValue();

      await EmployeeController.deleteEmployee(req, res);

      expect(employeeService.deleteEmployee).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });
});
