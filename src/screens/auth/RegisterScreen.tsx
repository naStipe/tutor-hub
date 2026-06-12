import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { signUp } from '../../supabase/auth';
import { supabase } from '../../supabase/config';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;
type Role = 'tutor' | 'student';

export function RegisterScreen({ navigation }: Props) {
  const [role, setRole] = useState<Role>('tutor');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (role === 'student' && !inviteCode.trim()) {
      Alert.alert('Error', "Please enter your tutor's invite code");
      return;
    }

    setLoading(true);
    try {
      let tutorId: string | null = null;
      if (role === 'student') {
        const { data: tutor, error: tutorError } = await supabase
          .from('profiles')
          .select('id')
          .eq('invite_code', inviteCode.trim())
          .eq('role', 'tutor')
          .single();

        if (tutorError || !tutor) {
          Alert.alert('Error', 'Invalid invite code');
          setLoading(false);
          return;
        }
        tutorId = tutor.id;
      }

      const data = await signUp(email, password, fullName);

      if (data.user) {
        const { error: updateError, data: updateData } = await supabase
          .from('profiles')
          .update({
            role: role === 'tutor' ? 'pending_tutor' : 'student',
            tutor_id: tutorId,
          })
          .eq('id', data.user.id)
          .select();

        console.log('Update result:', updateData, updateError);

        if (updateError) throw updateError;
      }

      Alert.alert(
        'Account created',
        role === 'tutor'
          ? "Please check your email to confirm. Your tutor account is pending approval — you'll be notified once approved."
          : 'Please check your email to confirm your account.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      Alert.alert('Registration failed', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start managing your lessons</Text>

        <View style={styles.roleSelector}>
          <TouchableOpacity
            style={[styles.roleButton, role === 'tutor' && styles.roleButtonActive]}
            onPress={() => setRole('tutor')}
          >
            <Text style={[styles.roleButtonText, role === 'tutor' && styles.roleButtonTextActive]}>
              I'm a Tutor
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, role === 'student' && styles.roleButtonActive]}
            onPress={() => setRole('student')}
          >
            <Text style={[styles.roleButtonText, role === 'student' && styles.roleButtonTextActive]}>
              I'm a Student
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {role === 'student' && (
          <TextInput
            style={styles.input}
            placeholder="Tutor's Invite Code"
            value={inviteCode}
            onChangeText={setInviteCode}
            autoCapitalize="characters"
          />
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8, textAlign: 'center', marginTop: 40 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 24, textAlign: 'center' },
  roleSelector: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  roleButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  roleButtonActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  roleButtonText: { fontSize: 14, fontWeight: '600', color: '#666' },
  roleButtonTextActive: { color: '#fff' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#4F46E5', textAlign: 'center', fontSize: 14, marginBottom: 40 },
});