import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { useLessons } from '../../hooks/useLessons';
import { useLessonPacks } from '../../hooks/useLessonPacks';
import { supabase } from '../../supabase/config';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import dayjs from 'dayjs';

type Props = NativeStackScreenProps<any, 'LessonDetail'>;

function statusVariant(status: string): 'warning' | 'primary' | 'success' | 'danger' | 'neutral' {
  switch (status) {
    case 'pending': return 'warning';
    case 'scheduled': return 'primary';
    case 'completed': return 'success';
    case 'cancelled': return 'danger';
    default: return 'neutral';
  }
}

export function LessonDetailScreen({ route, navigation }: Props) {
  const lessonId = route.params?.lessonId;
  const { lessons, cancelLesson, deleteLesson, approveLesson, rejectLesson, isLoading } = useLessons();
  const { packs } = useLessonPacks();
  const queryClient = useQueryClient();

  const lesson = lessons.find((l) => l.id === lessonId);
  const pack = lesson?.pack_id ? packs.find((p) => p.id === lesson.pack_id) : null;

  function handleApprove() {
    Alert.alert('Approve Lesson', 'Approve this lesson request?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: () => approveLesson(lessonId) },
    ]);
  }

  function handleReject() {
    Alert.alert('Reject Lesson', 'Reject this lesson request?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => { rejectLesson(lessonId); navigation.goBack(); },
      },
    ]);
  }

  function handleCancel() {
    Alert.alert('Cancel Lesson', 'Are you sure you want to cancel this lesson?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, cancel',
        style: 'destructive',
        onPress: () => { cancelLesson(lessonId); navigation.goBack(); },
      },
    ]);
  }

  function handleDelete() {
    Alert.alert('Delete Lesson', 'This will permanently delete the lesson. Are you sure?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => { deleteLesson(lessonId); navigation.goBack(); },
      },
    ]);
  }

  async function handleTogglePayment() {
    if (!lesson) return;
    const newStatus = lesson.payment_status === 'paid' ? 'unpaid' : 'paid';
    Alert.alert(
      'Change Payment Status',
      `Mark this lesson as ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const { error } = await supabase
              .from('lessons')
              .update({ payment_status: newStatus })
              .eq('id', lesson.id);
            if (error) Alert.alert('Error', error.message);
            else queryClient.invalidateQueries({ queryKey: ['lessons'] });
          },
        },
      ]
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading lesson..." />;
  }

  if (!lesson) {
    return <EmptyState title="Lesson not found" />;
  }

  const studentName = lesson.student?.full_name ?? lesson.student_profile?.full_name ?? 'Unknown Student';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.studentName}>{studentName}</Text>
        <Badge label={lesson.status} variant={statusVariant(lesson.status)} />
      </View>

      <Card style={styles.card}>
        <Row label="Date" value={dayjs(lesson.date).format('MMM D, YYYY')} />
        <Row label="Time" value={dayjs(lesson.date).format('HH:mm')} />
        <Row label="Duration" value={`${lesson.duration_minutes} minutes`} />
        {lesson.subject && <Row label="Subject" value={lesson.subject} />}
        {lesson.notes && <Row label="Notes" value={lesson.notes} last />}
      </Card>

      <Card style={styles.card}>
        <View style={styles.paymentRow}>
          <Text style={styles.rowLabel}>Payment</Text>
          <View style={styles.paymentRight}>
            <Badge
              label={lesson.payment_status}
              variant={lesson.payment_status === 'paid' ? 'success' : 'neutral'}
            />
            <TouchableOpacity onPress={handleTogglePayment} style={styles.toggleButton}>
              <Text style={styles.toggleText}>
                {lesson.payment_status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {pack && (
          <View style={styles.packRow}>
            <Text style={styles.rowLabel}>Pack</Text>
            <Text style={styles.rowValue}>
              {`${pack.lessons_remaining}/${pack.total_lessons} remaining`}
            </Text>
          </View>
        )}
      </Card>

      {lesson.status === 'pending' && (
        <View style={styles.actions}>
          <Button title="Approve" onPress={handleApprove} variant="success" style={styles.actionButton} />
          <Button title="Reject" onPress={handleReject} variant="danger" style={styles.actionButton} />
        </View>
      )}

      {lesson.status === 'scheduled' && (
        <View style={styles.actions}>
          <Button
            title="Reschedule"
            onPress={() => navigation.navigate('RescheduleLesson', { lessonId: lesson.id })}
            style={styles.actionButton}
          />
          <Button title="Cancel Lesson" onPress={handleCancel} variant="danger" style={styles.actionButton} />
        </View>
      )}

      <Button title="Delete Lesson" onPress={handleDelete} variant="outline" style={styles.deleteButton} />
    </ScrollView>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  studentName: { ...typography.h2, color: colors.text },
  card: { marginBottom: spacing.lg },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  rowLast: { borderBottomWidth: 0 },
  rowLabel: { ...typography.caption, color: colors.textMuted },
  rowValue: { ...typography.captionBold, color: colors.text, maxWidth: '60%', textAlign: 'right' },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
  },
  paymentRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  toggleButton: { paddingHorizontal: spacing.xs },
  toggleText: { ...typography.captionBold, color: colors.primary },
  packRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  actions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  actionButton: { flex: 1 },
  deleteButton: { borderColor: colors.danger, marginTop: spacing.sm },
});