export type UserRole = 'Admin' | 'Employee';

export type LeaveType = 'Annual' | 'Sick' | 'Unpaid' | 'Other';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    password?: string; // Optional for safety in frontend, though we mock it
    hireDate: string;
    totalAnnualLeaveDays: number;
    usedLeaveDays: number;
    isFirstLogin: boolean;
}

export interface LeaveRequest {
    id: string;
    employeeId: string;
    startDate: string;
    endDate: string;
    daysRequested: number;
    type: LeaveType;
    reason: string;
    status: LeaveStatus;
    requestedAt: string;
    decidedBy?: string; // Admin ID
    adminComment?: string;
}

export interface Notification {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}
