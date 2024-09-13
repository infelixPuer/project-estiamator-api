const db = require('../db/postgres');
const EmployeeRepository = require('../repositories/employeeRepository');
const Employee = require('../models/employee');

jest.mock('../db/postgres', () => ({
    query: jest.fn()
}));

describe('EmployeeRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return a list of employees', async () => {
            const mockRows = [
                { employee_id: 1, first_name: 'Alice', last_name: 'Smith', email: 'alice@example.com', is_available: true, role: 'developer' },
                { employee_id: 2, first_name: 'Bob', last_name: 'Johnson', email: 'bob@example.com', is_available: false, role: 'designer' }
            ];
            db.query.mockResolvedValue({ rows: mockRows });

            const employees = await EmployeeRepository.findAll();

            expect(employees).toEqual(mockRows.map(row => new Employee(row.employee_id, row.first_name, row.last_name, row.email, row.is_available, row.role)));
        });

        it('should handle database errors', async () => {
            db.query.mockRejectedValueOnce(new Error('Database error'));

            await expect(EmployeeRepository.findAll()).rejects.toThrow('Database error');
        });
    });

    describe('findById', () => {
        it('should return an employee if found', async () => {
            const mockRow = { employee_id: 1, first_name: 'Alice', last_name: 'Smith', email: 'alice@example.com', is_available: true, role: 'developer' };
            db.query.mockResolvedValue({ rows: [mockRow] });

            const employee = await EmployeeRepository.findById(1);

            expect(employee).toEqual(new Employee(mockRow.employee_id, mockRow.first_name, mockRow.last_name, mockRow.email, mockRow.is_available, mockRow.role));
        });

        it('should return null if employee is not found', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const employee = await EmployeeRepository.findById(999);

            expect(employee).toBeNull();
        });

        it('should handle database errors', async () => {
            db.query.mockRejectedValueOnce(new Error('Database error'));

            await expect(EmployeeRepository.findById(1)).rejects.toThrow('Database error');
        });
    });
    describe('create', () => {
        it('should create an employee and return it', async () => {
            const mockRow = { employee_id: 1, first_name: 'Alice', last_name: 'Smith', email: 'alice@example.com', is_available: true, role: 'developer' };
            db.query.mockResolvedValue({ rows: [mockRow] });

            const employee = await EmployeeRepository.create('Alice', 'Smith', 'alice@example.com', true, 'developer');

            expect(employee).toEqual(new Employee(mockRow.employee_id, mockRow.first_name, mockRow.last_name, mockRow.email, mockRow.is_available, mockRow.role));
        });

        it('should handle database errors', async () => {
            db.query.mockRejectedValue(new Error('Database error'));

            await expect(EmployeeRepository.create('Alice', 'Smith', 'alice@example.com', true, 'developer')).rejects.toThrow('Database error');
        });
    });

    describe('update', () => {
        it('should update an employee and return it if found', async () => {
            const mockRow = { employee_id: 1, first_name: 'Alice', last_name: 'Smith', email: 'alice@example.com', is_available: true, role: 'developer' };
            db.query.mockResolvedValue({ rows: [mockRow] });

            const employee = await EmployeeRepository.update(1, 'Alice', 'Smith', 'alice@example.com', true, 'developer');

            expect(employee).toEqual(new Employee(mockRow.employee_id, mockRow.first_name, mockRow.last_name, mockRow.email, mockRow.is_available, mockRow.role));
        });

        it('should return null if employee is not found', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const employee = await EmployeeRepository.update(999, 'Alice', 'Smith', 'alice@example.com', true, 'developer');

            expect(employee).toBeNull();
        });

        it('should handle database errors', async () => {
            db.query.mockRejectedValueOnce(new Error('Database error'));

            await expect(EmployeeRepository.update(1, 'Alice', 'Smith', 'alice@example.com', true, 'developer')).rejects.toThrow('Database error');
        });
    });

    describe('delete', () => {
        it('should delete an employee successfully', async () => {
            db.query.mockResolvedValue({ rows: [] }); // Simulate a successful delete

            await EmployeeRepository.delete(1);

            expect(db.query).toHaveBeenCalledWith('DELETE FROM employees WHERE employee_id = $1', [1]);
        });

        it('should handle database errors', async () => {
            db.query.mockRejectedValueOnce(new Error('Database error'));

            await expect(EmployeeRepository.delete(1)).rejects.toThrow('Database error');
        });
    });
});
