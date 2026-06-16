import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { getStudentConnections } from '../supabase/db/students';

export function useStudentConnections() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['student-connections', user?.id],
    queryFn: () => getStudentConnections(user!.id),
    enabled: !!user,
  });

  return {
    connections: query.data ?? [],
    isLoading: query.isLoading,
    hasConnections: (query.data?.length ?? 0) > 0,
  };
}