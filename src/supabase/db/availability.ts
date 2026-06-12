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