import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '../../api/events';
import { churchesApi } from '../../api/churches';
import { useAuthStore } from '../../store/authStore';
import { Plus, Pencil, Trash2, Users, Calendar } from 'lucide-react';
import type { Event } from '../../types';

const emptyForm = {
  title: '', description: '', startDate: '', endDate: '', location: '',
  imageUrl: '', allowsRegistration: false, maxAttendees: '', isPublished: true, churchId: '',
};

export default function AdminEventsPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: events = [] } = useQuery({
    queryKey: ['events-admin'],
    queryFn: () => eventsApi.getAll(user?.role === 'ChurchAdmin' ? { churchId: user.churchId } : undefined),
  });

  const { data: churches = [] } = useQuery({
    queryKey: ['churches'],
    queryFn: churchesApi.getAll,
  });

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        churchId: Number(form.churchId) || user?.churchId!,
        maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : undefined,
        startDate: new Date(form.startDate).toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      };
      return editing
        ? eventsApi.update(editing.id, payload)
        : eventsApi.create(payload as any);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events-admin'] });
      qc.invalidateQueries({ queryKey: ['events'] });
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
    },
  });

  const { mutate: remove } = useMutation({
    mutationFn: (id: number) => eventsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events-admin'] });
      qc.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const openEdit = (ev: Event) => {
    setEditing(ev);
    setForm({
      title: ev.title,
      description: ev.description ?? '',
      startDate: new Date(ev.startDate).toISOString().slice(0, 16),
      endDate: ev.endDate ? new Date(ev.endDate).toISOString().slice(0, 16) : '',
      location: ev.location ?? '',
      imageUrl: ev.imageUrl ?? '',
      allowsRegistration: ev.allowsRegistration,
      maxAttendees: ev.maxAttendees?.toString() ?? '',
      isPublished: ev.isPublished,
      churchId: ev.churchId.toString(),
    });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Eventos</h2>
        <button
          onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Nuevo evento
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            {editing ? 'Editar evento' : 'Nuevo evento'}
          </h3>
          <form onSubmit={(e) => { e.preventDefault(); save(); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Título *</label>
              <input required value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            {user?.role === 'SuperAdmin' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Iglesia *</label>
                <select required value={form.churchId}
                  onChange={e => setForm(f => ({ ...f, churchId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Seleccionar...</option>
                  {churches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Fecha inicio *</label>
              <input required type="datetime-local" value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Fecha fin</label>
              <input type="datetime-local" value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Lugar</label>
              <input value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">URL imagen</label>
              <input value={form.imageUrl}
                onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
              <textarea value={form.description} rows={3}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.allowsRegistration}
                  onChange={e => setForm(f => ({ ...f, allowsRegistration: e.target.checked }))}
                  className="rounded" />
                Permite inscripción
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.isPublished}
                  onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
                  className="rounded" />
                Publicado
              </label>
            </div>

            {form.allowsRegistration && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cupos máximos</label>
                <input type="number" min="1" value={form.maxAttendees}
                  onChange={e => setForm(f => ({ ...f, maxAttendees: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            )}

            <div className="md:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={isPending}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                {isPending ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Evento</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Iglesia</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Fecha</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Inscritos</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {events.map(ev => (
              <tr key={ev.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{ev.title}</td>
                <td className="px-4 py-3 text-gray-500">{ev.churchName}</td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(ev.startDate).toLocaleDateString('es')}
                </td>
                <td className="px-4 py-3 text-center">
                  {ev.allowsRegistration ? (
                    <span className="flex items-center justify-center gap-1 text-gray-600">
                      <Users size={14} />
                      {ev.currentAttendees}{ev.maxAttendees ? `/${ev.maxAttendees}` : ''}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    ev.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {ev.isPublished ? 'Publicado' : 'Borrador'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(ev)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => confirm('¿Eliminar evento?') && remove(ev.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  <Calendar size={32} className="mx-auto mb-2 text-gray-200" />
                  No hay eventos. Crea el primero.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
