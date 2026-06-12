import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';
import { StudentTabNavigator } from './StudentTabNavigator';
import { PendingApprovalScreen } from '../screens/auth/PendingApprovalScreen';

export function AppNavigator() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
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

  // User is logged in but profile hasn't loaded yet
  if (!profile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {profile.role === 'pending_tutor' ? (
        <PendingApprovalScreen />
      ) : profile.role === 'student' ? (
        <StudentTabNavigator />
      ) : (
        <TabNavigator />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});