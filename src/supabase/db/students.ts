import { supabase } from '../config';
import { Student } from '../../types';

export async function getStudents(tutorId: string): Promise<Student[]> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('tutor_id', tutorId)
    .order('full_name', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getStudent(studentId: string): Promise<Student> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single();

  if (error) throw error;
  return data;
}

export async function createStudent(
  tutorId: string,
  student: Omit<Student, 'id' | 'tutor_id' | 'created_at'>
): Promise<Student> {
  const { data, error } = await supabase
    .from('students')
    .insert({ ...student, tutor_id: tutorId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateStudent(
  studentId: string,
  updates: Partial<Omit<Student, 'id' | 'tutor_id' | 'created_at'>>
): Promise<Student> {
  const { data, error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', studentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteStudent(studentId: string): Promise<void> {
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', studentId);

  if (error) throw error;
}