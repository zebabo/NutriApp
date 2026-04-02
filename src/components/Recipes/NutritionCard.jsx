import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../utils/theme";

export const NutritionCard = ({ kcal, protein, carbs, fats, portion = 1 }) => {
  const items = [
    {
      label: "Calorias",
      value: Math.round(kcal * portion),
      unit: "kcal",
      color: "#FF6B6B",
    },
    {
      label: "Proteína",
      value: Math.round(protein * portion),
      unit: "g",
      color: COLORS.primary,
    },
    {
      label: "Hidratos",
      value: Math.round(carbs * portion),
      unit: "g",
      color: "#4ECDC4",
    },
    {
      label: "Gordura",
      value: Math.round(fats * portion),
      unit: "g",
      color: "#FFE66D",
    },
  ];
  return (
    <View style={styles.container}>
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
          <Text style={[styles.value, { color: item.color }]}>
            {item.value}
            {item.unit}
          </Text>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  item: { flex: 1, alignItems: "center" },
  value: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  label: {
    color: COLORS.textSecondary,
    fontSize: 10,
    textTransform: "uppercase",
    fontWeight: "600",
  },
});
