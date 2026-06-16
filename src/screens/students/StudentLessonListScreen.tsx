import { useState, useMemo, useCallback } from 'react';
import {View, Text, FlatList, Alert, StyleSheet, Platform} from 'react-native';
import {ExpandableCalendar, CalendarProvider, Calendar} from 'react-native-calendars';
import { useStudentLessons } from '../../hooks/useStudentLessons';
import { Lesson } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import dayjs from 'dayjs';

const calendarTheme = {
  selectedDayBackgroundColor: colors.primary,
  todayTextColor: colors.primary,
  arrowColor: colors.primary,
  textMonthFontWeight: '700' as const,
};

const providerTheme = { todayButtonTextColor: colors.primary };

function statusVariant(status: string): 'warning' | 'primary' | 'success' | 'danger' | 'neutral' {
  switch (status) {
    case 'pending': return 'warning';
    case 'scheduled': return 'primary';
    case 'completed': return 'success';
    case 'cancelled': return 'danger';
    default: return 'neutral';
  }
}

function statusDotColor(status: string) {
  switch (status) {
    case 'pending': return colors.warning;
    case 'scheduled': return colors.primary;
    case 'completed': return colors.success;
    case 'cancelled': return colors.danger;
    default: return colors.textMuted;
  }
}

export function StudentLessonListScreen() {
  const { lessons, isLoading, cancelLesson } = useStudentLessons();
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    lessons.forEach((lesson) => {
      const dateKey = dayjs(lesson.date).format('YYYY-MM-DD');
      if (!marks[dateKey]) marks[dateKey] = { dots: [] };
      if (marks[dateKey].dots.length < 6) {
        marks[dateKey].dots.push({ color: statusDotColor(lesson.status) });
      }
    });
    return marks;
  }, [lessons]);

  const dayLessons = useMemo(() => {
    return lessons
      .filter((lesson) => dayjs(lesson.date).format('YYYY-MM-DD') === selectedDate)
      .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
  }, [lessons, selectedDate]);

  const handleDateChanged = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const handleCancel = useCallback((lesson: Lesson) => {
    Alert.alert(
      'Cancel Lesson',
      `Cancel your lesson on ${dayjs(lesson.date).format('MMM D, YYYY · HH:mm')}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, cancel',
          style: 'destructive',
          onPress: () => cancelLesson(lesson.id),
        },
      ]
    );
  }, [cancelLesson]);

  if (isLoading) {
    return <LoadingSpinner message="Loading your lessons..." />;
  }

  return (
    <CalendarProvider
      date={selectedDate}
      onDateChanged={handleDateChanged}
      showTodayButton
      theme={providerTheme}
    >
      {Platform.OS === 'web' ? (
        <Calendar
          firstDay={1}
          markingType="multi-dot"
          markedDates={{
            ...markedDates,
            [selectedDate]: {
              ...(markedDates[selectedDate] || {}),
              selected: true,
              selectedColor: colors.primary,
            },
          }}
          theme={calendarTheme}
          onDayPress={(day) => setSelectedDate(day.dateString)}
        />
      ) : (
        <ExpandableCalendar
          firstDay={1}
          markingType="multi-dot"
          markedDates={markedDates}
          theme={calendarTheme}
          animateScroll={false}
          pastScrollRange={2}
          futureScrollRange={3}
        />
      )}

      <Text style={styles.sectionTitle}>
        {dayjs(selectedDate).format('dddd, MMM D')}
      </Text>

      <FlatList
        data={dayLessons}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          dayLessons.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={<EmptyState title="No lessons on this day" />}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardTopRow}>
              <View style={styles.cardTopLeft}>
                <Text style={styles.time}>{dayjs(item.date).format('HH:mm')}</Text>
                <Text style={styles.duration}>{item.duration_minutes} min</Text>
              </View>
              <Badge label={item.status} variant={statusVariant(item.status)} />
            </View>
            {item.subject && <Text style={styles.subject}>{item.subject}</Text>}
            {(item.status === 'scheduled' || item.status === 'pending') && (
              <Button
                title="Cancel Lesson"
                onPress={() => handleCancel(item)}
                variant="danger"
                style={styles.cancelButton}
              />
            )}
          </Card>
        )}
      />
    </CalendarProvider>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  listContent: { padding: spacing.lg, paddingTop: 0 },
  emptyContainer: { flexGrow: 1 },
  card: { marginBottom: spacing.md },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardTopLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  time: { ...typography.bodyBold, color: colors.primary },
  duration: { ...typography.small, color: colors.textMuted },
  subject: { ...typography.small, color: colors.textMuted, marginTop: spacing.xs },
  cancelButton: { marginTop: spacing.sm, paddingVertical: spacing.xs + 2 },
});