import React, { useState } from 'react';
import { useLeave } from '../../context/LeaveContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

export const AdminDashboard: React.FC = () => {
    const { leaveRequests, users, updateLeaveRequestStatus, currentUser } = useLeave();
    const [actionRequest, setActionRequest] = useState<{ id: string, type: 'Approve' | 'Reject' } | null>(null);
    const [comment, setComment] = useState('');

    const pendingRequests = leaveRequests.filter(req => req.status === 'Pending').sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

    const getEmployeeName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown';
    const totalEmployees = users.filter(u => u.role === 'Employee').length;

    const handleAction = () => {
        if (!actionRequest || !currentUser) return;
        updateLeaveRequestStatus(
            actionRequest.id,
            actionRequest.type === 'Approve' ? 'Approved' : 'Rejected',
            currentUser.id,
            comment
        );
        setActionRequest(null);
        setComment('');
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quick Stats */}
                <Card className="bg-blue-50 border-blue-100">
                    <CardHeader>
                        <CardTitle className="text-blue-700">Employees</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-blue-900">{totalEmployees}</p>
                            <p className="text-sm text-blue-600">Active Staff</p>
                        </div>
                        <Button variant="secondary" onClick={() => window.location.href = '/admin/employees'}>
                            View All Employees
                        </Button>
                    </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-100">
                    <CardHeader>
                        <CardTitle className="text-purple-700">Pending Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-purple-900">{pendingRequests.length}</p>
                        <p className="text-sm text-purple-600">Action Required</p>
                    </CardContent>
                </Card>
            </div>

            <h2 className="text-2xl font-bold text-slate-800">Inbox - Pending Requests</h2>

            {pendingRequests.length === 0 ? (
                <Card>
                    <CardContent className="p-10 text-center text-slate-500">
                        No pending requests. All caught up!
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {pendingRequests.map(req => (
                        <Card key={req.id}>
                            <CardContent className="p-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">{getEmployeeName(req.employeeId)}</h3>
                                    <div className="text-sm text-slate-500 mt-1 space-y-1">
                                        <p>Requested <span className="font-medium text-slate-700">{req.daysRequested} days</span> for {req.type}</p>
                                        <p>{new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</p>
                                        <p className="italic">"{req.reason}"</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="danger" size="sm" onClick={() => setActionRequest({ id: req.id, type: 'Reject' })}>
                                        Reject
                                    </Button>
                                    <Button variant="primary" size="sm" onClick={() => setActionRequest({ id: req.id, type: 'Approve' })}>
                                        Approve
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Modal
                isOpen={!!actionRequest}
                onClose={() => setActionRequest(null)}
                title={`${actionRequest?.type} Request`}
            >
                <div className="space-y-4">
                    <p className="text-slate-600">
                        Are you sure you want to {actionRequest?.type.toLowerCase()} this request?
                    </p>
                    <Input
                        label="Optional Comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a note..."
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setActionRequest(null)}>Cancel</Button>
                        <Button
                            variant={actionRequest?.type === 'Approve' ? 'primary' : 'danger'}
                            onClick={handleAction}
                        >
                            Confirm {actionRequest?.type}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
