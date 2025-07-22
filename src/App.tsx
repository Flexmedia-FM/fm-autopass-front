import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import { QueryProvider } from './app/query/index';
import { ThemeProvider } from './app/theme/ThemeProvider';
import { AuthInitializer } from './shared/components';
import Layout from './routes/layout';
import DashboardRoute from './routes/dashboard';
import { DevicesRoute } from './routes/devices';
import { UsersRoute } from './routes/users';
import { LoginRoute, ForgotPasswordRoute } from './routes/auth';
import { dashboardLoader } from './routes/dashboard/loader';
import { devicesLoader } from './routes/devices/loader';
import { usersLoader } from './routes/users/loader';
import { authLoader, protectedLoader } from './routes/auth/loader';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/auth',
    children: [
      {
        index: true,
        element: <Navigate to="/auth/login" replace />,
      },
      {
        path: 'login',
        element: <LoginRoute />,
        loader: authLoader,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordRoute />,
        loader: authLoader,
      },
    ],
  },
  {
    path: '/dashboard',
    element: <Layout />,
    loader: protectedLoader,
    children: [
      {
        index: true,
        element: <DashboardRoute />,
        loader: dashboardLoader,
      },
    ],
  },
  {
    path: '/devices',
    element: <Layout />,
    loader: protectedLoader,
    children: [
      {
        index: true,
        element: <DevicesRoute />,
        loader: devicesLoader,
      },
    ],
  },
  {
    path: '/users',
    element: <Layout />,
    loader: protectedLoader,
    children: [
      {
        index: true,
        element: <UsersRoute />,
        loader: usersLoader,
      },
    ],
  },
]);

export default function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthInitializer>
          <RouterProvider router={router} />
        </AuthInitializer>
      </ThemeProvider>
    </QueryProvider>
  );
}
