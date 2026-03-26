import { useState } from 'react';
import { Outlet, NavLink, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const NAV_SECTIONS = [
  {
    label: 'Principal',
    items: [
      {
        to: '/admin',
        end: true,
        label: 'Dashboard',
        icon: (
          <svg viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16, flexShrink: 0 }}>
            <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
            <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
            <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
            <rect x="9" y="9" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Gestión',
    items: [
      {
        to: '/admin/iglesias',
        label: 'Iglesias',
        superAdminOnly: true,
        icon: (
          <svg viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16, flexShrink: 0 }}>
            <path d="M8 1.5V2.5M6.5 2.5H9.5M2 14.5H14V7.5L8 3L2 7.5V14.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
            <path d="M5.5 14.5V10.5H10.5V14.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        ),
      },
      {
        to: '/admin/eventos',
        label: 'Eventos',
        icon: (
          <svg viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16, flexShrink: 0 }}>
            <rect x="1.5" y="3" width="13" height="11" rx="2" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M5 2V4M11 2V4M1.5 6.5H14.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        ),
      },
      {
        to: '/admin/blogs',
        label: 'Blog',
        icon: (
          <svg viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16, flexShrink: 0 }}>
            <rect x="2.5" y="1.5" width="11" height="13" rx="2" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M5 5.5H11M5 8H11M5 10.5H8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        ),
      },
    ],
  },
];

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/iglesias': 'Iglesias',
  '/admin/eventos': 'Eventos',
  '/admin/blogs': 'Blog',
};

function getCurrentDate() {
  return new Date().toLocaleDateString('es', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [, setNotifOpen] = useState(false);

  if (!user) return <Navigate to="/admin/login" replace />;

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Admin';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9F9F9', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 240, background: '#006B75', display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50, overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', width: 200, height: 200, top: -70, left: -50, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 150, height: 150, bottom: -50, right: -40, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

        {/* Brand */}
        <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1.5V3M6.5 3H9.5M2 14.5H14V7.5L8 3L2 7.5V14.5Z" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.5 14.5V10.5H10.5V14.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 600, color: 'white' }}>
              Iglesia de <span style={{ color: '#00B5C5' }}>Cristo</span>
            </span>
          </div>

          {/* User chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, padding: '8px 10px' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#E8A020', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 }}>
              {user.username.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'white', marginBottom: 1 }}>{user.username}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'rgba(232,160,32,0.22)', border: '1px solid rgba(232,160,32,0.28)', color: '#F2B84B', fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 10 }}>
                ⭐ {user.role}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto', position: 'relative', zIndex: 1 }}>
          {NAV_SECTIONS.map(section => (
            <div key={section.label}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', padding: '8px 8px 3px' }}>
                {section.label}
              </div>
              {section.items.map(item => {
                if (item.superAdminOnly && user.role !== 'SuperAdmin') return null;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    style={({ isActive }) => ({
                      display: 'flex', alignItems: 'center', gap: 9,
                      padding: '8px 9px', borderRadius: 8, cursor: 'pointer',
                      color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                      fontSize: 12.5, fontWeight: isActive ? 700 : 500,
                      textDecoration: 'none',
                      background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                      border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                      marginBottom: 1, position: 'relative',
                    })}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, background: '#F2B84B', borderRadius: '0 3px 3px 0' }} />
                        )}
                        <span style={{ opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                        {item.label}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: 10, borderTop: '1px solid rgba(255,255,255,0.08)', position: 'relative', zIndex: 1 }}>
          <button onClick={logout} style={{
            display: 'flex', alignItems: 'center', gap: 9, padding: '8px 9px',
            borderRadius: 8, cursor: 'pointer', color: 'rgba(255,255,255,0.4)',
            fontSize: 12.5, fontWeight: 500, border: 'none', background: 'none',
            width: '100%', fontFamily: 'inherit',
          }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M5.5 13H3C2.4 13 2 12.6 2 12V3C2 2.4 2.4 2 3 2H5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M10 10.5L13.5 7.5L10 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="13.5" y1="7.5" x2="6" y2="7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Topbar */}
        <header style={{
          background: 'white', borderBottom: '1px solid #E2E2E2', height: 52,
          padding: '0 28px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 600, color: '#1A1A1A' }}>
              Panel de Administración
            </span>
            <span style={{ color: '#ABABAB', fontSize: 13 }}>/</span>
            <span style={{ fontSize: 12.5, color: '#777777' }}>{pageTitle}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11.5, color: '#777777' }}>{getCurrentDate()}</span>
            <button
              onClick={() => setNotifOpen(v => !v)}
              style={{ width: 32, height: 32, borderRadius: 7, background: '#F3F3F3', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C5C5C', position: 'relative' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1.5C5.1 1.5 3.5 3.1 3.5 5V8L2 10H12L10.5 8V5C10.5 3.1 8.9 1.5 7 1.5Z" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M5.5 10C5.5 10.8 6.2 11.5 7 11.5C7.8 11.5 8.5 10.8 8.5 10" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: '24px 28px', overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
