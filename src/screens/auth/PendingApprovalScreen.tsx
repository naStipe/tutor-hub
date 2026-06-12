import { View, Text, StyleSheet, Alert } from 'react-native';
import { signOut } from '../../supabase/auth';
import { Button } from '../../components/ui/Button';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

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
      <Button title="Sign Out" onPress={handleSignOut} variant="danger" style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
  },
  title: { ...typography.h3, color: colors.text, marginBottom: spacing.md, textAlign: 'center' },
  text: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xxl, lineHeight: 22 },
  button: { width: '100%' },
});