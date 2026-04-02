import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  PORTION_MAX,
  PORTION_MIN,
  PORTION_STEP,
} from "../../utils/recipeConstants";
import { formatPortion } from "../../utils/recipeHelpers";
import { COLORS } from "../../utils/theme";

export const PortionSelector = ({ portion, onPortionChange }) => {
  const canDecrease = portion > PORTION_MIN;
  const canIncrease = portion < PORTION_MAX;
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Porção</Text>
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.btn, !canDecrease && styles.btnDisabled]}
          onPress={() => canDecrease && onPortionChange(portion - PORTION_STEP)}
          disabled={!canDecrease}
        >
          <Text style={styles.btnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.value}>{formatPortion(portion)}</Text>
        <TouchableOpacity
          style={[styles.btn, !canIncrease && styles.btnDisabled]}
          onPress={() => canIncrease && onPortionChange(portion + PORTION_STEP)}
          disabled={!canIncrease}
        >
          <Text style={styles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  label: { color: COLORS.textPrimary, fontSize: 15, fontWeight: "600" },
  controls: { flexDirection: "row", alignItems: "center", gap: 16 },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.4 },
  btnText: {
    color: COLORS.textInverse,
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 24,
  },
  value: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "600",
    minWidth: 80,
    textAlign: "center",
  },
});
