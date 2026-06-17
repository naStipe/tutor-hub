import { supabase } from '../config';
import { LessonPack } from '../../types';

export async function getLessonPacks(tutorId: string): Promise<LessonPack[]> {
  const { data, error } = await supabase
    .from('lesson_packs')
    .select('*')
    .eq('tutor_id', tutorId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getActivePack(
  tutorId: string,
  studentProfileId?: string,
  studentId?: string
): Promise<LessonPack | null> {
  let query = supabase
    .from('lesson_packs')
    .select('*')
    .eq('tutor_id', tutorId)
    .gt('lessons_remaining', 0)
    .order('created_at', { ascending: true })
    .limit(1);

  if (studentProfileId) {
    query = query.eq('student_profile_id', studentProfileId);
  } else if (studentId) {
    query = query.eq('student_id', studentId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function createLessonPack(
  tutorId: string,
  totalLessons: number,
  studentProfileId?: string,
  studentId?: string
): Promise<LessonPack> {
  const { data, error } = await supabase
    .from('lesson_packs')
    .insert({
      tutor_id: tutorId,
      total_lessons: totalLessons,
      lessons_remaining: totalLessons,
      student_profile_id: studentProfileId ?? null,
      student_id: studentId ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function decrementPack(packId: string): Promise<void> {
  const { error } = await supabase.rpc('decrement_pack', { pack_id: packId });
  if (error) throw error;
}

export async function incrementPack(packId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_pack', { pack_id: packId });
  if (error) throw error;
}