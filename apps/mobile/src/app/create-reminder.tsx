import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CATEGORY_ICONS } from '@family-nudge/shared';

const familyMembers = [
  { id: '1', name: 'John Doe', role: 'Admin', color: '#3B82F6' },
  { id: '2', name: 'Sarah Doe', role: 'Parent', color: '#EC4899' },
  { id: '3', name: 'Emma Doe', role: 'Member', color: '#8B5CF6' },
  { id: '4', name: 'Jake Doe', role: 'Child', color: '#10B981' },
];

const categories = [
  { key: 'HEALTH', label: 'Health' }, { key: 'INSURANCE', label: 'Insurance' },
  { key: 'MAINTENANCE', label: 'Maintenance' }, { key: 'SCHOOL', label: 'School' },
  { key: 'DOCUMENTS', label: 'Documents' }, { key: 'FINANCE', label: 'Finance' },
  { key: 'VEHICLE', label: 'Vehicle' }, { key: 'HOUSEHOLD', label: 'Household' },
  { key: 'PETS', label: 'Pets' }, { key: 'FAMILY', label: 'Family' },
] as const;

const priorities = [
  { key: 'LOW', label: 'Low', desc: 'Push only', color: '#6B7280', bg: '#F3F4F6' },
  { key: 'MEDIUM', label: 'Medium', desc: 'Push + SMS', color: '#3B82F6', bg: '#EFF6FF' },
  { key: 'HIGH', label: 'High', desc: 'Push + SMS + WhatsApp', color: '#F59E0B', bg: '#FFFBEB' },
  { key: 'CRITICAL', label: 'Critical', desc: 'Push + SMS + WhatsApp + Call', color: '#EF4444', bg: '#FEF2F2' },
] as const;

const channels = [
  { key: 'PUSH', label: 'Push', emoji: '🔔' },
  { key: 'SMS', label: 'SMS', emoji: '💬' },
  { key: 'WHATSAPP', label: 'WhatsApp', emoji: '📱' },
  { key: 'CALL', label: 'Call', emoji: '📞' },
  { key: 'EMAIL', label: 'Email', emoji: '📧' },
] as const;

