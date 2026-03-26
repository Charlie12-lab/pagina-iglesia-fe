import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { churchesApi } from '../../api/churches';
import { eventsApi } from '../../api/events';
import { blogsApi } from '../../api/blogs';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: churches = [] } = useQuery({
    queryKey: ['churches'],
    queryFn: churchesApi.getAll,
    enabled: user?.role === 'SuperAdmin',
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventsApi.getAll(user?.role === 'ChurchAdmin' ? { churchId: user.churchId } : undefined),
  });

  const { data: blogs = [] } = useQuery({
    queryKey: ['blogs'],
    queryFn: () => blogsApi.getAll(user?.role === 'ChurchAdmin' ? user.churchId : undefined),
  });

  const stats = [
    ...(user?.role === 'SuperAdmin' ? [{
      label: 'Iglesias', value: churches.length,
      iconColor: '#0098A6', iconBg: '#E6F7F8',
      icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 2V4M9 4H13M3 20H19V10L11 4L3 10V20Z" stroke="#0098A6" strokeWidth="1.5" strokeLinejoin="round"/><path d="M7 20V14H15V20" stroke="#0098A6" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    }] : []),
    {
      label: 'Eventos', value: events.length,
      iconColor: '#E8A020', iconBg: '#FEF5E0',
      icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="5" width="18" height="15" rx="2.5" stroke="#E8A020" strokeWidth="1.5"/><path d="M7 3V7M15 3V7M2 10H20" stroke="#E8A020" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    },
    {
      label: 'Publicaciones', value: blogs.length,
      iconColor: '#1B5E20', iconBg: '#E8F5E9',
      icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="2" width="16" height="19" rx="2.5" stroke="#1B5E20" strokeWidth="1.5"/><path d="M7 8H15M7 12H15M7 16H11" stroke="#1B5E20" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 600, color: '#1A1A1A', letterSpacing: -0.2, marginBottom: 3 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: '#777777' }}>
          Bienvenido, <strong>{user?.username}</strong>
          {user?.churchName && ` — ${user.churchName}`}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: 14, marginBottom: 24 }}>
        {stats.map(stat => (
          <div key={stat.label} style={{ background: 'white', border: '1px solid #E2E2E2', borderRadius: 13, padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: stat.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {stat.icon}
              </div>
            </div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 600, color: '#1A1A1A', lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: '#777777', marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Próximos eventos */}
      <div style={{ background: 'white', border: '1px solid #E2E2E2', borderRadius: 13, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F3F3', display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: '#FEF5E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2.5" width="12" height="10" rx="1.5" stroke="#E8A020" strokeWidth="1.2"/><path d="M4.5 1.5V3.5M9.5 1.5V3.5M1 5.5H13" stroke="#E8A020" strokeWidth="1.2" strokeLinecap="round"/></svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>Próximos eventos</span>
        </div>
        <div style={{ padding: '4px 0' }}>
          {events.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: '#ABABAB', fontSize: 13 }}>No hay eventos próximos.</div>
          ) : (
            events.slice(0, 5).map(ev => (
              <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid #F3F3F3' }}>
                <div style={{ width: 40, height: 40, background: '#FEF5E0', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1.5" y="3.5" width="15" height="13" rx="2" stroke="#E8A020" strokeWidth="1.4"/><path d="M6 2V5M12 2V5M1.5 7.5H16.5" stroke="#E8A020" strokeWidth="1.3" strokeLinecap="round"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#1A1A1A', fontSize: 13 }}>{ev.title}</div>
                  <div style={{ fontSize: 12, color: '#777777' }}>{ev.churchName} — {new Date(ev.startDate).toLocaleDateString('es')}</div>
                </div>
                {ev.eventType && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: '#E6F7F8', color: '#00818C' }}>{ev.eventType}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
