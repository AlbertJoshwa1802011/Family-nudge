import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const familyMembers = [
  { name: 'John Doe', role: 'Admin', color: '#3B82F6' },
  { name: 'Sarah Doe', role: 'Parent', color: '#EC4899' },
  { name: 'Emma Doe', role: 'Member', color: '#8B5CF6' },
  { name: 'Jake Doe', role: 'Child', color: '#10B981' },
];

export default function SettingsScreen() {
  const sections = [
    {
      title: 'NOTIFICATION PREFERENCES',
      items: [
        { label: 'Push Notifications', icon: '🔔', detail: 'Enabled' },
        { label: 'SMS Notifications', icon: '💬', detail: 'Enabled' },
        { label: 'WhatsApp Messages', icon: '📱', detail: 'Not configured' },
        { label: 'Automated Calls', icon: '📞', detail: 'Critical only' },
        { label: 'Email Notifications', icon: '📧', detail: 'Disabled' },
      ],
    },
    {
      title: 'SECURITY',
      items: [
        { label: 'Change Password', icon: '🔑' },
        { label: 'Encryption Settings', icon: '🔒', detail: 'AES-256-GCM' },
        { label: 'Active Sessions', icon: '📲', detail: '2 devices' },
        { label: 'Document Audit Log', icon: '📋' },
      ],
    },
    {
      title: 'ACCOUNT',
      items: [
        { label: 'Edit Profile', icon: '👤' },
        { label: 'Connected Services', icon: '🔗' },
        { label: 'Export Data', icon: '📤' },
        { label: 'Help & Support', icon: '❓' },
      ],
    },
  ];

  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <View style={s.profileCard}>
          <View style={s.profileAvatar}>
            <Text style={s.profileAvatarText}>J</Text>
          </View>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>John Doe</Text>
            <Text style={s.profileEmail}>john@example.com</Text>
          </View>
          <TouchableOpacity style={s.editBtn}><Text style={s.editBtnText}>Edit</Text></TouchableOpacity>
        </View>

        {/* Family */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>FAMILY MEMBERS</Text>
            <TouchableOpacity style={s.inviteBtn}><Text style={s.inviteBtnText}>+ Invite</Text></TouchableOpacity>
          </View>
          <View style={s.sectionCard}>
            {familyMembers.map((m, i) => (
              <TouchableOpacity key={m.name} style={[s.memberRow, i < familyMembers.length - 1 && s.memberBorder]}>
                <View style={[s.memberAvatar, { backgroundColor: m.color }]}>
                  <Text style={s.memberAvatarText}>{m.name[0]}</Text>
                </View>
                <View style={s.memberInfo}>
                  <Text style={s.memberName}>{m.name}</Text>
                  <Text style={s.memberRole}>{m.role}</Text>
                </View>
                <Text style={s.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.inviteCodeCard}>
            <Text style={s.inviteCodeLabel}>Family Invite Code</Text>
            <View style={s.inviteCodeRow}>
              <Text style={s.inviteCode}>A3F8K2M1</Text>
              <TouchableOpacity style={s.copyBtn}><Text style={s.copyBtnText}>Copy</Text></TouchableOpacity>
            </View>
            <Text style={s.inviteCodeHint}>Share this code so others can join your family</Text>
          </View>
        </View>

        {/* Settings sections */}
        {sections.map((section) => (
          <View key={section.title} style={s.section}>
            <Text style={s.sectionTitle}>{section.title}</Text>
            <View style={s.sectionCard}>
              {section.items.map((item, i) => (
                <TouchableOpacity key={item.label} style={[s.settingRow, i < section.items.length - 1 && s.settingBorder]}>
                  <Text style={s.settingIcon}>{item.icon}</Text>
                  <Text style={s.settingLabel}>{item.label}</Text>
                  {item.detail && <Text style={s.settingDetail}>{item.detail}</Text>}
                  <Text style={s.chevron}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity
          style={s.logoutBtn}
          onPress={() => Alert.alert('Sign Out', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Sign Out', style: 'destructive' }])}
        >
          <Text style={s.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={s.version}>Family Nudge v0.1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { padding: 16, paddingBottom: 40 },

  profileCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  profileAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  profileAvatarText: { fontSize: 22, fontWeight: '700', color: '#FFF' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  profileEmail: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  editBtn: { backgroundColor: '#EFF6FF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  editBtnText: { fontSize: 13, fontWeight: '600', color: '#3B82F6' },

  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#6B7280', letterSpacing: 0.5 },
  inviteBtn: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  inviteBtnText: { fontSize: 12, fontWeight: '600', color: '#3B82F6' },

  sectionCard: { backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },

  memberRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  memberBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  memberAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  memberAvatarText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  memberRole: { fontSize: 11, color: '#6B7280', marginTop: 1 },

  inviteCodeCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginTop: 8 },
  inviteCodeLabel: { fontSize: 11, fontWeight: '600', color: '#6B7280', marginBottom: 6 },
  inviteCodeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  inviteCode: { fontSize: 22, fontWeight: '800', color: '#111827', letterSpacing: 2 },
  copyBtn: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  copyBtnText: { fontSize: 12, fontWeight: '600', color: '#3B82F6' },
  inviteCodeHint: { fontSize: 10, color: '#9CA3AF', marginTop: 6 },

  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  settingBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  settingIcon: { fontSize: 18, marginRight: 12 },
  settingLabel: { flex: 1, fontSize: 14, color: '#111827' },
  settingDetail: { fontSize: 12, color: '#9CA3AF', marginRight: 8 },
  chevron: { fontSize: 18, color: '#D1D5DB' },

  logoutBtn: { backgroundColor: '#FEE2E2', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  logoutText: { color: '#DC2626', fontWeight: '700', fontSize: 15 },
  version: { textAlign: 'center', fontSize: 11, color: '#D1D5DB', marginTop: 16 },
});
