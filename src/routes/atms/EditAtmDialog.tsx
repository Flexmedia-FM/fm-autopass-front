import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  type SelectChangeEvent,
} from '@mui/material';
import { useAtmsStore } from './store';
import { useTenants } from '../users/useTenants';
import { useInstallations } from './useInstallations';
import { CustomButton } from '../../shared/ui';
import {
  AtmStatusLabels,
  UpdateAtmSchema,
  type Atm,
  type UpdateAtm,
} from './schema';
import type { DeviceStatus } from '../devices';

interface EditAtmDialogProps {
  open: boolean;
  onClose: () => void;
  atm: Atm | null;
}

interface FormData {
  code: string;
  name: string;
  location: string;
  address: string;
  tenantId: string;
  installationId: string;
  deviceStatus: DeviceStatus;
  isActive?: boolean;
  notes: string;
}

const initialFormData: FormData = {
  code: '',
  name: '',
  location: '',
  address: '',
  tenantId: '',
  installationId: '',
  deviceStatus: 'ACTIVE',
  isActive: true,
  notes: '',
};

export function EditAtmDialog({ open, onClose, atm }: EditAtmDialogProps) {
  const { updateAtm, isLoading, error } = useAtmsStore();
  const {
    tenants,
    isLoading: tenantsLoading,
    error: tenantsError,
  } = useTenants();
  const {
    installations,
    isLoading: installationsLoading,
    loadInstallations,
  } = useInstallations({ autoLoad: false });

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reset form when dialog closes or atm changes
  useEffect(() => {
    if (!open) {
      setFormData(initialFormData);
      setValidationErrors({});
      setSubmitError(null);
    } else if (atm) {
      setFormData({
        code: atm.code,
        name: atm.name,
        location: atm.location || '',
        address: atm.address || '',
        tenantId: atm.tenantId,
        installationId: atm.installationId || '',
        deviceStatus: atm.deviceStatus,
        // isActive: atm.isActive,
        notes: atm.notes || '',
      });
    }
  }, [open, atm]);

  // Load installations when tenant changes
  useEffect(() => {
    if (formData.tenantId) {
      loadInstallations();
    }
  }, [formData.tenantId, loadInstallations]);

  const validateField = (field: keyof FormData, value: string | boolean) => {
    try {
      const fieldSchema = UpdateAtmSchema.shape[field as keyof UpdateAtm];
      if (fieldSchema) {
        fieldSchema.parse(value);
      }
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    } catch (error: unknown) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: error instanceof Error ? error.message : 'Campo inválido',
      }));
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
      setFormData((prev) => ({ ...prev, [field]: value }));
      validateField(field, value);
    };

  const handleSwitchChange =
    (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.checked;
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

  const validateForm = (): boolean => {
    try {
      const atmData: UpdateAtm = {
        code: formData.code,
        name: formData.name,
        location: formData.location || undefined,
        address: formData.address || undefined,
        tenantId: formData.tenantId,
        installationId: formData.installationId || undefined,
        deviceStatus: formData.deviceStatus as
          | 'ACTIVE'
          | 'INACTIVE'
          | 'MAINTENANCE',
        // isActive: formData.isActive,
        notes: formData.notes || undefined,
      };

      UpdateAtmSchema.parse(atmData);
      setValidationErrors({});
      return true;
    } catch (error: unknown) {
      const errors: Record<string, string> = {};
      if (error && typeof error === 'object' && 'errors' in error) {
        const zodError = error as {
          errors: { path: string[]; message: string }[];
        };
        zodError.errors?.forEach((err) => {
          if (err.path && err.path[0]) {
            errors[err.path[0]] = err.message;
          }
        });
      }
      setValidationErrors(errors);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!atm || !validateForm()) {
      setSubmitError('Por favor, corrija os erros do formulário');
      return;
    }

    try {
      setSubmitError(null);

      const atmData: UpdateAtm = {
        code: formData.code,
        name: formData.name,
        location: formData.location || undefined,
        address: formData.address || undefined,
        tenantId: formData.tenantId,
        installationId: formData.installationId || undefined,
        deviceStatus: formData.deviceStatus as
          | 'ACTIVE'
          | 'INACTIVE'
          | 'MAINTENANCE',
        // isActive: formData.isActive,
        notes: formData.notes || undefined,
      };

      await updateAtm(atm.id, atmData);
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar ATM:', error);
      setSubmitError(
        error instanceof Error ? error.message : 'Erro ao atualizar ATM'
      );
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Editar ATM</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* Errors */}
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Row 1: Código e Nome */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Código"
              value={formData.code}
              onChange={handleInputChange('code')}
              error={!!validationErrors.code}
              helperText={validationErrors.code}
              required
              fullWidth
            />
            <TextField
              label="Nome"
              value={formData.name}
              onChange={handleInputChange('name')}
              error={!!validationErrors.name}
              helperText={validationErrors.name}
              required
              fullWidth
            />
          </Box>

          {/* Row 2: Localização e Endereço */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Localização"
              value={formData.location}
              onChange={handleInputChange('location')}
              error={!!validationErrors.location}
              helperText={validationErrors.location}
              fullWidth
            />
            <TextField
              label="Endereço"
              value={formData.address}
              onChange={handleInputChange('address')}
              error={!!validationErrors.address}
              helperText={validationErrors.address}
              fullWidth
            />
          </Box>

          {/* Row 3: Organização */}
          <FormControl fullWidth error={!!validationErrors.tenantId} required>
            <InputLabel>Organização</InputLabel>
            <Select
              value={formData.tenantId}
              label="Organização"
              onChange={handleSelectChange('tenantId')}
              disabled={tenantsLoading}
            >
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

          {/* Row 4: Instalação */}
          <FormControl fullWidth error={!!validationErrors.installationId}>
            <InputLabel>Instalação (Opcional)</InputLabel>
            <Select
              value={formData.installationId}
              label="Instalação (Opcional)"
              onChange={handleSelectChange('installationId')}
              disabled={installationsLoading || !formData.tenantId}
            >
              <MenuItem value="">
                <em>Nenhuma</em>
              </MenuItem>
              {installations.map((installation) => (
                <MenuItem key={installation.id} value={installation.id}>
                  {installation.name}{' '}
                  {installation.code && `(${installation.code})`}
                </MenuItem>
              ))}
            </Select>
            {validationErrors.installationId && (
              <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                {validationErrors.installationId}
              </Box>
            )}
          </FormControl>

          {/* Row 5: Status */}
          <FormControl
            fullWidth
            error={!!validationErrors.deviceStatus}
            required
          >
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.deviceStatus}
              label="Status"
              onChange={handleSelectChange('deviceStatus')}
            >
              {Object.entries(AtmStatusLabels).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
            {validationErrors.deviceStatus && (
              <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                {validationErrors.deviceStatus}
              </Box>
            )}
          </FormControl>

          {/* Row 6: Switch Ativo */}
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={handleSwitchChange('isActive')}
              />
            }
            label="ATM Ativo"
          />

          {/* Row 7: Observações */}
          <TextField
            label="Observações"
            value={formData.notes}
            onChange={handleInputChange('notes')}
            error={!!validationErrors.notes}
            helperText={validationErrors.notes}
            multiline
            rows={3}
            fullWidth
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
        <CustomButton
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
        >
          {isLoading ? 'Salvando...' : 'Salvar Alterações'}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
}

export default EditAtmDialog;
