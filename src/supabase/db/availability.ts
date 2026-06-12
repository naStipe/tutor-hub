import { supabase } from '../config';
import { Availability } from '../../types';

export async function getTutorAvailability(tutorId: string): Promise<Availability[]> {
  const { data, error } = await supabase
    .from('availability')
    .select('*')
    .eq('tutor_id', tutorId)
    .order('day_of_week', { ascending: true });

  if (error) throw error;
  return data;
}

export async function addAvailability(
  tutorId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string
): Promise<Availability> {
  const { data, error } = await supabase
    .from('availability')
    .insert({ tutor_id: tutorId, day_of_week: dayOfWeek, start_time: startTime, end_time: endTime })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAvailability(id: string): Promise<void> {
  const { error } = await supabase
    .from('availability')
    .delete()
    .eq('id', id);

  if (error) throw error;
}