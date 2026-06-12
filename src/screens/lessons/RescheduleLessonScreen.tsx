import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLessons } from '../../hooks/useLessons';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import dayjs from 'dayjs';

type Props = NativeStackScreenProps<any, 'RescheduleLesson'>;

export function RescheduleLessonScreen({ route, navigation }: Props) {
  const lessonId = route.params?.lessonId;
  const { lessons, rescheduleLesson, isLoading } = useLessons();

  const lesson = lessons.find((l) => l.id === lessonId);

  const [dateTime, setDateTime] = useState(lesson ? new Date(lesson.date) : new Date());
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

  async function handleReschedule() {
    setSaving(true);
    try {
      rescheduleLesson({ lessonId, newDate: dateTime.toISOString() });
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <LoadingSpinner message="Loading lesson..." />;
  if (!lesson) return <EmptyState title="Lesson not found" />;

  const studentName = lesson.student?.full_name ?? lesson.student_profile?.full_name ?? 'Unknown';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Card style={styles.infoCard}>
        <Text style={styles.infoLabel}>Student</Text>
        <Text style={styles.infoValue}>{studentName}</Text>
        {lesson.subject && (
          <>
            <Text style={styles.infoLabel}>Subject</Text>
            <Text style={styles.infoValue}>{lesson.subject}</Text>
          </>
        )}
        <Text style={styles.infoLabel}>Current date</Text>
        <Text style={styles.infoValue}>{dayjs(lesson.date).format('MMM D, YYYY · HH:mm')}</Text>
      </Card>

      <Text style={styles.sectionTitle}>New date & time</Text>

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

      <Button title="Confirm Reschedule" onPress={handleReschedule} loading={saving} style={styles.button} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  infoCard: { marginBottom: spacing.sm },
  infoLabel: { ...typography.small, color: colors.textMuted, marginTop: spacing.sm },
  infoValue: { ...typography.bodyBold, color: colors.text, marginTop: spacing.xs },
  sectionTitle: { ...typography.h3, color: colors.text, marginTop: spacing.xl, marginBottom: spacing.sm },
  label: { ...typography.captionBold, color: colors.text, marginBottom: spacing.xs, marginTop: spacing.md },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md,
    backgroundColor: colors.surface, minHeight: 48, justifyContent: 'center',
  },
  pickerValue: { ...typography.body, color: colors.text },
  button: { marginTop: spacing.xxl, marginBottom: spacing.xxl },
});