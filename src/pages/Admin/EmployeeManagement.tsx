import React, { useState } from 'react';
import { useLeave } from '../../context/LeaveContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { User, UserRole } from '../../types';
import { Trash2, UserPlus, FileKey } from 'lucide-react';

export const EmployeeManagement: React.FC = () => {
    const { users, addUser, removeUser } = useLeave();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);

    // Form State
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState<UserRole>('Employee');
    const [newHireDate, setNewHireDate] = useState('');
    const [newAllowance, setNewAllowance] = useState('20');

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        addUser({
            name: newName,
            email: newEmail,
            role: newRole,
            hireDate: newHireDate,
            totalAnnualLeaveDays: parseInt(newAllowance) || 0
        });
        setIsAddModalOpen(false);
        // Reset form
        setNewName('');
        setNewEmail('');
        setNewRole('Employee');
        setNewHireDate('');
        setNewAllowance('20');
    };

    const handleDelete = () => {
        if (deleteUser) {
            removeUser(deleteUser.id);
            setDeleteUser(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Employee Management</h2>
                <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
                    <UserPlus size={18} />
                    Add Employee
                </Button>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase font-medium text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Hire Date</th>
                                <th className="px-6 py-4 text-center">Leave Balance</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        <div>{user.name}</div>
                                        <div className="text-xs text-slate-400">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{new Date(user.hireDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="font-bold text-slate-900">{user.totalAnnualLeaveDays - user.usedLeaveDays}</span>
                                        <span className="text-slate-400"> / {user.totalAnnualLeaveDays}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setDeleteUser(user)}
                                            className="text-slate-400 hover:text-red-600 transition-colors p-2"
                                            title="Remove User"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add User Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Employee">
                <form onSubmit={handleAddUser} className="space-y-4">
                    <Input label="Full Name" required value={newName} onChange={e => setNewName(e.target.value)} />
                    <Input label="Email Address" type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} />

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Role</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value as UserRole)}
                        >
                            <option value="Employee">Employee</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    <Input label="Hire Date" type="date" required value={newHireDate} onChange={e => setNewHireDate(e.target.value)} />
                    <Input label="Annual Leave Allowance (Days)" type="number" required value={newAllowance} onChange={e => setNewAllowance(e.target.value)} />

                    <div className="pt-2 flex justify-end gap-2">
                        <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Create Account</Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={!!deleteUser} onClose={() => setDeleteUser(null)} title="Remove Employee">
                <p className="text-slate-600 mb-6">
                    Are you sure you want to remove <strong>{deleteUser?.name}</strong>? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setDeleteUser(null)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDelete}>Delete User</Button>
                </div>
            </Modal>
        </div>
    );
};
