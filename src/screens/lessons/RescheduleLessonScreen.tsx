import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useLessons } from '../../hooks/useLessons';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

type Props = NativeStackScreenProps<any, 'RescheduleLesson'>;

const DURATIONS = [30, 45, 60, 90];

export function RescheduleLessonScreen({ route, navigation }: Props) {
  const lessonId = route.params?.lessonId;
  const { lessons, rescheduleLesson, isLoading } = useLessons();

  const lesson = lessons.find((l) => l.id === lessonId);

  const originalDate = lesson ? dayjs(lesson.date).format('YYYY-MM-DD') : null;
  const originalTime = lesson ? dayjs(lesson.date).format('HH:mm') : null;
  const duration = lesson?.duration_minutes ?? 60;

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Generate time slots for selected date
  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];

    const slots: { time: string; available: boolean; isOriginal: boolean }[] = [];

    // Get booked lessons on this day (excluding current lesson)
    const dayBooked = lessons
      .filter((l) => l.id !== lessonId && (l.status === 'pending' || l.status === 'scheduled'))
      .map((l) => ({ start: dayjs(l.date), end: dayjs(l.date).add(l.duration_minutes, 'minute') }))
      .filter((b) => b.start.format('YYYY-MM-DD') === selectedDate);

    let current = dayjs(selectedDate).hour(6).minute(0).second(0);
    const end = dayjs(selectedDate).hour(22).minute(0).second(0);

    while (current.isSameOrBefore(end)) {
      const slotEnd = current.add(duration, 'minute');
      const conflicts = dayBooked.some((b) => current.isBefore(b.end) && slotEnd.isAfter(b.start));
      const isPast = current.isBefore(dayjs());

      // Check if this slot is part of the original lesson time
      const isOriginal = selectedDate === originalDate && (() => {
        const slotStart = current;
        const origStart = dayjs(`${originalDate} ${originalTime}`);
        const origEnd = origStart.add(duration, 'minute');
        return slotStart.isSameOrAfter(origStart) && slotStart.isBefore(origEnd);
      })();

      slots.push({
        time: current.format('HH:mm'),
        available: !conflicts && !isPast,
        isOriginal,
      });

      current = current.add(15, 'minute');
    }

    return slots;
  }, [selectedDate, lessons, lessonId, duration, originalDate, originalTime]);

  // Mark calendar — highlight original date
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    if (originalDate) {
      marks[originalDate] = {
        customStyles: {
          container: { backgroundColor: colors.warningLight, borderRadius: radius.md },
          text: { color: colors.warning, fontWeight: 'bold' },
        },
      };
    }
    if (selectedDate && selectedDate !== originalDate) {
      marks[selectedDate] = {
        customStyles: {
          container: { backgroundColor: colors.primary, borderRadius: radius.md },
          text: { color: colors.textInverse, fontWeight: 'bold' },
        },
      };
    }
    if (selectedDate && selectedDate === originalDate) {
      marks[selectedDate] = {
        customStyles: {
          container: { backgroundColor: colors.primary, borderRadius: radius.md },
          text: { color: colors.textInverse, fontWeight: 'bold' },
        },
      };
    }
    return marks;
  }, [selectedDate, originalDate]);

  async function handleReschedule() {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select a date and time');
      return;
    }
    setSaving(true);
    try {
      const newDateTime = dayjs(`${selectedDate} ${selectedTime}`).toISOString();
      rescheduleLesson({ lessonId, newDate: newDateTime });
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
    <ScrollView style={styles.container}>
      <Card style={styles.infoCard}>
        <Text style={styles.infoLabel}>Student</Text>
        <Text style={styles.infoValue}>{studentName}</Text>
        {lesson.subject && (
          <>
            <Text style={styles.infoLabel}>Subject</Text>
            <Text style={styles.infoValue}>{lesson.subject}</Text>
          </>
        )}
        <Text style={styles.infoLabel}>Current date & time</Text>
        <Text style={styles.infoValue}>
          {dayjs(lesson.date).format('MMM D, YYYY · HH:mm')} ({duration} min)
        </Text>
      </Card>

      <Text style={styles.sectionTitle}>Select new date</Text>

      <Calendar
        markingType="custom"
        markedDates={markedDates}
        onDayPress={(day: DateData) => {
          setSelectedDate(day.dateString);
          setSelectedTime(null);
        }}
        minDate={dayjs().format('YYYY-MM-DD')}
        maxDate={dayjs().add(60, 'day').format('YYYY-MM-DD')}
        theme={{
          todayTextColor: colors.primary,
          arrowColor: colors.primary,
          textMonthFontWeight: '700',
        }}
      />

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.warningLight }]} />
          <Text style={styles.legendText}>Current date</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Selected date</Text>
        </View>
      </View>

      {selectedDate && (
        <>
          <Text style={styles.sectionTitle}>
            Select new time — {dayjs(selectedDate).format('dddd, MMM D')}
          </Text>

          {timeSlots.length === 0 ? (
            <Text style={styles.emptyText}>No slots available</Text>
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
                      slot.isOriginal && styles.timeSlotOriginal,
                      isInSelectedSpan && styles.timeSlotSelected,
                    ]}
                    onPress={() => setSelectedTime(slot.time)}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        !slot.available && styles.timeSlotTextUnavailable,
                        slot.isOriginal && styles.timeSlotTextOriginal,
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

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.successLight }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.warningLight }]} />
          <Text style={styles.legendText}>Current time</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>New time</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }]} />
          <Text style={styles.legendText}>Unavailable</Text>
        </View>
      </View>

      <View style={styles.formSection}>
        <Button
          title="Confirm Reschedule"
          onPress={handleReschedule}
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
  infoCard: { margin: spacing.lg, marginBottom: 0 },
  infoLabel: { ...typography.small, color: colors.textMuted, marginTop: spacing.sm },
  infoValue: { ...typography.bodyBold, color: colors.text, marginTop: spacing.xs },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 12, height: 12, borderRadius: 3 },
  legendText: { ...typography.small, color: colors.textSecondary },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  timeSlot: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md + 2,
    borderRadius: radius.md,
    minWidth: 70,
    alignItems: 'center',
  },
  timeSlotAvailable: { backgroundColor: colors.successLight },
  timeSlotUnavailable: { backgroundColor: colors.background },
  timeSlotOriginal: { backgroundColor: colors.warningLight },
  timeSlotSelected: { backgroundColor: colors.primary },
  timeSlotText: { ...typography.captionBold, color: colors.success },
  timeSlotTextUnavailable: { color: colors.textMuted },
  timeSlotTextOriginal: { color: colors.warning },
  timeSlotTextSelected: { color: colors.textInverse },
  emptyText: { ...typography.caption, color: colors.textSecondary, marginHorizontal: spacing.lg },
  formSection: { padding: spacing.lg, marginBottom: spacing.xl },
  button: { marginTop: spacing.md },
});