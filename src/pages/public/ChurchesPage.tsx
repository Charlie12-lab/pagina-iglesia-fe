import { useQuery } from '@tanstack/react-query';
import { churchesApi } from '../../api/churches';
import { MapPin, Phone, Mail, Globe, Church } from 'lucide-react';

export default function ChurchesPage() {
  const { data: churches = [], isLoading } = useQuery({
    queryKey: ['churches'],
    queryFn: churchesApi.getAll,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-indigo-800">Directorio de Iglesias</h1>
        <p className="text-gray-600 mt-2">Conoce las comunidades de fe de todo el país.</p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow animate-pulse h-48" />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {churches.map(church => (
          <div key={church.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
            <div className="flex items-center gap-4 mb-4">
              {church.logoUrl ? (
                <img src={church.logoUrl} alt={church.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Church size={28} className="text-indigo-500" />
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold text-gray-900">{church.name}</h2>
                {church.city && (
                  <p className="text-indigo-600 text-sm font-medium">{church.city}</p>
                )}
              </div>
            </div>

            {church.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{church.description}</p>
            )}

            <div className="space-y-1.5 text-xs text-gray-500">
              {church.address && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-indigo-400 shrink-0" />
                  <span>{church.address}</span>
                </div>
              )}
              {church.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone size={13} className="text-indigo-400 shrink-0" />
                  <span>{church.phone}</span>
                </div>
              )}
              {church.email && (
                <div className="flex items-center gap-1.5">
                  <Mail size={13} className="text-indigo-400 shrink-0" />
                  <a href={`mailto:${church.email}`} className="hover:text-indigo-600 transition-colors">
                    {church.email}
                  </a>
                </div>
              )}
              {church.websiteUrl && (
                <div className="flex items-center gap-1.5">
                  <Globe size={13} className="text-indigo-400 shrink-0" />
                  <a href={church.websiteUrl} target="_blank" rel="noopener noreferrer"
                    className="hover:text-indigo-600 transition-colors truncate">
                    {church.websiteUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!isLoading && churches.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <Church size={48} className="mx-auto mb-3 text-gray-300" />
          <p>No hay iglesias registradas aún.</p>
        </div>
      )}
    </div>
  );
}
