import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { getStudentConnections } from '../supabase/db/students';

export function useStudentConnections() {
  const { user, profile } = useAuth();

  const query = useQuery({
    queryKey: ['student-connections', user?.id],
    queryFn: () => getStudentConnections(user!.id),
    enabled: !!user && profile?.role === 'student',
  });

  return {
    connections: query.data ?? [],
    isLoading: profile?.role === 'student' ? query.isLoading : false,
    hasConnections: (query.data?.length ?? 0) > 0,
  };
}