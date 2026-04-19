import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CATEGORY_ICONS } from '@family-nudge/shared';

const upcomingReminders = [
  { id: '1', title: 'Car Insurance Renewal', category: 'INSURANCE', priority: 'CRITICAL', dueDate: '2026-04-25' },
  { id: '2', title: 'Dental Checkup — Sarah', category: 'HEALTH', priority: 'HIGH', dueDate: '2026-04-30' },
  { id: '3', title: 'Replace HVAC Filter', category: 'MAINTENANCE', priority: 'MEDIUM', dueDate: '2026-05-01' },
];

const priorityColors: Record<string, string> = {
  LOW: '#6B7280',
  MEDIUM: '#3B82F6',
  HIGH: '#F59E0B',
  CRITICAL: '#EF4444',
};

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Active', value: '12', color: '#3B82F6' },
            { label: 'Due Soon', value: '3', color: '#F59E0B' },
            { label: 'Policies', value: '5', color: '#10B981' },
            { label: 'Docs', value: '24', color: '#8B5CF6' },
          ].map((stat) => (
            <View key={stat.label} style={[styles.statCard, { borderLeftColor: stat.color }]}>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Upcoming */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Reminders</Text>
          {upcomingReminders.map((r) => (
            <TouchableOpacity key={r.id} style={styles.reminderCard}>
              <Text style={styles.reminderIcon}>
                {CATEGORY_ICONS[r.category as keyof typeof CATEGORY_ICONS] ?? '⭐'}
              </Text>
              <View style={styles.reminderContent}>
                <Text style={styles.reminderTitle}>{r.title}</Text>
                <Text style={styles.reminderDate}>
                  Due {new Date(r.dueDate).toLocaleDateString()}
                </Text>
              </View>
              <View style={[styles.priorityBadge, { backgroundColor: priorityColors[r.priority] + '20' }]}>
                <Text style={[styles.priorityText, { color: priorityColors[r.priority] }]}>
                  {r.priority}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {[
              { label: 'New Reminder', emoji: '🔔', color: '#3B82F6' },
              { label: 'Upload Doc', emoji: '📄', color: '#8B5CF6' },
              { label: 'Add Policy', emoji: '🛡️', color: '#10B981' },
              { label: 'Maintenance', emoji: '🔧', color: '#F59E0B' },
            ].map((action) => (
              <TouchableOpacity key={action.label} style={[styles.actionCard, { backgroundColor: action.color + '10' }]}>
                <Text style={styles.actionEmoji}>{action.emoji}</Text>
                <Text style={[styles.actionLabel, { color: action.color }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { padding: 16 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  reminderIcon: { fontSize: 24, marginRight: 12 },
  reminderContent: { flex: 1 },
  reminderTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  reminderDate: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  priorityText: { fontSize: 10, fontWeight: '600' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: {
    width: '47%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  actionEmoji: { fontSize: 28, marginBottom: 8 },
  actionLabel: { fontSize: 13, fontWeight: '600' },
});
