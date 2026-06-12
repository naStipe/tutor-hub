export type UserRole = 'tutor' | 'pending_tutor' | 'student';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  tutor_approved: boolean;
  invite_code?: string;
  tutor_id?: string;
  created_at: string;
}

export interface Availability {
  id: string;
  tutor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
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

export type LessonStatus = 'pending' | 'scheduled' | 'completed' | 'cancelled';

export interface Lesson {
  id: string;
  tutor_id: string;
  student_id?: string;
  student_profile_id?: string;
  student?: { id: string; full_name: string; email?: string; phone?: string };
  student_profile?: Profile;
  subject?: string;
  date: string;
  duration_minutes: number;
  status: LessonStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}