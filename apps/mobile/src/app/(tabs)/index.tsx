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

const upcomingReminders = [
  { id: '1', title: 'Car Insurance Renewal', category: 'INSURANCE', priority: 'CRITICAL', dueDate: '2026-04-25', assignees: ['1', '2'], channels: ['PUSH', 'SMS', 'WHATSAPP', 'CALL'] },
  { id: '2', title: 'Dental Checkup — Sarah', category: 'HEALTH', priority: 'HIGH', dueDate: '2026-04-30', assignees: ['2'], channels: ['PUSH', 'SMS'] },
  { id: '3', title: 'Replace HVAC Filter', category: 'MAINTENANCE', priority: 'MEDIUM', dueDate: '2026-05-01', assignees: ['1'], channels: ['PUSH'] },
  { id: '4', title: 'Annual Health Checkups', category: 'HEALTH', priority: 'HIGH', dueDate: '2026-05-10', assignees: ['1', '2', '3', '4'], channels: ['PUSH', 'SMS', 'WHATSAPP'] },
];

const expiringPolicies = [
  { id: '1', name: 'Laptop Warranty', provider: 'Best Buy', daysLeft: 9 },
  { id: '2', name: 'Auto Insurance', provider: 'State Farm', daysLeft: 26 },
];

const priorityColors: Record<string, string> = {
  LOW: '#6B7280', MEDIUM: '#3B82F6', HIGH: '#F59E0B', CRITICAL: '#EF4444',
};

function AvatarRow({ assigneeIds }: { assigneeIds: string[] }) {
  const isAll = assigneeIds.length === familyMembers.length;
  if (isAll) {
    return (
      <View style={aStyles.entireFamily}>
        <Text style={aStyles.entireFamilyIcon}>👨‍👩‍👧‍👦</Text>
        <Text style={aStyles.entireFamilyText}>Entire Family</Text>
      </View>
    );
  }

  const members = assigneeIds
    .map((id) => familyMembers.find((m) => m.id === id))
    .filter(Boolean) as typeof familyMembers;

  return (
    <View style={aStyles.row}>
      {members.map((m, i) => (
        <View key={m.id} style={[aStyles.avatar, { backgroundColor: m.color, marginLeft: i > 0 ? -6 : 0, zIndex: members.length - i }]}>
          <Text style={aStyles.avatarLetter}>{m.name[0]}</Text>
        </View>
      ))}
      <Text style={aStyles.names}>{members.map((m) => m.name).join(', ')}</Text>
    </View>
  );
}

const aStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  avatar: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#FFF' },
  avatarLetter: { fontSize: 9, fontWeight: '700', color: '#FFF' },
  names: { fontSize: 10, color: '#6B7280', marginLeft: 6 },
  entireFamily: { flexDirection: 'row', alignItems: 'center', marginTop: 4, backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, alignSelf: 'flex-start' },
  entireFamilyIcon: { fontSize: 12, marginRight: 4 },
  entireFamilyText: { fontSize: 10, color: '#3B82F6', fontWeight: '600' },
});

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Family header */}
        <View style={s.familyHeader}>
          <View>
            <Text style={s.greeting}>Good morning, John</Text>
            <Text style={s.familyName}>The Doe Family</Text>
          </View>
          <View style={s.familyAvatars}>
            {familyMembers.map((m, i) => (
              <View key={m.id} style={[s.familyAvatar, { backgroundColor: m.color, marginLeft: i > 0 ? -8 : 0, zIndex: familyMembers.length - i }]}>
                <Text style={s.familyAvatarLetter}>{m.name[0]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          {[
            { label: 'Active', value: '12', color: '#3B82F6', bg: '#EFF6FF' },
            { label: 'Due Soon', value: '3', color: '#F59E0B', bg: '#FFFBEB' },
            { label: 'Policies', value: '5', color: '#10B981', bg: '#ECFDF5' },
            { label: 'Docs', value: '24', color: '#8B5CF6', bg: '#F5F3FF' },
          ].map((stat) => (
            <View key={stat.label} style={[s.statCard, { backgroundColor: stat.bg }]}>
              <Text style={[s.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Create Nudge CTA */}
        <TouchableOpacity
          style={s.ctaButton}
          onPress={() => router.push('/create-reminder')}
          activeOpacity={0.8}
        >
          <Text style={s.ctaEmoji}>🔔</Text>
          <View style={s.ctaContent}>
            <Text style={s.ctaTitle}>Create a Nudge</Text>
            <Text style={s.ctaDesc}>Remind yourself, a member, or the entire family</Text>
          </View>
          <Text style={s.ctaArrow}>›</Text>
        </TouchableOpacity>

        {/* Upcoming Reminders */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Upcoming Reminders</Text>
            <TouchableOpacity><Text style={s.seeAll}>See All</Text></TouchableOpacity>
          </View>
          {upcomingReminders.map((r) => (
            <TouchableOpacity key={r.id} style={s.reminderCard} activeOpacity={0.7}>
              <Text style={s.reminderIcon}>
                {CATEGORY_ICONS[r.category as keyof typeof CATEGORY_ICONS] ?? '⭐'}
              </Text>
              <View style={s.reminderContent}>
                <Text style={s.reminderTitle}>{r.title}</Text>
                <Text style={s.reminderDate}>
                  Due {new Date(r.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
                <AvatarRow assigneeIds={r.assignees} />
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <View style={[s.priorityBadge, { backgroundColor: priorityColors[r.priority] + '20' }]}>
                  <Text style={[s.priorityText, { color: priorityColors[r.priority] }]}>{r.priority}</Text>
                </View>
                <View style={s.channelRow}>
                  {r.channels.slice(0, 3).map((ch) => (
                    <Text key={ch} style={s.channelDot}>
                      {ch === 'PUSH' ? '🔔' : ch === 'SMS' ? '💬' : ch === 'WHATSAPP' ? '📱' : '📞'}
                    </Text>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Expiring Policies */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Expiring Soon</Text>
            <TouchableOpacity><Text style={s.seeAll}>See All</Text></TouchableOpacity>
          </View>
          {expiringPolicies.map((p) => (
            <TouchableOpacity key={p.id} style={s.policyCard} activeOpacity={0.7}>
              <View style={[s.policyIcon, { backgroundColor: p.daysLeft <= 14 ? '#FEE2E2' : '#FEF3C7' }]}>
                <Text style={{ fontSize: 20 }}>🛡️</Text>
              </View>
              <View style={s.policyContent}>
                <Text style={s.policyName}>{p.name}</Text>
                <Text style={s.policyProvider}>{p.provider}</Text>
              </View>
              <View style={[s.daysLeftBadge, { backgroundColor: p.daysLeft <= 14 ? '#FEE2E2' : '#FEF3C7' }]}>
                <Text style={[s.daysLeftText, { color: p.daysLeft <= 14 ? '#DC2626' : '#D97706' }]}>
                  {p.daysLeft}d
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Quick Actions</Text>
          <View style={s.actionsGrid}>
            {[
              { label: 'New Reminder', emoji: '🔔', color: '#3B82F6', bg: '#EFF6FF' },
              { label: 'Upload Doc', emoji: '📄', color: '#8B5CF6', bg: '#F5F3FF' },
              { label: 'Add Policy', emoji: '🛡️', color: '#10B981', bg: '#ECFDF5' },
              { label: 'Maintenance', emoji: '🔧', color: '#F59E0B', bg: '#FFFBEB' },
              { label: 'Invite Family', emoji: '📨', color: '#EC4899', bg: '#FDF2F8' },
              { label: 'Call Parents', emoji: '📞', color: '#06B6D4', bg: '#ECFEFF' },
            ].map((action) => (
              <TouchableOpacity key={action.label} style={[s.actionCard, { backgroundColor: action.bg }]} activeOpacity={0.7}>
                <Text style={s.actionEmoji}>{action.emoji}</Text>
                <Text style={[s.actionLabel, { color: action.color }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { padding: 16, paddingBottom: 32 },

  familyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 4 },
  greeting: { fontSize: 14, color: '#6B7280' },
  familyName: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 2 },
  familyAvatars: { flexDirection: 'row' },
  familyAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
  familyAvatarLetter: { fontSize: 13, fontWeight: '700', color: '#FFF' },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 10, color: '#6B7280', marginTop: 2, fontWeight: '500' },

  ctaButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#3B82F6', borderRadius: 20, padding: 18, marginBottom: 24,
    shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  ctaEmoji: { fontSize: 28, marginRight: 14 },
  ctaContent: { flex: 1 },
  ctaTitle: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  ctaDesc: { fontSize: 12, color: '#BFDBFE', marginTop: 2 },
  ctaArrow: { fontSize: 24, color: '#BFDBFE', fontWeight: '300' },

  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  seeAll: { fontSize: 13, color: '#3B82F6', fontWeight: '600' },

  reminderCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  reminderIcon: { fontSize: 26, marginRight: 12 },
  reminderContent: { flex: 1 },
  reminderTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  reminderDate: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  priorityText: { fontSize: 9, fontWeight: '700' },
  channelRow: { flexDirection: 'row', gap: 2 },
  channelDot: { fontSize: 10 },

  policyCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  policyIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  policyContent: { flex: 1 },
  policyName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  policyProvider: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  daysLeftBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  daysLeftText: { fontSize: 14, fontWeight: '800' },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: { width: '31%', borderRadius: 16, padding: 16, alignItems: 'center' },
  actionEmoji: { fontSize: 26, marginBottom: 6 },
  actionLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
});
