import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PoliciesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Insurance & Warranties</Text>
        <Text style={styles.subtitle}>Never miss a renewal or expiry date</Text>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderEmoji}>🛡️</Text>
          <Text style={styles.placeholderText}>Add your first policy to get started</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, marginBottom: 24 },
  placeholder: { alignItems: 'center', paddingVertical: 60 },
  placeholderEmoji: { fontSize: 48, marginBottom: 12 },
  placeholderText: { fontSize: 14, color: '#9CA3AF' },
});
