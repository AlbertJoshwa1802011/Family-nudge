import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CATEGORY_ICONS } from '@family-nudge/shared';

const familyMembers = [
  { id: '1', name: 'John', color: '#3B82F6' },
  { id: '2', name: 'Sarah', color: '#EC4899' },
  { id: '3', name: 'Emma', color: '#8B5CF6' },
  { id: '4', name: 'Jake', color: '#10B981' },
];

const reminders = [
  { id: '1', title: 'Car Insurance Renewal', category: 'INSURANCE', priority: 'CRITICAL', dueDate: '2026-04-25', assignees: ['1', '2'], channels: ['PUSH', 'SMS', 'WHATSAPP', 'CALL'], createdBy: 'Sarah' },
  { id: '2', title: 'Dental Checkup — Sarah', category: 'HEALTH', priority: 'HIGH', dueDate: '2026-04-30', assignees: ['2'], channels: ['PUSH', 'SMS'], createdBy: 'John' },
  { id: '3', title: 'Replace HVAC Filter', category: 'MAINTENANCE', priority: 'MEDIUM', dueDate: '2026-05-01', assignees: ['1'], channels: ['PUSH'], createdBy: 'Sarah' },
  { id: '4', title: 'School Permission Slip', category: 'SCHOOL', priority: 'HIGH', dueDate: '2026-04-22', assignees: ['3', '4'], channels: ['PUSH', 'WHATSAPP'], createdBy: 'John' },
  { id: '5', title: 'Passport Renewal', category: 'DOCUMENTS', priority: 'MEDIUM', dueDate: '2026-06-15', assignees: ['1'], channels: ['PUSH', 'SMS'], createdBy: 'Sarah' },
  { id: '6', title: 'Annual Health Checkups', category: 'HEALTH', priority: 'HIGH', dueDate: '2026-05-10', assignees: ['1', '2', '3', '4'], channels: ['PUSH', 'SMS', 'WHATSAPP'], createdBy: 'John' },
];

const priorityColors: Record<string, string> = {
  LOW: '#6B7280', MEDIUM: '#3B82F6', HIGH: '#F59E0B', CRITICAL: '#EF4444',
};

const channelEmoji: Record<string, string> = {
  PUSH: '🔔', SMS: '💬', WHATSAPP: '📱', CALL: '📞', EMAIL: '📧',
};

export default function RemindersScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
        {['All', 'Health', 'Insurance', 'Maintenance', 'School', 'Documents'].map((cat, i) => (
          <TouchableOpacity key={cat} style={[s.chip, i === 0 && s.chipActive]} activeOpacity={0.7}>
            <Text style={[s.chipText, i === 0 && s.chipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {reminders.map((r) => {
          const isAllFamily = r.assignees.length === familyMembers.length;
          const assignedMembers = r.assignees
            .map((id) => familyMembers.find((m) => m.id === id))
            .filter(Boolean) as typeof familyMembers;

          return (
            <TouchableOpacity key={r.id} style={s.card} activeOpacity={0.7}>
              {/* Top row */}
              <View style={s.cardTop}>
                <Text style={s.cardIcon}>{CATEGORY_ICONS[r.category as keyof typeof CATEGORY_ICONS] ?? '⭐'}</Text>
                <View style={s.cardMain}>
                  <Text style={s.cardTitle}>{r.title}</Text>
                  <Text style={s.cardDate}>
                    Due {new Date(r.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </View>
                <View style={[s.pBadge, { backgroundColor: priorityColors[r.priority] + '20' }]}>
                  <Text style={[s.pBadgeText, { color: priorityColors[r.priority] }]}>{r.priority}</Text>
                </View>
              </View>

              {/* Assignees */}
              <View style={s.cardMiddle}>
                {isAllFamily ? (
                  <View style={s.entireFamilyBadge}>
                    <Text style={s.efIcon}>👨‍👩‍👧‍👦</Text>
                    <Text style={s.efText}>Entire Family</Text>
                  </View>
                ) : (
                  <View style={s.assigneeRow}>
                    {assignedMembers.map((m, i) => (
                      <View key={m.id} style={[s.miniAvatar, { backgroundColor: m.color, marginLeft: i > 0 ? -4 : 0 }]}>
                        <Text style={s.miniAvatarText}>{m.name[0]}</Text>
                      </View>
                    ))}
                    <Text style={s.assigneeNames}>{assignedMembers.map((m) => m.name).join(', ')}</Text>
                  </View>
                )}
                <Text style={s.createdBy}>by {r.createdBy}</Text>
              </View>

              {/* Channels */}
              <View style={s.channelRow}>
                {r.channels.map((ch) => (
                  <View key={ch} style={s.channelChip}>
                    <Text style={s.channelEmoji}>{channelEmoji[ch]}</Text>
                    <Text style={s.channelLabel}>{ch}</Text>
                  </View>
                ))}
              </View>

              {/* Actions */}
              <View style={s.actions}>
                <TouchableOpacity style={s.actionDone} activeOpacity={0.7}>
                  <Text style={s.actionDoneText}>Mark Done</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.actionSnooze} activeOpacity={0.7}>
                  <Text style={s.actionSnoozeText}>Snooze</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => router.push('/create-reminder')}
        activeOpacity={0.8}
      >
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  filterScroll: { maxHeight: 52, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  filterContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6' },
  chipActive: { backgroundColor: '#3B82F6' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  chipTextActive: { color: '#FFF' },

  scroll: { padding: 16, paddingBottom: 100 },

  card: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  cardIcon: { fontSize: 28, marginRight: 12 },
  cardMain: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  cardDate: { fontSize: 12, color: '#6B7280', marginTop: 3 },
  pBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  pBadgeText: { fontSize: 10, fontWeight: '700' },

  cardMiddle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  assigneeRow: { flexDirection: 'row', alignItems: 'center' },
  miniAvatar: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#FFF' },
  miniAvatarText: { fontSize: 9, fontWeight: '700', color: '#FFF' },
  assigneeNames: { fontSize: 11, color: '#6B7280', marginLeft: 6 },
  entireFamilyBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  efIcon: { fontSize: 14, marginRight: 4 },
  efText: { fontSize: 11, color: '#3B82F6', fontWeight: '700' },
  createdBy: { fontSize: 10, color: '#9CA3AF' },

  channelRow: { flexDirection: 'row', gap: 6, marginTop: 12 },
  channelChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 3 },
  channelEmoji: { fontSize: 10 },
  channelLabel: { fontSize: 9, fontWeight: '600', color: '#6B7280' },

  actions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  actionDone: { flex: 1, backgroundColor: '#EFF6FF', paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  actionDoneText: { fontSize: 13, fontWeight: '600', color: '#3B82F6' },
  actionSnooze: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#F3F4F6', borderRadius: 12, alignItems: 'center' },
  actionSnoozeText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },

  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#3B82F6',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  fabText: { fontSize: 28, color: '#FFF', fontWeight: '300', marginTop: -2 },
});
