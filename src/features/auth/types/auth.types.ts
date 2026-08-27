export interface User {
  user: string;
  admin?: boolean;
}

export interface LoginRequest {
  user: string;
  pass: string;
}

export interface RegisterRequest {
  user: string;
  pass: string;
  turnstileToken: string;
}

export interface LoginResponse {
  user: string;
  admin: boolean;
}

export interface RegisterResponse {
  user: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}
