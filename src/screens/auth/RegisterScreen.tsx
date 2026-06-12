import { useState } from 'react';
import {
  View,
  Text,
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
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/spacing';
import { typography } from '../../constants/typography';

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

      await signUp(email, password, fullName, role, tutorId);

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
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start managing your lessons</Text>
        </View>

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

        <Input
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {role === 'student' && (
          <Input
            placeholder="Tutor's Invite Code"
            value={inviteCode}
            onChangeText={setInviteCode}
            autoCapitalize="characters"
          />
        )}

        <Button title="Create Account" onPress={handleRegister} loading={loading} style={styles.button} />

        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
          Already have an account? <Text style={styles.linkBold}>Sign in</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { padding: spacing.xl, paddingTop: spacing.xxxl },
  header: { marginBottom: spacing.xl, alignItems: 'center' },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary },
  roleSelector: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  roleButton: {
    flex: 1,
    padding: spacing.md + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  roleButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  roleButtonText: { ...typography.captionBold, color: colors.textSecondary },
  roleButtonTextActive: { color: colors.textInverse },
  button: { marginBottom: spacing.lg, marginTop: spacing.sm },
  link: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xxxl },
  linkBold: { color: colors.primary, fontWeight: '600' },
});