export default function CreateReminderScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('HEALTH');
  const [priority, setPriority] = useState('MEDIUM');
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['PUSH']);
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [entireFamily, setEntireFamily] = useState(false);

  function toggleAssignee(id: string) {
    setAssigneeIds((prev) => {
      const next = prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id];
      setEntireFamily(next.length === familyMembers.length);
      return next;
    });
  }

  function toggleEntireFamily() {
    if (entireFamily) {
      setAssigneeIds([]);
      setEntireFamily(false);
    } else {
      setAssigneeIds(familyMembers.map((m) => m.id));
      setEntireFamily(true);
    }
  }

  function toggleChannel(ch: string) {
    setSelectedChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch],
    );
  }

  function handleCreate() {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please give your nudge a title.');
      return;
    }
    if (assigneeIds.length === 0) {
      Alert.alert('No Assignees', 'Please select at least one family member to remind.');
      return;
    }
    Alert.alert('Nudge Created!', `"${title}" will be sent to ${entireFamily ? 'the entire family' : assigneeIds.length + ' member(s)'}.`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }

  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={s.label}>What do you want to remind?</Text>
        <TextInput
          style={s.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Car Insurance Renewal, Dental Checkup..."
          placeholderTextColor="#9CA3AF"
        />

        <TextInput
          style={[s.input, { height: 70, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Add details (optional)"
          placeholderTextColor="#9CA3AF"
          multiline
        />

        {/* Category */}
        <Text style={s.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll} contentContainerStyle={s.chipRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[s.catChip, category === cat.key && s.catChipActive]}
              onPress={() => setCategory(cat.key)}
            >
              <Text style={s.catEmoji}>{CATEGORY_ICONS[cat.key]}</Text>
              <Text style={[s.catText, category === cat.key && s.catTextActive]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Who to Remind */}
        <Text style={s.label}>Who to remind?</Text>

        <TouchableOpacity style={[s.entireFamilyBtn, entireFamily && s.entireFamilyBtnActive]} onPress={toggleEntireFamily}>
          <Text style={s.efEmoji}>👨‍👩‍👧‍👦</Text>
          <View style={s.efContent}>
            <Text style={[s.efTitle, entireFamily && s.efTitleActive]}>Remind Entire Family</Text>
            <Text style={s.efDesc}>Send to all {familyMembers.length} members</Text>
          </View>
          <View style={[s.checkCircle, entireFamily && s.checkCircleActive]}>
            {entireFamily && <Text style={s.checkMark}>✓</Text>}
          </View>
        </TouchableOpacity>

        <Text style={s.orText}>— or pick specific members —</Text>

        {familyMembers.map((m) => {
          const selected = assigneeIds.includes(m.id);
          return (
            <TouchableOpacity
              key={m.id}
              style={[s.memberRow, selected && s.memberRowActive]}
              onPress={() => toggleAssignee(m.id)}
            >
              <View style={[s.memberAvatar, { backgroundColor: m.color }]}>
                <Text style={s.memberAvatarText}>{m.name[0]}</Text>
              </View>
              <View style={s.memberInfo}>
                <Text style={s.memberName}>{m.name}</Text>
                <Text style={s.memberRole}>{m.role}</Text>
              </View>
              <View style={[s.checkCircle, selected && s.checkCircleActive]}>
                {selected && <Text style={s.checkMark}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Priority */}
        <Text style={[s.label, { marginTop: 24 }]}>Priority Level</Text>
        <View style={s.priorityGrid}>
          {priorities.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[s.priorityCard, { backgroundColor: p.bg }, priority === p.key && { borderColor: p.color, borderWidth: 2 }]}
              onPress={() => setPriority(p.key)}
            >
              <Text style={[s.priorityLabel, { color: p.color }]}>{p.label}</Text>
              <Text style={s.priorityDesc}>{p.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Channels */}
        <Text style={s.label}>Notification Channels</Text>
        <View style={s.channelGrid}>
          {channels.map((ch) => {
            const active = selectedChannels.includes(ch.key);
            return (
              <TouchableOpacity
                key={ch.key}
                style={[s.channelChip, active && s.channelChipActive]}
                onPress={() => toggleChannel(ch.key)}
              >
                <Text style={s.channelEmoji}>{ch.emoji}</Text>
                <Text style={[s.channelLabel, active && s.channelLabelActive]}>{ch.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Create Button */}
      <View style={s.bottomBar}>
        <TouchableOpacity style={s.createBtn} onPress={handleCreate} activeOpacity={0.8}>
          <Text style={s.createBtnText}>Create Nudge</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { padding: 16, paddingBottom: 120 },

  label: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 16 },
  input: {
    backgroundColor: '#FFF', borderRadius: 14, padding: 14, fontSize: 15, color: '#111827',
    borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 8,
  },

  chipScroll: { marginBottom: 8 },
  chipRow: { gap: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1.5, borderColor: '#E5E7EB', gap: 6 },
  catChipActive: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  catEmoji: { fontSize: 16 },
  catText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  catTextActive: { color: '#3B82F6' },

  entireFamilyBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 16,
    borderWidth: 2, borderColor: '#E5E7EB', marginBottom: 10,
  },
  entireFamilyBtnActive: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  efEmoji: { fontSize: 28, marginRight: 12 },
  efContent: { flex: 1 },
  efTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  efTitleActive: { color: '#3B82F6' },
  efDesc: { fontSize: 12, color: '#6B7280', marginTop: 2 },

  orText: { textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginVertical: 10 },

  memberRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: '#E5E7EB', marginBottom: 8,
  },
  memberRowActive: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  memberAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  memberAvatarText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  memberRole: { fontSize: 11, color: '#6B7280', marginTop: 1 },

  checkCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
  checkCircleActive: { borderColor: '#3B82F6', backgroundColor: '#3B82F6' },
  checkMark: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  priorityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  priorityCard: { width: '48%', borderRadius: 14, padding: 14, borderWidth: 2, borderColor: 'transparent' },
  priorityLabel: { fontSize: 14, fontWeight: '700' },
  priorityDesc: { fontSize: 10, color: '#6B7280', marginTop: 3 },

  channelGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  channelChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1.5, borderColor: '#E5E7EB', gap: 6 },
  channelChipActive: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  channelEmoji: { fontSize: 16 },
  channelLabel: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  channelLabelActive: { color: '#3B82F6' },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', padding: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  createBtn: {
    backgroundColor: '#3B82F6', borderRadius: 16, paddingVertical: 16, alignItems: 'center',
    shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  createBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
