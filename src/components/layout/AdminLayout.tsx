import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Calendar, BookOpen, Church, Users, LayoutDashboard, LogOut } from 'lucide-react';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/eventos', label: 'Eventos', icon: Calendar },
  { to: '/admin/blogs', label: 'Blog', icon: BookOpen },
  { to: '/admin/iglesias', label: 'Iglesias', icon: Church },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();

  if (!user) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-900 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-indigo-700">
          <p className="font-bold text-lg">IglesiaNet Admin</p>
          <p className="text-indigo-300 text-sm">{user.username}</p>
          <p className="text-indigo-400 text-xs">{user.role}</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => {
            if (to === '/admin/iglesias' && user.role !== 'SuperAdmin') return null;
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-indigo-700 text-white'
                      : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-indigo-700">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-indigo-300 hover:text-white hover:bg-indigo-800 rounded-lg text-sm transition-colors"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm px-6 py-4">
          <h1 className="text-gray-800 font-semibold text-lg">Panel de Administración</h1>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
