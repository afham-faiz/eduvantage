import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { HealthResponseSchema } from "@eduvantage/contracts";

// Importing + using a shared contract here proves the workspace package
// resolves through Metro (not just tsc) — see metro.config.js.
const sampleHealth = HealthResponseSchema.safeParse({
  status: "ok",
  service: "student-mobile",
  timestamp: new Date().toISOString(),
});

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Mobile</Text>
      <Text style={styles.subtitle}>Foundation placeholder — no product UI yet.</Text>
      <Text style={styles.subtitle}>
        @eduvantage/contracts loaded: {sampleHealth.success ? "yes" : "no"}
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 14,
    color: "#737373",
  },
});
