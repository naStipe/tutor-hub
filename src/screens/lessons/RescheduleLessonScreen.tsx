import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLessons } from '../../hooks/useLessons';
import dayjs from 'dayjs';

type Props = NativeStackScreenProps<any, 'RescheduleLesson'>;

export function RescheduleLessonScreen({ route, navigation }: Props) {
  const lessonId = route.params?.lessonId;
  const { lessons, rescheduleLesson, isLoading } = useLessons();

  const lesson = lessons.find((l) => l.id === lessonId);

  const [dateTime, setDateTime] = useState(
    lesson ? new Date(lesson.date) : new Date()
  );
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

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Lesson not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Student</Text>
        <Text style={styles.infoValue}>{lesson.student?.full_name ?? 'Unknown'}</Text>
        {lesson.subject && (
          <>
            <Text style={styles.infoLabel}>Subject</Text>
            <Text style={styles.infoValue}>{lesson.subject}</Text>
          </>
        )}
        <Text style={styles.infoLabel}>Current date</Text>
        <Text style={styles.infoValue}>
          {dayjs(lesson.date).format('MMM D, YYYY · HH:mm')}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>New date & time</Text>

      <Text style={styles.label}>Date *</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.pickerValue}>{dayjs(dateTime).format('dddd, MMM D, YYYY')}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={dateTime}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      <Text style={styles.label}>Time *</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
        <Text style={styles.pickerValue}>{dayjs(dateTime).format('HH:mm')}</Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={dateTime}
          mode="time"
          display="spinner"
          onChange={onTimeChange}
          minuteInterval={5}
        />
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleReschedule}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? 'Rescheduling...' : 'Confirm Reschedule'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#EF4444' },
  infoCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  infoLabel: { fontSize: 12, color: '#888', marginTop: 8 },
  infoValue: { fontSize: 16, fontWeight: '600', color: '#111', marginTop: 2 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginTop: 24,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    minHeight: 48,
  },
  pickerValue: { fontSize: 16, color: '#111' },
  button: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});