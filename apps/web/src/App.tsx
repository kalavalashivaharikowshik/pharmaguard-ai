import {
  Routes,
  Route,
} from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Login from './pages/Login';
import Register from './pages/Register';
import Batches from './pages/Batches';
import Recalls from './pages/Recalls';
import Transfers from './pages/Transfers';
import Revocation from './pages/Revocation';
import Compliance from './pages/Compliance';
import Blockchain from './pages/Blockchain';
import Unauthorized from './pages/Unauthorized';
import Settings from './pages/Settings';
import Users from './pages/Users';
import Notifications from './pages/Notifications';
import RegistrationRequests from './pages/RegistrationRequests';
import ActivateAccount from './pages/ActivateAccount';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import ProtectedRoute from './auth/ProtectedRoute';
import RoleProtectedRoute from './auth/RoleProtectedRoute';

export default function App() {

  return (

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
                'DISTRIBUTOR',
                'PHARMACY',
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

    </Routes>

  );
}