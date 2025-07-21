/**
 * Utilitários para gerenciamento de cookies
 */

export interface CookieOptions {
  expires?: Date;
  maxAge?: number;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Define um cookie
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): void {
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options.expires) {
    cookieString += `; expires=${options.expires.toUTCString()}`;
  }

  if (options.maxAge) {
    cookieString += `; max-age=${options.maxAge}`;
  }

  if (options.domain) {
    cookieString += `; domain=${options.domain}`;
  }

  if (options.path) {
    cookieString += `; path=${options.path}`;
  }

  if (options.secure) {
    cookieString += '; secure';
  }

  if (options.httpOnly) {
    cookieString += '; httponly';
  }

  if (options.sameSite) {
    cookieString += `; samesite=${options.sameSite}`;
  }

  document.cookie = cookieString;
}

/**
 * Obtém o valor de um cookie
 */
export function getCookie(name: string): string | null {
  const encodedName = encodeURIComponent(name);
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(`${encodedName}=`)) {
      return decodeURIComponent(cookie.substring(encodedName.length + 1));
    }
  }

  return null;
}

/**
 * Remove um cookie
 */
export function removeCookie(
  name: string,
  options: Pick<CookieOptions, 'domain' | 'path'> = {}
): void {
  setCookie(name, '', {
    ...options,
    expires: new Date(0),
  });
}

/**
 * Verifica se um cookie existe
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}

/**
 * Gerenciador específico para tokens de autenticação
 */
export class TokenCookieManager {
  private static readonly ACCESS_TOKEN_KEY = 'fm-autopass-access-token';
  private static readonly REFRESH_TOKEN_KEY = 'fm-autopass-refresh-token';

  // Token de acesso expira em 15 minutos
  private static readonly ACCESS_TOKEN_MAX_AGE = 15 * 60; // 15 minutos em segundos

  // Token de refresh expira em 7 dias
  private static readonly REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 dias em segundos

  /**
   * Salva os tokens nos cookies
   */
  static setTokens(
    accessToken: string,
    refreshToken: string,
    rememberMe = false
  ): void {
    const baseOptions: CookieOptions = {
      path: '/',
      secure: window.location.protocol === 'https:',
      sameSite: 'lax',
    };

    // Token de acesso (sempre 15 minutos)
    setCookie(this.ACCESS_TOKEN_KEY, accessToken, {
      ...baseOptions,
      maxAge: this.ACCESS_TOKEN_MAX_AGE,
    });

    // Token de refresh (7 dias se "lembrar", senão sessão)
    const refreshOptions = rememberMe
      ? { ...baseOptions, maxAge: this.REFRESH_TOKEN_MAX_AGE }
      : baseOptions; // Sem maxAge = cookie de sessão

    setCookie(this.REFRESH_TOKEN_KEY, refreshToken, refreshOptions);
  }

  /**
   * Obtém o token de acesso
   */
  static getAccessToken(): string | null {
    return getCookie(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Obtém o token de refresh
   */
  static getRefreshToken(): string | null {
    return getCookie(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Remove todos os tokens
   */
  static clearTokens(): void {
    removeCookie(this.ACCESS_TOKEN_KEY, { path: '/' });
    removeCookie(this.REFRESH_TOKEN_KEY, { path: '/' });
  }

  /**
   * Verifica se há tokens salvos
   */
  static hasTokens(): boolean {
    return (
      hasCookie(this.ACCESS_TOKEN_KEY) && hasCookie(this.REFRESH_TOKEN_KEY)
    );
  }

  /**
   * Atualiza apenas o token de acesso (usado no refresh)
   */
  static updateAccessToken(accessToken: string): void {
    const baseOptions: CookieOptions = {
      path: '/',
      secure: window.location.protocol === 'https:',
      sameSite: 'lax',
      maxAge: this.ACCESS_TOKEN_MAX_AGE,
    };

    setCookie(this.ACCESS_TOKEN_KEY, accessToken, baseOptions);
  }
}
