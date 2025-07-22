import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Alert,
  Button,
  CircularProgress,
  type SelectChangeEvent,
} from '@mui/material';
import { CustomButton } from '../../shared/ui';
import { useUsersStore } from './store';
import { UpdateUserSchema, type UpdateUser, type User } from './schema';
import { useTenants } from './useTenants';
import { z } from 'zod';

interface EditUserDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

interface FormData {
  email: string;
  login: string;
  name: string;
  userRole: 'ADMIN' | 'OPERATOR' | '';
  isActive: boolean;
  tenantId: string;
  tenantName: string;
}

const initialFormData: FormData = {
  email: '',
  login: '',
  name: '',
  userRole: '',
  isActive: true,
  tenantId: '',
  tenantName: '',
};

export function EditUserDialog({ open, onClose, user }: EditUserDialogProps) {
  const { updateUser, isLoading, error } = useUsersStore();
  const {
    tenants,
    isLoading: tenantsLoading,
    error: tenantsError,
  } = useTenants();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reset form when dialog closes or user changes
  useEffect(() => {
    if (!open) {
      setFormData(initialFormData);
      setValidationErrors({});
      setSubmitError(null);
    } else if (user) {
      // Populate form with user data
      setFormData({
        email: user.email,
        login: user.login,
        name: user.name || '',
        userRole: user.userRole,
        isActive: user.isActive,
        tenantId: user.tenantId,
        tenantName: user.tenantName,
      });
      setValidationErrors({});
      setSubmitError(null);
    }
  }, [open, user]);

  const validateField = (field: keyof FormData, value: string | boolean) => {
    try {
      const fieldSchema = UpdateUserSchema.shape[field as keyof UpdateUser];
      if (fieldSchema) {
        fieldSchema.parse(value);
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationErrors((prev) => ({
          ...prev,
          [field]: error.issues[0]?.message || 'Campo inválido',
        }));
      }
    }
  };

  const handleInputChange =
    (field: keyof FormData) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
      validateField(field, value);
    };

  const handleSelectChange =
    (field: keyof FormData) => (event: SelectChangeEvent<string>) => {
      const value = event.target.value as string;

      // Se estiver selecionando um tenant, atualizar também o tenantName
      if (field === 'tenantId') {
        const selectedTenant = tenants.find((tenant) => tenant.id === value);
        setFormData((prev) => ({
          ...prev,
          [field]: value,
          tenantName: selectedTenant ? selectedTenant.name : '',
        }));
        validateField(field, value);
        if (selectedTenant) {
          validateField('tenantName', selectedTenant.name);
        }
      } else {
        setFormData((prev) => ({ ...prev, [field]: value }));
        validateField(field, value);
      }
    };

  const handleSwitchChange =
    (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.checked;
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

  const validateForm = (): boolean => {
    try {
      // Preparar dados para validação
      const dataToValidate: UpdateUser = {
        email: formData.email,
        login: formData.login,
        name: formData.name || null,
        userRole: formData.userRole as 'ADMIN' | 'OPERATOR',
        isActive: formData.isActive,
        tenantId: formData.tenantId,
        tenantName: formData.tenantName,
        tenantRole: null,
      };

      UpdateUserSchema.parse(dataToValidate);
      setValidationErrors({});
      setSubmitError(null);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!user || !validateForm()) {
      return;
    }

    try {
      setSubmitError(null);

      const userData: UpdateUser = {
        email: formData.email,
        login: formData.login,
        name: formData.name || null,
        userRole: formData.userRole as 'ADMIN' | 'OPERATOR',
        isActive: formData.isActive,
        tenantId: formData.tenantId,
        tenantName: formData.tenantName,
        tenantRole: null,
      };

      console.log('Dados sendo enviados para atualização:', userData);
      console.log('Dados originais do usuário:', user);

      await updateUser(user.id, userData);
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      setSubmitError(
        error instanceof Error ? error.message : 'Erro ao atualizar usuário'
      );
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'OPERATOR':
        return 'Operador';
      default:
        return role;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { minHeight: '500px' },
      }}
    >
      <DialogTitle>Editar Usuário</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {(submitError || error) && (
            <Alert severity="error">{submitError || error}</Alert>
          )}

          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            error={!!validationErrors.email}
            helperText={validationErrors.email}
            required
            fullWidth
            autoComplete="email"
          />

          <TextField
            label="Login"
            value={formData.login}
            onChange={handleInputChange('login')}
            error={!!validationErrors.login}
            helperText={validationErrors.login}
            required
            fullWidth
            autoComplete="username"
          />

          <TextField
            label="Nome Completo"
            value={formData.name}
            onChange={handleInputChange('name')}
            error={!!validationErrors.name}
            helperText={validationErrors.name}
            fullWidth
            autoComplete="name"
          />

          <FormControl fullWidth required error={!!validationErrors.userRole}>
            <InputLabel>Cargo</InputLabel>
            <Select
              value={formData.userRole}
              onChange={handleSelectChange('userRole')}
              label="Cargo"
            >
              <MenuItem value="">
                <em>Selecione um cargo</em>
              </MenuItem>
              <MenuItem value="ADMIN">{getRoleLabel('ADMIN')}</MenuItem>
              <MenuItem value="OPERATOR">{getRoleLabel('OPERATOR')}</MenuItem>
            </Select>
            {validationErrors.userRole && (
              <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                {validationErrors.userRole}
              </Box>
            )}
          </FormControl>

          <FormControl fullWidth required error={!!validationErrors.tenantId}>
            <InputLabel>Organização</InputLabel>
            <Select
              value={formData.tenantId}
              onChange={handleSelectChange('tenantId')}
              label="Organização"
              disabled={tenantsLoading}
            >
              <MenuItem value="">
                <em>Selecione uma organização</em>
              </MenuItem>
              {tenants.map((tenant) => (
                <MenuItem key={tenant.id} value={tenant.id}>
                  {tenant.displayName}
                </MenuItem>
              ))}
            </Select>
            {validationErrors.tenantId && (
              <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                {validationErrors.tenantId}
              </Box>
            )}
            {tenantsError && (
              <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                {tenantsError}
              </Box>
            )}
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={handleSwitchChange('isActive')}
                color="primary"
              />
            }
            label="Usuário ativo"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <CustomButton
          variant="outlined"
          onClick={handleCancel}
          disabled={isLoading}
        >
          Cancelar
        </CustomButton>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            isLoading ||
            !formData.email ||
            !formData.login ||
            !formData.userRole ||
            !formData.tenantId
          }
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
        >
          {isLoading ? 'Atualizando...' : 'Atualizar Usuário'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditUserDialog;
