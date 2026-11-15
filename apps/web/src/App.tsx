import { lazy, Suspense } from 'react';
import {
  Routes,
  Route,
} from 'react-router-dom';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Batches = lazy(() => import('./pages/Batches'));
const Recalls = lazy(() => import('./pages/Recalls'));
const Transfers = lazy(() => import('./pages/Transfers'));
const Revocation = lazy(() => import('./pages/Revocation'));
const Compliance = lazy(() => import('./pages/Compliance'));
const Blockchain = lazy(() => import('./pages/Blockchain'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const Settings = lazy(() => import('./pages/Settings'));
const Users = lazy(() => import('./pages/Users'));
const Notifications = lazy(() => import('./pages/Notifications'));
const RegistrationRequests = lazy(() => import('./pages/RegistrationRequests'));
const ActivateAccount = lazy(() => import('./pages/ActivateAccount'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

import ProtectedRoute from './auth/ProtectedRoute';
const AIInsights = lazy(() => import('./pages/AIInsights'));
const Assistant = lazy(() => import('./pages/Assistant'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Manufacturers = lazy(() => import('./pages/Manufacturers'));
const StockMap = lazy(() => import('./pages/StockMap'));
const Disposals = lazy(() => import('./pages/Disposals'));
const Violations = lazy(() => import('./pages/Violations'));
const NotFound = lazy(() => import('./pages/NotFound'));
import RoleProtectedRoute from './auth/RoleProtectedRoute';

export default function App() {

  return (

    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface)] text-slate-500">Loading…</div>
      }
    >
    <Routes>

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/unauthorized"
        element={<Unauthorized />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      {/* DASHBOARD */}

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/activate"
        element={<ActivateAccount />}
      />

      {/* INVENTORY */}

      <Route
        path="/inventory"
        element={
          <ProtectedRoute>

            <RoleProtectedRoute
              roles={[
                'SUPER_ADMIN',
                'REGULATOR',
                'MANUFACTURER',
                'DISTRIBUTOR',
                'PHARMACY',
              ]}
            >

              <Inventory />

            </RoleProtectedRoute>

          </ProtectedRoute>
        }
      />

      {/* BATCHES */}

      <Route
        path="/batches"
        element={
          <ProtectedRoute>

            <RoleProtectedRoute
              roles={[
                'SUPER_ADMIN',
                'REGULATOR',
                'MANUFACTURER',
              ]}
            >

              <Batches />

            </RoleProtectedRoute>

          </ProtectedRoute>
        }
      />

      {/* RECALLS */}

      <Route
        path="/recalls"
        element={
          <ProtectedRoute>

            <RoleProtectedRoute
              roles={[
                'SUPER_ADMIN',
                'REGULATOR',
                'MANUFACTURER',
                'DISTRIBUTOR',
                'PHARMACY',
              ]}
            >

              <Recalls />

            </RoleProtectedRoute>

          </ProtectedRoute>
        }
      />

      {/* TRANSFERS */}

      <Route
        path="/transfers"
        element={
          <ProtectedRoute>

            <RoleProtectedRoute
              roles={[
                'SUPER_ADMIN',
                'MANUFACTURER',
                'DISTRIBUTOR',
                'REGULATOR',
                'PHARMACY',
              ]}
            >

              <Transfers />

            </RoleProtectedRoute>

          </ProtectedRoute>
        }
      />

      {/* REVOCATION */}

      <Route
        path="/revocation"
        element={
          <ProtectedRoute>

            <RoleProtectedRoute
              roles={[
                'SUPER_ADMIN',
                'REGULATOR',
              ]}
            >

              <Revocation />

            </RoleProtectedRoute>

          </ProtectedRoute>
        }
      />

      {/* COMPLIANCE */}

      <Route
        path="/compliance"
        element={
          <ProtectedRoute>

            <RoleProtectedRoute
              roles={[
                'SUPER_ADMIN',
                'REGULATOR',
              ]}
            >

              <Compliance />

            </RoleProtectedRoute>

          </ProtectedRoute>
        }
      />

      {/* BLOCKCHAIN */}

      <Route
        path="/blockchain"
        element={
          <ProtectedRoute>

            <RoleProtectedRoute
              roles={[
                'SUPER_ADMIN',
                'REGULATOR',
                'MANUFACTURER',
              ]}
            >

              <Blockchain />

            </RoleProtectedRoute>

          </ProtectedRoute>
        }
      />

      {/* NOTIFICATIONS */}

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      {/* USER MANAGEMENT */}

      <Route
        path="/users"
        element={
          <ProtectedRoute>

            <RoleProtectedRoute
              roles={[
                'SUPER_ADMIN',
              ]}
            >

              <Users />

            </RoleProtectedRoute>

          </ProtectedRoute>
        }
      />

      {/* SETTINGS */}

      <Route
        path="/settings"
        element={
          <ProtectedRoute>

            <RoleProtectedRoute
              roles={[
                'SUPER_ADMIN',
                'REGULATOR',
                'MANUFACTURER',
                'DISTRIBUTOR',
                'PHARMACY',
              ]}
            >

              <Settings />

            </RoleProtectedRoute>

          </ProtectedRoute>
        }
      />

      <Route
        path="/registration"
        element={
          <ProtectedRoute>

            <RoleProtectedRoute
              roles={[
                'SUPER_ADMIN',
              ]}
            >

              <RegistrationRequests />

            </RoleProtectedRoute>

          </ProtectedRoute>
        }
      />

    {/* NEW MODULES */}
      {(
        [
          ['/ai-insights', <AIInsights />, ['SUPER_ADMIN', 'REGULATOR', 'MANUFACTURER', 'DISTRIBUTOR', 'PHARMACY']],
          ['/assistant', <Assistant />, ['SUPER_ADMIN', 'REGULATOR', 'MANUFACTURER', 'DISTRIBUTOR', 'PHARMACY']],
          ['/analytics', <Analytics />, ['SUPER_ADMIN', 'REGULATOR']],
          ['/manufacturers', <Manufacturers />, ['SUPER_ADMIN', 'REGULATOR']],
          ['/map', <StockMap />, ['SUPER_ADMIN', 'REGULATOR', 'MANUFACTURER']],
          ['/disposals', <Disposals />, ['SUPER_ADMIN', 'REGULATOR', 'MANUFACTURER', 'DISTRIBUTOR', 'PHARMACY']],
          ['/violations', <Violations />, ['SUPER_ADMIN', 'REGULATOR']],
        ] as [string, React.ReactNode, string[]][]
      ).map(([path, element, roles]) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute>
              <RoleProtectedRoute roles={roles}>{element}</RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
      ))}

      <Route path="*" element={<NotFound />} />

    </Routes>
    </Suspense>

  );
}