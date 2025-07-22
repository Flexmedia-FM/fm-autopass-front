import { useLoaderData } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Switch,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useUsersStore } from './store';
import { CustomButton } from '../../shared/ui';
import {
  ReusableDataGrid,
  type DataGridColumn,
} from '../../shared/ui/ReusableDataGrid';
import { CreateUserDialog } from './CreateUserDialog';
import type { UsersLoaderData } from './loader';
import type { User } from './schema';
import type { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';

export default function UsersRoute() {
  const loaderData = useLoaderData() as UsersLoaderData;
  const {
    users,
    totalUsers,
    currentPage,
    limit,
    isLoading,
    error,
    toggleUserStatus,
    removeUser,
    setPage,
    setLimit,
    setFilters,
    setUsers,
  } = useUsersStore();

  const [paginationModel, setPaginationModel] = useState({
    page: currentPage - 1, // DataGrid usa 0-based, nossa store usa 1-based
    pageSize: limit,
  });

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Sincronizar dados do loader com a store
  useEffect(() => {
    if (loaderData?.users) {
      setUsers(loaderData.users);
    }
  }, [loaderData, setUsers]);

  const handlePaginationChange = useCallback(
    (model: GridPaginationModel) => {
      setPaginationModel(model);
      setPage(model.page + 1); // Converter para 1-based
      setLimit(model.pageSize);
    },
    [setPage, setLimit]
  );

  const handleSortChange = useCallback(
    (model: GridSortModel) => {
      if (model.length > 0) {
        const sort = model[0];
        setFilters({
          sortBy: sort.field,
          sortOrder: sort.sort || 'asc',
        });
      } else {
        setFilters({
          sortBy: undefined,
          sortOrder: undefined,
        });
      }
    },
    [setFilters]
  );

  const handleStatusToggle = useCallback(
    (id: string) => {
      toggleUserStatus(id);
    },
    [toggleUserStatus]
  );

  const handleEdit = useCallback((id: string) => {
    console.log('Editar usuário:', id);
    // Aqui você implementaria a lógica de edição
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
        removeUser(id);
      }
    },
    [removeUser]
  );

  const handleAddUser = useCallback(() => {
    setCreateDialogOpen(true);
  }, []);

  const handleCloseCreateDialog = useCallback(() => {
    setCreateDialogOpen(false);
  }, []);

  const getUserRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'OPERATOR':
        return 'Operador';
      default:
        return role;
    }
  };

  const getUserRoleColor = (
    role: string
  ): 'primary' | 'secondary' | 'default' => {
    switch (role) {
      case 'ADMIN':
        return 'primary';
      case 'OPERATOR':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const columns: DataGridColumn[] = [
    {
      field: 'login',
      headerName: 'Login',
      width: 150,
      sortable: true,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 250,
      sortable: true,
    },
    {
      field: 'name',
      headerName: 'Nome',
      width: 200,
      sortable: true,
      renderCell: (params) => <span>{params.value || 'Não informado'}</span>,
    },
    {
      field: 'userRole',
      headerName: 'Perfil',
      width: 140,
      sortable: true,
      renderCell: (params) => (
        <Chip
          label={getUserRoleLabel(params.value as string)}
          color={getUserRoleColor(params.value as string)}
          size="small"
        />
      ),
    },
    {
      field: 'tenantName',
      headerName: 'Organização',
      width: 150,
      sortable: true,
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 100,
      sortable: true,
      renderCell: (params) => (
        <Tooltip title={params.value ? 'Usuário ativo' : 'Usuário inativo'}>
          <Switch
            checked={params.value as boolean}
            onChange={() => handleStatusToggle(params.row.id as string)}
            size="small"
            color="primary"
          />
        </Tooltip>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Criado em',
      width: 120,
      sortable: true,
      renderCell: (params) => (
        <span>
          {new Date(params.value as string).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Editar usuário">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleEdit(params.row.id as string)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir usuário">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.id as string)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Usuários
        </Typography>
        <CustomButton
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={handleAddUser}
        >
          Adicionar Usuário
        </CustomButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Dados carregados via loader: {loaderData.users.total} usuários
        encontrados
      </Typography>

      <ReusableDataGrid
        rows={users}
        columns={columns}
        totalRows={totalUsers}
        loading={isLoading}
        error={error}
        pagination={paginationModel}
        onPaginationChange={handlePaginationChange}
        onSortChange={handleSortChange}
        getRowId={(row) => (row as User).id}
        autoHeight
        rowHeight={60}
        sx={{
          '& .MuiDataGrid-cell--textLeft': {
            paddingLeft: 2,
          },
          '& .MuiDataGrid-columnHeader--sortable': {
            fontWeight: 600,
          },
        }}
      />

      <CreateUserDialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
      />
    </Box>
  );
}
