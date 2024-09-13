const employeeService = require('../services/employeeService');
const employeeRepository = require('../repositories/employeeRepository');

jest.mock('../repositories/employeeRepository');

describe('EmployeeService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllEmployees', () => {
        it('should return a list of employees', async () => {
            const mockEmployees = [
                { employee_id: 1, first_name: 'Alice', last_name: 'Smith', email: 'alice@example.com', is_available: true, role: 'developer' },
                { employee_id: 2, first_name: 'Bob', last_name: 'Johnson', email: 'bob@example.com', is_available: false, role: 'designer' }
            ];
            employeeRepository.findAll.mockResolvedValue(mockEmployees);

            const employees = await employeeService.getAllEmployees();

            expect(employees).toEqual(mockEmployees);
        });

        it('should handle repository errors', async () => {
            employeeRepository.findAll.mockRejectedValueOnce(new Error('Repository error'));

            await expect(employeeService.getAllEmployees()).rejects.toThrow('Repository error');
        });
    });

    describe('getEmployeeById', () => {
        it('should return an employee if found', async () => {
            const mockEmployee = { employee_id: 1, first_name: 'Alice', last_name: 'Smith', email: 'alice@example.com', is_available: true, role: 'developer' };
            employeeRepository.findById.mockResolvedValue(mockEmployee);

            const employee = await employeeService.getEmployeeById(1);

            expect(employee).toEqual(mockEmployee);
        });

        it('should return null if employee is not found', async () => {
            employeeRepository.findById.mockResolvedValue(null);

            const employee = await employeeService.getEmployeeById(999);

            expect(employee).toBeNull();
        });

        it('should handle repository errors', async () => {
            employeeRepository.findById.mockRejectedValueOnce(new Error('Repository error'));

            await expect(employeeService.getEmployeeById(1)).rejects.toThrow('Repository error');
        });
    });

    describe('createEmployee', () => {
        it('should create an employee and return it', async () => {
            const mockEmployee = { employee_id: 1, first_name: 'Alice', last_name: 'Smith', email: 'alice@example.com', is_available: true, role: 'developer' };
            employeeRepository.create.mockResolvedValue(mockEmployee);

            const employee = await employeeService.createEmployee('Alice', 'Smith', 'alice@example.com', true, 'developer');

            expect(employee).toEqual(mockEmployee);
        });

        it('should handle repository errors', async () => {
            employeeRepository.create.mockRejectedValueOnce(new Error('Repository error'));

            await expect(employeeService.createEmployee('Alice', 'Smith', 'alice@example.com', true, 'developer')).rejects.toThrow('Repository error');
        });
    });

    describe('updateEmployee', () => {
        it('should update an employee and return it if found', async () => {
            const mockEmployee = { employee_id: 1, first_name: 'Alice', last_name: 'Smith', email: 'alice@example.com', is_available: true, role: 'developer' };
            employeeRepository.update.mockResolvedValue(mockEmployee);

            const employee = await employeeService.updateEmployee(1, 'Alice', 'Smith', 'alice@example.com', true, 'developer');

            expect(employee).toEqual(mockEmployee);
        });

        it('should return null if employee is not found', async () => {
            employeeRepository.update.mockResolvedValue(null);

            const employee = await employeeService.updateEmployee(999, 'Alice', 'Smith', 'alice@example.com', true, 'developer');

            expect(employee).toBeNull();
        });

        it('should handle repository errors', async () => {
            employeeRepository.update.mockRejectedValueOnce(new Error('Repository error'));

            await expect(employeeService.updateEmployee(1, 'Alice', 'Smith', 'alice@example.com', true, 'developer')).rejects.toThrow('Repository error');
        });
    });

    describe('deleteEmployee', () => {
        it('should delete an employee successfully', async () => {
            employeeRepository.delete.mockResolvedValue();

            await employeeService.deleteEmployee(1);

            expect(employeeRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should handle repository errors', async () => {
            employeeRepository.delete.mockRejectedValueOnce(new Error('Repository error'));

            await expect(employeeService.deleteEmployee(1)).rejects.toThrow('Repository error');
        });
    });
});
