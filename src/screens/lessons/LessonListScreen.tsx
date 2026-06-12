import { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useLessons } from '../../hooks/useLessons';
import { Lesson } from '../../types';
import dayjs from 'dayjs';

type Props = NativeStackScreenProps<any, 'LessonList'>;

function statusColor(status: string) {
  switch (status) {
    case 'pending': return '#F59E0B';
    case 'scheduled': return '#4F46E5';
    case 'completed': return '#10B981';
    case 'cancelled': return '#EF4444';
    default: return '#666';
  }
}

export function LessonListScreen({ navigation }: Props) {
  const { lessons, isLoading, cancelLesson, approveLesson, rejectLesson } = useLessons();
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));

  // Build marked dates for the calendar
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    lessons.forEach((lesson) => {
      const dateKey = dayjs(lesson.date).format('YYYY-MM-DD');
      if (!marks[dateKey]) {
        marks[dateKey] = { dots: [] };
      }
      marks[dateKey].dots.push({ color: statusColor(lesson.status) });
    });

    // Highlight selected date
    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: '#4F46E5',
    };

    return marks;
  }, [lessons, selectedDate]);

  // Filter lessons for the selected day
  const dayLessons = useMemo(() => {
    return lessons
      .filter((lesson) => dayjs(lesson.date).format('YYYY-MM-DD') === selectedDate)
      .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
  }, [lessons, selectedDate]);

  function handleCancel(lesson: Lesson) {
    Alert.alert(
      'Cancel Lesson',
      `Cancel lesson with ${lesson.student?.full_name} on ${dayjs(lesson.date).format('MMM D, YYYY')}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, cancel',
          style: 'destructive',
          onPress: () => cancelLesson(lesson.id),
        },
      ]
    );
  }

  function handleApprove(lesson: Lesson) {
    Alert.alert(
      'Approve Lesson',
      `Approve lesson request from ${lesson.student_profile?.full_name ?? lesson.student?.full_name} on ${dayjs(lesson.date).format('MMM D, YYYY · HH:mm')}?`,
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
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Calendar
        markingType="multi-dot"
        markedDates={markedDates}
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        theme={{
          selectedDayBackgroundColor: '#4F46E5',
          todayTextColor: '#4F46E5',
          arrowColor: '#4F46E5',
        }}
      />

      <Text style={styles.sectionTitle}>
        {dayjs(selectedDate).format('dddd, MMM D')}
      </Text>

      <FlatList
        data={dayLessons}
        keyExtractor={(item) => item.id}
        contentContainerStyle={dayLessons.length === 0 && styles.emptyContainer}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No lessons on this day</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('LessonDetail', { lessonId: item.id })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.studentName}>
                {item.student?.full_name ?? item.student_profile?.full_name ?? 'Unknown Student'}
              </Text>
              <View style={[styles.badge, { backgroundColor: statusColor(item.status) }]}>
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.time}>{dayjs(item.date).format('HH:mm')}</Text>
            <Text style={styles.duration}>{item.duration_minutes} min</Text>
            {item.subject && <Text style={styles.subject}>{item.subject}</Text>}
            {item.status === 'pending' && (
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleApprove(item)}>
                  <Text style={styles.actionTextSuccess}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleReject(item)}>
                  <Text style={styles.actionTextDanger}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
            {item.status === 'scheduled' && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('RescheduleLesson', { lessonId: item.id })}
                >
                  <Text style={styles.actionTextPrimary}>Reschedule</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleCancel(item)}
                >
                  <Text style={styles.actionTextDanger}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('BookLesson', {})}
      >
        <Text style={styles.fabText}>+ Book Lesson</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },
  emptyContainer: { flexGrow: 1 },
  emptyText: { fontSize: 14, color: '#888' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  studentName: { fontSize: 16, fontWeight: '600', color: '#111' },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  time: { fontSize: 14, color: '#555', marginBottom: 4 },
  duration: { fontSize: 13, color: '#888' },
  subject: { fontSize: 13, color: '#888', marginTop: 2 },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  },
  actionButton: { paddingVertical: 4 },
  actionTextSuccess: { color: '#10B981', fontWeight: '600', fontSize: 14 },
  actionTextPrimary: { color: '#4F46E5', fontWeight: '600', fontSize: 14 },
  actionTextDanger: { color: '#EF4444', fontWeight: '600', fontSize: 14 },
  fab: {
    backgroundColor: '#4F46E5',
    margin: 16,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});