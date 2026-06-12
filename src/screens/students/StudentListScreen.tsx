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
import { useStudents } from '../../hooks/useStudents';
import { Student } from '../../types';

type Props = NativeStackScreenProps<any, 'StudentList'>;

export function StudentListScreen({ navigation }: Props) {
  const { students, registeredStudents, isLoading, deleteStudent } = useStudents();

  function handleDelete(student: Student) {
    Alert.alert(
      'Delete Student',
      `Are you sure you want to delete ${student.full_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteStudent(student.id),
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
      {registeredStudents.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registered Students</Text>
          {registeredStudents.map((s) => (
            <View key={s.id} style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.name}>{s.full_name}</Text>
                <Text style={styles.detail}>{s.email}</Text>
              </View>
              <View style={styles.registeredBadge}>
                <Text style={styles.registeredBadgeText}>App User</Text>
              </View>
            </View>
          ))}
          <Text style={styles.sectionTitle}>Manual Students</Text>
        </View>
      )}
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        contentContainerStyle={students.length === 0 && styles.emptyContainer}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No students yet</Text>
            <Text style={styles.emptySubtext}>Add your first student below</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('StudentDetail', { studentId: item.id })}
          >
            <View style={styles.cardContent}>
              <Text style={styles.name}>{item.full_name}</Text>
              {item.email && <Text style={styles.detail}>{item.email}</Text>}
              {item.phone && <Text style={styles.detail}>{item.phone}</Text>}
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('StudentDetail', { studentId: null })}
      >
        <Text style={styles.fabText}>+ Add Student</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 8 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#888',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  registeredBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  registeredBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
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
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#111' },
  detail: { fontSize: 14, color: '#666', marginTop: 2 },
  deleteButton: { padding: 8 },
  deleteText: { color: '#EF4444', fontSize: 14, fontWeight: '500' },
  fab: {
    backgroundColor: '#4F46E5',
    margin: 16,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});