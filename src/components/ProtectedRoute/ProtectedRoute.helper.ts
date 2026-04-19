import { useAuthStore } from '../../store/useAuthStore';

export const useProtectedRoute = () => {
  const user    = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  return { user, loading };
};
