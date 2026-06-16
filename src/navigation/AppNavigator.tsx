import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '../hooks/useAuth';
import { useStudentConnections } from '../hooks/useStudentConnections';
import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';
import { StudentTabNavigator } from './StudentTabNavigator';
import { PendingApprovalScreen } from '../screens/auth/PendingApprovalScreen';
import { NoTutorScreen } from '../screens/auth/NoTutorScreen';
import { colors } from '../constants/colors';

export function AppNavigator() {
  const { user, profile, loading } = useAuth();
  const { hasConnections, isLoading: loadingConnections } = useStudentConnections();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (profile.role === 'pending_tutor') {
    return (
      <NavigationContainer>
        <PendingApprovalScreen />
      </NavigationContainer>
    );
  }

  if (profile.role === 'student') {
    if (loadingConnections) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (!hasConnections) {
      return (
        <NavigationContainer>
          <NoTutorScreen />
        </NavigationContainer>
      );
    }

    return (
      <NavigationContainer>
        <StudentTabNavigator />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});