import client from './client';
import type { BlogPost, BlogPostSummary } from '../types';

export const blogsApi = {
  getAll: (churchId?: number) =>
    client.get<BlogPostSummary[]>('/blogs', { params: { churchId } }).then(r => r.data),

  getById: (id: string) => client.get<BlogPost>(`/blogs/${id}`).then(r => r.data),

  create: (data: Partial<BlogPost>) => client.post<BlogPost>('/blogs', data).then(r => r.data),

  update: (id: string, data: Partial<BlogPost>) =>
    client.put<BlogPost>(`/blogs/${id}`, data).then(r => r.data),

  remove: (id: string) => client.delete(`/blogs/${id}`),
};
