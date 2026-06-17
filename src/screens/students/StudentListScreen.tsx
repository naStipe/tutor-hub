import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useStudents } from '../../hooks/useStudents';
import { useLessonPacks } from '../../hooks/useLessonPacks';
import { Student } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/spacing';
import { typography } from '../../constants/typography';

type Props = NativeStackScreenProps<any, 'StudentList'>;

export function StudentListScreen({ navigation }: Props) {
  const { students, registeredStudents, isLoading, deleteStudent } = useStudents();
  const { packs, createPack, isCreating } = useLessonPacks();

  const [showPackModal, setShowPackModal] = useState(false);
  const [packStudentId, setPackStudentId] = useState('');
  const [packStudentType, setPackStudentType] = useState<'profile' | 'manual'>('profile');
  const [packSize, setPackSize] = useState(4);

  function handleDelete(student: Student) {
    Alert.alert(
      'Delete Student',
      `Are you sure you want to delete ${student.full_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteStudent(student.id) },
      ]
    );
  }

  function handleAddPack(studentId: string, type: 'profile' | 'manual') {
    setPackStudentId(studentId);
    setPackStudentType(type);
    setShowPackModal(true);
  }

  function handleCreatePack() {
    createPack({
      totalLessons: packSize,
      studentProfileId: packStudentType === 'profile' ? packStudentId : undefined,
      studentId: packStudentType === 'manual' ? packStudentId : undefined,
    });
    setShowPackModal(false);
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading students..." />;
  }

  const hasAny = students.length > 0 || registeredStudents.length > 0;

  return (
    <View style={styles.container}>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        contentContainerStyle={!hasAny ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={
          registeredStudents.length === 0 ? (
            <EmptyState title="No students yet" subtitle="Add your first student below" />
          ) : null
        }
        ListHeaderComponent={
          registeredStudents.length > 0 ? (
            <View>
              <Text style={styles.sectionTitle}>Registered Students</Text>
              {registeredStudents.map((s) => {
                const studentPacks = packs.filter(
                  (p) => p.student_profile_id === s.id && p.lessons_remaining > 0
                );
                const totalRemaining = studentPacks.reduce((sum, p) => sum + p.lessons_remaining, 0);
                return (
                  <Card key={s.id} style={styles.card}>
                    <View style={styles.cardRow}>
                      <View style={styles.cardContent}>
                        <Text style={styles.name}>{s.full_name}</Text>
                        {s.email && <Text style={styles.detail}>{s.email}</Text>}
                        {totalRemaining > 0 && (
                          <Text style={styles.packInfo}>
                            {`${totalRemaining} lesson${totalRemaining !== 1 ? 's' : ''} in pack`}
                          </Text>
                        )}
                      </View>
                      <View style={styles.cardActions}>
                        <Badge label="App User" variant="success" />
                        <TouchableOpacity onPress={() => handleAddPack(s.id, 'profile')}>
                          <Text style={styles.addPackText}>+ Pack</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Card>
                );
              })}
              {students.length > 0 && (
                <Text style={styles.sectionTitle}>Manual Students</Text>
              )}
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const studentPacks = packs.filter(
            (p) => p.student_id === item.id && p.lessons_remaining > 0
          );
          const totalRemaining = studentPacks.reduce((sum, p) => sum + p.lessons_remaining, 0);
          return (
            <TouchableOpacity
              onPress={() => navigation.navigate('StudentDetail', { studentId: item.id })}
            >
              <Card style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={styles.cardContent}>
                    <Text style={styles.name}>{item.full_name}</Text>
                    {item.email && <Text style={styles.detail}>{item.email}</Text>}
                    {item.phone && <Text style={styles.detail}>{item.phone}</Text>}
                    {totalRemaining > 0 && (
                      <Text style={styles.packInfo}>
                        {`${totalRemaining} lesson${totalRemaining !== 1 ? 's' : ''} in pack`}
                      </Text>
                    )}
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => handleAddPack(item.id, 'manual')}>
                      <Text style={styles.addPackText}>+ Pack</Text>
                    </TouchableOpacity>
                    <Text style={styles.deleteText} onPress={() => handleDelete(item)}>
                      Delete
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.fabContainer}>
        <Button
          title="+ Add Student"
          onPress={() => navigation.navigate('StudentDetail', { studentId: null })}
        />
      </View>

      <Modal
        visible={showPackModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPackModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPackModal(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Lesson Pack</Text>
            <Text style={styles.modalSubtitle}>How many lessons in this pack?</Text>
            <View style={styles.packSizeRow}>
              {[4, 8, 12, 16].map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[styles.packSizeChip, packSize === size && styles.packSizeChipActive]}
                  onPress={() => setPackSize(size)}
                >
                  <Text style={[styles.packSizeText, packSize === size && styles.packSizeTextActive]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setShowPackModal(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Create Pack"
                onPress={handleCreatePack}
                loading={isCreating}
                style={styles.modalButton}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: spacing.lg, paddingBottom: 0 },
  emptyContainer: { flexGrow: 1 },
  sectionTitle: {
    ...typography.smallBold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  card: { marginBottom: spacing.md },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardContent: { flex: 1 },
  cardActions: { alignItems: 'flex-end', gap: spacing.xs },
  name: { ...typography.bodyBold, color: colors.text },
  detail: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs / 2 },
  packInfo: { ...typography.small, color: colors.success, marginTop: spacing.xs / 2 },
  addPackText: { ...typography.captionBold, color: colors.primary },
  deleteText: { ...typography.captionBold, color: colors.danger, padding: spacing.xs },
  fabContainer: { padding: spacing.lg, backgroundColor: colors.background },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: '85%',
  },
  modalTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.xs },
  modalSubtitle: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.lg },
  packSizeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  packSizeChip: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  packSizeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  packSizeText: { ...typography.bodyBold, color: colors.textSecondary },
  packSizeTextActive: { color: colors.textInverse },
  modalActions: { flexDirection: 'row', gap: spacing.md },
  modalButton: { flex: 1 },
});