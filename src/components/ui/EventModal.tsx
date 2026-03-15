import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { X, MapPin, Calendar, Users } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { eventsApi } from '../../api/events';
import type { Event, EventRegistrationRequest } from '../../types';

interface Props {
  event: Event;
  onClose: () => void;
}

export default function EventModal({ event, onClose }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [form, setForm] = useState<EventRegistrationRequest>({
    fullName: '', email: '', phone: '', notes: ''
  });

  const { mutate: register, isPending } = useMutation({
    mutationFn: () => eventsApi.register(event.id, form),
    onSuccess: () => setRegistered(true),
  });

  const spotsLeft = event.maxAttendees
    ? event.maxAttendees - event.currentAttendees
    : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header image */}
        {event.imageUrl && (
          <img src={event.imageUrl} alt={event.title}
            className="w-full h-48 object-cover rounded-t-2xl" />
        )}

        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-indigo-600 text-sm font-medium">{event.churchName}</p>
              <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-indigo-500" />
              <span>
                {format(new Date(event.startDate), "EEEE dd 'de' MMMM, yyyy — HH:mm", { locale: es })}
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-indigo-500" />
                <span>{event.location}</span>
              </div>
            )}
            {event.maxAttendees && (
              <div className="flex items-center gap-2">
                <Users size={16} className="text-indigo-500" />
                <span>
                  {event.currentAttendees} / {event.maxAttendees} inscritos
                  {spotsLeft !== null && spotsLeft > 0 && (
                    <span className="text-green-600 ml-1">({spotsLeft} cupos disponibles)</span>
                  )}
                  {spotsLeft === 0 && <span className="text-red-500 ml-1">(Sin cupos)</span>}
                </span>
              </div>
            )}
          </div>

          {event.description && (
            <p className="text-gray-700 mb-6 leading-relaxed">{event.description}</p>
          )}

          {/* Registration */}
          {event.allowsRegistration && !registered && (
            <>
              {!showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  disabled={spotsLeft === 0}
                  className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Inscribirse al evento
                </button>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); register(); }} className="space-y-3">
                  <h3 className="font-semibold text-gray-800">Formulario de inscripción</h3>
                  <input required placeholder="Nombre completo" value={form.fullName}
                    onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <input required type="email" placeholder="Correo electrónico" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <input placeholder="Teléfono (opcional)" value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <textarea placeholder="Notas adicionales (opcional)" value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowForm(false)}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" disabled={isPending}
                      className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                      {isPending ? 'Enviando...' : 'Confirmar inscripción'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {registered && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-700 font-semibold">¡Inscripción confirmada!</p>
              <p className="text-green-600 text-sm">Te esperamos en el evento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
