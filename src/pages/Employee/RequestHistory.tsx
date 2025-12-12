import React from 'react';
import { useLeave } from '../../context/LeaveContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const RequestHistory: React.FC = () => {
    const { currentUser, leaveRequests } = useLeave();

    if (!currentUser) return null;

    const myRequests = leaveRequests.filter(req => req.employeeId === currentUser.id).sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Request History</h2>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase font-medium text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Dates</th>
                                <th className="px-6 py-4">Details</th> {/* Type & Duration */}
                                <th className="px-6 py-4">Submitted</th>
                                <th className="px-6 py-4">Note</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {myRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No leave requests found.
                                    </td>
                                </tr>
                            ) : (
                                myRequests.map(req => (
                                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <StatusBadge status={req.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">
                                                {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{req.type}</div>
                                            <div className="text-xs text-slate-400">{req.daysRequested} Days</div>
                                        </td>
                                        <td className="px-6 py-4">{new Date(req.requestedAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <div className="truncate" title={req.adminComment || req.reason}>
                                                {req.adminComment ? (
                                                    <span className="text-slate-500 italic">Admin: {req.adminComment}</span>
                                                ) : (
                                                    req.reason
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
