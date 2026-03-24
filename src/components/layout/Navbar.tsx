import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{
      background: 'var(--white)',
      borderBottom: '1px solid var(--gray-200)',
      padding: '0 44px',
      display: 'flex',
      alignItems: 'center',
      height: '52px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <Link to="/" style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        textDecoration: 'none', marginRight: '28px', flexShrink: 0,
      }}>
        <div style={{
          width: '28px', height: '28px', background: 'var(--bondi)',
          borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M7.5 1.5V3.5M6.5 3.5H8.5M2 13.5H13V7L7.5 3L2 7V13.5Z"
              stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5.5 13.5V10H9.5V13.5"
              stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '16px', color: 'var(--text)', whiteSpace: 'nowrap' }}>
          Iglesia de <span style={{ color: 'var(--bondi)' }}>Cristo</span>
        </span>
      </Link>

      {/* Nav links */}
      <ul style={{ display: 'flex', alignItems: 'center', gap: '1px', flex: 1, listStyle: 'none', margin: 0, padding: 0 }}>
        {[
          {
            to: '/iglesias', label: 'Directorio',
            icon: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.3"/><line x1="3.5" y1="6.5" x2="9.5" y2="6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="6.5" y1="3.5" x2="6.5" y2="9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
          },
          {
            to: '/', label: 'Eventos',
            icon: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1.5" y="2.5" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 1.5V3M9 1.5V3M1.5 5.5H11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
          },
          {
            to: '/blog', label: 'Blog',
            icon: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 3H11.5M1.5 6.5H8.5M1.5 10H6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
          },
        ].map(({ to, label, icon }) => (
          <li key={label}>
            <NavLink
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '5px',
                color: isActive ? 'var(--bondi-dark)' : 'var(--text-mid)',
                textDecoration: 'none', fontSize: '13px', fontWeight: 500,
                padding: '5px 10px', borderRadius: '6px',
                background: isActive ? 'var(--bondi-mist)' : 'transparent',
                whiteSpace: 'nowrap',
              })}
            >
              <span style={{ color: 'var(--amber)' }}>{icon}</span>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Right side */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {user ? (
          <>
            <Link
              to="/admin"
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                background: 'var(--bondi-pale)', color: 'var(--bondi-dark)',
                fontSize: '12.5px', fontWeight: 600, padding: '5px 12px',
                borderRadius: '7px', textDecoration: 'none',
              }}
            >
              <LayoutDashboard size={14} />
              Admin
            </Link>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                background: 'transparent', border: '1.5px solid var(--gray-200)',
                color: 'var(--text-mid)', fontSize: '12.5px', fontWeight: 500,
                padding: '5px 10px', borderRadius: '7px', cursor: 'pointer',
              }}
            >
              <LogOut size={14} />
              Salir
            </button>
          </>
        ) : (
          <Link
            to="/admin/login"
            style={{
              background: 'var(--bondi)', color: 'white',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '12.5px', fontWeight: 700, padding: '6px 16px',
              borderRadius: '7px', textDecoration: 'none', whiteSpace: 'nowrap',
            }}
          >
            Iniciar sesión
          </Link>
        )}
      </div>
    </nav>
  );
}
