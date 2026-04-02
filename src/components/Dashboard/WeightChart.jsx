import { Dimensions, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { COLORS } from "../../utils/theme";

const screenWidth = Dimensions.get("window").width - 40;

export const WeightChart = ({ historico, unidade }) => {
  if (!historico || historico.length < 2) return null;

  const ultimos = historico.slice(-7);
  const labels = ultimos.map((h) => {
    const [, m, d] = h.data.split("-");
    return `${d}/${m}`;
  });
  const data = ultimos.map((h) => {
    const val = parseFloat(h.peso);
    return unidade === "Imperial"
      ? parseFloat((val * 2.20462).toFixed(1))
      : val;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Evolução do Peso 📈</Text>
      <LineChart
        data={{ labels, datasets: [{ data }] }}
        width={screenWidth}
        height={180}
        chartConfig={{
          backgroundColor: COLORS.surface,
          backgroundGradientFrom: COLORS.surface,
          backgroundGradientTo: COLORS.surface,
          decimalPlaces: 1,
          color: () => COLORS.primary,
          labelColor: () => COLORS.textSecondary,
          propsForDots: { r: "4", strokeWidth: "2", stroke: COLORS.primary },
          propsForBackgroundLines: { stroke: COLORS.surfaceBorder },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  chart: { borderRadius: 12, marginLeft: -16 },
});
