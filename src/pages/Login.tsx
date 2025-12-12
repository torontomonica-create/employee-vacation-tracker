import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeave } from '../context/LeaveContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { User } from '../types';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login, users, addNotification } = useLeave();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showGoogleModal, setShowGoogleModal] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const result = await login(email, password);
        setIsLoading(false);

        if (result.success) {
            // Check context for current user? login updates it.
            // But we might need to wait for state update or check the user logic in context.
            // Ideally login should return the user or we check context. But context update might be async in React batching.
            // Let's rely on finding the user again locally or assume logic:

            // To properly redirect, we need the user object.
            // Let's fetch it from users array for now since login doesn't return it
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (user) {
                if (user.isFirstLogin) {
                    navigate('/force-password-change');
                } else {
                    navigate(user.role === 'Admin' ? '/admin' : '/employee');
                }
            }
        }
    };

    const handleGoogleLogin = (user: User) => {
        // Simulate Google Login success
        login(user.email); // No password needed
        setShowGoogleModal(false);
        if (user.isFirstLogin) {
            navigate('/force-password-change');
        } else {
            navigate(user.role === 'Admin' ? '/admin' : '/employee');
        }
    };

    const handleForgotPassword = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate sending email
        if (!users.find(u => u.email === forgotEmail)) {
            addNotification('If that email exists, we sent a link.', 'info');
        } else {
            addNotification(`Reset link sent to ${forgotEmail}`, 'success');
        }
        setShowForgotPassword(false);
        setForgotEmail('');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-blue-600">Vacation Tracker</CardTitle>
                    <p className="text-sm text-slate-500 mt-2">Sign in to your account</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                        />
                        <Input
                            label="Password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowForgotPassword(true)}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Visual reCAPTCHA Placeholder */}
                        <div className="border border-slate-300 rounded bg-slate-50 p-3 flex items-center gap-3">
                            <div className="w-6 h-6 border-2 border-slate-300 rounded-sm" />
                            <span className="text-sm text-slate-600">I'm not a robot</span>
                            <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" className="w-8 h-8 ml-auto opacity-50" />
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </Button>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-500">Or continue with</span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="secondary"
                            className="w-full"
                            onClick={() => setShowGoogleModal(true)}
                        >
                            Sign in with Google
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Google Mock Modal */}
            <Modal
                isOpen={showGoogleModal}
                onClose={() => setShowGoogleModal(false)}
                title="Choose an Account"
            >
                <div className="space-y-2">
                    {users.map(user => (
                        <button
                            key={user.id}
                            className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-all text-left"
                            onClick={() => handleGoogleLogin(user)}
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-medium text-slate-900">{user.name}</p>
                                <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </Modal>

            {/* Forgot Password Modal */}
            <Modal
                isOpen={showForgotPassword}
                onClose={() => setShowForgotPassword(false)}
                title="Reset Password"
            >
                <form onSubmit={handleForgotPassword} className="space-y-4">
                    <p className="text-sm text-slate-600">Enter your email address and we'll send you a link to reset your password.</p>
                    <Input
                        label="Email Address"
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="you@company.com"
                    />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setShowForgotPassword(false)}>Cancel</Button>
                        <Button type="submit">Send Reset Link</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
