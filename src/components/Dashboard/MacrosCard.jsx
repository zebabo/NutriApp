import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../utils/theme";

export const MacrosCard = ({ proteina, hidratos, gordura }) => {
  const macros = [
    { label: "Proteína", value: proteina, color: "#FF6B6B", icon: "🥩" },
    { label: "Hidratos", value: hidratos, color: "#4ECDC4", icon: "🍞" },
    { label: "Gordura", value: gordura, color: "#FFE66D", icon: "🥑" },
  ];
  return (
    <View style={styles.container}>
      {macros.map((macro, index) => (
        <View key={index} style={styles.macroBox}>
          <Text style={styles.icon}>{macro.icon}</Text>
          <Text style={[styles.value, { color: macro.color }]}>
            {macro.value}g
          </Text>
          <Text style={styles.label}>{macro.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 20,
  },
  macroBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  icon: { fontSize: 24, marginBottom: 8 },
  value: { fontWeight: "bold", fontSize: 18, marginBottom: 4 },
  label: {
    color: COLORS.textSecondary,
    fontSize: 10,
    textTransform: "uppercase",
    fontWeight: "600",
  },
});
