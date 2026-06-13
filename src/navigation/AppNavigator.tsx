import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';
import { StudentTabNavigator } from './StudentTabNavigator';
import { PendingApprovalScreen } from '../screens/auth/PendingApprovalScreen';
import {useEffect} from "react";
import * as SplashScreen from 'expo-splash-screen';


export function AppNavigator() {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

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