import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, loading } = useSession();

  if (loading) {
    return <main className="screen-center">Loading your island...</main>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
