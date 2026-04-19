import { Navigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useProtectedRoute } from './ProtectedRoute.helper';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useProtectedRoute();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" aria-live="polite">
        <div className="space-y-3 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};
