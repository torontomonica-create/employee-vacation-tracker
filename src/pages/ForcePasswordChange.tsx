import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeave } from '../context/LeaveContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export const ForcePasswordChange: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, setUserAsFirstLoginDone, addNotification } = useLeave();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    if (!currentUser) {
        // Should not be here if not logged in
        return <div className="p-10 text-center">Please log in first.</div>;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            addNotification('Password must be at least 6 characters', 'error');
            return;
        }
        if (password !== confirmPassword) {
            addNotification('Passwords do not match', 'error');
            return;
        }

        setUserAsFirstLoginDone(currentUser.id, password);
        addNotification('Password updated successfully', 'success');
        navigate(currentUser.role === 'Admin' ? '/admin' : '/employee');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-xl text-yellow-600">Change Password Required</CardTitle>
                    <p className="text-sm text-slate-500 mt-2">
                        For security reasons, please set a new permanent password for your account.
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="New Password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Input
                            label="Confirm New Password"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <Button type="submit" className="w-full">Set Password & Continue</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
