import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StudentTabParamList, StudentLessonsStackParamList } from './types';
import { BookLessonScreen } from '../screens/students/BookLessonScreen';
import { StudentLessonListScreen } from '../screens/students/StudentLessonListScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator<StudentTabParamList>();
const LessonsStack = createNativeStackNavigator<StudentLessonsStackParamList>();

function MyLessonsNavigator() {
  return (
    <LessonsStack.Navigator>
      <LessonsStack.Screen
        name="StudentLessonList"
        component={StudentLessonListScreen}
        options={{ title: 'My Lessons' }}
      />
    </LessonsStack.Navigator>
  );
}

export function StudentTabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="BookLesson"
        component={BookLessonScreen}
        options={{ title: 'Book Lesson' }}
      />
      <Tab.Screen
        name="MyLessons"
        component={MyLessonsNavigator}
        options={{ headerShown: false, title: 'My Lessons' }}
      />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}