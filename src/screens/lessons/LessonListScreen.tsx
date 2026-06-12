import { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useLessons } from '../../hooks/useLessons';
import { Lesson } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import dayjs from 'dayjs';

type Props = NativeStackScreenProps<any, 'LessonList'>;

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

export function LessonListScreen({ navigation }: Props) {
  const { lessons, isLoading, cancelLesson, approveLesson, rejectLesson } = useLessons();
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    lessons.forEach((lesson) => {
      const dateKey = dayjs(lesson.date).format('YYYY-MM-DD');
      if (!marks[dateKey]) marks[dateKey] = { dots: [] };
      marks[dateKey].dots.push({ color: statusDotColor(lesson.status) });
    });

    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: colors.primary,
    };

    return marks;
  }, [lessons, selectedDate]);

  const dayLessons = useMemo(() => {
    return lessons
      .filter((lesson) => dayjs(lesson.date).format('YYYY-MM-DD') === selectedDate)
      .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
  }, [lessons, selectedDate]);

  function handleCancel(lesson: Lesson) {
    const name = lesson.student?.full_name ?? lesson.student_profile?.full_name ?? 'this student';
    Alert.alert(
      'Cancel Lesson',
      `Cancel lesson with ${name} on ${dayjs(lesson.date).format('MMM D, YYYY')}?`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, cancel', style: 'destructive', onPress: () => cancelLesson(lesson.id) },
      ]
    );
  }

  function handleApprove(lesson: Lesson) {
    const name = lesson.student_profile?.full_name ?? lesson.student?.full_name ?? 'this student';
    Alert.alert(
      'Approve Lesson',
      `Approve lesson request from ${name} on ${dayjs(lesson.date).format('MMM D, YYYY · HH:mm')}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Approve', onPress: () => approveLesson(lesson.id) },
      ]
    );
  }

  function handleReject(lesson: Lesson) {
    Alert.alert(
      'Reject Lesson',
      'Are you sure you want to reject this lesson request?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Reject', style: 'destructive', onPress: () => rejectLesson(lesson.id) },
      ]
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading your lessons..." />;
  }

  return (
    <View style={styles.container}>
      <Calendar
        markingType="multi-dot"
        markedDates={markedDates}
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        theme={{
          selectedDayBackgroundColor: colors.primary,
          todayTextColor: colors.primary,
          arrowColor: colors.primary,
          textMonthFontWeight: '700',
        }}
        style={styles.calendar}
      />

      <Text style={styles.sectionTitle}>
        {dayjs(selectedDate).format('dddd, MMM D')}
      </Text>

      <FlatList
        data={dayLessons}
        keyExtractor={(item) => item.id}
        contentContainerStyle={dayLessons.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={<EmptyState title="No lessons on this day" />}
        renderItem={({ item }) => {
          const studentName = item.student?.full_name ?? item.student_profile?.full_name ?? 'Unknown Student';

          return (
            <TouchableOpacity onPress={() => navigation.navigate('LessonDetail', { lessonId: item.id })}>
              <Card style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.studentName}>{studentName}</Text>
                  <Badge label={item.status} variant={statusVariant(item.status)} />
                </View>
                <Text style={styles.time}>{dayjs(item.date).format('HH:mm')}</Text>
                <Text style={styles.duration}>{item.duration_minutes} min</Text>
                {item.subject && <Text style={styles.subject}>{item.subject}</Text>}

                {item.status === 'pending' && (
                  <View style={styles.actions}>
                    <Button title="Approve" onPress={() => handleApprove(item)} variant="success" style={styles.actionButton} />
                    <Button title="Reject" onPress={() => handleReject(item)} variant="danger" style={styles.actionButton} />
                  </View>
                )}
                {item.status === 'scheduled' && (
                  <View style={styles.actions}>
                    <Button
                      title="Reschedule"
                      onPress={() => navigation.navigate('RescheduleLesson', { lessonId: item.id })}
                      variant="outline"
                      style={styles.actionButton}
                    />
                    <Button title="Cancel" onPress={() => handleCancel(item)} variant="danger" style={styles.actionButton} />
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.fabContainer}>
        <Button title="+ Book Lesson" onPress={() => navigation.navigate('BookLesson', {})} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  calendar: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  listContent: { paddingBottom: spacing.md },
  emptyContainer: { flexGrow: 1 },
  card: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  studentName: { ...typography.bodyBold, color: colors.text },
  time: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  duration: { ...typography.small, color: colors.textMuted },
  subject: { ...typography.small, color: colors.textMuted, marginTop: spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  actionButton: { flex: 1, paddingVertical: spacing.sm },
  fabContainer: { padding: spacing.lg, backgroundColor: colors.background },
});