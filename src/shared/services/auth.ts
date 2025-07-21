import { apiService } from './api';

// Tipos para as requisições de autenticação
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Resposta real da API /auth/login
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

// Resposta real da API /auth/profile
export interface UserProfile {
  userId: string;
  email: string;
  tenantId: string;
  tenantRole: 'OWNER' | 'ADMIN' | 'USER';
  userRole: 'ADMIN' | 'USER';
  isActive: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  success: boolean;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
  success: boolean;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

// Serviço de autenticação
export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Login do usuário
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('Logging in with credentials:', credentials);
    return await apiService.post<LoginResponse>('/auth/login', credentials);
  }

  // Logout do usuário
  async logout(): Promise<void> {
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');
  }

  // Esqueci a senha
  async forgotPassword(
    data: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> {
    return apiService.post<ForgotPasswordResponse>(
      '/auth/forgot-password',
      data
    );
  }

  // Redefinir senha
  async resetPassword(
    data: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> {
    return apiService.post<ResetPasswordResponse>('/auth/reset-password', data);
  }

  // Refresh do token
  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    return apiService.post<RefreshTokenResponse>('/auth/refresh', data);
  }

  // Verificar se o token é válido
  async verifyToken(): Promise<{ valid: boolean }> {
    return apiService.get<{ valid: boolean }>('/auth/verify');
  }

  // Obter perfil do usuário
  async getProfile(): Promise<UserProfile> {
    return apiService.get<UserProfile>('/auth/profile');
  }
}

export const authService = AuthService.getInstance();
