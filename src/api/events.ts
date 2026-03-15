import client from './client';
import type { Event, EventRegistrationRequest } from '../types';

export const eventsApi = {
  getAll: (params?: { churchId?: number; from?: string; to?: string }) =>
    client.get<Event[]>('/events', { params }).then(r => r.data),

  getById: (id: number) => client.get<Event>(`/events/${id}`).then(r => r.data),

  create: (data: Partial<Event> & { churchId: number }) =>
    client.post<Event>('/events', data).then(r => r.data),

  update: (id: number, data: Partial<Event>) =>
    client.put<Event>(`/events/${id}`, data).then(r => r.data),

  remove: (id: number) => client.delete(`/events/${id}`),

  register: (id: number, data: EventRegistrationRequest) =>
    client.post(`/events/${id}/register`, data).then(r => r.data),

  getRegistrations: (id: number) =>
    client.get(`/events/${id}/registrations`).then(r => r.data),
};
