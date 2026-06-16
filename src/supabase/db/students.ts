import { supabase } from '../config';
import { Student } from '../../types';
import { Profile } from '../../types';

export async function getRegisteredStudents(tutorId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('tutor_student_connections')
    .select('student:profiles!tutor_student_connections_student_id_fkey(*)')
    .eq('tutor_id', tutorId);

  if (error) throw error;
  return data.map((c: any) => c.student);
}

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

export async function getStudentConnections(studentId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('tutor_student_connections')
    .select('tutor_id')
    .eq('student_id', studentId);

  if (error) throw error;
  return data.map((c) => c.tutor_id);
}

export async function connectToTutor(tutorId: string, studentId: string): Promise<void> {
  const { error } = await supabase
    .from('tutor_student_connections')
    .insert({ tutor_id: tutorId, student_id: studentId });

  if (error) throw error;
}