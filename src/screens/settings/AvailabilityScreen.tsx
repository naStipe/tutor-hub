import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAvailability } from '../../hooks/useAvailability';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/spacing';
import { typography } from '../../constants/typography';
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

  if (isLoading) return <LoadingSpinner message="Loading availability..." />;

  return (
    <View style={styles.container}>
      <Card style={styles.formCard}>
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

        <Button title="Add Slot" onPress={handleAdd} style={styles.addButton} />
      </Card>

      <Text style={styles.sectionTitle}>Your Availability</Text>
      <FlatList
        data={availability}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No availability set</Text>}
        renderItem={({ item }) => (
          <Card style={styles.slotCard}>
            <View style={styles.slotRow}>
              <Text style={styles.slotText}>
                {DAYS[item.day_of_week]}: {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
              </Text>
              <Text style={styles.deleteText} onPress={() => handleDelete(item.id)}>Remove</Text>
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  formCard: { marginBottom: spacing.lg },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  label: { ...typography.captionBold, color: colors.text, marginBottom: spacing.xs, marginTop: spacing.md },
  dayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  dayChip: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md - 2, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  dayChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayChipText: { ...typography.small, color: colors.textSecondary },
  dayChipTextActive: { color: colors.textInverse },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md,
    backgroundColor: colors.background, minHeight: 48, justifyContent: 'center',
  },
  pickerValue: { ...typography.body, color: colors.text },
  addButton: { marginTop: spacing.lg },
  listContent: { paddingBottom: spacing.xl },
  emptyText: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
  slotCard: { marginBottom: spacing.sm },
  slotRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  slotText: { ...typography.caption, color: colors.text },
  deleteText: { ...typography.captionBold, color: colors.danger },
});