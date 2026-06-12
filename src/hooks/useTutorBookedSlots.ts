import { useQuery } from '@tanstack/react-query';
import { getTutorBookedSlots } from '../supabase/db/studentLessons';

export function useTutorBookedSlots(tutorId?: string) {
  const query = useQuery({
    queryKey: ['tutor-booked-slots', tutorId],
    queryFn: () => getTutorBookedSlots(tutorId!),
    enabled: !!tutorId,
    refetchOnMount: 'always',
  });

  return { bookedSlots: query.data ?? [], isLoading: query.isLoading };
}