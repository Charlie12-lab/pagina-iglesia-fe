import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { churchesApi } from '../../api/churches';
import { eventsApi } from '../../api/events';
import { blogsApi } from '../../api/blogs';
import { Church, Calendar, BookOpen, TrendingUp } from 'lucide-react';

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
    {
      label: 'Iglesias',
      value: user?.role === 'SuperAdmin' ? churches.length : '-',
      icon: Church,
      color: 'bg-purple-100 text-purple-600',
      show: user?.role === 'SuperAdmin',
    },
    {
      label: 'Eventos',
      value: events.length,
      icon: Calendar,
      color: 'bg-indigo-100 text-indigo-600',
      show: true,
    },
    {
      label: 'Publicaciones',
      value: blogs.length,
      icon: BookOpen,
      color: 'bg-green-100 text-green-600',
      show: true,
    },
  ].filter(s => s.show);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">
          Bienvenido, <strong>{user?.username}</strong>
          {user?.churchName && ` — ${user.churchName}`}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Próximos eventos */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-indigo-500" />
          Próximos eventos
        </h3>
        {events.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay eventos próximos.</p>
        ) : (
          <div className="space-y-3">
            {events.slice(0, 5).map(ev => (
              <div key={ev.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                  <Calendar size={20} className="text-indigo-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{ev.title}</p>
                  <p className="text-gray-500 text-xs">{ev.churchName} — {new Date(ev.startDate).toLocaleDateString('es')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
