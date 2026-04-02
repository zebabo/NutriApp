import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../utils/theme";

export const CaloriesCard = ({ meta, consumidas, faltam }) => {
  const isOver = faltam < 0;
  const progress = Math.min(100, (consumidas / meta) * 100);
  return (
    <View style={styles.container}>
      <View style={styles.formula}>
        <View style={styles.valueBox}>
          <Text style={styles.value}>{meta}</Text>
          <Text style={styles.label}>Meta</Text>
        </View>
        <Text style={styles.operator}>-</Text>
        <View style={styles.valueBox}>
          <Text style={styles.value}>{consumidas}</Text>
          <Text style={styles.label}>Comido</Text>
        </View>
        <Text style={styles.operator}>=</Text>
        <View style={styles.valueBox}>
          <Text
            style={[
              styles.mainValue,
              isOver ? styles.valueOver : styles.valueUnder,
            ]}
          >
            {Math.abs(faltam)}
          </Text>
          <Text style={styles.label}>{isOver ? "Excesso" : "Restantes"}</Text>
        </View>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBar,
              { width: `${progress}%` },
              isOver && styles.progressBarOver,
            ]}
          />
        </View>
        <Text style={styles.progressText}>{progress.toFixed(0)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  formula: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  valueBox: { alignItems: "center", flex: 1 },
  value: { color: COLORS.textPrimary, fontSize: 18, fontWeight: "bold" },
  mainValue: { fontSize: 32, fontWeight: "bold" },
  valueUnder: { color: COLORS.primary },
  valueOver: { color: "#FF4500" },
  label: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 4,
    textTransform: "uppercase",
  },
  operator: {
    color: COLORS.surfaceBorder,
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 8,
  },
  progressContainer: { flexDirection: "row", alignItems: "center", gap: 12 },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressBarOver: { backgroundColor: "#FF4500" },
  progressText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "bold",
    minWidth: 40,
    textAlign: "right",
  },
});
