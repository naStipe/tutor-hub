import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { getTutorAvailability, addAvailability, deleteAvailability } from '../supabase/db/availability';

export function useAvailability(tutorId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const targetTutorId = tutorId ?? user?.id;

  const availabilityQuery = useQuery({
    queryKey: ['availability', targetTutorId],
    queryFn: () => getTutorAvailability(targetTutorId!),
    enabled: !!targetTutorId,
  });

  const addMutation = useMutation({
    mutationFn: ({ dayOfWeek, startTime, endTime }: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }) => addAvailability(user!.id, dayOfWeek, startTime, endTime),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['availability'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAvailability(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['availability'] }),
  });

  return {
    availability: availabilityQuery.data ?? [],
    isLoading: availabilityQuery.isLoading,
    addAvailability: addMutation.mutate,
    deleteAvailability: deleteMutation.mutate,
  };
}