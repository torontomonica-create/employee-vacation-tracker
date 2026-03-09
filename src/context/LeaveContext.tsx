import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, LeaveRequest, Notification } from '../types';
import { supabase, supabaseNoSession } from '../lib/supabase';

const generateId = () => Math.random().toString(36).substr(2, 9);

interface LeaveContextType {
    currentUser: User | null;
    users: User[];
    leaveRequests: LeaveRequest[];
    notifications: Notification[];
    loading: boolean;
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
    if (!context) throw new Error('useLeave must be used within a LeaveProvider');
    return context;
};

// Map Supabase profile row -> app User type
const mapProfile = (p: Record<string, unknown>): User => ({
    id: p.id as string,
    name: p.name as string,
    email: p.email as string,
    role: p.role as 'Admin' | 'Employee',
    hireDate: p.hire_date as string,
    totalAnnualLeaveDays: p.total_annual_leave_days as number,
    usedLeaveDays: p.used_leave_days as number,
    isFirstLogin: p.is_first_login as boolean,
});

// Map Supabase leave_request row -> app LeaveRequest type
const mapLeaveRequest = (r: Record<string, unknown>): LeaveRequest => ({
    id: r.id as string,
    employeeId: r.employee_id as string,
    startDate: r.start_date as string,
    endDate: r.end_date as string,
    daysRequested: r.days_requested as number,
    type: r.type as LeaveRequest['type'],
    reason: (r.reason as string) ?? '',
    status: r.status as LeaveRequest['status'],
    requestedAt: r.requested_at as string,
    decidedBy: r.decided_by as string | undefined,
    adminComment: r.admin_comment as string | undefined,
});

export const LeaveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const addNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
        const id = generateId();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
    }, []);

    const removeNotification = (id: string) =>
        setNotifications(prev => prev.filter(n => n.id !== id));

    const loadData = useCallback(async () => {
        const [{ data: profiles }, { data: requests }] = await Promise.all([
            supabase.from('profiles').select('*'),
            supabase.from('leave_requests').select('*'),
        ]);
        if (profiles) setUsers(profiles.map(p => mapProfile(p as Record<string, unknown>)));
        if (requests) setLeaveRequests(requests.map(r => mapLeaveRequest(r as Record<string, unknown>)));
    }, []);

    // On mount: restore existing session
    useEffect(() => {
        (async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                if (profile) {
                    setCurrentUser(mapProfile(profile as Record<string, unknown>));
                    await loadData();
                }
            }
            setLoading(false);
        })();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                setCurrentUser(null);
                setUsers([]);
                setLeaveRequests([]);
            }
        });
        return () => subscription.unsubscribe();
    }, [loadData]);

    const login = async (email: string, password?: string) => {
        if (!password) return { success: false, message: 'Password required' };
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user) return { success: false, message: error?.message ?? 'Login failed' };

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
        if (!profile) return { success: false, message: 'Profile not found' };

        const user = mapProfile(profile as Record<string, unknown>);
        setCurrentUser(user);
        await loadData();
        addNotification(`Welcome back, ${user.name}`, 'success');
        return { success: true };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
        addNotification('Logged out successfully', 'info');
    };

    const setUserAsFirstLoginDone = async (userId: string, newPassword: string) => {
        await supabase.auth.updateUser({ password: newPassword });
        await supabase.from('profiles').update({ is_first_login: false }).eq('id', userId);
        setCurrentUser(prev => prev ? { ...prev, isFirstLogin: false } : null);
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isFirstLogin: false } : u));
    };

    const addUser = async (userData: Omit<User, 'id' | 'password' | 'isFirstLogin' | 'usedLeaveDays'>) => {
        const tempPassword = Math.random().toString(36).slice(-8);
        // Use no-session client so the admin's own session is not replaced
        const { data, error } = await supabaseNoSession.auth.signUp({
            email: userData.email,
            password: tempPassword,
            options: {
                data: {
                    name: userData.name,
                    role: userData.role,
                    hire_date: userData.hireDate,
                    total_annual_leave_days: userData.totalAnnualLeaveDays,
                },
            },
        });
        if (error || !data.user) {
            addNotification(error?.message ?? 'Failed to create user', 'error');
            return;
        }
        await loadData();
        addNotification(`User ${userData.name} added. Temp password: ${tempPassword}`, 'success');
    };

    const removeUser = async (userId: string) => {
        if (currentUser?.id === userId) {
            addNotification('You cannot delete yourself', 'error');
            return;
        }
        await supabase.from('profiles').delete().eq('id', userId);
        setUsers(prev => prev.filter(u => u.id !== userId));
        addNotification('User removed', 'success');
    };

    const addLeaveRequest = async (requestData: Omit<LeaveRequest, 'id' | 'status' | 'requestedAt'>) => {
        const { data, error } = await supabase.from('leave_requests').insert({
            employee_id: requestData.employeeId,
            start_date: requestData.startDate,
            end_date: requestData.endDate,
            days_requested: requestData.daysRequested,
            type: requestData.type,
            reason: requestData.reason,
            status: 'Pending',
        }).select().single();
        if (error || !data) {
            addNotification('Failed to submit request', 'error');
            return;
        }
        setLeaveRequests(prev => [...prev, mapLeaveRequest(data as Record<string, unknown>)]);
        addNotification('Leave request submitted', 'success');
    };

    const updateLeaveRequestStatus = async (
        requestId: string,
        status: 'Approved' | 'Rejected',
        adminId: string,
        comment?: string,
    ) => {
        const { data, error } = await supabase
            .from('leave_requests')
            .update({ status, decided_by: adminId, admin_comment: comment })
            .eq('id', requestId)
            .select()
            .single();
        if (error || !data) {
            addNotification('Failed to update request', 'error');
            return;
        }
        const updated = mapLeaveRequest(data as Record<string, unknown>);
        setLeaveRequests(prev => prev.map(r => r.id === requestId ? updated : r));

        // If approved, increment employee's used_leave_days in DB
        if (status === 'Approved') {
            const req = leaveRequests.find(r => r.id === requestId);
            if (req) {
                const employee = users.find(u => u.id === req.employeeId);
                if (employee) {
                    const newUsed = employee.usedLeaveDays + req.daysRequested;
                    await supabase.from('profiles').update({ used_leave_days: newUsed }).eq('id', employee.id);
                    setUsers(prev => prev.map(u => u.id === employee.id ? { ...u, usedLeaveDays: newUsed } : u));
                    if (currentUser?.id === employee.id) {
                        setCurrentUser(prev => prev ? { ...prev, usedLeaveDays: newUsed } : null);
                    }
                }
            }
        }
        addNotification(`Request ${status}`, status === 'Approved' ? 'success' : 'info');
    };

    return (
        <LeaveContext.Provider value={{
            currentUser, users, leaveRequests, notifications, loading,
            login, logout, setUserAsFirstLoginDone,
            addUser, removeUser,
            addLeaveRequest, updateLeaveRequestStatus,
            addNotification, removeNotification,
        }}>
            {children}
        </LeaveContext.Provider>
    );
};
