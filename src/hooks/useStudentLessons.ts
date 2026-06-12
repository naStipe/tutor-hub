import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import {
  getStudentLessons,
  bookLessonAsStudent,
  cancelStudentLesson,
} from '../supabase/db/studentLessons';

export function useStudentLessons() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  const lessonsQuery = useQuery({
    queryKey: ['students-lessons', user?.id],
    queryFn: () => getStudentLessons(user!.id),
    enabled: !!user,
  });

  const bookMutation = useMutation({
    mutationFn: ({ date, durationMinutes, subject }: {
      date: string;
      durationMinutes: number;
      subject?: string;
    }) => bookLessonAsStudent(profile!.tutor_id!, user!.id, date, durationMinutes, subject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-lessons'] });
      queryClient.invalidateQueries({ queryKey: ['tutor-booked-slots'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (lessonId: string) => cancelStudentLesson(lessonId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students-lessons'] }),
  });

  return {
    lessons: lessonsQuery.data ?? [],
    isLoading: lessonsQuery.isLoading,
    error: lessonsQuery.error,
    bookLesson: bookMutation.mutate,
    cancelLesson: cancelMutation.mutate,
  };
}