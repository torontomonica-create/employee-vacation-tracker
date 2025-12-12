import { User, LeaveRequest } from '../types';

export const initialUsers: User[] = [
    {
        id: '1',
        name: 'Admin User',
        email: 'admin@company.com',
        role: 'Admin',
        password: 'password123',
        hireDate: '2020-01-01',
        totalAnnualLeaveDays: 25,
        usedLeaveDays: 0,
        isFirstLogin: false,
    },
    {
        id: '2',
        name: 'John Employee',
        email: 'employee@company.com',
        role: 'Employee',
        password: 'password123',
        hireDate: '2022-05-15',
        totalAnnualLeaveDays: 20,
        usedLeaveDays: 5,
        isFirstLogin: false,
    },
    {
        id: '3',
        name: 'Jane New hire',
        email: 'jane@company.com',
        role: 'Employee',
        password: 'temp',
        hireDate: '2023-11-20',
        totalAnnualLeaveDays: 20,
        usedLeaveDays: 0,
        isFirstLogin: true,
    },
];

export const initialLeaveRequests: LeaveRequest[] = [
    {
        id: 'req-1',
        employeeId: '2',
        startDate: '2024-06-10',
        endDate: '2024-06-12',
        daysRequested: 3,
        type: 'Annual',
        reason: 'Summer vacation',
        status: 'Approved',
        requestedAt: '2024-01-10',
        decidedBy: '1',
    },
    {
        id: 'req-2',
        employeeId: '2',
        startDate: '2024-08-01',
        endDate: '2024-08-02',
        daysRequested: 2,
        type: 'Sick',
        reason: 'Flu',
        status: 'Pending',
        requestedAt: '2024-07-30',
    },
];
