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
  Box,
  Alert,
  Button,
  CircularProgress,
  type SelectChangeEvent,
} from '@mui/material';
import { CustomButton } from '../../shared/ui';
import { useDevicesStore } from './store';
import {
  UpdateDeviceSchema,
  type UpdateDevice,
  type Device,
  type DeviceStatus,
  DeviceStatusLabels,
} from '../../shared/services/devices';
import { useAtms } from './useAtms';
import { useTenants } from '../users/useTenants';
import { z } from 'zod';

interface EditDeviceDialogProps {
  open: boolean;
  onClose: () => void;
  device: Device | null;
}

interface FormData {
  serialNumber: string;
  atmId: string | null;
  tenantId: string;
  status: DeviceStatus | '';
  installationDate: string;
  lastMaintenanceDate: string;
  notes: string;
}

const initialFormData: FormData = {
  serialNumber: '',
  atmId: '',
  tenantId: '',
  status: '',
  installationDate: '',
  lastMaintenanceDate: '',
  notes: '',
};

export function EditDeviceDialog({
  open,
  onClose,
  device,
}: EditDeviceDialogProps) {
  const { updateDevice, isLoading, error } = useDevicesStore();
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

  // Carregar ATMs baseado no tenant selecionado
  const {
    atms,
    isLoading: atmsLoading,
    error: atmsError,
    loadAtms,
  } = useAtms({
    tenantId: formData.tenantId || undefined,
    autoLoad: false,
  });

  // Reset form when dialog closes or device changes
  useEffect(() => {
    if (!open) {
      setFormData(initialFormData);
      setValidationErrors({});
      setSubmitError(null);
    } else if (device) {
      // Populate form with device data
      setFormData({
        serialNumber: device.serialNumber,
        atmId: device.atmId || '',
        tenantId: device.tenantId,
        status: device.status,
        installationDate: device.installationDate
          ? new Date(device.installationDate).toISOString().slice(0, 16)
          : '',
        lastMaintenanceDate: device.lastMaintenanceDate
          ? new Date(device.lastMaintenanceDate).toISOString().slice(0, 16)
          : '',
        notes: device.notes || '',
      });
      setValidationErrors({});
      setSubmitError(null);
    }
  }, [open, device]);

  // Carregar ATMs quando o tenant for selecionado
  useEffect(() => {
    if (formData.tenantId) {
      loadAtms();
    }
  }, [formData.tenantId]);

  const validateField = (field: keyof FormData, value: string) => {
    try {
      // Validar campos específicos conforme o schema
      switch (field) {
        case 'serialNumber':
          if (value && value.length < 6) {
            throw new Error('Número de série deve ter pelo menos 6 caracteres');
          }
          break;
        case 'atmId':
          if (!value) {
            throw new Error('ATM é obrigatório');
          }
          break;
        case 'tenantId':
          if (!value) {
            throw new Error('Organização é obrigatória');
          }
          break;
        case 'status':
          if (!value) {
            throw new Error('Status é obrigatório');
          }
          break;
      }

      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    } catch (error) {
      if (error instanceof Error) {
        setValidationErrors((prev) => ({
          ...prev,
          [field]: error.message,
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
    (field: keyof FormData) => (event: SelectChangeEvent<string | null>) => {
      const value = event.target.value as string;

      // Se for mudança de tenant, limpar ATM selecionado
      if (field === 'tenantId') {
        setFormData((prev) => ({
          ...prev,
          [field]: value,
          atmId: '', // Limpar ATM quando trocar tenant
        }));
      } else {
        setFormData((prev) => ({ ...prev, [field]: value }));
      }

      validateField(field, value);
    };

  const validateForm = (): boolean => {
    try {
      // Preparar dados para validação
      const dataToValidate: UpdateDevice = {
        serialNumber: formData.serialNumber || undefined,
        atmId: formData.atmId || undefined,
        tenantId: formData.tenantId || undefined,
        status: (formData.status as DeviceStatus) || undefined,
        installationDate: formData.installationDate || undefined,
        lastMaintenanceDate: formData.lastMaintenanceDate || undefined,
        notes: formData.notes || undefined,
      };

      UpdateDeviceSchema.parse(dataToValidate);
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
    if (!device || !validateForm()) {
      return;
    }

    try {
      setSubmitError(null);

      const deviceData: UpdateDevice = {
        serialNumber: formData.serialNumber || undefined,
        atmId: formData.atmId || undefined,
        tenantId: formData.tenantId || undefined,
        status: (formData.status as DeviceStatus) || undefined,
        installationDate: formData.installationDate || undefined,
        lastMaintenanceDate: formData.lastMaintenanceDate || undefined,
        notes: formData.notes || undefined,
      };

      await updateDevice(device.id, deviceData);
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar dispositivo:', error);
      setSubmitError(
        error instanceof Error ? error.message : 'Erro ao atualizar dispositivo'
      );
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' },
      }}
    >
      <DialogTitle>Editar Dispositivo</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {(submitError || error) && (
            <Alert severity="error">{submitError || error}</Alert>
          )}

          <TextField
            label="Número de Série"
            value={formData.serialNumber}
            onChange={handleInputChange('serialNumber')}
            error={!!validationErrors.serialNumber}
            helperText={validationErrors.serialNumber || 'Mínimo 6 caracteres'}
            required
            fullWidth
            placeholder="Ex: ABC123456"
          />

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

          <FormControl fullWidth required error={!!validationErrors.atmId}>
            <InputLabel>ATM</InputLabel>
            <Select
              value={formData.atmId}
              onChange={handleSelectChange('atmId')}
              label="ATM"
              disabled={atmsLoading || !formData.tenantId}
            >
              <MenuItem value="">
                <em>
                  {!formData.tenantId
                    ? 'Selecione uma organização primeiro'
                    : 'Selecione um ATM'}
                </em>
              </MenuItem>
              {atms.map((atm) => (
                <MenuItem key={atm.id} value={atm.id}>
                  {atm.code} - {atm.name}
                </MenuItem>
              ))}
            </Select>
            {validationErrors.atmId && (
              <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                {validationErrors.atmId}
              </Box>
            )}
            {atmsError && (
              <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                {atmsError}
              </Box>
            )}
            {formData.tenantId && atmsLoading && (
              <Box
                sx={{ color: 'text.secondary', fontSize: '0.75rem', mt: 0.5 }}
              >
                Carregando ATMs...
              </Box>
            )}
          </FormControl>

          <FormControl fullWidth required error={!!validationErrors.status}>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={handleSelectChange('status')}
              label="Status"
            >
              <MenuItem value="">
                <em>Selecione um status</em>
              </MenuItem>
              {Object.entries(DeviceStatusLabels).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
            {validationErrors.status && (
              <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                {validationErrors.status}
              </Box>
            )}
          </FormControl>

          <TextField
            label="Data de Instalação"
            type="datetime-local"
            value={formData.installationDate}
            onChange={handleInputChange('installationDate')}
            error={!!validationErrors.installationDate}
            helperText={validationErrors.installationDate}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />

          <TextField
            label="Data da Última Manutenção"
            type="datetime-local"
            value={formData.lastMaintenanceDate}
            onChange={handleInputChange('lastMaintenanceDate')}
            error={!!validationErrors.lastMaintenanceDate}
            helperText={validationErrors.lastMaintenanceDate}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />

          <TextField
            label="Observações"
            value={formData.notes}
            onChange={handleInputChange('notes')}
            error={!!validationErrors.notes}
            helperText={validationErrors.notes}
            fullWidth
            multiline
            rows={3}
            placeholder="Observações sobre o dispositivo..."
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
            !formData.serialNumber ||
            !formData.atmId ||
            !formData.tenantId ||
            !formData.status
          }
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
        >
          {isLoading ? 'Atualizando...' : 'Atualizar Dispositivo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditDeviceDialog;
