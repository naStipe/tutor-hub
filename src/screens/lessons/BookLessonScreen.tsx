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
      Alert.alert('Error', 'Please add a students first');
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
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No students yet</Text>
        <Text style={styles.emptySubtext}>Add a student before booking a lesson</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Students')}
        >
          <Text style={styles.buttonText}>Go to Students</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Student *</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={studentId}
          onValueChange={(val) => setStudentId(val)}
        >
          {students.map((s) => (
            <Picker.Item key={s.id} label={s.full_name} value={s.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Subject</Text>
      <TextInput
        style={styles.input}
        value={subject}
        onChangeText={setSubject}
        placeholder="e.g. Mathematics"
      />

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

      <Text style={styles.label}>Duration (minutes)</Text>
      <TextInput
        style={styles.input}
        value={duration}
        onChangeText={setDuration}
        keyboardType="numeric"
        placeholder="e.g. 60"
      />

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Any notes about this lesson..."
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleBook}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? 'Booking...' : 'Book Lesson'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#666', marginBottom: 24, textAlign: 'center' },
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
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