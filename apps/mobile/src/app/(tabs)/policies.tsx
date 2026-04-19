import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const policies = [
  { id: '1', name: 'Auto Insurance — Honda', type: 'AUTO', provider: 'State Farm', endDate: '2026-05-15', daysLeft: 26, premium: '$120/mo' },
  { id: '2', name: 'Home Insurance', type: 'HOME', provider: 'Allstate', endDate: '2026-11-01', daysLeft: 196, premium: '$85/mo' },
  { id: '3', name: 'Laptop Extended Warranty', type: 'WARRANTY', provider: 'Best Buy', endDate: '2026-04-28', daysLeft: 9, premium: 'One-time' },
  { id: '4', name: 'Health Insurance', type: 'HEALTH', provider: 'Blue Cross', endDate: '2026-12-31', daysLeft: 256, premium: '$450/mo' },
  { id: '5', name: 'Life Insurance — John', type: 'LIFE', provider: 'MetLife', endDate: '2027-03-15', daysLeft: 330, premium: '$35/mo' },
];

const typeEmoji: Record<string, string> = {
  AUTO: '🚗', HOME: '🏠', WARRANTY: '📋', HEALTH: '🏥', LIFE: '💚',
};

export default function PoliciesScreen() {
  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <View style={s.summaryRow}>
          <View style={[s.summaryCard, { backgroundColor: '#FEE2E2' }]}>
            <Text style={[s.summaryValue, { color: '#DC2626' }]}>2</Text>
            <Text style={s.summaryLabel}>Expiring Soon</Text>
          </View>
          <View style={[s.summaryCard, { backgroundColor: '#ECFDF5' }]}>
            <Text style={[s.summaryValue, { color: '#059669' }]}>3</Text>
            <Text style={s.summaryLabel}>Active</Text>
          </View>
          <View style={[s.summaryCard, { backgroundColor: '#EFF6FF' }]}>
            <Text style={[s.summaryValue, { color: '#3B82F6' }]}>$690</Text>
            <Text style={s.summaryLabel}>Monthly</Text>
          </View>
        </View>

        {/* Policies */}
        {policies.map((p) => {
          const urgent = p.daysLeft <= 30;
          return (
            <TouchableOpacity key={p.id} style={s.card} activeOpacity={0.7}>
              <View style={s.cardTop}>
                <View style={[s.typeIcon, { backgroundColor: urgent ? '#FEE2E2' : '#F3F4F6' }]}>
                  <Text style={{ fontSize: 22 }}>{typeEmoji[p.type] ?? '🛡️'}</Text>
                </View>
                <View style={s.cardContent}>
                  <Text style={s.cardTitle}>{p.name}</Text>
                  <Text style={s.cardProvider}>{p.provider} · {p.premium}</Text>
                </View>
                <View style={s.daysWrap}>
                  <Text style={[s.daysValue, { color: urgent ? '#DC2626' : '#059669' }]}>{p.daysLeft}</Text>
                  <Text style={s.daysLabel}>days left</Text>
                </View>
              </View>

              <View style={s.cardBottom}>
                <Text style={s.expiryDate}>
                  Expires {new Date(p.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </Text>
                <View style={[s.statusBadge, { backgroundColor: urgent ? '#FEE2E2' : '#ECFDF5' }]}>
                  <Text style={[s.statusText, { color: urgent ? '#DC2626' : '#059669' }]}>
                    {urgent ? 'EXPIRING SOON' : 'ACTIVE'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={s.fab} activeOpacity={0.8}>
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { padding: 16, paddingBottom: 100 },

  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  summaryCard: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center' },
  summaryValue: { fontSize: 22, fontWeight: '800' },
  summaryLabel: { fontSize: 10, color: '#6B7280', marginTop: 2, fontWeight: '500' },

  card: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  typeIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  cardProvider: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  daysWrap: { alignItems: 'center' },
  daysValue: { fontSize: 22, fontWeight: '800' },
  daysLabel: { fontSize: 9, color: '#9CA3AF', fontWeight: '500' },

  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  expiryDate: { fontSize: 11, color: '#6B7280' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 9, fontWeight: '700' },

  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#10B981',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  fabText: { fontSize: 28, color: '#FFF', fontWeight: '300', marginTop: -2 },
});
