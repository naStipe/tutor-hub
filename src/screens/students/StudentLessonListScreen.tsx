import { View, Text, FlatList, Alert, StyleSheet } from 'react-native';
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

function statusVariant(status: string): 'warning' | 'primary' | 'success' | 'danger' | 'neutral' {
  switch (status) {
    case 'pending': return 'warning';
    case 'scheduled': return 'primary';
    case 'completed': return 'success';
    case 'cancelled': return 'danger';
    default: return 'neutral';
  }
}

export function StudentLessonListScreen() {
  const { lessons, isLoading, cancelLesson } = useStudentLessons();

  function handleCancel(lesson: Lesson) {
    Alert.alert(
      'Cancel Lesson',
      `Cancel your lesson on ${dayjs(lesson.date).format('MMM D, YYYY · HH:mm')}?`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, cancel', style: 'destructive', onPress: () => cancelLesson(lesson.id) },
      ]
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading your lessons..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id}
        contentContainerStyle={lessons.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={
          <EmptyState title="No lessons booked yet" subtitle='Go to "Book Lesson" to schedule one' />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.date}>{dayjs(item.date).format('MMM D, YYYY · HH:mm')}</Text>
              <Badge label={item.status} variant={statusVariant(item.status)} />
            </View>
            <Text style={styles.duration}>{item.duration_minutes} min</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: spacing.lg },
  emptyContainer: { flexGrow: 1 },
  card: { marginBottom: spacing.md },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  date: { ...typography.bodyBold, color: colors.text },
  duration: { ...typography.small, color: colors.textMuted },
  subject: { ...typography.small, color: colors.textMuted, marginTop: spacing.xs },
  cancelButton: { marginTop: spacing.md },
});