import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import {
  getLessons,
  createLesson,
  updateLesson,
  cancelLesson,
  rescheduleLesson,
  deleteLesson,
  approveLesson,
  rejectLesson,
} from '../supabase/db/lessons';
import { Lesson } from '../types';

export function useLessons() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const lessonsQuery = useQuery({
    queryKey: ['lessons', user?.id],
    queryFn: () => getLessons(user!.id),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (lesson: Omit<Lesson, 'id' | 'tutor_id' | 'student' | 'created_at' | 'updated_at'>) =>
      createLesson(user!.id, lesson),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lessons'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ lessonId, updates }: {
      lessonId: string;
      updates: Partial<Omit<Lesson, 'id' | 'tutor_id' | 'student' | 'created_at' | 'updated_at'>>;
    }) => updateLesson(lessonId, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lessons'] }),
  });

  const cancelMutation = useMutation({
    mutationFn: (lessonId: string) => cancelLesson(lessonId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lessons'] }),
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ lessonId, newDate, duration }: {
      lessonId: string;
      newDate: string;
      duration?: number;
    }) => rescheduleLesson(lessonId, newDate, duration),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lessons'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (lessonId: string) => deleteLesson(lessonId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lessons'] }),
  });

  const approveMutation = useMutation({
    mutationFn: (lessonId: string) => approveLesson(lessonId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lessons'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (lessonId: string) => rejectLesson(lessonId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lessons'] }),
  });

  return {
    lessons: lessonsQuery.data ?? [],
    isLoading: lessonsQuery.isLoading,
    error: lessonsQuery.error,
    createLesson: createMutation.mutate,
    updateLesson: updateMutation.mutate,
    cancelLesson: cancelMutation.mutate,
    rescheduleLesson: rescheduleMutation.mutate,
    deleteLesson: deleteMutation.mutate,
    approveLesson: approveMutation.mutate,
    rejectLesson: rejectMutation.mutate,
  };
}