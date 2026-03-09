import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LeaveProvider, useLeave } from './context/LeaveContext';
import { ToastContainer } from './components/ToastContainer';
import { Login } from './pages/Login';
import { ForcePasswordChange } from './pages/ForcePasswordChange';
import { Layout } from './components/Layout';
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { EmployeeManagement } from './pages/Admin/EmployeeManagement';
import { EmployeeDashboard } from './pages/Employee/EmployeeDashboard';
import { RequestHistory } from './pages/Employee/RequestHistory';

// Simple Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole?: 'Admin' | 'Employee' }> = ({ children, allowedRole }) => {
    const { currentUser, loading } = useLeave();

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (currentUser.isFirstLogin && window.location.pathname !== '/force-password-change') {
        return <Navigate to="/force-password-change" replace />;
    }

    if (allowedRole && currentUser.role !== allowedRole) {
        // Redirect to their dashboard if trying to access unauthorized area
        return <Navigate to={currentUser.role === 'Admin' ? '/admin' : '/employee'} replace />;
    }

    return <>{children}</>;
};

function App() {
    return (
        <LeaveProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/force-password-change"
                        element={
                            <ProtectedRoute>
                                <ForcePasswordChange />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Routes */}
                    <Route path="/admin" element={
                        <ProtectedRoute allowedRole="Admin">
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<AdminDashboard />} />
                        <Route path="employees" element={<EmployeeManagement />} />
                    </Route>

                    {/* Employee Routes */}
                    <Route path="/employee" element={
                        <ProtectedRoute allowedRole="Employee">
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<EmployeeDashboard />} />
                        <Route path="history" element={<RequestHistory />} />
                    </Route>

                    <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
                <ToastContainer />
            </BrowserRouter>
        </LeaveProvider>
    );
}

export default App;
