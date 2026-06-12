import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CalendarPlus, ListChecks, Settings as SettingsIcon } from 'lucide-react-native';
import { StudentTabParamList, StudentLessonsStackParamList } from './types';
import { BookLessonScreen } from '../screens/students/BookLessonScreen';
import { StudentLessonListScreen } from '../screens/students/StudentLessonListScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { colors } from '../constants/colors';

const Tab = createBottomTabNavigator<StudentTabParamList>();
const LessonsStack = createNativeStackNavigator<StudentLessonsStackParamList>();

const headerOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTitleStyle: { color: colors.text, fontWeight: '700' as const },
  headerShadowVisible: false,
};

function MyLessonsNavigator() {
  return (
    <LessonsStack.Navigator screenOptions={headerOptions}>
      <LessonsStack.Screen name="StudentLessonList" component={StudentLessonListScreen} options={{ title: 'My Lessons' }} />
    </LessonsStack.Navigator>
  );
}

export function StudentTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { borderTopColor: colors.borderLight },
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text, fontWeight: '700' },
        headerShadowVisible: false,
      }}
    >
      <Tab.Screen
        name="BookLesson"
        component={BookLessonScreen}
        options={{ title: 'Book Lesson', tabBarIcon: ({ color, size }) => <CalendarPlus color={color} size={size} /> }}
      />
      <Tab.Screen
        name="MyLessons"
        component={MyLessonsNavigator}
        options={{ headerShown: false, title: 'My Lessons', tabBarIcon: ({ color, size }) => <ListChecks color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}