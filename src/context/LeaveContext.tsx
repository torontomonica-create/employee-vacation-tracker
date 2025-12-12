import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LeaveRequest, Notification } from '../types';
import { initialUsers, initialLeaveRequests } from '../data/mockData';

// Simple ID generator if we don't want to install uuid
const generateId = () => Math.random().toString(36).substr(2, 9);

interface LeaveContextType {
    currentUser: User | null;
    users: User[];
    leaveRequests: LeaveRequest[];
    notifications: Notification[];
    login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    setUserAsFirstLoginDone: (userId: string, newPassword: string) => void;
    addUser: (user: Omit<User, 'id' | 'password' | 'isFirstLogin' | 'usedLeaveDays'>) => void;
    removeUser: (userId: string) => void;
    addLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'status' | 'requestedAt'>) => void;
    updateLeaveRequestStatus: (requestId: string, status: 'Approved' | 'Rejected', adminId: string, comment?: string) => void;
    addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
    removeNotification: (id: string) => void;
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

export const useLeave = () => {
    const context = useContext(LeaveContext);
    if (!context) {
        throw new Error('useLeave must be used within a LeaveProvider');
    }
    return context;
};

export const LeaveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize state from localStorage or mock data
    const [users, setUsers] = useState<User[]>(() => {
        const stored = localStorage.getItem('users');
        return stored ? JSON.parse(stored) : initialUsers;
    });

    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
        const stored = localStorage.getItem('leaveRequests');
        return stored ? JSON.parse(stored) : initialLeaveRequests;
    });

    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const stored = localStorage.getItem('currentUser');
        return stored ? JSON.parse(stored) : null;
    });

    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Persist to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem('users', JSON.stringify(users));
    }, [users]);

    useEffect(() => {
        localStorage.setItem('leaveRequests', JSON.stringify(leaveRequests));
    }, [leaveRequests]);

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    }, [currentUser]);

    const addNotification = (message: string, type: 'success' | 'error' | 'info') => {
        const id = generateId();
        setNotifications((prev) => [...prev, { id, message, type }]);
        // Auto remove after 5 seconds
        setTimeout(() => {
            removeNotification(id);
        }, 5000);
    };

    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const login = async (email: string, password?: string) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        // In a real app, we would hash/check password securely.
        // For mock, if password is provided, check it. (Google Login might skip password check here or use different flow)
        if (password && user.password !== password) {
            return { success: false, message: 'Invalid password' };
        }

        setCurrentUser(user);
        addNotification(`Welcome back, ${user.name}`, 'success');
        return { success: true };
    };

    const logout = () => {
        setCurrentUser(null);
        addNotification('Logged out successfully', 'info');
    };

    const setUserAsFirstLoginDone = (userId: string, newPassword: string) => {
        setUsers((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, password: newPassword, isFirstLogin: false } : u))
        );
        // Update current user if it's them
        if (currentUser && currentUser.id === userId) {
            setCurrentUser((prev) => prev ? { ...prev, password: newPassword, isFirstLogin: false } : null);
        }
    };

    const addUser = (userData: Omit<User, 'id' | 'password' | 'isFirstLogin' | 'usedLeaveDays'>) => {
        const tempPassword = Math.random().toString(36).slice(-8);
        const newUser: User = {
            ...userData,
            id: generateId(),
            password: tempPassword,
            isFirstLogin: true,
            usedLeaveDays: 0
        };
        setUsers(prev => [...prev, newUser]);
        addNotification(`User ${newUser.name} added. Temp password: ${tempPassword}`, 'success');
    };

    const removeUser = (userId: string) => {
        if (currentUser?.id === userId) {
            addNotification("You cannot delete yourself", 'error');
            return;
        }
        setUsers(prev => prev.filter(u => u.id !== userId));
        addNotification("User removed", 'success');
    };

    const addLeaveRequest = (requestData: Omit<LeaveRequest, 'id' | 'status' | 'requestedAt'>) => {
        const newRequest: LeaveRequest = {
            ...requestData,
            id: generateId(),
            status: 'Pending',
            requestedAt: new Date().toISOString()
        };
        setLeaveRequests(prev => [...prev, newRequest]);
        addNotification("Leave request submitted", 'success');
    };

    const updateLeaveRequestStatus = (requestId: string, status: 'Approved' | 'Rejected', adminId: string, comment?: string) => {
        setLeaveRequests(prev => prev.map(req => {
            if (req.id === requestId) {
                const updatedReq = { ...req, status, decidedBy: adminId, adminComment: comment };

                // If approved, update user balance
                if (status === 'Approved') {
                    setUsers(currentUsers => currentUsers.map(u => {
                        if (u.id === req.employeeId) {
                            return { ...u, usedLeaveDays: u.usedLeaveDays + req.daysRequested };
                        }
                        return u;
                    }));
                }
                return updatedReq;
            }
            return req;
        }));
        addNotification(`Request ${status}`, status === 'Approved' ? 'success' : 'info');
    };

    return (
        <LeaveContext.Provider
            value={{
                currentUser,
                users,
                leaveRequests,
                notifications,
                login,
                logout,
                setUserAsFirstLoginDone,
                addUser,
                removeUser,
                addLeaveRequest,
                updateLeaveRequestStatus,
                addNotification,
                removeNotification,
            }}
        >
            {children}
        </LeaveContext.Provider>
    );
};
