export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  Lessons: undefined;
  Students: undefined;
  Settings: undefined;
};

export type LessonsStackParamList = {
  LessonList: undefined;
  LessonDetail: { lessonId: string };
  BookLesson: { studentId?: string };
  RescheduleLesson: { lessonId: string };
};

export type StudentsStackParamList = {
  StudentList: undefined;
  StudentDetail: { studentId: string | null };
};