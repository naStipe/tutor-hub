import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { getLessonPacks, createLessonPack } from '../supabase/db/lessonPacks';

export function useLessonPacks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const packsQuery = useQuery({
    queryKey: ['lesson-packs', user?.id],
    queryFn: () => getLessonPacks(user!.id),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: ({
                   totalLessons,
                   studentProfileId,
                   studentId,
                 }: {
      totalLessons: number;
      studentProfileId?: string;
      studentId?: string;
    }) => createLessonPack(user!.id, totalLessons, studentProfileId, studentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lesson-packs'] }),
  });

  return {
    packs: packsQuery.data ?? [],
    isLoading: packsQuery.isLoading,
    createPack: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}