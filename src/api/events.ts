import client from './client';
import type { Event, EventRegistrationRequest, GroupRegistrationRequest } from '../types';

export const eventsApi = {
  getAll: (params?: { churchId?: number; from?: string; to?: string }) =>
    client.get<Event[]>('/events', { params }).then(r => r.data),

  getById: (id: number) => client.get<Event>(`/events/${id}`).then(r => r.data),

  create: (data: Partial<Event> & { churchId: number }) =>
    client.post<Event>('/events', data).then(r => r.data),

  update: (id: number, data: Partial<Event>) =>
    client.put<Event>(`/events/${id}`, data).then(r => r.data),

  remove: (id: number) => client.delete(`/events/${id}`),

  // Inscripción individual — multipart/form-data con voucher opcional
  register: (id: number, data: EventRegistrationRequest, voucher?: File) => {
    const form = new FormData();
    form.append('fullName', data.fullName);
    form.append('email', data.email);
    if (data.phone) form.append('phone', data.phone);
    if (data.notes) form.append('notes', data.notes);
    if (data.church) form.append('church', data.church);
    if (voucher) form.append('voucher', voucher);
    return client.post(`/events/${id}/register`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  // Inscripción grupal — multipart/form-data con lista de miembros en JSON
  registerGroup: (id: number, data: GroupRegistrationRequest, voucher?: File) => {
    const form = new FormData();
    form.append('responsible', data.responsible);
    form.append('email', data.email);
    if (data.phone) form.append('phone', data.phone);
    if (data.church) form.append('church', data.church);
    form.append('membersJson', JSON.stringify(data.members));
    if (voucher) form.append('voucher', voucher);
    return client.post(`/events/${id}/register-group`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  getRegistrations: (id: number) =>
    client.get(`/events/${id}/registrations`).then(r => r.data),

  uploadImage: (file: File) => {
    const form = new FormData();
    form.append('image', file);
    return client.post<{ url: string }>('/events/upload-image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data.url);
  },
};
