import type { UserProfile } from '../services';

/**
 * Extrai o nome de exibição do email do usuário
 */
export function getDisplayName(user: UserProfile | null): string {
  if (!user?.email) return 'Usuário';

  // Extrair a parte antes do @ do email
  const emailParts = user.email.split('@');
  const username = emailParts[0];

  // Capitalize a primeira letra e remover pontos/underscores
  const cleanUsername = username.replace(/[._]/g, ' ');
  return cleanUsername
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Extrai as iniciais do usuário do email
 */
export function getUserInitials(user: UserProfile | null): string {
  if (!user?.email) return 'U';

  // Usar as primeiras letras do email
  const emailParts = user.email.split('@');
  const username = emailParts[0];

  // Se tem ponto ou underscore, usar as primeiras letras de cada parte
  if (username.includes('.') || username.includes('_')) {
    const parts = username.split(/[._]/);
    return parts
      .slice(0, 2) // Pegar apenas as duas primeiras partes
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  // Senão, usar as duas primeiras letras
  return username.slice(0, 2).toUpperCase();
}

/**
 * Verifica se o usuário é administrador
 */
export function isAdmin(user: UserProfile | null): boolean {
  return user?.userRole === 'ADMIN';
}

/**
 * Verifica se o usuário é proprietário do tenant
 */
export function isTenantOwner(user: UserProfile | null): boolean {
  return user?.tenantRole === 'OWNER';
}

/**
 * Obtém o nível de acesso do usuário (útil para exibição)
 */
export function getUserAccessLevel(user: UserProfile | null): string {
  if (!user) return 'Visitante';

  if (user.tenantRole === 'OWNER') return 'Proprietário';
  if (user.userRole === 'ADMIN') return 'Administrador';
  return 'Usuário';
}
