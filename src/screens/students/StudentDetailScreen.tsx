import { useState, useEffect } from 'react';
import { View, Alert, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useStudents } from '../../hooks/useStudents';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { StyleSheet } from 'react-native';

type Props = NativeStackScreenProps<any, 'StudentDetail'>;

export function StudentDetailScreen({ route, navigation }: Props) {
  const studentId = route.params?.studentId ?? null;
  const { students, createStudent, updateStudent, isLoading } = useStudents();

  const existingStudent = studentId ? students.find((s) => s.id === studentId) : null;
  const isEditing = !!existingStudent;

  const [fullName, setFullName] = useState(existingStudent?.full_name ?? '');
  const [email, setEmail] = useState(existingStudent?.email ?? '');
  const [phone, setPhone] = useState(existingStudent?.phone ?? '');
  const [notes, setNotes] = useState(existingStudent?.notes ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Edit Student' : 'New Student' });
  }, [isEditing]);

  async function handleSave() {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Full name is required');
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        updateStudent({ studentId: existingStudent.id, updates: { full_name: fullName, email, phone, notes } });
      } else {
        createStudent({ full_name: fullName, email, phone, notes });
      }
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <LoadingSpinner message="Loading..." />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Input label="Full Name *" value={fullName} onChangeText={setFullName} placeholder="e.g. John Smith" autoCapitalize="words" />
      <Input label="Email" value={email} onChangeText={setEmail} placeholder="e.g. john@email.com" keyboardType="email-address" autoCapitalize="none" />
      <Input label="Phone" value={phone} onChangeText={setPhone} placeholder="e.g. +358 40 123 4567" keyboardType="phone-pad" />
      <Input
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        placeholder="Any notes about this student..."
        multiline
        numberOfLines={4}
        style={styles.textArea}
      />

      <Button title={isEditing ? 'Save Changes' : 'Add Student'} onPress={handleSave} loading={saving} style={styles.button} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.lg },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: { marginTop: spacing.xl, marginBottom: spacing.xxl },
});