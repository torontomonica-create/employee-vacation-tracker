import React from 'react';
import { cn } from '../ToastContainer';
import { LeaveStatus } from '../../types';

export const StatusBadge: React.FC<{ status: LeaveStatus }> = ({ status }) => {
    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                {
                    'bg-green-100 text-green-800': status === 'Approved',
                    'bg-yellow-100 text-yellow-800': status === 'Pending',
                    'bg-red-100 text-red-800': status === 'Rejected',
                }
            )}
        >
            {status}
        </span>
    );
};
