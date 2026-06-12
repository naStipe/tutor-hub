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
import DateTimePicker from '@react-native-community/datetimepicker';
import { useStudentLessons } from '../../hooks/useStudentLessons';
import dayjs from 'dayjs';

type Props = NativeStackScreenProps<any, 'BookLesson'>;

export function BookLessonScreen({ navigation }: Props) {
  const { bookLesson } = useStudentLessons();

  const [dateTime, setDateTime] = useState(new Date());
  const [duration, setDuration] = useState('60');
  const [subject, setSubject] = useState('');
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
    setSaving(true);
    try {
      bookLesson({
        date: dateTime.toISOString(),
        durationMinutes: parseInt(duration) || 60,
        subject,
      });
      Alert.alert('Success', 'Lesson booked! Your tutor will be notified.');
      navigation.navigate('MyLessons');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
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

      <Text style={styles.label}>Subject / Topic</Text>
      <TextInput
        style={styles.input}
        value={subject}
        onChangeText={setSubject}
        placeholder="e.g. Algebra homework help"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleBook}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? 'Booking...' : 'Request Lesson'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 16 },
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