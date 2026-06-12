import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useStudentLessons } from '../../hooks/useStudentLessons';
import { useAuth } from '../../hooks/useAuth';
import { useAvailability } from '../../hooks/useAvailability';
import dayjs from 'dayjs';

type Props = NativeStackScreenProps<any, 'BookLesson'>;

export function BookLessonScreen({ navigation }: Props) {
  const { bookLesson } = useStudentLessons();
  const { profile } = useAuth();
  const { availability, isLoading } = useAvailability(profile?.tutor_id ?? undefined);

  const [dateTime, setDateTime] = useState(new Date());
  const [duration, setDuration] = useState('60');
  const [subject, setSubject] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Days of week the tutor has availability for
  const availableDays = useMemo(() => {
    return new Set(availability.map((a) => a.day_of_week));
  }, [availability]);

  // Slot for the currently selected day
  const todaysSlot = useMemo(() => {
    const day = dayTime(dateTime);
    return availability.find((a) => a.day_of_week === day);
  }, [availability, dateTime]);

  function dayTime(d: Date) {
    return d.getDay();
  }

  function isWithinAvailability(d: Date): boolean {
    const slot = availability.find((a) => a.day_of_week === d.getDay());
    if (!slot) return false;

    const time = dayjs(d).format('HH:mm:ss');
    return time >= slot.start_time && time <= slot.end_time;
  }

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
    if (availability.length === 0) {
      Alert.alert('Error', 'Your tutor has not set up availability yet');
      return;
    }

    if (!isWithinAvailability(dateTime)) {
      Alert.alert(
        'Outside availability',
        'Please pick a date and time within your tutor\'s available hours.'
      );
      return;
    }

    setSaving(true);
    try {
      bookLesson({
        date: dateTime.toISOString(),
        durationMinutes: parseInt(duration) || 60,
        subject,
      });
      Alert.alert('Success', 'Lesson requested! Your tutor will confirm it.');
      navigation.navigate('MyLessons');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  }

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (availability.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Your tutor hasn't set availability yet</Text>
        <Text style={styles.emptySubtext}>Please check back later</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Tutor's Availability</Text>
        {availability.map((a) => (
          <Text key={a.id} style={styles.infoText}>
            {DAYS[a.day_of_week]}: {a.start_time.slice(0, 5)} - {a.end_time.slice(0, 5)}
          </Text>
        ))}
      </View>

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
      {!availableDays.has(dateTime.getDay()) && (
        <Text style={styles.warningText}>⚠️ Tutor is not available on this day</Text>
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
      {todaysSlot && !isWithinAvailability(dateTime) && (
        <Text style={styles.warningText}>
          ⚠️ Outside hours ({todaysSlot.start_time.slice(0, 5)} - {todaysSlot.end_time.slice(0, 5)})
        </Text>
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#333', textAlign: 'center' },
  emptySubtext: { fontSize: 14, color: '#666', marginTop: 8, textAlign: 'center' },
  infoCard: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 16, marginTop: 16 },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 6 },
  infoText: { fontSize: 13, color: '#666', marginTop: 2 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 16 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12,
    fontSize: 16, backgroundColor: '#fafafa', justifyContent: 'center', minHeight: 48,
  },
  pickerValue: { fontSize: 16, color: '#111' },
  warningText: { color: '#F59E0B', fontSize: 13, marginTop: 6, fontWeight: '600' },
  button: {
    backgroundColor: '#4F46E5', padding: 16, borderRadius: 10,
    alignItems: 'center', marginTop: 32, marginBottom: 40,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});