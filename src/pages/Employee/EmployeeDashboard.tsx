import React, { useState } from 'react';
import { useLeave } from '../../context/LeaveContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LeaveType } from '../../types';
import { differenceInBusinessDays, parseISO, isBefore } from 'date-fns';
import { PieChart, Clock, CalendarCheck } from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
    const { currentUser, addLeaveRequest, addNotification } = useLeave();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [type, setType] = useState<LeaveType>('Annual');
    const [reason, setReason] = useState('');

    if (!currentUser) return null;

    const remainingDays = currentUser.totalAnnualLeaveDays - currentUser.usedLeaveDays;
    const isLowBalance = remainingDays < 5;

    const calculateDays = () => {
        if (!startDate || !endDate) return 0;
        const start = parseISO(startDate);
        const end = parseISO(endDate);
        if (isBefore(end, start)) return 0;
        return differenceInBusinessDays(end, start) + 1; // Inclusive
    };

    const daysRequested = calculateDays();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (daysRequested <= 0) {
            addNotification("End date must be after start date", "error");
            return;
        }

        if (type === 'Annual' && daysRequested > remainingDays) {
            addNotification(`Insufficient leave balance. You have ${remainingDays} days remaining.`, "error");
            return;
        }

        addLeaveRequest({
            employeeId: currentUser.id,
            startDate,
            endDate,
            daysRequested,
            type,
            reason
        });

        // Reset
        setStartDate('');
        setEndDate('');
        setType('Annual');
        setReason('');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">My Dashboard</h2>
                <Button variant="secondary" onClick={() => window.location.href = '/employee/history'}>
                    View Request History
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                            <PieChart size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Allowance</p>
                            <p className="text-2xl font-bold text-slate-900">{currentUser.totalAnnualLeaveDays} Days</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Used Days</p>
                            <p className="text-2xl font-bold text-slate-900">{currentUser.usedLeaveDays} Days</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className={isLowBalance ? "border-red-200 bg-red-50" : ""}>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className={`p-3 rounded-full ${isLowBalance ? "bg-red-200 text-red-700" : "bg-green-100 text-green-600"}`}>
                            <CalendarCheck size={24} />
                        </div>
                        <div>
                            <p className={`text-sm font-medium ${isLowBalance ? "text-red-700" : "text-slate-500"}`}>Remaining</p>
                            <p className={`text-2xl font-bold ${isLowBalance ? "text-red-700" : "text-slate-900"}`}>{remainingDays} Days</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Request Leave</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Start Date"
                                    type="date"
                                    required
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                />
                                <Input
                                    label="End Date"
                                    type="date"
                                    required
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                />
                            </div>

                            {daysRequested > 0 && (
                                <div className="p-3 bg-slate-50 rounded text-sm text-slate-600">
                                    Duration: <span className="font-bold">{daysRequested} Business Days</span>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Type</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={type}
                                    onChange={(e) => setType(e.target.value as LeaveType)}
                                >
                                    <option value="Annual">Annual Leave</option>
                                    <option value="Sick">Sick Leave</option>
                                    <option value="Unpaid">Unpaid Leave</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <Input
                                label="Reason"
                                required
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                placeholder="e.g., Summer vacation, Doctor appointment"
                            />

                            <Button type="submit" className="w-full" disabled={daysRequested <= 0}>
                                Submit Request
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Helpful Info or Calendar Placeholder could go here */}
                <Card className="bg-blue-50 border-blue-100">
                    <CardHeader>
                        <CardTitle className="text-blue-800">Policy Reminder</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-blue-700 space-y-2">
                        <p>• Annual leave requests should be submitted at least 2 weeks in advance.</p>
                        <p>• Sick leave should be reported as soon as possible.</p>
                        <p>• Unpaid leave requires approval from HR.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
