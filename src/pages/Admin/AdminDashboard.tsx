import React, { useState } from 'react';
import { useLeave } from '../../context/LeaveContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

export const AdminDashboard: React.FC = () => {
    const { leaveRequests, users, updateLeaveRequestStatus, currentUser } = useLeave();
    const [actionRequest, setActionRequest] = useState<{ id: string, type: 'Approve' | 'Reject' } | null>(null);
    const [comment, setComment] = useState('');

    const pendingRequests = leaveRequests.filter(req => req.status === 'Pending').sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

    const getEmployeeName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown';

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
