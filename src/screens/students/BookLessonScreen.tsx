import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useStudentLessons } from '../../hooks/useStudentLessons';
import { useAuth } from '../../hooks/useAuth';
import { useAvailability } from '../../hooks/useAvailability';
import { useTutorBookedSlots } from '../../hooks/useTutorBookedSlots';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);

type Props = NativeStackScreenProps<any, 'BookLesson'>;

const DURATIONS = [30, 45, 60, 90];

export function BookLessonScreen({ navigation }: Props) {
  const { bookLesson } = useStudentLessons();
  const { profile } = useAuth();
  const { availability, isLoading: loadingAvailability } = useAvailability(profile?.tutor_id ?? undefined);
  const { bookedSlots, isLoading: loadingBooked } = useTutorBookedSlots(profile?.tutor_id ?? undefined);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [duration, setDuration] = useState(60);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [saving, setSaving] = useState(false);

  const availableDays = useMemo(() => new Set(availability.map((a) => a.day_of_week)), [availability]);

  // Mark calendar dates: green if tutor available that weekday, grey otherwise (only for upcoming dates)
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    const today = dayjs();
    for (let i = 0; i < 60; i++) {
      const d = today.add(i, 'day');
      const dateStr = d.format('YYYY-MM-DD');
      const isAvailable = availableDays.has(d.day());
      marks[dateStr] = {
        customStyles: {
          container: {
            backgroundColor: isAvailable ? '#D1FAE5' : '#F3F4F6',
            borderRadius: 8,
          },
          text: {
            color: isAvailable ? '#065F46' : '#9CA3AF',
          },
        },
        disabled: !isAvailable,
      };
    }
    if (selectedDate) {
      marks[selectedDate] = {
        ...(marks[selectedDate] || {}),
        customStyles: {
          container: { backgroundColor: '#4F46E5', borderRadius: 8 },
          text: { color: '#fff', fontWeight: 'bold' },
        },
      };
    }
    return marks;
  }, [availableDays, selectedDate]);

  // Generate 15-min time slots for the selected date based on availability
  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dayOfWeek = dayjs(selectedDate).day();
    const slot = availability.find((a) => a.day_of_week === dayOfWeek);
    if (!slot) return [];

    const slots: { time: string; available: boolean }[] = [];
    const [startH, startM] = slot.start_time.split(':').map(Number);
    const [endH, endM] = slot.end_time.split(':').map(Number);

    let current = dayjs(selectedDate).hour(startH).minute(startM).second(0);
    const end = dayjs(selectedDate).hour(endH).minute(endM).second(0);

    // Booked slots for this day
    const dayBooked = bookedSlots
      .map((b) => ({
        start: dayjs(b.date),
        end: dayjs(b.date).add(b.duration_minutes, 'minute'),
      }))
      .filter((b) => b.start.format('YYYY-MM-DD') === selectedDate);

    while (current.add(duration, 'minute').isSameOrBefore(end)) {
      const slotEnd = current.add(duration, 'minute');

      // Check conflict with any booked lesson
      const conflicts = dayBooked.some(
        (b) => current.isBefore(b.end) && slotEnd.isAfter(b.start)
      );

      // Don't show past time slots for today
      const isPast = current.isBefore(dayjs());

      slots.push({
        time: current.format('HH:mm'),
        available: !conflicts && !isPast,
      });

      current = current.add(15, 'minute');
    }

    return slots;
  }, [selectedDate, availability, duration, bookedSlots]);

  function handleDayPress(day: DateData) {
    if (!availableDays.has(dayjs(day.dateString).day())) {
      return; // disabled day
    }
    setSelectedDate(day.dateString);
    setSelectedTime(null);
  }

  async function handleBook() {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select a date and time');
      return;
    }

    const dateTime = dayjs(`${selectedDate} ${selectedTime}`).toISOString();

    setSaving(true);
    try {
      bookLesson({ date: dateTime, durationMinutes: duration, subject });
      Alert.alert('Success', 'Lesson requested! Your tutor will confirm it.');
      navigation.navigate('MyLessons');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loadingAvailability || loadingBooked) {
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
    <ScrollView style={styles.container}>
      <Calendar
        markingType="custom"
        markedDates={markedDates}
        onDayPress={handleDayPress}
        minDate={dayjs().format('YYYY-MM-DD')}
        maxDate={dayjs().add(60, 'day').format('YYYY-MM-DD')}
        theme={{ todayTextColor: '#4F46E5', arrowColor: '#4F46E5' }}
      />

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#D1FAE5' }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F3F4F6' }]} />
          <Text style={styles.legendText}>Unavailable</Text>
        </View>
      </View>

      <Text style={styles.label}>Lesson Duration</Text>
      <View style={styles.durationRow}>
        {DURATIONS.map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.durationChip, duration === d && styles.durationChipActive]}
            onPress={() => {
              setDuration(d);
              setSelectedTime(null);
            }}
          >
            <Text style={[styles.durationChipText, duration === d && styles.durationChipTextActive]}>
              {d} min
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedDate && (
        <>
          <Text style={styles.label}>
            Available Times — {dayjs(selectedDate).format('dddd, MMM D')}
          </Text>
          {timeSlots.length === 0 ? (
            <Text style={styles.emptySubtext}>No slots available for this duration</Text>
          ) : (
            <View style={styles.timeGrid}>
              {timeSlots.map((slot) => (
                <TouchableOpacity
                  key={slot.time}
                  disabled={!slot.available}
                  style={[
                    styles.timeSlot,
                    slot.available ? styles.timeSlotAvailable : styles.timeSlotUnavailable,
                    selectedTime === slot.time && styles.timeSlotSelected,
                  ]}
                  onPress={() => setSelectedTime(slot.time)}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      !slot.available && styles.timeSlotTextUnavailable,
                      selectedTime === slot.time && styles.timeSlotTextSelected,
                    ]}
                  >
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}

      <Text style={styles.label}>Subject / Topic</Text>
      <TextInput
        style={styles.input}
        value={subject}
        onChangeText={setSubject}
        placeholder="e.g. Algebra homework help"
      />

      <TouchableOpacity
        style={[styles.button, (!selectedDate || !selectedTime) && styles.buttonDisabled]}
        onPress={handleBook}
        disabled={saving || !selectedDate || !selectedTime}
      >
        <Text style={styles.buttonText}>
          {saving ? 'Booking...' : 'Request Lesson'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#333', textAlign: 'center' },
  emptySubtext: { fontSize: 14, color: '#666', marginTop: 8, textAlign: 'center', paddingHorizontal: 16 },
  legend: { flexDirection: 'row', gap: 16, paddingHorizontal: 16, paddingVertical: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 3 },
  legendText: { fontSize: 12, color: '#666' },
  label: { fontSize: 14, fontWeight: '700', color: '#333', marginTop: 16, marginHorizontal: 16, marginBottom: 8 },
  durationRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  durationChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  durationChipActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  durationChipText: { fontSize: 13, color: '#666', fontWeight: '600' },
  durationChipTextActive: { color: '#fff' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16 },
  timeSlot: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, minWidth: 70, alignItems: 'center' },
  timeSlotAvailable: { backgroundColor: '#D1FAE5' },
  timeSlotUnavailable: { backgroundColor: '#F3F4F6' },
  timeSlotSelected: { backgroundColor: '#4F46E5' },
  timeSlotText: { fontSize: 13, fontWeight: '600', color: '#065F46' },
  timeSlotTextUnavailable: { color: '#9CA3AF' },
  timeSlotTextSelected: { color: '#fff' },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12,
    fontSize: 16, backgroundColor: '#fafafa', marginHorizontal: 16,
  },
  button: {
    backgroundColor: '#4F46E5', padding: 16, borderRadius: 10,
    alignItems: 'center', marginTop: 32, marginHorizontal: 16, marginBottom: 40,
  },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});