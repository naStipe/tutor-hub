import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useStudentLessons } from '../../hooks/useStudentLessons';
import { Lesson } from '../../types';
import dayjs from 'dayjs';

type Props = NativeStackScreenProps<any, 'StudentLessonList'>;

function statusColor(status: string) {
  switch (status) {
    case 'pending': return '#F59E0B';
    case 'scheduled': return '#4F46E5';
    case 'completed': return '#10B981';
    case 'cancelled': return '#EF4444';
    default: return '#666';
  }
}

export function StudentLessonListScreen({ navigation }: Props) {
  const { lessons, isLoading, cancelLesson } = useStudentLessons();

  function handleCancel(lesson: Lesson) {
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
      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id}
        contentContainerStyle={lessons.length === 0 && styles.emptyContainer}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No lessons booked yet</Text>
            <Text style={styles.emptySubtext}>Go to "Book Lesson" to schedule one</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.date}>
                {dayjs(item.date).format('MMM D, YYYY · HH:mm')}
              </Text>
              <View style={[styles.badge, { backgroundColor: statusColor(item.status) }]}>
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.duration}>{item.duration_minutes} min</Text>
            {item.subject && <Text style={styles.subject}>{item.subject}</Text>}
            {(item.status === 'scheduled' || item.status === 'pending') && (
              <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancel(item)}>
                <Text style={styles.cancelText}>Cancel Lesson</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#333' },
  emptySubtext: { fontSize: 14, color: '#666', marginTop: 8 },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
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
  date: { fontSize: 15, fontWeight: '600', color: '#111' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  duration: { fontSize: 13, color: '#888' },
  subject: { fontSize: 13, color: '#888', marginTop: 2 },
  cancelButton: { marginTop: 12 },
  cancelText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },
});