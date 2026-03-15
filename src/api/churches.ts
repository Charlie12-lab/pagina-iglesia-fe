import client from './client';
import type { Church } from '../types';

export const churchesApi = {
  getAll: () => client.get<Church[]>('/churches').then(r => r.data),
  getById: (id: number) => client.get<Church>(`/churches/${id}`).then(r => r.data),
  create: (data: Partial<Church>) => client.post<Church>('/churches', data).then(r => r.data),
  update: (id: number, data: Partial<Church>) => client.put<Church>(`/churches/${id}`, data).then(r => r.data),
  remove: (id: number) => client.delete(`/churches/${id}`),
};
