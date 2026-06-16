import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import {
  getStudentLessons,
  bookLessonAsStudent,
  cancelStudentLesson,
  getTutorBookedSlots,
} from '../supabase/db/studentLessons';
import { getStudentConnections } from '../supabase/db/students';

export function useStudentLessons() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  const connectionsQuery = useQuery({
    queryKey: ['student-connections', user?.id],
    queryFn: () => getStudentConnections(user!.id),
    enabled: !!user,
  });

  // Use first connected tutor, fall back to legacy tutor_id on profile
  const tutorId = connectionsQuery.data?.[0] ?? profile?.tutor_id ?? null;

  const lessonsQuery = useQuery({
    queryKey: ['student-lessons', user?.id],
    queryFn: () => getStudentLessons(user!.id),
    enabled: !!user,
  });

  const bookMutation = useMutation({
    mutationFn: ({ date, durationMinutes, subject }: {
      date: string;
      durationMinutes: number;
      subject?: string;
    }) => bookLessonAsStudent(tutorId!, user!.id, date, durationMinutes, subject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-lessons'] });
      queryClient.invalidateQueries({ queryKey: ['tutor-booked-slots'] });
    },
    onError: (error) => console.error('Booking error:', error),
  });

  const cancelMutation = useMutation({
    mutationFn: (lessonId: string) => cancelStudentLesson(lessonId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['student-lessons'] }),
  });

  return {
    lessons: lessonsQuery.data ?? [],
    isLoading: lessonsQuery.isLoading || connectionsQuery.isLoading,
    error: lessonsQuery.error,
    tutorId,
    bookLesson: bookMutation.mutate,
    cancelLesson: cancelMutation.mutate,
  };
}