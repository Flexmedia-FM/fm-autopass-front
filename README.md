# FM AutoPass Frontend

Um projeto frontend React com Vite e TypeScript, estruturado para escalabilidade e manutenibilidade.

## 🚀 Tecnologias

### Base
- **React 19** com hooks modernos
- **Vite** para build rápido e dev server
- **TypeScript** para tipagem estática

### Roteamento
- **React Router DOM v7** com route objects + loaders/actions
- Estrutura baseada em loaders para carregamento de dados

### UI
- **Material UI** para componentes visuais
- **@emotion** para CSS-in-JS
- **@mui/icons-material** para ícones

### Formulários e Validação
- **React Hook Form** para gerenciamento de formulários
- **Zod** para validação de schemas
- **@hookform/resolvers** para integração

### Estado
- **Zustand** para gerenciamento leve de estado, isolado por feature

### HTTP Client
- **Axios** para requisições HTTP performáticas
- Interceptors para autenticação automática
- Tratamento centralizado de erros

### Fetch/Cache
- **@tanstack/react-query** para chamadas e cache de dados

## 📁 Estrutura do Projeto

```
src/
├── routes/                    # Rotas organizadas por feature
│   ├── layout.tsx            # Layout principal com navegação
│   ├── dashboard/            # Feature Dashboard
│   │   ├── index.tsx        # Componente da rota
│   │   ├── loader.ts        # Loader de dados
│   │   ├── store.ts         # Estado local Zustand
│   │   └── schema.ts        # Schemas Zod
│   ├── devices/             # Feature Dispositivos
│   │   ├── index.tsx        # Componente da rota
│   │   ├── loader.ts        # Loader de dados
│   │   ├── store.ts         # Estado local Zustand
│   │   └── schema.ts        # Schemas Zod
│   └── auth/                # Feature Autenticação
│       ├── index.tsx        # Barrel exports
│       ├── login.tsx        # Tela de login
│       ├── forgot-password.tsx # Tela de recuperação
│       ├── store.ts         # Estado de autenticação
│       ├── schema.ts        # Schemas de validação
│       └── loader.ts        # Loaders de proteção
├── shared/                   # Recursos compartilhados
│   ├── ui/                  # Componentes UI reutilizáveis
│   │   ├── CustomButton.tsx # Botão customizado
│   │   └── index.ts         # Barrel exports
│   └── services/            # Serviços HTTP
│       ├── api.ts           # Cliente HTTP com Axios
│       ├── auth.ts          # Serviço de autenticação
│       └── index.ts         # Barrel exports
├── app/                     # Configuração da aplicação
│   ├── query/              # Setup React Query
│   │   └── index.ts        # QueryClient provider
│   └── theme/              # Configuração de tema
│       ├── index.ts        # Temas Material-UI
│       ├── ThemeProvider.tsx # Provider de tema
│       └── useTheme.ts     # Hook de tema
├── assets/                 # Recursos estáticos
│   ├── AUTOPASS.png        # Logo da aplicação
│   └── Copyright.png       # Copyright footer
├── main.tsx                # Entry point
└── App.tsx                 # Router principal
```

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor em modo desenvolvimento
npm run dev:staging      # Inicia servidor em modo staging

# Build
npm run build            # Build para produção
npm run build:staging    # Build para staging
npm run build:dev        # Build para desenvolvimento

# Linting e Formatação
npm run lint             # Executa ESLint
npm run lint:fix         # Corrige erros do ESLint automaticamente
npm run format           # Formata código com Prettier
npm run format:check     # Verifica formatação sem alterar

# Preview
npm run preview          # Preview do build de produção
npm run preview:staging  # Preview do build de staging
```

## 🔧 Configuração de Ambiente

### Variáveis de Ambiente

O projeto usa diferentes arquivos de ambiente para cada situação:

- **`.env`** - Variáveis padrão para todos os ambientes
- **`.env.development`** - Configurações para desenvolvimento
- **`.env.staging`** - Configurações para homologação
- **`.env.production`** - Configurações para produção

### Variáveis Disponíveis

```bash
# URL base da API
VITE_API_BASE_URL=http://localhost:43000

# Ambiente atual
VITE_ENVIRONMENT=development

# Timeout das requisições (ms)
VITE_API_TIMEOUT=10000

