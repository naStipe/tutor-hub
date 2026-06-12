import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signOut } from '../../supabase/auth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  async function handleSignOut() {
    try {
      await signOut();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings</Text>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => navigation.navigate('Availability')}
      >
        <Text style={styles.menuButtonText}>Manage Availability</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  text: { fontSize: 24, fontWeight: 'bold', marginBottom: 32 },
  menuButton: {
    backgroundColor: '#f5f5f5', padding: 16, borderRadius: 8,
    width: '100%', alignItems: 'center', marginBottom: 16,
  },
  menuButtonText: { color: '#111', fontSize: 16, fontWeight: '600' },
  button: { backgroundColor: '#EF4444', padding: 16, borderRadius: 8, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});