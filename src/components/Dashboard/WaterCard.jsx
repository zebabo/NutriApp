import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { QUICK_WATER_AMOUNTS } from "../../utils/dashboardConstants";
import { COLORS } from "../../utils/theme";

export const WaterCard = ({ aguaHoje, metaAgua, onAddWater, onReset }) => {
  const progress = Math.min(100, (aguaHoje / metaAgua) * 100);
  const metaAtingida = aguaHoje >= metaAgua;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Água 💧</Text>
          <View style={styles.amountRow}>
            <Text style={[styles.amount, metaAtingida && styles.amountSuccess]}>
              {aguaHoje}/{metaAgua}ml
            </Text>
            {metaAtingida && (
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={COLORS.primary}
              />
            )}
          </View>
        </View>
        <TouchableOpacity onPress={onReset} style={styles.resetBtn}>
          <Ionicons name="refresh-outline" size={16} color={COLORS.water} />
        </TouchableOpacity>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
      <View style={styles.quickAddRow}>
        {QUICK_WATER_AMOUNTS.map((amount) => (
          <TouchableOpacity
            key={amount}
            style={styles.quickAddBtn}
            onPress={() => onAddWater(amount)}
          >
            <Text style={styles.quickAddText}>+{amount}ml</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1A2A3A",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  title: {
    color: COLORS.water,
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 4,
  },
  amountRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  amount: { color: COLORS.textPrimary, fontSize: 18, fontWeight: "bold" },
  amountSuccess: { color: COLORS.primary },
  resetBtn: {
    padding: 6,
    backgroundColor: "rgba(79, 195, 247, 0.15)",
    borderRadius: 20,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "rgba(79, 195, 247, 0.2)",
    borderRadius: 4,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: COLORS.water,
    borderRadius: 4,
  },
  quickAddRow: { flexDirection: "row", gap: 8 },
  quickAddBtn: {
    flex: 1,
    backgroundColor: COLORS.water,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  quickAddText: { color: COLORS.textInverse, fontWeight: "bold", fontSize: 13 },
});
