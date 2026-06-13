import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Calendar, Users, Settings as SettingsIcon } from 'lucide-react-native';
import { AppTabParamList, StudentsStackParamList, LessonsStackParamList, SettingsStackParamList } from './types';
import { LessonListScreen } from '../screens/lessons/LessonListScreen';
import { LessonDetailScreen } from '../screens/lessons/LessonDetailScreen';
import { BookLessonScreen } from '../screens/lessons/BookLessonScreen';
import { RescheduleLessonScreen } from '../screens/lessons/RescheduleLessonScreen';
import { StudentListScreen } from '../screens/students/StudentListScreen';
import { StudentDetailScreen } from '../screens/students/StudentDetailScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { AvailabilityScreen } from '../screens/settings/AvailabilityScreen';
import { colors } from '../constants/colors';

const Tab = createBottomTabNavigator<AppTabParamList>();
const LessonsStack = createNativeStackNavigator<LessonsStackParamList>();
const StudentsStack = createNativeStackNavigator<StudentsStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

function LessonsNavigator() {
  return (
    <LessonsStack.Navigator screenOptions={headerOptions}>
      <LessonsStack.Screen name="LessonList" component={LessonListScreen} options={{ title: 'Lessons' }} />
      <LessonsStack.Screen name="LessonDetail" component={LessonDetailScreen} options={{ title: 'Lesson Detail' }} />
      <LessonsStack.Screen name="BookLesson" component={BookLessonScreen} options={{ title: 'Book Lesson' }} />
      <LessonsStack.Screen name="RescheduleLesson" component={RescheduleLessonScreen} options={{ title: 'Reschedule' }} />
    </LessonsStack.Navigator>
  );
}

function StudentsNavigator() {
  return (
    <StudentsStack.Navigator screenOptions={headerOptions}>
      <StudentsStack.Screen name="StudentList" component={StudentListScreen} options={{ title: 'Students' }} />
      <StudentsStack.Screen name="StudentDetail" component={StudentDetailScreen} />
    </StudentsStack.Navigator>
  );
}

function SettingsNavigator() {
  return (
    <SettingsStack.Navigator screenOptions={headerOptions}>
      <SettingsStack.Screen name="SettingsHome" component={SettingsScreen} options={{ title: 'Settings' }} />
      <SettingsStack.Screen name="Availability" component={AvailabilityScreen} options={{ title: 'Availability' }} />
    </SettingsStack.Navigator>
  );
}

const headerOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTitleStyle: { color: colors.text, fontWeight: '700' as const },
  headerShadowVisible: false,
};

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { borderTopColor: colors.borderLight },
      }}
    >
      <Tab.Screen
        name="Lessons"
        component={LessonsNavigator}
        options={{ headerShown: false, tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Students"
        component={StudentsNavigator}
        options={{ headerShown: false, tabBarIcon: ({ color, size }) => <Users color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{ headerShown: false, tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}