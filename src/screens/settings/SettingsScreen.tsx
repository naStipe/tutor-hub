import { useState } from 'react';
import { View, Text, StyleSheet, Alert, TextInput, Modal, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { signOut } from '../../supabase/auth';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../supabase/config';
import { connectToTutor } from '../../supabase/db/students';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/spacing';
import { typography } from '../../constants/typography';

type Props = NativeStackScreenProps<any, any>;

export function SettingsScreen({ navigation }: Props) {
  const { profile } = useAuth();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [connecting, setConnecting] = useState(false);

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }

  async function handleApplyTutor() {
    Alert.alert(
      'Apply to Become a Tutor',
      'Your account will be reviewed and approved by an administrator.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: async () => {
            const { error } = await supabase
              .from('profiles')
              .update({ role: 'pending_tutor' })
              .eq('id', profile!.id);
            if (error) Alert.alert('Error', error.message);
            else Alert.alert('Success', 'Your application has been submitted! Please sign out and back in once approved.');
          },
        },
      ]
    );
  }

  async function handleConnectTutor() {
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
      Alert.alert('Success', `Connected to ${tutor.full_name}!`);
      setShowInviteModal(false);
      setInviteCode('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setConnecting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {profile && (
        <Card style={styles.profileCard}>
          <Text style={styles.name}>{profile.full_name}</Text>
          <Text style={styles.email}>{profile.email}</Text>
          <Text style={styles.role}>{profile.role}</Text>
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

      {profile?.role === 'student' && (
        <>
          <Button
            title="Connect to a Tutor"
            onPress={() => setShowInviteModal(true)}
            variant="outline"
            style={styles.menuButton}
          />
          <Button
            title="Apply to Become a Tutor"
            onPress={handleApplyTutor}
            variant="outline"
            style={styles.menuButton}
          />
        </>
      )}

      <Button
        title="Sign Out"
        onPress={handleSignOut}
        variant="danger"
        style={styles.signOutButton}
      />

      {/* Connect to Tutor Modal */}
      <Modal
        visible={showInviteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInviteModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowInviteModal(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            <Text style={styles.modalTitle}>Connect to a Tutor</Text>
            <Text style={styles.modalSubtitle}>Enter your tutor's invite code</Text>
            <TextInput
              style={styles.input}
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder="Invite code"
              autoCapitalize="characters"
              autoFocus
            />
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => { setShowInviteModal(false); setInviteCode(''); }}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Connect"
                onPress={handleConnectTutor}
                loading={connecting}
                style={styles.modalButton}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.background },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.lg, marginTop: spacing.md },
  profileCard: { marginBottom: spacing.lg },
  name: { ...typography.h3, color: colors.text },
  email: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  role: { ...typography.small, color: colors.textMuted, marginTop: spacing.xs, textTransform: 'capitalize' },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: '85%',
  },
  modalTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.xs },
  modalSubtitle: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.lg },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    marginBottom: spacing.lg,
    letterSpacing: 2,
  },
  modalActions: { flexDirection: 'row', gap: spacing.md },
  modalButton: { flex: 1 },
});