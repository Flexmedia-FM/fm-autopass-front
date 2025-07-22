# Serviços da Aplicação FM AutoPass

Este documento descreve os serviços disponíveis na aplicação para interação com a API.

## Estrutura dos Serviços

Todos os serviços seguem um padrão consistente:

- **Validação com Zod**: Todos os dados são validados usando schemas Zod
- **TypeScript**: Tipos completamente tipados
- **Interceptors**: Tratamento automático de erros e autenticação
- **Padronização**: Interface consistente entre todos os serviços

## Serviços Disponíveis

### 1. Linhas (`LinesService`)

Gerencia as linhas do sistema de transporte.

#### Endpoints:
- `GET /lines` - Buscar todas as linhas
- `GET /lines/:id` - Buscar linha por ID
- `POST /lines` - Criar nova linha
- `PATCH /lines/:id` - Atualizar linha
- `DELETE /lines/:id` - Excluir linha

#### Exemplo de uso:
```typescript
import { LinesService } from '../shared/services';

// Buscar todas as linhas com paginação
const linesResponse = await LinesService.findAll({
  page: 1,
  limit: 10,
  search: 'Linha Azul',
  sortBy: 'name',
  order: 'asc'
});

// Criar nova linha
const newLine = await LinesService.create({
  name: 'Linha Verde',
  code: 'LV-001',
  tenantId: 'tenant-uuid'
});

// Buscar linhas simplificadas para dropdowns
const simpleLines = await LinesService.findAllSimple();
```

#### Schema da Linha:
```typescript
{
  id: string (UUID);
  name: string;
  code: string;
  tenantId: string (UUID);
  createdAt: string (datetime);
  updatedAt: string (datetime);
}
```

### 2. Instalações/Estações (`InstallationsService`)

Gerencia as estações/instalações do sistema.

#### Endpoints:
- `GET /installations` - Buscar todas as instalações
- `GET /installations/:id` - Buscar instalação por ID
- `POST /installations` - Criar nova instalação
- `PATCH /installations/:id` - Atualizar instalação
- `DELETE /installations/:id` - Excluir instalação
- `GET /installations/nearby` - Buscar instalações próximas

#### Exemplo de uso:
```typescript
import { InstallationsService } from '../shared/services';

// Buscar todas as instalações
const installations = await InstallationsService.findAll({
  page: 1,
  limit: 20,
  search: 'Estação Paulista'
});

// Buscar por tenant
const tenantInstallations = await InstallationsService.findByTenant('tenant-uuid');

// Buscar instalações próximas
const nearbyInstallations = await InstallationsService.findNearby(
  -23.561684, // latitude
  -46.655981, // longitude
  5000 // raio em metros (opcional)
);

// Criar nova instalação
const newInstallation = await InstallationsService.create({
  name: 'Estação Consolação',
  code: 'CON-001',
  address: 'Avenida Paulista, 1000',
  location: { lat: -23.561684, lng: -46.655981 },
  tenantId: 'tenant-uuid'
});
```

#### Schema da Instalação:
```typescript
{
  id: string (UUID);
  name: string;
  code?: string;
  address?: string;
  location?: { lat: number; lng: number };
  tenantId: string (UUID);
  createdAt: string (datetime);
  updatedAt: string (datetime);
}
```

### 3. Dispositivos (`DevicesService`)

Gerencia os dispositivos do sistema (versão real para substituir o mock atual).

#### Endpoints:
- `GET /devices` - Buscar todos os dispositivos
- `GET /devices/:id` - Buscar dispositivo por ID
- `POST /devices` - Criar novo dispositivo
- `PATCH /devices/:id` - Atualizar dispositivo
- `DELETE /devices/:id` - Excluir dispositivo
- `GET /devices/statistics` - Estatísticas dos dispositivos

#### Status dos Dispositivos:
- `NOT_INSTALLED`: Não Instalado
- `INSTALLED`: Instalado
- `ACTIVE`: Ativo
- `INACTIVE`: Inativo
- `MAINTENANCE`: Em Manutenção
- `DECOMMISSIONED`: Descomissionado

#### Exemplo de uso:
```typescript
import { DevicesService } from '../shared/services';

// Buscar dispositivos com filtros
const devices = await DevicesService.findAll({
  page: 1,
  limit: 10,
  status: 'ACTIVE',
  atmId: 'atm-uuid'
});

// Buscar por ATM específico
const atmDevices = await DevicesService.findByAtm('atm-uuid');

// Atualizar status
await DevicesService.updateStatus('device-uuid', 'MAINTENANCE');

// Métodos de conveniência
await DevicesService.activate('device-uuid');
await DevicesService.deactivate('device-uuid');
await DevicesService.markAsInstalled('device-uuid');
await DevicesService.recordMaintenance('device-uuid', 'Manutenção preventiva');

// Obter estatísticas
const stats = await DevicesService.getStatistics();
```

#### Schema do Dispositivo:
```typescript
{
  id: string (UUID);
  serialNumber: string;
  code?: string;
  atmId: string (UUID);
  tenantId: string (UUID);
  status: DeviceStatus;
  installationDate?: string (datetime);
  lastMaintenanceDate?: string (datetime);
  notes?: string;
  createdAt: string (datetime);
  updatedAt: string (datetime);
  atm?: { id: string; name: string; code?: string };
  tenant?: { id: string; name: string; fantasyName: string };
}
```

## Integração com React Router Loaders

### Exemplo para Devices:
```typescript
// src/routes/devices/loader.ts
import { DevicesService } from '../../shared/services';
import { useDevicesStore } from './store';

export async function devicesLoader(): Promise<DevicesLoaderData> {
  try {
    // Usar o serviço real em vez de mock
    const response = await DevicesService.findAll({
      page: 1,
      limit: 50
    });

    // Atualizar store se necessário
    useDevicesStore.getState().setDevices(response.data);

    return {
      devices: response.data,
      total: response.total,
      page: response.page,
      totalPages: response.totalPages
    };
  } catch (error) {
    console.error('Erro ao carregar dispositivos:', error);
    throw new Response('Erro ao carregar dispositivos', { status: 500 });
  }
}
```

## Tratamento de Erros

Todos os serviços utilizam o `ApiService` que já possui:

- Interceptors para refresh token automático
- Tratamento de erros 401 (redirecionamento para login)
- Logs em modo desenvolvimento
- Tipagem consistente de erros

## Validação de Dados

Todos os schemas Zod estão configurados para:

- Validar dados de entrada antes de enviar para API
- Validar dados de resposta da API
- Fornecer mensagens de erro claras
- Garantir type safety completo

## Próximos Passos

1. **Integrar com as telas existentes**: Substituir os mocks pelos serviços reais
2. **Criar stores Zustand**: Para cada entidade (linhas, instalações)
3. **Implementar cache**: Usar React Query ou SWR para cache inteligente
4. **Testes**: Criar testes unitários para os serviços

## Importação

```typescript
// Importar todos os serviços
import {
  LinesService,
  InstallationsService, 
  DevicesService,
  UsersService,
  TenantsService
} from '../shared/services';

// Ou importar específico
import { LinesService } from '../shared/services/lines';
```
