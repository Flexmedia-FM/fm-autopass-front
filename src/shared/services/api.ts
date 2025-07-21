import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { TokenCookieManager } from '../utils';

// Configuração da instância Axios
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor para requisições
  instance.interceptors.request.use(
    (config) => {
      // Adicionar token de autenticação se existir
      const token = TokenCookieManager.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log da requisição em desenvolvimento
      if (import.meta.env.VITE_ENVIRONMENT === 'development') {
        console.log('🚀 API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data,
          hasToken: !!token,
        });
      }

      return config;
    },
    (error) => {
      console.error('❌ Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Interceptor para respostas
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log da resposta em desenvolvimento
      if (import.meta.env.VITE_ENVIRONMENT === 'development') {
        console.log('✅ API Response:', {
          status: response.status,
          url: response.config.url,
          data: response.data,
        });
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Log do erro
      console.error('❌ API Error:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url,
      });

      // Tratar erro 401 (token expirado)
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const refreshToken = TokenCookieManager.getRefreshToken();

        if (refreshToken) {
          try {
            // Tentar renovar o token
            const response = await axios.post(
              `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
              { refresh_token: refreshToken }
            );

            const { access_token, refresh_token: newRefreshToken } =
              response.data;

            // Atualizar tokens nos cookies
            TokenCookieManager.setTokens(access_token, newRefreshToken, true);

            // Refazer a requisição original com o novo token
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return instance(originalRequest);
          } catch (refreshError) {
            console.error('❌ Erro ao renovar token:', refreshError);
            // Se falhar o refresh, limpar tokens e redirecionar
            TokenCookieManager.clearTokens();
            window.location.href = '/auth/login';
          }
        } else {
          // Sem refresh token, redirecionar para login
          TokenCookieManager.clearTokens();
          window.location.href = '/auth/login';
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Instância principal da API
export const apiClient = createApiInstance();

// Tipos para as respostas da API
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Wrapper para requisições com tratamento de erro consistente
export class ApiService {
  private static instance: ApiService;

  private constructor() {}

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await apiClient.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await apiClient.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await apiClient.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await apiClient.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      return {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        code: error.code,
      };
    }
    return {
      message: 'Erro inesperado ocorreu',
    };
  }
}

export const apiService = ApiService.getInstance();
