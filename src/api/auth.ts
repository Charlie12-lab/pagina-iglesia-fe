import client from './client';
import type { LoginResponse } from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    client.post<LoginResponse>('/auth/login', { email, password }).then(r => r.data),
};
