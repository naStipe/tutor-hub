import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useStudents } from '../../hooks/useStudents';
import { Student } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

type Props = NativeStackScreenProps<any, 'StudentList'>;

export function StudentListScreen({ navigation }: Props) {
  const { students, registeredStudents, isLoading, deleteStudent } = useStudents();

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
              {registeredStudents.map((s) => (
                <Card key={s.id} style={styles.card}>
                  <View style={styles.cardRow}>
                    <View style={styles.cardContent}>
                      <Text style={styles.name}>{s.full_name}</Text>
                      {s.email && <Text style={styles.detail}>{s.email}</Text>}
                    </View>
                    <Badge label="App User" variant="success" />
                  </View>
                </Card>
              ))}
              {students.length > 0 && <Text style={styles.sectionTitle}>Manual Students</Text>}
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('StudentDetail', { studentId: item.id })}>
            <Card style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.cardContent}>
                  <Text style={styles.name}>{item.full_name}</Text>
                  {item.email && <Text style={styles.detail}>{item.email}</Text>}
                  {item.phone && <Text style={styles.detail}>{item.phone}</Text>}
                </View>
                <Text style={styles.deleteText} onPress={() => handleDelete(item)}>Delete</Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
      <View style={styles.fabContainer}>
        <Button title="+ Add Student" onPress={() => navigation.navigate('StudentDetail', { studentId: null })} />
      </View>
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
  name: { ...typography.bodyBold, color: colors.text },
  detail: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs / 2 },
  deleteText: { ...typography.captionBold, color: colors.danger, padding: spacing.xs },
  fabContainer: { padding: spacing.lg, backgroundColor: colors.background },
});