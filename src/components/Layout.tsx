import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useLeave } from '../context/LeaveContext';
import { LogOut, LayoutDashboard, Users, Calendar, Menu } from 'lucide-react';
import { cn } from './ToastContainer';

export const Layout: React.FC = () => {
    const { currentUser, logout } = useLeave();
    const navigate = useNavigate();
    const location = useLocation();

    if (!currentUser) {
        // Ideally protected route handles this, but for layout safety
        // navigate('/login'); // We don't want to cause render loop here
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const { pathname } = useLocation();

    // Close mobile menu on route change
    React.useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const isAdmin = currentUser.role === 'Admin';

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-20">
                <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                    <Calendar className="w-6 h-6" />
                    Vacation Tracker
                </h1>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-md"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:sticky top-0 h-full z-40 bg-white border-r border-slate-200 w-64 transition-transform duration-200 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-6 border-b border-slate-100 hidden md:block">
                    <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                        <Calendar className="w-6 h-6" />
                        Vacation Tracker
                    </h1>
                </div>

                {/* Mobile specific close button or header inside sidebar could go here, but clicking outside closes it */}
                <div className="md:hidden p-4 border-b border-slate-100 flex justify-between items-center">
                    <span className="font-semibold text-slate-900">Menu</span>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-slate-500">✕</button>
                </div>

                <nav className="p-4 space-y-1">
                    {isAdmin ? (
                        <>
                            <NavItem
                                to="/admin"
                                icon={<LayoutDashboard size={20} />}
                                label="Dashboard"
                                active={location.pathname === '/admin'}
                            />
                            <NavItem
                                to="/admin/employees"
                                icon={<Users size={20} />}
                                label="Employees"
                                active={location.pathname === '/admin/employees'}
                            />
                        </>
                    ) : (
                        <>
                            <NavItem
                                to="/employee"
                                icon={<LayoutDashboard size={20} />}
                                label="Dashboard"
                                active={location.pathname === '/employee'}
                            />
                            <NavItem
                                to="/employee/history"
                                icon={<Calendar size={20} />}
                                label="Request History"
                                active={location.pathname === '/employee/history'}
                            />
                        </>
                    )}
                </nav>
                <div className="absolute bottom-0 w-full p-4 border-t border-slate-100 bg-white">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                            {currentUser.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-slate-900 truncate">{currentUser.name}</p>
                            <p className="text-xs text-slate-500 truncate">{currentUser.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 w-full max-w-[100vw] overflow-x-hidden">
                <Outlet />
            </main>
        </div>
    );
};

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string; active: boolean }> = ({ to, icon, label, active }) => {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate(to)}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
        >
            {icon}
            {label}
        </button>
    );
};
