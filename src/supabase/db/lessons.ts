import { supabase } from '../config';
import { Lesson, LessonStatus } from '../../types';

export async function getLessons(tutorId: string): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      *,
      student:students(*),
      student_profile:profiles!lessons_student_profile_id_fkey(*)
    `)
    .eq('tutor_id', tutorId)
    .order('date', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getLesson(lessonId: string): Promise<Lesson> {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      *,
      student:students(*),
      student_profile:profiles!lessons_student_profile_id_fkey(*)
    `)
    .eq('id', lessonId)
    .single();

  if (error) throw error;
  return data;
}

export async function createLesson(
  tutorId: string,
  lesson: Omit<Lesson, 'id' | 'tutor_id' | 'student' | 'created_at' | 'updated_at'>
): Promise<Lesson> {
  const { data, error } = await supabase
    .from('lessons')
    .insert({ ...lesson, tutor_id: tutorId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateLesson(
  lessonId: string,
  updates: Partial<Omit<Lesson, 'id' | 'tutor_id' | 'student' | 'created_at' | 'updated_at'>>
): Promise<Lesson> {
  const { data, error } = await supabase
    .from('lessons')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', lessonId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function cancelLesson(lessonId: string): Promise<Lesson> {
  return updateLesson(lessonId, { status: 'cancelled' });
}

export async function rescheduleLesson(
  lessonId: string,
  newDate: string
): Promise<Lesson> {
  return updateLesson(lessonId, { date: newDate, status: 'scheduled' });
}

export async function deleteLesson(lessonId: string): Promise<void> {
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', lessonId);

  if (error) throw error;
}

export async function approveLesson(lessonId: string): Promise<Lesson> {
  return updateLesson(lessonId, { status: 'scheduled' });
}

export async function rejectLesson(lessonId: string): Promise<Lesson> {
  return updateLesson(lessonId, { status: 'cancelled' });
}