import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../../features/auth/auth-context';

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { status } = useAuth();

  if (status === 'authenticated') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
