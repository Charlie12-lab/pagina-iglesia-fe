import { Link, NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Church, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <nav className="bg-indigo-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Church size={24} />
          IglesiaNet
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? 'text-yellow-300' : 'hover:text-yellow-200 transition-colors'
            }
          >
            Inicio
          </NavLink>
          <NavLink
            to="/iglesias"
            className={({ isActive }) =>
              isActive ? 'text-yellow-300' : 'hover:text-yellow-200 transition-colors'
            }
          >
            Iglesias
          </NavLink>
          <NavLink
            to="/blog"
            className={({ isActive }) =>
              isActive ? 'text-yellow-300' : 'hover:text-yellow-200 transition-colors'
            }
          >
            Blog
          </NavLink>

          {user ? (
            <div className="flex items-center gap-3 ml-4">
              <Link
                to="/admin"
                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-md transition-colors"
              >
                <LayoutDashboard size={16} />
                Admin
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-1 hover:text-yellow-200 transition-colors"
              >
                <LogOut size={16} />
                Salir
              </button>
            </div>
          ) : (
            <Link
              to="/admin/login"
              className="ml-4 bg-yellow-400 text-indigo-900 px-3 py-1.5 rounded-md font-semibold hover:bg-yellow-300 transition-colors"
            >
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
