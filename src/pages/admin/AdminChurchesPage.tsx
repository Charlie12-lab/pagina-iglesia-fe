import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { churchesApi } from '../../api/churches';
import { useAuthStore } from '../../store/authStore';
import { Navigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Church } from 'lucide-react';
import type { Church as ChurchType } from '../../types';

const emptyForm = {
  name: '', address: '', city: '', phone: '', email: '',
  description: '', logoUrl: '', websiteUrl: '',
};

export default function AdminChurchesPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ChurchType | null>(null);
  const [form, setForm] = useState(emptyForm);

  if (user?.role !== 'SuperAdmin') return <Navigate to="/admin" replace />;

  const { data: churches = [] } = useQuery({
    queryKey: ['churches'],
    queryFn: churchesApi.getAll,
  });

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => editing
      ? churchesApi.update(editing.id, form)
      : churchesApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['churches'] });
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
    },
  });

  const { mutate: remove } = useMutation({
    mutationFn: (id: number) => churchesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['churches'] }),
  });

  const openEdit = (c: ChurchType) => {
    setEditing(c);
    setForm({
      name: c.name, address: c.address ?? '', city: c.city ?? '',
      phone: c.phone ?? '', email: c.email ?? '', description: c.description ?? '',
      logoUrl: c.logoUrl ?? '', websiteUrl: c.websiteUrl ?? '',
    });
    setShowForm(true);
  };

  const field = (key: keyof typeof form, label: string, type = 'text') => (
    <div key={key}>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        required={key === 'name'}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Iglesias</h2>
        <button
          onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Nueva iglesia
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            {editing ? 'Editar iglesia' : 'Nueva iglesia'}
          </h3>
          <form onSubmit={(e) => { e.preventDefault(); save(); }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field('name', 'Nombre *')}
            {field('city', 'Ciudad')}
            {field('address', 'Dirección')}
            {field('phone', 'Teléfono')}
            {field('email', 'Correo', 'email')}
            {field('logoUrl', 'URL Logo')}
            {field('websiteUrl', 'Sitio web')}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
              <textarea value={form.description} rows={3}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {churches.map(church => (
          <div key={church.id} className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              {church.logoUrl ? (
                <img src={church.logoUrl} alt={church.name}
                  className="w-12 h-12 rounded-full object-cover border border-indigo-100" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Church size={22} className="text-indigo-500" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-gray-900">{church.name}</h3>
                {church.city && <p className="text-xs text-indigo-600">{church.city}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-1 mt-2">
              <button onClick={() => openEdit(church)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors">
                <Pencil size={15} />
              </button>
              <button onClick={() => confirm('¿Desactivar iglesia?') && remove(church.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {churches.length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-400">
            <Church size={40} className="mx-auto mb-2 text-gray-200" />
            No hay iglesias registradas.
          </div>
        )}
      </div>
    </div>
  );
}
