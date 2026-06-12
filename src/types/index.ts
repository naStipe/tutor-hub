export type UserRole = 'tutor' | 'student';

export interface Profile {
  id: string;           // matches Supabase auth user id
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface Student {
  id: string;
  tutor_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  notes?: string;
  created_at: string;
}

export type LessonStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Lesson {
  id: string;
  tutor_id: string;
  student_id: string;
  student?: Student;    // joined from DB query
  subject?: string;
  date: string;         // ISO timestamp
  duration_minutes: number;
  status: LessonStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}