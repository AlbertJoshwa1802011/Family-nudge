import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const sections = [
    {
      title: 'Account',
      items: [
        { label: 'Edit Profile', icon: '👤' },
        { label: 'Notification Preferences', icon: '🔔' },
        { label: 'WhatsApp Integration', icon: '💬' },
      ],
    },
    {
      title: 'Family',
      items: [
        { label: 'Manage Members', icon: '👨‍👩‍👧‍👦' },
        { label: 'Invite Family', icon: '📨' },
        { label: 'Family Settings', icon: '⚙️' },
      ],
    },
    {
      title: 'Security',
      items: [
        { label: 'Change Password', icon: '🔑' },
        { label: 'Encryption Settings', icon: '🔒' },
        { label: 'Active Sessions', icon: '📱' },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Settings</Text>

        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.card}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.item, i < section.items.length - 1 && styles.itemBorder]}
                >
                  <Text style={styles.itemIcon}>{item.icon}</Text>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  itemIcon: { fontSize: 20, marginRight: 12 },
  itemLabel: { flex: 1, fontSize: 15, color: '#111827' },
  chevron: { fontSize: 20, color: '#D1D5DB' },
  logoutButton: { backgroundColor: '#FEE2E2', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  logoutText: { color: '#DC2626', fontWeight: '600', fontSize: 15 },
});
