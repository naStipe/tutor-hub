import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../supabase/config';
import { connectToTutor } from '../../supabase/db/students';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { signOut } from '../../supabase/auth';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/spacing';
import { typography } from '../../constants/typography';

export function NoTutorScreen() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [inviteCode, setInviteCode] = useState('');
  const [connecting, setConnecting] = useState(false);

  async function handleConnect() {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }
    setConnecting(true);
    try {
      const { data: tutor, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('invite_code', inviteCode.trim())
        .eq('role', 'tutor')
        .single();

      if (error || !tutor) {
        Alert.alert('Error', 'Invalid invite code');
        return;
      }

      await connectToTutor(tutor.id, profile!.id);
      queryClient.invalidateQueries({ queryKey: ['student-connections'] });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setConnecting(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Connect to a Tutor</Text>
        <Text style={styles.subtitle}>
          You need a tutor's invite code to get started. Ask your tutor for their code.
        </Text>
        <TextInput
          style={styles.input}
          value={inviteCode}
          onChangeText={setInviteCode}
          placeholder="Enter invite code"
          autoCapitalize="characters"
        />
        <Button
          title="Connect"
          onPress={handleConnect}
          loading={connecting}
          style={styles.button}
        />
      </Card>
      <Button
        title="Sign Out"
        onPress={handleSignOut}
        variant="danger"
        style={styles.signOutButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  card: { marginBottom: spacing.lg },
  title: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    marginBottom: spacing.md,
    letterSpacing: 2,
  },
  button: { marginTop: spacing.sm },
  signOutButton: { marginTop: spacing.lg },
});