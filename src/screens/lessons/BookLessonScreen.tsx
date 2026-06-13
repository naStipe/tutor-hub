import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useLessons } from '../../hooks/useLessons';
import { useStudents } from '../../hooks/useStudents';
import { useAvailability } from '../../hooks/useAvailability';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrAfter);

type Props = NativeStackScreenProps<any, 'BookLesson'>;

const DURATIONS = [30, 45, 60, 90];

export function BookLessonScreen({ navigation }: Props) {
  const { lessons, createLesson } = useLessons();
  const { students, registeredStudents } = useStudents();
  const { availability, isLoading: loadingAvailability } = useAvailability();

  const allStudents = useMemo(() => {
    return [
      ...registeredStudents.map((s) => ({ id: s.id, full_name: s.full_name, type: 'profile' as const })),
      ...students.map((s) => ({ id: s.id, full_name: s.full_name, type: 'manual' as const })),
    ];
  }, [registeredStudents, students]);

  const [selectedStudent, setSelectedStudent] = useState(allStudents[0]?.id ?? '');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [duration, setDuration] = useState(60);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const availableDays = useMemo(() => new Set(availability.map((a) => a.day_of_week)), [availability]);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    const today = dayjs();
    for (let i = 0; i < 60; i++) {
      const d = today.add(i, 'day');
      const dateStr = d.format('YYYY-MM-DD');
      const isAvailable = availableDays.has(d.day());
      marks[dateStr] = {
        customStyles: {
          container: { backgroundColor: isAvailable ? colors.successLight : colors.background, borderRadius: radius.md },
          text: { color: isAvailable ? colors.success : colors.textMuted },
        },
      };
    }
    if (selectedDate) {
      marks[selectedDate] = {
        customStyles: {
          container: { backgroundColor: colors.primary, borderRadius: radius.md },
          text: { color: colors.textInverse, fontWeight: 'bold' },
        },
      };
    }
    return marks;
  }, [availableDays, selectedDate]);

  // Generate 15-min slots for the whole day (00:00-23:45), mark conflicts
  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];

    const slots: { time: string; available: boolean }[] = [];

    const dayBooked = lessons
      .filter((l) => l.status === 'pending' || l.status === 'scheduled')
      .map((l) => ({ start: dayjs(l.date), end: dayjs(l.date).add(l.duration_minutes, 'minute') }))
      .filter((b) => b.start.format('YYYY-MM-DD') === selectedDate);

    let current = dayjs(selectedDate).hour(6).minute(0).second(0);
    const end = dayjs(selectedDate).hour(22).minute(0).second(0);

    while (current.isSameOrBefore(end)) {
      const slotEnd = current.add(duration, 'minute');
      const conflicts = dayBooked.some((b) => current.isBefore(b.end) && slotEnd.isAfter(b.start));
      const isPast = current.isBefore(dayjs());

      slots.push({ time: current.format('HH:mm'), available: !conflicts && !isPast });
      current = current.add(15, 'minute');
    }

    return slots;
  }, [selectedDate, duration, lessons]);

  function handleDayPress(day: DateData) {
    setSelectedDate(day.dateString);
    setSelectedTime(null);
  }

  async function handleBook() {
    if (!selectedStudent) {
      Alert.alert('Error', 'Please add a student first');
      return;
    }
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select a date and time');
      return;
    }

    const studentEntry = allStudents.find((s) => s.id === selectedStudent);
    const dateTime = dayjs(`${selectedDate} ${selectedTime}`).toISOString();

    setSaving(true);
    try {
      createLesson({
        student_id: studentEntry?.type === 'manual' ? selectedStudent : undefined,
        student_profile_id: studentEntry?.type === 'profile' ? selectedStudent : undefined,
        subject,
        date: dateTime,
        duration_minutes: duration,
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

  if (loadingAvailability) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (allStudents.length === 0) {
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
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Student *</Text>
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={selectedStudent} onValueChange={setSelectedStudent}>
            {allStudents.map((s) => (
              <Picker.Item key={s.id} label={s.full_name} value={s.id} />
            ))}
          </Picker>
        </View>
      </View>

      <Calendar
        markingType="custom"
        markedDates={markedDates}
        onDayPress={handleDayPress}
        minDate={dayjs().format('YYYY-MM-DD')}
        maxDate={dayjs().add(60, 'day').format('YYYY-MM-DD')}
        theme={{ todayTextColor: colors.primary, arrowColor: colors.primary, textMonthFontWeight: '700' }}
      />

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.successLight }]} />
          <Text style={styles.legendText}>Your availability</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }]} />
          <Text style={styles.legendText}>Outside availability</Text>
        </View>
      </View>

      <Text style={styles.label}>Lesson Duration</Text>
      <View style={styles.durationRow}>
        {DURATIONS.map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.durationChip, duration === d && styles.durationChipActive]}
            onPress={() => { setDuration(d); setSelectedTime(null); }}
          >
            <Text style={[styles.durationChipText, duration === d && styles.durationChipTextActive]}>{d} min</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedDate && (
        <>
          <Text style={styles.label}>Available Times — {dayjs(selectedDate).format('dddd, MMM D')}</Text>
          <View style={styles.timeGrid}>
            {timeSlots.map((slot) => {
              const isInSelectedSpan = selectedTime && (() => {
                const slotStart = dayjs(`${selectedDate} ${slot.time}`);
                const selectedStart = dayjs(`${selectedDate} ${selectedTime}`);
                const selectedEnd = selectedStart.add(duration, 'minute');
                return slotStart.isSameOrAfter(selectedStart) && slotStart.isBefore(selectedEnd);
              })();

              return (
                <TouchableOpacity
                  key={slot.time}
                  disabled={!slot.available}
                  style={[
                    styles.timeSlot,
                    slot.available ? styles.timeSlotAvailable : styles.timeSlotUnavailable,
                    isInSelectedSpan && styles.timeSlotSelected,
                  ]}
                  onPress={() => setSelectedTime(slot.time)}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      !slot.available && styles.timeSlotTextUnavailable,
                      isInSelectedSpan && styles.timeSlotTextSelected,
                    ]}
                  >
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      <View style={styles.formSection}>
        <Input label="Subject" value={subject} onChangeText={setSubject} placeholder="e.g. Mathematics" />
        <Input
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Any notes about this lesson..."
          multiline
          numberOfLines={4}
          style={styles.textArea}
        />
        <Button
          title="Book Lesson"
          onPress={handleBook}
          loading={saving}
          disabled={!selectedDate || !selectedTime}
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  section: { padding: spacing.lg, paddingBottom: 0 },
  label: { ...typography.captionBold, color: colors.text, marginBottom: spacing.xs, marginTop: spacing.md },
  pickerWrapper: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    backgroundColor: colors.background, overflow: 'hidden',
  },
  legend: { flexDirection: 'row', gap: spacing.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 12, height: 12, borderRadius: 3 },
  legendText: { ...typography.small, color: colors.textSecondary },
  durationRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg },
  durationChip: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md + 2, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  durationChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  durationChipText: { ...typography.captionBold, color: colors.textSecondary },
  durationChipTextActive: { color: colors.textInverse },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.lg },
  timeSlot: { paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.md + 2, borderRadius: radius.md, minWidth: 70, alignItems: 'center' },
  timeSlotAvailable: { backgroundColor: colors.successLight },
  timeSlotUnavailable: { backgroundColor: colors.background },
  timeSlotSelected: { backgroundColor: colors.primary },
  timeSlotText: { ...typography.captionBold, color: colors.success },
  timeSlotTextUnavailable: { color: colors.textMuted },
  timeSlotTextSelected: { color: colors.textInverse },
  formSection: { padding: spacing.lg },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: { marginTop: spacing.md, marginBottom: spacing.xl },
  bottomButton: { padding: spacing.lg },
});