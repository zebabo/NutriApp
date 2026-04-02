import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../utils/theme";

export const MealList = ({ refeicoes = [], onRemove }) => {
  if (!refeicoes || refeicoes.length === 0) return null;
  const total = refeicoes.reduce((sum, r) => sum + (r.kcal || 0), 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Refeições de Hoje</Text>
        <View style={styles.totalBadge}>
          <Text style={styles.totalText}>{total} kcal</Text>
        </View>
      </View>
      {refeicoes.map((item, index) => (
        <View key={item.id || index}>
          <View style={styles.item}>
            <View style={styles.itemContent}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.nome}</Text>
                <View style={styles.itemMeta}>
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color={COLORS.textMuted}
                  />
                  <Text style={styles.itemTime}>{item.hora || "--:--"}</Text>
                </View>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemKcal}>{item.kcal} kcal</Text>
                <TouchableOpacity
                  onPress={() => onRemove(item.id)}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={16} color="#FF4500" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {index < refeicoes.length - 1 && <View style={styles.separator} />}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { color: COLORS.textPrimary, fontSize: 16, fontWeight: "bold" },
  totalBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  totalText: { color: COLORS.textInverse, fontSize: 12, fontWeight: "bold" },
  item: { paddingVertical: 12 },
  itemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemInfo: { flex: 1 },
  itemName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  itemTime: { color: COLORS.textMuted, fontSize: 12 },
  itemRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  itemKcal: { color: COLORS.primary, fontSize: 14, fontWeight: "bold" },
  deleteBtn: {
    padding: 8,
    backgroundColor: "rgba(255, 69, 0, 0.1)",
    borderRadius: 8,
  },
  separator: { height: 1, backgroundColor: COLORS.surfaceBorder },
});
