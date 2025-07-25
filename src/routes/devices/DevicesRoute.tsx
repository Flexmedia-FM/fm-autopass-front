import { useLoaderData } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  IconButton,
  Chip,
  Tooltip,
  TextField,
  InputAdornment,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Build as MaintenanceIcon,
  PowerSettingsNew as PowerIcon,
} from '@mui/icons-material';
import { useDevicesStore } from './store';
import {
  ReusableDataGrid,
  type DataGridColumn,
} from '../../shared/ui/ReusableDataGrid';
import type { Device, DeviceStatus } from '../../shared/services/devices';
import type { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import {
  DeviceStatusLabels,
  DeviceStatusColors,
} from '../../shared/services/devices';

// Tipo para dados do loader (específico da rota)
interface DevicesLoaderData {
  devices: {
    data: Device[];
    total: number;
    page: number;
    limit: number;
  };
}
import { TenantsService } from '../../shared/services';
import { CreateDeviceDialog } from './CreateDeviceDialog';
import { EditDeviceDialog } from './EditDeviceDialog';
import { DeleteDeviceDialog } from './DeleteDeviceDialog';

// Componente para exibir o nome do tenant de forma assíncrona
function TenantNameCell({ tenantId }: { tenantId: string }) {
  const [tenantName, setTenantName] = useState<string>('Carregando...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchTenantName = async () => {
      try {
        const tenant = await TenantsService.findById(tenantId);
        if (isMounted) {
          setTenantName(tenant?.name || 'N/A');
          setIsLoading(false);
        }
      } catch {
        if (isMounted) {
          setTenantName('Erro');
          setIsLoading(false);
        }
      }
    };

    fetchTenantName();

    return () => {
      isMounted = false;
    };
  }, [tenantId]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={16} />
        <Typography variant="body2">Carregando...</Typography>
      </Box>
    );
  }

  return <Typography variant="body2">{tenantName}</Typography>;
}

