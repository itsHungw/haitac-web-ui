import { apiClient } from '@/lib/api/api-client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../types/auth.types';

export const authService = {
  /**
   * Logs in with username and password.
   * On success, backend sets the secure session cookie (htth_token).
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('login', credentials);
  },

  /**
   * Registers a new game account.
   */
  async register(credentials: RegisterRequest): Promise<RegisterResponse> {
    return apiClient.post<RegisterResponse>('register', credentials);
  },

  /**
   * Logs out the current session and clears the cookie.
   */
  async logout(): Promise<void> {
    return apiClient.post<void>('logout');
  },

  /**
   * Retrieves the current authenticated user's session profile.
   */
  async getMe(): Promise<LoginResponse | null> {
    try {
      return await apiClient.get<LoginResponse>('me');
    } catch {
      return null;
    }
  },
};
