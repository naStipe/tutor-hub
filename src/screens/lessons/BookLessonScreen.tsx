import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLessons } from '../../hooks/useLessons';
import { useStudents } from '../../hooks/useStudents';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import dayjs from 'dayjs';

type Props = NativeStackScreenProps<any, 'BookLesson'>;

export function BookLessonScreen({ navigation }: Props) {
  const { createLesson } = useLessons();
  const { students } = useStudents();

  const [studentId, setStudentId] = useState(students[0]?.id ?? '');
  const [subject, setSubject] = useState('');
  const [dateTime, setDateTime] = useState(new Date());
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  function onDateChange(event: any, selected?: Date) {
    setShowDatePicker(Platform.OS === 'ios');
    if (selected) {
      const updated = new Date(dateTime);
      updated.setFullYear(selected.getFullYear());
      updated.setMonth(selected.getMonth());
      updated.setDate(selected.getDate());
      setDateTime(updated);
    }
    if (Platform.OS === 'android') setShowDatePicker(false);
  }

  function onTimeChange(event: any, selected?: Date) {
    setShowTimePicker(Platform.OS === 'ios');
    if (selected) {
      const updated = new Date(dateTime);
      updated.setHours(selected.getHours());
      updated.setMinutes(selected.getMinutes());
      setDateTime(updated);
    }
    if (Platform.OS === 'android') setShowTimePicker(false);
  }

  async function handleBook() {
    if (!studentId) {
      Alert.alert('Error', 'Please add a student first');
      return;
    }

    setSaving(true);
    try {
      createLesson({
        student_id: studentId,
        subject,
        date: dateTime.toISOString(),
        duration_minutes: parseInt(duration) || 60,
        status: 'scheduled',
        notes,
      });
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  }

  if (students.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState title="No students yet" subtitle="Add a student before booking a lesson" />
        <View style={styles.bottomButton}>
          <Button title="Go to Students" onPress={() => navigation.navigate('Students')} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Student *</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={studentId} onValueChange={(val) => setStudentId(val)}>
          {students.map((s) => (
            <Picker.Item key={s.id} label={s.full_name} value={s.id} />
          ))}
        </Picker>
      </View>

      <Input label="Subject" value={subject} onChangeText={setSubject} placeholder="e.g. Mathematics" />

      <Text style={styles.label}>Date *</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.pickerValue}>{dayjs(dateTime).format('dddd, MMM D, YYYY')}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={dateTime} mode="date" display="default" onChange={onDateChange} minimumDate={new Date()} />
      )}

      <Text style={styles.label}>Time *</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
        <Text style={styles.pickerValue}>{dayjs(dateTime).format('HH:mm')}</Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker value={dateTime} mode="time" display="spinner" onChange={onTimeChange} minuteInterval={5} />
      )}

      <Input
        label="Duration (minutes)"
        value={duration}
        onChangeText={setDuration}
        keyboardType="numeric"
        placeholder="e.g. 60"
      />

      <Input
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        placeholder="Any notes about this lesson..."
        multiline
        numberOfLines={4}
        style={styles.textArea}
      />

      <Button title="Book Lesson" onPress={handleBook} loading={saving} style={styles.button} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.lg },
  label: { ...typography.captionBold, color: colors.text, marginBottom: spacing.xs, marginTop: spacing.md },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md,
    backgroundColor: colors.background, minHeight: 48, justifyContent: 'center',
  },
  pickerValue: { ...typography.body, color: colors.text },
  pickerWrapper: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    backgroundColor: colors.background, overflow: 'hidden',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: { marginTop: spacing.xl, marginBottom: spacing.xxl },
  bottomButton: { padding: spacing.lg },
});