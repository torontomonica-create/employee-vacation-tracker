import React from 'react';
import { useLeave } from '../context/LeaveContext';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export const ToastContainer: React.FC = () => {
    const { notifications, removeNotification } = useLeave();

    if (notifications.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            {notifications.map((note) => (
                <div
                    key={note.id}
                    className={cn(
                        "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white min-w-[300px] animate-slide-in",
                        note.type === 'success' && "bg-green-600",
                        note.type === 'error' && "bg-red-600",
                        note.type === 'info' && "bg-blue-600"
                    )}
                >
                    {note.type === 'success' && <CheckCircle size={20} />}
                    {note.type === 'error' && <AlertCircle size={20} />}
                    {note.type === 'info' && <Info size={20} />}
                    <p className="flex-1 text-sm font-medium">{note.message}</p>
                    <button onClick={() => removeNotification(note.id)} className="hover:opacity-80">
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
};
