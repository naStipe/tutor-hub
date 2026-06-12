import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAvailability } from '../../hooks/useAvailability';
import dayjs from 'dayjs';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function AvailabilityScreen() {
  const { availability, isLoading, addAvailability, deleteAvailability } = useAvailability();
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState(new Date(0, 0, 0, 9, 0));
  const [endTime, setEndTime] = useState(new Date(0, 0, 0, 17, 0));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  function handleAdd() {
    if (endTime <= startTime) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }
    addAvailability({
      dayOfWeek,
      startTime: dayjs(startTime).format('HH:mm:ss'),
      endTime: dayjs(endTime).format('HH:mm:ss'),
    });
  }

  function handleDelete(id: string) {
    Alert.alert('Remove slot', 'Remove this availability slot?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteAvailability(id) },
    ]);
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
      <Text style={styles.sectionTitle}>Add Availability</Text>

      <Text style={styles.label}>Day of Week</Text>
      <View style={styles.dayRow}>
        {DAYS.map((day, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.dayChip, dayOfWeek === idx && styles.dayChipActive]}
            onPress={() => setDayOfWeek(idx)}
          >
            <Text style={[styles.dayChipText, dayOfWeek === idx && styles.dayChipTextActive]}>
              {day.slice(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Start Time</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowStartPicker(true)}>
        <Text style={styles.pickerValue}>{dayjs(startTime).format('HH:mm')}</Text>
      </TouchableOpacity>
      {showStartPicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display="spinner"
          minuteInterval={15}
          onChange={(e, selected) => {
            setShowStartPicker(false);
            if (selected) setStartTime(selected);
          }}
        />
      )}

      <Text style={styles.label}>End Time</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowEndPicker(true)}>
        <Text style={styles.pickerValue}>{dayjs(endTime).format('HH:mm')}</Text>
      </TouchableOpacity>
      {showEndPicker && (
        <DateTimePicker
          value={endTime}
          mode="time"
          display="spinner"
          minuteInterval={15}
          onChange={(e, selected) => {
            setShowEndPicker(false);
            if (selected) setEndTime(selected);
          }}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
        <Text style={styles.addButtonText}>Add Slot</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Your Availability</Text>
      <FlatList
        data={availability}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No availability set</Text>}
        renderItem={({ item }) => (
          <View style={styles.slotCard}>
            <Text style={styles.slotText}>
              {DAYS[item.day_of_week]}: {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
            </Text>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={styles.deleteText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 12 },
  dayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dayChip: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  dayChipActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  dayChipText: { fontSize: 13, color: '#666' },
  dayChipTextActive: { color: '#fff' },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12,
    backgroundColor: '#fafafa', minHeight: 48, justifyContent: 'center',
  },
  pickerValue: { fontSize: 16, color: '#111' },
  addButton: { backgroundColor: '#4F46E5', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  emptyText: { color: '#888', fontSize: 14, marginTop: 8 },
  slotCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, marginTop: 8,
  },
  slotText: { fontSize: 14, color: '#111' },
  deleteText: { color: '#EF4444', fontWeight: '600', fontSize: 13 },
});