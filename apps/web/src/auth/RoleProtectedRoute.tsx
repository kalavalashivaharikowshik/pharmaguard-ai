import { Navigate } from 'react-router-dom';

import { hasRole } from './roles';

export default function RoleProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: string[];
}) {
  if (!hasRole(roles)) {
    return <Navigate to="/unauthorized" />;
  }
  return children;
}
