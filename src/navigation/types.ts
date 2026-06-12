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

export type StudentTabParamList = {
  BookLesson: undefined;
  MyLessons: undefined;
  Settings: undefined;
};

export type StudentLessonsStackParamList = {
  StudentLessonList: undefined;
  StudentLessonDetail: { lessonId: string };
};

export type StudentBookStackParamList = {
  AvailabilityCalendar: undefined;
  ConfirmBooking: { date: string; time: string };
};