# Nome da aplicação
VITE_APP_NAME=FM AutoPass
```

### Configuração por Ambiente

**Desenvolvimento (localhost:43000)**
```bash
VITE_API_BASE_URL=http://localhost:43000
VITE_ENVIRONMENT=development
```

**Staging/Homologação**
```bash
VITE_API_BASE_URL=https://api-hml.autopass.com
VITE_ENVIRONMENT=staging
```

**Produção**
```bash
VITE_API_BASE_URL=https://api.autopass.com
VITE_ENVIRONMENT=production
```

## 🚀 Como Executar

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure as variáveis de ambiente:**
   - Copie `.env` para `.env.local` se necessário
   - Ajuste as URLs da API conforme seu ambiente

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse no navegador:**
   ```
   http://localhost:5173
   ```

## 🔐 Autenticação

### API Endpoints

A aplicação espera os seguintes endpoints da API:

```bash
POST /auth/login           # Login com email/senha
POST /auth/logout          # Logout do usuário
POST /auth/forgot-password # Recuperação de senha
POST /auth/reset-password  # Redefinição de senha
POST /auth/refresh         # Renovação de tokens
GET  /auth/verify          # Verificação de token
GET  /auth/profile         # Perfil do usuário
```

### Formato das Respostas

**Login Success (POST /auth/login):**
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "1",
      "name": "Administrador",
      "email": "admin@autopass.com",
      "role": "admin"
    },
    "expires_in": 3600
  },
  "message": "Login realizado com sucesso",
  "success": true
}
```

### Fluxo de Autenticação

1. **Login**: Usuário faz login com email/senha
2. **Tokens**: API retorna access_token e refresh_token
3. **Armazenamento**: Tokens são salvos no localStorage via Zustand
4. **Interceptors**: Axios adiciona automaticamente o Bearer token
5. **Renovação**: Tokens são renovados automaticamente quando expiram
6. **Logout**: Tokens são removidos e usuário redirecionado

## 🎯 Funcionalidades Implementadas

### Autenticação
- Login com validação em tempo real
- Recuperação de senha (mockada)
- Logout automático em caso de token inválido
- Renovação automática de tokens
- Proteção de rotas

### Dashboard
- Estatísticas em cards visuais
- Sistema de alertas com Zustand
- Loader tipado com Zod
- Ícones Material UI

### Dispositivos
- Lista de dispositivos com validação Zod
- CRUD básico com Zustand
- Status visual com chips coloridos
- Botão customizado reutilizável
- Loader para carregamento de dados

### Layout e Navegação
- AppBar e Drawer lateral com tema AutoPass
- Navegação com React Router
- Links ativos destacados
- Layout responsivo
- Toggle de tema claro/escuro

## 📝 Padrões de Código

### Estrutura por Feature
Cada rota possui sua própria pasta com:
- `index.tsx` - Componente principal
- `loader.ts` - Carregamento de dados
- `store.ts` - Estado local
- `schema.ts` - Validações

### Serviços HTTP
- Cliente Axios centralizado com interceptors
- Tratamento de erros padronizado
- Renovação automática de tokens
- Logs em desenvolvimento

### Tipagem com TypeScript
- Tipos exportados de schemas Zod
- Props tipadas para componentes
- Loaders com tipos específicos
- Serviços tipados

### Validação com Zod
- Schemas para validação de dados
- Integração com React Hook Form
- Validação no loader e store

### Estado com Zustand
- Stores isolados por feature
- Ações tipadas
- Estado derivado
- Persistência automática

## 🧪 Testes

Para testar a integração com a API:

1. **Certifique-se de que a API está rodando em localhost:43000**
2. **Acesse a tela de login**
3. **Teste diferentes cenários:**
   - Login com credenciais válidas
   - Login com credenciais inválidas
   - Recuperação de senha
   - Logout

## 🔧 Configuração

### ESLint + Prettier
Configuração incluída para:
- TypeScript
- React
- Hooks rules
- Prettier integration

### Material UI Theme
Theme customizado com cores da AutoPass:
- Tema claro e escuro
- Gradientes personalizados
- Componentes estilizados

### React Query
QueryClient configurado com:
- Cache de 30 minutos
- Stale time de 5 minutos
- Retry automático

### Axios
Cliente HTTP configurado com:
- Base URL por ambiente
- Interceptors de autenticação
- Tratamento de erros
- Logs de desenvolvimento

## 📚 Próximos Passos

1. ✅ Implementar integração com API real
2. ✅ Configurar variáveis de ambiente
3. ✅ Adicionar interceptors de autenticação
4. ⏳ Implementar testes com Vitest
5. ⏳ Adicionar animações com Framer Motion
6. ⏳ Implementar mais features do dashboard
7. ⏳ Adicionar notificações toast

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request
