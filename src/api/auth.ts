import client from './client';
import type { LoginResponse } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
  expectAdmin?: boolean;
  churchId?: number | null;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    client.post<LoginResponse>('/auth/login', payload).then(r => r.data),
};
