import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../supabase/db/students';
import { Student } from '../types';
import { getRegisteredStudents } from '../supabase/db/students';



export function useStudents() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const studentsQuery = useQuery({
    queryKey: ['students', user?.id],
    queryFn: () => getStudents(user!.id),
    enabled: !!user,
  });

  const registeredStudentsQuery = useQuery({
    queryKey: ['registered-students', user?.id],
    queryFn: () => getRegisteredStudents(user!.id),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (student: Omit<Student, 'id' | 'tutor_id' | 'created_at'>) =>
      createStudent(user!.id, student),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] }),
    onError: (error) => console.error('Create students error:', error),
  });

  const updateMutation = useMutation({
    mutationFn: ({ studentId, updates }: {
      studentId: string;
      updates: Partial<Omit<Student, 'id' | 'tutor_id' | 'created_at'>>;
    }) => updateStudent(studentId, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (studentId: string) => deleteStudent(studentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] }),
  });

  return {
    students: studentsQuery.data ?? [],
    isLoading: studentsQuery.isLoading,
    error: studentsQuery.error,
    createStudent: createMutation.mutate,
    updateStudent: updateMutation.mutate,
    deleteStudent: deleteMutation.mutate,
    registeredStudents: registeredStudentsQuery.data ?? [],
    isLoadingRegistered: registeredStudentsQuery.isLoading,
  };
}