# Dockerfile para FM AutoPass Frontend
# Multi-stage build para otimização de tamanho

# Estágio 1: Build da aplicação
FROM node:20-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production --silent

# Copiar todo o código fonte
COPY . .

# Argumento para definir o ambiente de build
ARG BUILD_MODE=production

# Build da aplicação baseado no modo
RUN if [ "$BUILD_MODE" = "staging" ]; then \
  npm run build:staging; \
  elif [ "$BUILD_MODE" = "development" ]; then \
  npm run build:dev; \
  else \
  npm run build; \
  fi

# Estágio 2: Servidor de produção
FROM nginx:1.25-alpine AS production

# Instalar curl para health checks
RUN apk add --no-cache curl

# Copiar arquivos buildados do estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Expor porta 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/ || exit 1

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]

# Estágio 3: Desenvolvimento (opcional)
FROM node:20-alpine AS development

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar todas as dependências (incluindo dev)
RUN npm ci --silent

# Copiar código fonte
COPY . .

# Expor porta do Vite dev server
EXPOSE 5173

# Comando para desenvolvimento
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
