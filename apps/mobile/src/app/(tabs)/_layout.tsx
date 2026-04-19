import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

function TabIcon({ label, emoji, focused }: { label: string; emoji: string; focused: boolean }) {
  return (
    <View style={styles.tabIconWrap}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
          paddingTop: 6,
          paddingBottom: 6,
          height: 70,
        },
        headerStyle: { backgroundColor: '#ffffff' },
        headerTitleStyle: { fontWeight: '700', color: '#111827', fontSize: 20 },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: 'Family Nudge',
          tabBarIcon: ({ focused }) => <TabIcon label="Home" emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          headerTitle: 'Reminders',
          tabBarIcon: ({ focused }) => <TabIcon label="Nudges" emoji="🔔" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          headerTitle: 'Document Vault',
          tabBarIcon: ({ focused }) => <TabIcon label="Vault" emoji="🔒" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="policies"
        options={{
          headerTitle: 'Policies',
          tabBarIcon: ({ focused }) => <TabIcon label="Policies" emoji="🛡️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerTitle: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon label="More" emoji="⚙️" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconWrap: { alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabEmoji: { fontSize: 22, opacity: 0.5 },
  tabEmojiActive: { opacity: 1 },
  tabLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '500' },
  tabLabelActive: { color: '#3B82F6', fontWeight: '700' },
});
