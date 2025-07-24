import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  FormControlLabel,
  Checkbox,
  Link,
  Container,
  useTheme,
  CardMedia,
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuthStore } from './store';
import { LoginSchema, type LoginFormData } from './schema';
import AutoPassLogo from '../../assets/AUTOPASS.png';
import CopyrightImage from '../../assets/Copyright.png';

export default function LoginRoute() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    mode: 'onBlur', // Valida quando o campo perde o foco
    reValidateMode: 'onChange', // Revalida enquanto o usuário digita
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data.email, data.password, data.rememberMe);
      navigate('/dashboard');
    } catch (error) {
      // Erro já é tratado no store
      console.error('Erro no login:', error);
    }
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleSubmit(onSubmit)(event);
  };

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
      {/* Card de Login */}
      <Container component="main" maxWidth="sm">
        <Card
          sx={{
            width: '100%',
            maxWidth: 680,
            mx: 'auto',
            boxShadow: theme.shadows[10],
          }}
        >
          <CardMedia sx={{ mt: 4, mb: 2 }}>
            {/* Logo da AutoPass no topo */}
            <Box
              sx={{
                // mb: 4,
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
          </CardMedia>
          <CardContent sx={{ px: 4 }}>
            <Box
              sx={{
                display: 'flex',
                // flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                gap: 2,
              }}
            >
              <Box
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  borderRadius: '50%',
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <LockOutlined />
              </Box>
              <Typography component="h1" variant="h5" fontWeight="bold">
                Faça login em sua conta
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
              />

              <TextField
                {...register('password')}
                margin="normal"
                fullWidth
                name="password"
                label="Senha"
                type="password"
                id="password"
                autoComplete="current-password"
                error={!!errors.password}
                helperText={errors.password?.message}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    {...register('rememberMe')}
                    value="remember"
                    color="primary"
                  />
                }
                label="Lembrar de mim"
                sx={{ mt: 1 }}
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
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Link
                  component={RouterLink}
                  to="/auth/forgot-password"
                  variant="body2"
                  sx={{ textDecoration: 'none' }}
                >
                  Esqueceu sua senha?
                </Link>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Credenciais de teste */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Credenciais de teste: yuri.sa@flexmedia / Flex@55350050
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
            maxWidth: '800px',
            height: 'auto',
            opacity: 0.8,
          }}
        />
      </Box>
    </Box>
  );
}
