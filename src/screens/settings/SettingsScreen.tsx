import { View, Text, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { signOut } from '../../supabase/auth';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

type Props = NativeStackScreenProps<any, any>;

export function SettingsScreen({ navigation }: Props) {
  const { profile } = useAuth();

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {profile && (
        <Card style={styles.profileCard}>
          <Text style={styles.name}>{profile.full_name}</Text>
          <Text style={styles.email}>{profile.email}</Text>
          {profile.invite_code && (
            <View style={styles.inviteRow}>
              <Text style={styles.inviteLabel}>Your Invite Code</Text>
              <Text style={styles.inviteCode}>{profile.invite_code}</Text>
            </View>
          )}
        </Card>
      )}

      {profile?.role === 'tutor' && (
        <Button
          title="Manage Availability"
          onPress={() => navigation.navigate('Availability')}
          variant="outline"
          style={styles.menuButton}
        />
      )}

      <Button title="Sign Out" onPress={handleSignOut} variant="danger" style={styles.signOutButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.background },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.lg, marginTop: spacing.md },
  profileCard: { marginBottom: spacing.lg },
  name: { ...typography.h3, color: colors.text },
  email: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  inviteRow: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  inviteLabel: { ...typography.small, color: colors.textMuted },
  inviteCode: { ...typography.h3, color: colors.primary, marginTop: spacing.xs, letterSpacing: 2 },
  menuButton: { marginBottom: spacing.md },
  signOutButton: { marginTop: 'auto', marginBottom: spacing.xl },
});