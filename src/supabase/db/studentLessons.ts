import { supabase } from '../config';
import { Lesson } from '../../types';

export async function getStudentLessons(studentProfileId: string): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('student_profile_id', studentProfileId)
    .order('date', { ascending: true });

  if (error) throw error;
  return data;
}

export async function bookLessonAsStudent(
  tutorId: string,
  studentProfileId: string,
  date: string,
  durationMinutes: number,
  subject?: string
): Promise<Lesson> {
  const { data, error } = await supabase
    .from('lessons')
    .insert({
      tutor_id: tutorId,
      student_profile_id: studentProfileId,
      date,
      duration_minutes: durationMinutes,
      subject,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function cancelStudentLesson(lessonId: string): Promise<void> {
  const { error } = await supabase
    .from('lessons')
    .update({ status: 'cancelled' })
    .eq('id', lessonId);

  if (error) throw error;
}