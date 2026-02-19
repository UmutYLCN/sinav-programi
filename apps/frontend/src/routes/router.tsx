import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';
import { AppShell } from '@/components/layout/app-shell';
import DashboardPage from '@/pages/dashboard';
import ExamsPage from '@/pages/exams';
import PlanimPage from '@/pages/planim';
import UnavailabilityPage from '@/pages/unavailability';
import InvigilatorLoadPage from '@/pages/invigilator-load';
import DataManagementPage from '@/pages/data-management';
import AutoAssignInvigilatorsPage from '@/pages/auto-assign-invigilators';
import LoginPage from '@/pages/login';
import { AuthGuard } from '@/components/auth/auth-guard';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <AppShell />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'exams', element: <ExamsPage /> },
      { path: 'planim', element: <PlanimPage /> },
      { path: 'unavailability', element: <UnavailabilityPage /> },
      { path: 'invigilator-load', element: <InvigilatorLoadPage /> },
      { path: 'auto-assign-invigilators', element: <AutoAssignInvigilatorsPage /> },
      { path: 'data', element: <DataManagementPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