export default function DevicesRoute() {
  const loaderData = useLoaderData() as DevicesLoaderData;
  const {
    devices,
    totalDevices,
    currentPage,
    limit,
    isLoading,
    error,
    filters,
    loadDevices,
    refreshDevices,
    updateDeviceStatus,
    setPage,
    setLimit,
    setFilters,
    clearFilters,
  } = useDevicesStore();

  // Estados locais para filtros da UI
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | ''>(
    filters.status || ''
  );

  // Estados para controlar os diálogos
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  // Inicializar com dados do loader
  useEffect(() => {
    if (loaderData.devices.data.length > 0) {
      useDevicesStore.getState().setDevices(loaderData.devices);
    }
  }, [loaderData]);

  // Paginação para sincronizar com MUI DataGrid
  const [paginationModel, setPaginationModel] = useState({
    page: currentPage - 1, // DataGrid usa 0-based, nossa store usa 1-based
    pageSize: limit,
  });

  // Atualizar paginationModel quando o store mudar
  useEffect(() => {
    setPaginationModel({
      page: currentPage - 1, // DataGrid usa 0-based, nossa store usa 1-based
      pageSize: limit,
    });
  }, [currentPage, limit]);

  const handleSearch = useCallback(() => {
    setFilters({
      search: searchValue || undefined,
    });
    // Reset para primeira página quando buscar
    setPage(1);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [searchValue, setFilters, setPage]);

  const handleSearchKeyPress = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleFilterChange = useCallback(
    (newFilters: Partial<typeof filters>) => {
      const updatedFilters = { ...filters, ...newFilters, page: 1 };
      setFilters(updatedFilters);
      loadDevices(updatedFilters);
    },
    [filters, setFilters, loadDevices]
  );

  const handleStatusFilterChange = (status: DeviceStatus | '') => {
    setStatusFilter(status);
    handleFilterChange({ status: status || undefined });
  };

  const handleClearFilters = () => {
    setSearchValue('');
    setStatusFilter('');
    clearFilters();
    loadDevices();
  };

  const handleRefresh = () => {
    refreshDevices();
  };

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
    setPage(model.page + 1); // MUI usa 0-indexed, nossa API usa 1-indexed
    setLimit(model.pageSize);
    loadDevices({
      ...filters,
      page: model.page + 1,
      limit: model.pageSize,
    });
  };

  const handleSortChange = (model: GridSortModel) => {
    if (model.length > 0) {
      const sort = model[0];
      const sortBy = sort.field as
        | 'createdAt'
        | 'serialNumber'
        | 'status'
        | 'installationDate';
      const sortOrder = sort.sort as 'asc' | 'desc';

      handleFilterChange({ sortBy, sortOrder });
    }
  };

  const handleStatusToggle = async (device: Device) => {
    const newStatus: DeviceStatus =
      device.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await updateDeviceStatus(device.id, newStatus);
  };

  const handleMaintenanceToggle = async (device: Device) => {
    const newStatus: DeviceStatus =
      device.status === 'MAINTENANCE' ? 'ACTIVE' : 'MAINTENANCE';
    await updateDeviceStatus(device.id, newStatus);
  };

  // Handlers para diálogos
  const handleCreateDevice = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEditDevice = (device: Device) => {
    setSelectedDevice(device);
    setIsEditDialogOpen(true);
  };

  const handleDeleteDevice = (device: Device) => {
    setSelectedDevice(device);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDialogs = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedDevice(null);
  };

  // Definição das colunas da grid
  const columns: DataGridColumn[] = [
    {
      field: 'serialNumber',
      headerName: 'Número de Série',
      flex: 1,
      minWidth: 150,
    },
    // {
    //   field: 'code',
    //   headerName: 'Código',
    //   flex: 0.8,
    //   minWidth: 120,
    //   valueGetter: (_, row) => (row as Device).code || 'N/A',
    // },
    {
      field: 'atm',
      headerName: 'ATM',
      flex: 1,
      minWidth: 150,
      valueGetter: (_, row) => (row as Device).atm?.code || 'N/A',
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.8,
      minWidth: 130,
      renderCell: (params) => {
        const device = params.row as Device;
        return (
          <Chip
            label={DeviceStatusLabels[device.status]}
            color={DeviceStatusColors[device.status]}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'installationDate',
      headerName: 'Data de Instalação',
      flex: 1,
      minWidth: 150,
      valueGetter: (_, row) => {
        const device = row as Device;
        return device.installationDate
          ? new Date(device.installationDate).toLocaleDateString('pt-BR')
          : 'Não instalado';
      },
    },
    {
      field: 'lastMaintenanceDate',
      headerName: 'Última Manutenção',
      flex: 1,
      minWidth: 150,
      valueGetter: (_, row) => {
        const device = row as Device;
        return device.lastMaintenanceDate
          ? new Date(device.lastMaintenanceDate).toLocaleDateString('pt-BR')
          : 'Nunca';
      },
    },
    {
      field: 'tenant',
      headerName: 'Organização',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        const device = params.row as Device;
        return <TenantNameCell tenantId={device.tenantId} />;
      },
    },
    {
      field: 'actions',
      headerName: 'Ações',
      flex: 1,
      minWidth: 200,
      sortable: false,
      renderCell: (params) => {
        const device = params.row as Device;
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip
              title={device.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}
            >
              <IconButton
                size="small"
                onClick={() => handleStatusToggle(device)}
                disabled={isLoading}
                color={device.status === 'ACTIVE' ? 'error' : 'success'}
              >
                <PowerIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip
              title={
                device.status === 'MAINTENANCE'
                  ? 'Retornar para Ativo'
                  : 'Colocar em Manutenção'
              }
            >
              <IconButton
                size="small"
                onClick={() => handleMaintenanceToggle(device)}
                disabled={isLoading}
                color={device.status === 'MAINTENANCE' ? 'primary' : 'warning'}
              >
                <MaintenanceIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Editar">
              <IconButton size="small" onClick={() => handleEditDevice(device)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Excluir">
              <IconButton
                size="small"
                onClick={() => handleDeleteDevice(device)}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Dispositivos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateDevice}
        >
          Adicionar Dispositivo
        </Button>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <TextField
            size="small"
            placeholder="Buscar por número de série, código..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) =>
                handleStatusFilterChange(e.target.value as DeviceStatus | '')
              }
            >
              <MenuItem value="">Todos</MenuItem>
              {Object.entries(DeviceStatusLabels).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{ minWidth: 100 }}
          >
            Buscar
          </Button>

          <Button
            variant="outlined"
            onClick={handleClearFilters}
            disabled={!searchValue && !statusFilter}
          >
            Limpar Filtros
          </Button>

          <IconButton
            onClick={handleRefresh}
            disabled={isLoading}
            title="Atualizar"
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Alertas de erro */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => useDevicesStore.getState().setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Informações da listagem */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Exibindo {devices.length} de {totalDevices} dispositivos
      </Typography>

      {/* Data Grid */}
      <ReusableDataGrid
        rows={devices}
        columns={columns}
        totalRows={totalDevices}
        loading={isLoading}
        pagination={paginationModel}
        onPaginationChange={handlePaginationChange}
        onSortChange={handleSortChange}
        getRowId={(row) => (row as Device).id}
        height={600}
      />

      {/* Diálogos de CRUD */}
      <CreateDeviceDialog
        open={isCreateDialogOpen}
        onClose={handleCloseDialogs}
      />

      <EditDeviceDialog
        open={isEditDialogOpen}
        onClose={handleCloseDialogs}
        device={selectedDevice}
      />

      <DeleteDeviceDialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDialogs}
        device={selectedDevice}
      />
    </Box>
  );
}
