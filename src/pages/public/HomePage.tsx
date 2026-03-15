import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, dateFnsLocalizer, type View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { eventsApi } from '../../api/events';
import EventModal from '../../components/ui/EventModal';
import type { Event } from '../../types';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: es }),
  getDay,
  locales: { es },
});

const messages = {
  next: 'Siguiente',
  previous: 'Anterior',
  today: 'Hoy',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'No hay eventos en este período',
};

export default function HomePage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [view, setView] = useState<View>('month');

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventsApi.getAll(),
  });

  const calendarEvents = events.map(ev => ({
    id: ev.id,
    title: `${ev.churchName} — ${ev.title}`,
    start: new Date(ev.startDate),
    end: ev.endDate ? new Date(ev.endDate) : new Date(ev.startDate),
    resource: ev,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-indigo-800 mb-3">
          Bienvenido a IglesiaNet
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Plataforma de iglesias — encuentra eventos, actividades y mensajes de las comunidades de fe de todo el país.
        </p>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Calendario de Actividades</h2>
        <div style={{ height: 600 }}>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            view={view}
            onView={setView}
            messages={messages}
            culture="es"
            onSelectEvent={(ev) => setSelectedEvent(ev.resource as Event)}
            eventPropGetter={() => ({
              className: 'cursor-pointer',
            })}
          />
        </div>
      </div>

      {/* Event modal */}
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}
