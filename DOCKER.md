# FM AutoPass Frontend - Docker Setup

Este documento fornece instruções completas para usar Docker com o projeto FM AutoPass Frontend.

## 📋 Pré-requisitos

- Docker Desktop instalado e em execução
- Docker Compose (incluído no Docker Desktop)
- Git (para clonar o repositório)

## 🚀 Quick Start

### Desenvolvimento Local

```powershell
# Usar o script PowerShell
.\docker-scripts.ps1 dev

# Ou usar docker-compose diretamente
docker-compose -f docker-compose.dev.yml up --build
```

Acesse: http://localhost:5173

### Produção

```powershell
# Usar o script PowerShell
.\docker-scripts.ps1 prod

# Ou usar docker-compose diretamente
docker-compose -f docker-compose.prod.yml up --build
```

Acesse: http://localhost:80

## 📂 Arquivos Docker

### Dockerfile
- **Multi-stage build** com estágios para desenvolvimento e produção
- **Estágio builder**: Compila a aplicação React
- **Estágio production**: Serve com Nginx otimizado
- **Estágio development**: Executa Vite dev server

### docker-compose.yml
Configuração principal com profiles para diferentes ambientes:
- `dev`: Ambiente de desenvolvimento
- `staging`: Ambiente de homologação  
- `prod`: Ambiente de produção
- `proxy`: Nginx proxy reverso

### docker-compose.dev.yml
Configuração específica para desenvolvimento com:
- Hot reload habilitado
- Volume mounting para código fonte
- Porta 5173 exposta

### docker-compose.prod.yml
Configuração específica para produção com:
- Build otimizado
- Health checks
- Resource limits
- Logging configurado

## 🛠️ Scripts Disponíveis

Use o arquivo `docker-scripts.ps1` para facilitar as operações:

```powershell
# Mostrar ajuda
.\docker-scripts.ps1 help

# Desenvolvimento
.\docker-scripts.ps1 dev

# Staging
.\docker-scripts.ps1 staging

# Produção
.\docker-scripts.ps1 prod

# Builds específicos
.\docker-scripts.ps1 build-dev
.\docker-scripts.ps1 build-staging
.\docker-scripts.ps1 build-prod

# Parar containers
.\docker-scripts.ps1 stop

# Limpar tudo
.\docker-scripts.ps1 clean

# Ver logs
.\docker-scripts.ps1 logs

# Acessar shell do container
.\docker-scripts.ps1 shell
```

## 🌍 Ambientes

### Development
- **Porta**: 5173
- **Hot Reload**: Ativado
- **Volumes**: Código fonte montado
- **Env**: `.env.development`

### Staging
- **Porta**: 8080
- **Build**: Otimizado para staging
- **Env**: `.env.staging`
- **Servidor**: Nginx

### Production
- **Porta**: 80
- **Build**: Otimizado para produção
- **Env**: `.env.production`
- **Servidor**: Nginx com cache e compressão

## 🔧 Configurações Avançadas

### Nginx Personalizado
O arquivo `nginx.conf` inclui:
- Suporte para SPA (Single Page Application)
- Compressão Gzip
- Cache de assets estáticos
- Headers de segurança
- Health check endpoint

### Health Checks
- **Desenvolvimento**: `curl -f http://localhost:5173`
- **Produção**: `curl -f http://localhost:80/health`

### Resource Limits (Produção)
- **CPU**: Max 1 core, reserva 0.25 core
- **Memory**: Max 512MB, reserva 128MB

## 🐛 Troubleshooting

### Container não inicia
```powershell
# Verificar logs
.\docker-scripts.ps1 logs

# Ou usar docker-compose diretamente
docker-compose -f docker-compose.dev.yml logs frontend
```

### Problemas de permissão no Windows
```powershell
# Executar PowerShell como administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Porta já em uso
```powershell
# Verificar processos usando a porta
netstat -ano | findstr :5173
netstat -ano | findstr :80

# Matar processo se necessário
taskkill /PID <PID> /F
```

### Limpar cache do Docker
```powershell
# Limpar containers e imagens não utilizados
docker system prune -a

# Limpar volumes não utilizados
docker volume prune
```

## 📊 Monitoramento

### Verificar status dos containers
```powershell
docker ps
docker-compose -f docker-compose.dev.yml ps
```

### Ver recursos utilizados
```powershell
docker stats
```

### Health check manual
```powershell
# Desenvolvimento
curl http://localhost:5173

# Produção
curl http://localhost:80/health
```

## 🔒 Segurança

### Headers de Segurança (Produção)
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer-when-downgrade`
- Content Security Policy configurado

### Variáveis de Ambiente
- Nunca commitar arquivos `.env.local`
- Usar Docker secrets para dados sensíveis em produção
- Validar variáveis obrigatórias no startup

## 🚀 Deploy

### Build para produção
```powershell
# Build local
.\docker-scripts.ps1 build-prod

# Tag para registry
docker tag fm-autopass-frontend:prod your-registry/fm-autopass-frontend:latest

# Push para registry
docker push your-registry/fm-autopass-frontend:latest
```

### Docker Registry
```powershell
# Login no registry
docker login your-registry.com

# Build e push
docker build --target production --build-arg BUILD_MODE=production -t your-registry/fm-autopass-frontend:v1.0.0 .
docker push your-registry/fm-autopass-frontend:v1.0.0
```

## 📝 Notas Importantes

1. **Desenvolvimento**: Use sempre o ambiente de desenvolvimento para coding
2. **Staging**: Para testes antes de produção
3. **Produção**: Apenas para deploy final
4. **Volumes**: Em desenvolvimento, o código é montado como volume para hot reload
5. **Build Args**: Use `BUILD_MODE` para controlar o tipo de build
6. **Networks**: Todos os containers usam a rede `autopass-network`

## 🤝 Contribuição

Para contribuir com melhorias nos arquivos Docker:

1. Teste localmente primeiro
2. Documente mudanças
3. Considere impactos em todos os ambientes
4. Mantenha compatibilidade com Windows/Linux
