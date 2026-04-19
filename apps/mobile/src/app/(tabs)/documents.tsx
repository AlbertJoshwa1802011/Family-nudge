import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const documents = [
  { id: '1', name: 'Passport — John.pdf', category: 'Identity', size: '2.4 MB', date: 'Mar 15', icon: '🪪' },
  { id: '2', name: 'Home Insurance Policy.pdf', category: 'Insurance', size: '890 KB', date: 'Jan 2', icon: '🛡️' },
  { id: '3', name: 'Birth Certificate — Emma.pdf', category: 'Identity', size: '1.1 MB', date: 'Dec 10', icon: '📜' },
  { id: '4', name: 'Tax Return 2025.pdf', category: 'Financial', size: '3.2 MB', date: 'Mar 28', icon: '💰' },
  { id: '5', name: 'Car Title — Honda.pdf', category: 'Vehicle', size: '1.8 MB', date: 'Feb 14', icon: '🚗' },
  { id: '6', name: 'Medical Records — Sarah.pdf', category: 'Medical', size: '5.1 MB', date: 'Nov 5', icon: '🏥' },
];

const categories = ['All', 'Identity', 'Insurance', 'Financial', 'Medical', 'Vehicle'];

export default function DocumentsScreen() {
  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      {/* Encryption banner */}
      <View style={s.banner}>
        <Text style={s.bannerIcon}>🔒</Text>
        <Text style={s.bannerText}>All documents encrypted with AES-256-GCM</Text>
      </View>

      {/* Category filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
        {categories.map((cat, i) => (
          <TouchableOpacity key={cat} style={[s.chip, i === 0 && s.chipActive]} activeOpacity={0.7}>
            <Text style={[s.chipText, i === 0 && s.chipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {documents.map((doc) => (
          <TouchableOpacity key={doc.id} style={s.docCard} activeOpacity={0.7}>
            <View style={s.docIconWrap}>
              <Text style={s.docIcon}>{doc.icon}</Text>
            </View>
            <View style={s.docContent}>
              <Text style={s.docName} numberOfLines={1}>{doc.name}</Text>
              <Text style={s.docMeta}>{doc.category} · {doc.size} · {doc.date}</Text>
            </View>
            <View style={s.encBadge}>
              <Text style={s.encText}>✓ Encrypted</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Storage info */}
        <View style={s.storageCard}>
          <Text style={s.storageTitle}>Storage Used</Text>
          <View style={s.storageBar}>
            <View style={[s.storageProgress, { width: '28%' }]} />
          </View>
          <Text style={s.storageText}>14.5 MB of 50 MB used</Text>
        </View>
      </ScrollView>

      {/* Upload FAB */}
      <TouchableOpacity style={s.fab} activeOpacity={0.8}>
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  banner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F3FF', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  bannerIcon: { fontSize: 14 },
  bannerText: { fontSize: 12, color: '#7C3AED', fontWeight: '600' },

  filterScroll: { maxHeight: 52, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  filterContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6' },
  chipActive: { backgroundColor: '#8B5CF6' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  chipTextActive: { color: '#FFF' },

  scroll: { padding: 16, paddingBottom: 100 },

  docCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  docIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  docIcon: { fontSize: 22 },
  docContent: { flex: 1 },
  docName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  docMeta: { fontSize: 11, color: '#6B7280', marginTop: 3 },
  encBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  encText: { fontSize: 9, fontWeight: '600', color: '#059669' },

  storageCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginTop: 8 },
  storageTitle: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  storageBar: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' },
  storageProgress: { height: '100%', backgroundColor: '#8B5CF6', borderRadius: 3 },
  storageText: { fontSize: 11, color: '#6B7280', marginTop: 6 },

  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#8B5CF6',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  fabText: { fontSize: 28, color: '#FFF', fontWeight: '300', marginTop: -2 },
});
