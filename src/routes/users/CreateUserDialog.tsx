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
import { CreateUserSchema, type CreateUser } from './schema';
import { useTenants } from './useTenants';
import { ZodErrorHandler } from '../../shared/utils';

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  email: string;
  login: string;
  name: string;
  userRole: 'ADMIN' | 'OPERATOR' | '';
  isActive: boolean;
  tenantId: string;
  tenantName: string;
  password: string;
}

const initialFormData: FormData = {
  email: '',
  login: '',
  name: '',
  userRole: '',
  isActive: true,
  tenantId: '',
  tenantName: '',
  password: '',
};

export function CreateUserDialog({ open, onClose }: CreateUserDialogProps) {
  const { addUser, isLoading, error } = useUsersStore();
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

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData(initialFormData);
      setValidationErrors({});
      setSubmitError(null);
    }
  }, [open]);

  const validateField = (field: keyof FormData, value: string | boolean) => {
    try {
      const fieldSchema = CreateUserSchema.shape[field as keyof CreateUser];
      if (fieldSchema) {
        fieldSchema.parse(value);
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    } catch (error) {
      if (ZodErrorHandler.isZodError(error)) {
        setValidationErrors((prev) => ({
          ...prev,
          [field]: ZodErrorHandler.getFirstErrorMessage(error),
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
      const dataToValidate: CreateUser = {
        email: formData.email,
        login: formData.login,
        name: formData.name || null,
        userRole: formData.userRole as 'ADMIN' | 'OPERATOR',
        isActive: formData.isActive,
        tenantId: formData.tenantId,
        tenantName: formData.tenantName,
        tenantRole: null,
        password: formData.password,
      };

      CreateUserSchema.parse(dataToValidate);
      setValidationErrors({});
      setSubmitError(null);
      return true;
    } catch (error) {
      const handled = ZodErrorHandler.handleError(error);

      if (handled.isZodError && handled.formErrors) {
        setValidationErrors(handled.formErrors);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitError(null);

      const userData: CreateUser = {
        email: formData.email,
        login: formData.login,
        name: formData.name || null,
        userRole: formData.userRole as 'ADMIN' | 'OPERATOR',
        isActive: formData.isActive,
        tenantId: formData.tenantId,
        tenantName: formData.tenantName,
        tenantRole: null,
        password: formData.password,
      };

      await addUser(userData);
      onClose();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      setSubmitError(
        error instanceof Error ? error.message : 'Erro ao criar usuário'
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
      <DialogTitle>Criar Novo Usuário</DialogTitle>

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

          <TextField
            label="Senha"
            type="password"
            value={formData.password}
            onChange={handleInputChange('password')}
            error={!!validationErrors.password}
            helperText={validationErrors.password}
            required
            fullWidth
            autoComplete="new-password"
          />

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
          {isLoading ? 'Criando...' : 'Criar Usuário'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateUserDialog;
