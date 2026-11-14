import { Navigate } from 'react-router-dom';

export default function RoleProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: string[];
}) {

  const role =
    localStorage.getItem('role');

  if (
    !role ||
    !roles.includes(role)
  ) {
    return (
      <Navigate
        to="/unauthorized"
      />
    );
  }

  return children;
}