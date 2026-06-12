import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signOut } from '../../supabase/auth';

export function PendingApprovalScreen() {
  async function handleSignOut() {
    try {
      await signOut();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Pending Approval</Text>
      <Text style={styles.text}>
        Your tutor account is currently under review. You'll be able to access
        the app once an administrator approves your account.
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  text: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  button: { backgroundColor: '#EF4444', padding: 16, borderRadius: 8, paddingHorizontal: 32 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});