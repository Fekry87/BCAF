import { get, post } from './api';
import type { User, LoginCredentials } from '@/types';

export const authApi = {
  login: (credentials: LoginCredentials) => post<{ user: User; token: string }>('/auth/login', credentials),

  logout: () => post<null>('/auth/logout'),

  getUser: () => get<User>('/auth/user'),

  refresh: () => post<{ token: string }>('/auth/refresh'),
};
