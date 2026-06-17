import { supabase } from '../config';
import { Lesson } from '../../types';
import { getActivePack, decrementPack } from './lessonPacks';
import { incrementPack } from './lessonPacks';

export async function autoCompletePastLessons(tutorId: string): Promise<void> {
  const now = new Date().toISOString();

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, date, duration_minutes')
    .eq('tutor_id', tutorId)
    .eq('status', 'scheduled');

  const toComplete = lessons?.filter((l) => {
    const endTime = new Date(l.date);
    endTime.setMinutes(endTime.getMinutes() + l.duration_minutes);
    return endTime < new Date(now);
  }) ?? [];

  if (toComplete.length > 0) {
    await supabase
      .from('lessons')
      .update({ status: 'completed', updated_at: now })
      .in('id', toComplete.map((l) => l.id));
  }
}

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
  lesson: Omit<Lesson, 'id' | 'tutor_id' | 'student' | 'student_profile' | 'created_at' | 'updated_at'>
): Promise<Lesson> {
  // Check for active pack
  const pack = await getActivePack(
    tutorId,
    lesson.student_profile_id,
    lesson.student_id
  );

  const { data, error } = await supabase
    .from('lessons')
    .insert({
      ...lesson,
      tutor_id: tutorId,
      payment_status: pack ? 'paid' : 'unpaid',
      pack_id: pack?.id ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  // Decrement pack if used
  if (pack) {
    await decrementPack(pack.id);
  }

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
  // Get the lesson first to check if it was paid and has a pack
  const { data: lesson, error: fetchError } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single();

  if (fetchError) throw fetchError;

  // Update status to cancelled
  const updated = await updateLesson(lessonId, { status: 'cancelled' });

  // If lesson was paid and has a pack, return credit
  if (lesson.payment_status === 'paid' && lesson.pack_id) {
    await incrementPack(lesson.pack_id);
  }

  return updated;
}

export async function rescheduleLesson(
  lessonId: string,
  newDate: string,
  duration?: number
): Promise<Lesson> {
  return updateLesson(lessonId, {
    date: newDate,
    status: 'scheduled',
    ...(duration && { duration_minutes: duration }),
  });
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