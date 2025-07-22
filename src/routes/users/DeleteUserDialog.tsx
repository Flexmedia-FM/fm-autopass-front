import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Alert,
  Button,
  CircularProgress,
  TextField,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { CustomButton } from '../../shared/ui';
import { useUsersStore } from './store';
import type { User } from './schema';

interface DeleteUserDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

export function DeleteUserDialog({
  open,
  onClose,
  user,
}: DeleteUserDialogProps) {
  const { removeUser, isLoading } = useUsersStore();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');

  const handleConfirmDelete = async () => {
    if (!user) {
      return;
    }

    try {
      setSubmitError(null);
      setIsDeleting(true);
      await removeUser(user.id);
      // Pequeno delay para melhor UX
      setTimeout(() => {
        setIsDeleting(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      setIsDeleting(false);
      setSubmitError(
        error instanceof Error ? error.message : 'Erro ao excluir usuário'
      );
    }
  };

  const handleCancel = () => {
    if (isDeleting) return; // Não permitir cancelar durante a exclusão
    setSubmitError(null);
    setConfirmationText('');
    onClose();
  };

  if (!user) {
    return null;
  }

  const isProcessing = isLoading || isDeleting;
  const isConfirmationValid = confirmationText.toLowerCase() === 'confirmar';

  return (
    <Dialog
      open={open}
      onClose={isProcessing ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 3,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <WarningIcon color="error" fontSize="large" />
          <Typography variant="h6" component="span">
            Confirmar Exclusão
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {submitError && <Alert severity="error">{submitError}</Alert>}

          <Alert severity="warning" icon={<WarningIcon />}>
            <Typography variant="body2" fontWeight="medium">
              ⚠️ Esta ação é irreversível!
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Uma vez excluído, o usuário e todos os dados associados serão
              permanentemente removidos do sistema.
            </Typography>
          </Alert>

          <Box
            sx={{
              p: 2,
              // bgcolor: 'grey.50',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.200',
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Usuário que será excluído:
            </Typography>
            <Typography variant="h6" gutterBottom>
              {user.name || user.login}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Login:</strong> {user.login}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Email:</strong> {user.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Organização:</strong> {user.tenantName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Perfil:</strong>{' '}
              {user.userRole === 'ADMIN' ? 'Administrador' : 'Operador'}
            </Typography>
            <Typography
              variant="body2"
              color={user.isActive ? 'success.light' : 'error.main'}
            >
              <strong>Status:</strong> {user.isActive ? 'Ativo' : 'Inativo'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Criado em:</strong>{' '}
              {new Date(user.createdAt).toLocaleDateString('pt-BR')}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary">
            Tem certeza que deseja continuar com a exclusão?
          </Typography>

          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: 'error.50',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'error.200',
            }}
          >
            <Typography
              variant="body2"
              color="error.light"
              fontWeight="bold"
              gutterBottom
            >
              Para confirmar a exclusão, digite "CONFIRMAR" no campo abaixo:
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Digite CONFIRMAR para continuar"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              disabled={isProcessing}
              sx={{ mt: 1 }}
              autoComplete="off"
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <CustomButton
          variant="outlined"
          onClick={handleCancel}
          disabled={isProcessing}
          sx={{ minWidth: 120 }}
        >
          Cancelar
        </CustomButton>
        <Button
          variant="contained"
          color="error"
          onClick={handleConfirmDelete}
          disabled={isProcessing || !isConfirmationValid}
          startIcon={
            isProcessing ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <DeleteIcon />
            )
          }
          sx={{ minWidth: 120 }}
        >
          {isProcessing ? 'Excluindo...' : 'Excluir Usuário'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteUserDialog;
