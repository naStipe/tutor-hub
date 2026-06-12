import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useLessons } from '../../hooks/useLessons';
import dayjs from 'dayjs';

type Props = NativeStackScreenProps<any, 'LessonDetail'>;

function statusColor(status: string) {
  switch (status) {
    case 'scheduled': return '#4F46E5';
    case 'completed': return '#10B981';
    case 'cancelled': return '#EF4444';
    default: return '#666';
  }
}

export function LessonDetailScreen({ route, navigation }: Props) {
  const lessonId = route.params?.lessonId;
  const { lessons, cancelLesson, deleteLesson, isLoading } = useLessons();

  const lesson = lessons.find((l) => l.id === lessonId);

  function handleCancel() {
    Alert.alert(
      'Cancel Lesson',
      'Are you sure you want to cancel this lesson?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, cancel',
          style: 'destructive',
          onPress: () => {
            cancelLesson(lessonId);
            navigation.goBack();
          },
        },
      ]
    );
  }

  function handleDelete() {
    Alert.alert(
      'Delete Lesson',
      'This will permanently delete the lesson. Are you sure?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteLesson(lessonId);
            navigation.goBack();
          },
        },
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

  if (!lesson) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Lesson not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.studentName}>
          {lesson.student?.full_name ?? 'Unknown Student'}
        </Text>
        <View style={[styles.badge, { backgroundColor: statusColor(lesson.status) }]}>
          <Text style={styles.badgeText}>{lesson.status}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Row label="Date" value={dayjs(lesson.date).format('MMM D, YYYY')} />
        <Row label="Time" value={dayjs(lesson.date).format('HH:mm')} />
        <Row label="Duration" value={`${lesson.duration_minutes} minutes`} />
        {lesson.subject && <Row label="Subject" value={lesson.subject} />}
        {lesson.notes && <Row label="Notes" value={lesson.notes} />}
      </View>

      {lesson.status === 'scheduled' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('RescheduleLesson', { lessonId: lesson.id })}
          >
            <Text style={styles.primaryButtonText}>Reschedule</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleCancel}
          >
            <Text style={styles.dangerButtonText}>Cancel Lesson</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Delete Lesson</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#EF4444' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
  },
  studentName: { fontSize: 20, fontWeight: '700', color: '#111' },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rowLabel: { fontSize: 14, color: '#888' },
  rowValue: { fontSize: 14, fontWeight: '600', color: '#111', maxWidth: '60%', textAlign: 'right' },
  actions: { marginHorizontal: 16, gap: 12, marginBottom: 12 },
  primaryButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  dangerButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  dangerButtonText: { color: '#EF4444', fontSize: 16, fontWeight: '600' },
  deleteButton: {
    margin: 16,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: { color: '#999', fontSize: 14 },
});