import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../utils/theme";

export const BMICard = ({ bmi, bmiCategory, healthyRange, unitSystem }) => {
  if (!bmi || !bmiCategory) return null;
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>IMC Atual:</Text>
        <Text style={[styles.value, { color: bmiCategory.color }]}>
          {bmi} - {bmiCategory.text}
        </Text>
      </View>
      {healthyRange && (
        <View style={styles.row}>
          <Text style={styles.label}>Peso Saudável:</Text>
          <Text style={styles.value}>
            {unitSystem === "Metric"
              ? `${healthyRange.min} - ${healthyRange.max} kg`
              : `${(healthyRange.min * 2.20462).toFixed(1)} - ${(healthyRange.max * 2.20462).toFixed(1)} lb`}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: { color: COLORS.textSecondary, fontSize: 13, fontWeight: "600" },
  value: { color: COLORS.textPrimary, fontSize: 14, fontWeight: "bold" },
});
