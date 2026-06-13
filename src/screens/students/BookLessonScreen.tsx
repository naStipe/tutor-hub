import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useStudentLessons } from '../../hooks/useStudentLessons';
import { useAuth } from '../../hooks/useAuth';
import { useAvailability } from '../../hooks/useAvailability';
import { useTutorBookedSlots } from '../../hooks/useTutorBookedSlots';
import { Card } from '../../components/ui/Card';
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
        disabled: !isAvailable,
      };
    }
    if (selectedDate) {
      marks[selectedDate] = {
        ...(marks[selectedDate] || {}),
        customStyles: {
          container: { backgroundColor: colors.primary, borderRadius: radius.md },
          text: { color: colors.textInverse, fontWeight: 'bold' },
        },
      };
    }
    return marks;
  }, [availableDays, selectedDate]);

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

    const dayBooked = bookedSlots
      .map((b) => ({ start: dayjs(b.date), end: dayjs(b.date).add(b.duration_minutes, 'minute') }))
      .filter((b) => b.start.format('YYYY-MM-DD') === selectedDate);

    while (current.add(duration, 'minute').isSameOrBefore(end)) {
      const slotEnd = current.add(duration, 'minute');
      const conflicts = dayBooked.some((b) => current.isBefore(b.end) && slotEnd.isAfter(b.start));
      const isPast = current.isBefore(dayjs());

      slots.push({ time: current.format('HH:mm'), available: !conflicts && !isPast });
      current = current.add(15, 'minute');
    }

    return slots;
  }, [selectedDate, availability, duration, bookedSlots]);

  function handleDayPress(day: DateData) {
    if (!availableDays.has(dayjs(day.dateString).day())) return;
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
    return <LoadingSpinner message="Loading availability..." />;
  }

  if (availability.length === 0) {
    return <EmptyState title="Your tutor hasn't set availability yet" subtitle="Please check back later" />;
  }

  return (
    <ScrollView style={styles.container}>
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
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }]} />
          <Text style={styles.legendText}>Unavailable</Text>
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
          {timeSlots.length === 0 ? (
            <Text style={styles.emptyText}>No slots available for this duration</Text>
          ) : (
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
          )}
        </>
      )}

      <View style={styles.formSection}>
        <Input label="Subject / Topic" value={subject} onChangeText={setSubject} placeholder="e.g. Algebra homework help" />
        <Button
          title="Request Lesson"
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
  legend: { flexDirection: 'row', gap: spacing.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 12, height: 12, borderRadius: 3 },
  legendText: { ...typography.small, color: colors.textSecondary },
  label: { ...typography.captionBold, color: colors.text, marginTop: spacing.lg, marginHorizontal: spacing.lg, marginBottom: spacing.sm },
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
  emptyText: { ...typography.caption, color: colors.textSecondary, marginHorizontal: spacing.lg },
  formSection: { padding: spacing.lg },
  button: { marginTop: spacing.md, marginBottom: spacing.xl },
});