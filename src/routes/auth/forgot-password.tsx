import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  Container,
  useTheme,
} from '@mui/material';
import { EmailOutlined, ArrowBack } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from './store';
import { ForgotPasswordSchema, type ForgotPasswordFormData } from './schema';
import AutoPassLogo from '../../assets/AUTOPASS.png';
import CopyrightImage from '../../assets/Copyright.png';

export default function ForgotPasswordRoute() {
  const theme = useTheme();
  const [emailSent, setEmailSent] = useState(false);
  const { forgotPassword, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(ForgotPasswordSchema),
    mode: 'onBlur', // Valida quando o campo perde o foco
    reValidateMode: 'onChange', // Revalida enquanto o usuário digita
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      clearError();
      await forgotPassword(data.email);
      setEmailSent(true);
    } catch (error) {
      // Erro já é tratado no store
      console.error('Erro ao enviar email:', error);
    }
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleSubmit(onSubmit)(event);
  };

  if (emailSent) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 3,
          px: 2,
        }}
      >
        {/* Logo da AutoPass no topo */}
        <Box
          sx={{
            mb: 4,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img
            src={AutoPassLogo}
            alt="AutoPass Logo"
            style={{
              maxWidth: '280px',
              height: 'auto',
              filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2))',
            }}
          />
        </Box>

        <Container component="main" maxWidth="sm">
          <Card
            sx={{
              width: '100%',
              maxWidth: 400,
              mx: 'auto',
              boxShadow: theme.shadows[10],
            }}
          >
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Box
                sx={{
                  bgcolor: 'success.main',
                  color: 'success.contrastText',
                  borderRadius: '50%',
                  p: 1.5,
                  mb: 2,
                  display: 'inline-flex',
                }}
              >
                <EmailOutlined />
              </Box>

              <Typography component="h1" variant="h5" fontWeight="bold" mb={2}>
                Email Enviado!
              </Typography>

              <Typography variant="body1" color="text.secondary" mb={3}>
                Enviamos um link de recuperação para{' '}
                <strong>{getValues('email')}</strong>. Verifique sua caixa de
                entrada e siga as instruções para redefinir sua senha.
              </Typography>

              <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="body2">
                  <strong>Importante:</strong> O link de recuperação expira em
                  24 horas. Se você não receber o email, verifique sua pasta de
                  spam ou solicite um novo link.
                </Typography>
              </Alert>

              <Button
                component={RouterLink}
                to="/auth/login"
                variant="contained"
                fullWidth
                startIcon={<ArrowBack />}
                sx={{ mt: 2 }}
              >
                Voltar para Login
              </Button>
            </CardContent>
          </Card>
        </Container>

        {/* Copyright da AutoPass */}
        <Box
          sx={{
            mt: 4,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img
            src={CopyrightImage}
            alt="Copyright AutoPass"
            style={{
              maxWidth: '200px',
              height: 'auto',
              opacity: 0.8,
            }}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        py: 3,
        px: 2,
      }}
    >
      {/* Logo da AutoPass no topo */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <img
          src={AutoPassLogo}
          alt="AutoPass Logo"
          style={{
            maxWidth: '280px',
            height: 'auto',
            filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2))',
          }}
        />
      </Box>

      <Container component="main" maxWidth="sm">
        <Card
          sx={{
            width: '100%',
            maxWidth: 400,
            mx: 'auto',
            boxShadow: theme.shadows[10],
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Box
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  borderRadius: '50%',
                  p: 1.5,
                  mb: 2,
                }}
              >
                <EmailOutlined />
              </Box>
              <Typography component="h1" variant="h5" fontWeight="bold">
                Esqueceu sua senha?
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: 'center', mt: 1 }}
              >
                Não se preocupe! Digite seu email e enviaremos um link para
                redefinir sua senha.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleFormSubmit} noValidate>
              <TextField
                {...register('email')}
                margin="normal"
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                autoFocus
                error={!!errors.email}
                helperText={errors.email?.message}
                placeholder="Digite seu email cadastrado"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  fontSize: '1.1rem',
                }}
              >
                {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Link
                  component={RouterLink}
                  to="/auth/login"
                  variant="body2"
                  sx={{
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <ArrowBack fontSize="small" />
                  Voltar para o login
                </Link>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Esta é uma tela mockada para demonstração. Em produção, o email seria
          enviado pelo backend.
        </Typography>
      </Box>

      {/* Copyright da AutoPass */}
      <Box
        sx={{
          mt: 4,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <img
          src={CopyrightImage}
          alt="Copyright AutoPass"
          style={{
            maxWidth: '200px',
            height: 'auto',
            opacity: 0.8,
          }}
        />
      </Box>
    </Box>
  );
}
