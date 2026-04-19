import { StyleSheet, Text, View } from "react-native";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Family-nudge</Text>
      <Text style={styles.body}>
        Reminders that escalate until they land, and an encrypted family
        document vault.
      </Text>
      <Text style={styles.footer}>
        Week 1 scaffold — auth, family, reminders, vault coming next.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: { fontSize: 32, fontWeight: "700", marginBottom: 8 },
  body: { textAlign: "center", color: "#6b7280", maxWidth: 480 },
  footer: { marginTop: 32, fontSize: 12, color: "#9ca3af" },
});
