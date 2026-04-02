import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../utils/theme";

export const WeightProgress = ({
  pesoAtual,
  pesoAlvo,
  metaAtingida,
  unidade,
  novoPeso,
  setNovoPeso,
  onRegister,
}) => {
  const exibir = (val) => {
    const n = parseFloat(val);
    if (isNaN(n)) return "--";
    const v = unidade === "Imperial" ? (n * 2.20462).toFixed(1) : n.toFixed(1);
    return `${v}${unidade === "Imperial" ? "lb" : "kg"}`;
  };
  const diferenca = pesoAtual && pesoAlvo ? Math.abs(pesoAtual - pesoAlvo) : 0;
  const faltam = pesoAtual > pesoAlvo ? "perder" : "ganhar";

  return (
    <View style={styles.container}>
      <View style={styles.currentWeight}>
        <View style={styles.weightInfo}>
          <Text style={styles.weightLabel}>Peso Atual</Text>
          <Text style={styles.weightValue}>{exibir(pesoAtual)}</Text>
        </View>
        {metaAtingida ? (
          <View style={styles.goalBadge}>
            <Ionicons
              name="checkmark-circle"
              size={32}
              color={COLORS.primary}
            />
            <Text style={styles.goalText}>Meta Atingida!</Text>
          </View>
        ) : (
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>Meta</Text>
            <Text style={styles.progressValue}>{exibir(pesoAlvo)}</Text>
            <Text style={styles.progressDiff}>
              ({diferenca.toFixed(1)}
              {unidade === "Imperial" ? "lb" : "kg"} a {faltam})
            </Text>
          </View>
        )}
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Registar novo peso:</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={novoPeso}
            onChangeText={setNovoPeso}
            placeholder={`Ex: ${pesoAtual}`}
            placeholderTextColor={COLORS.textMuted}
          />
          <TouchableOpacity style={styles.registerBtn} onPress={onRegister}>
            <Ionicons name="checkmark" size={20} color={COLORS.textInverse} />
            <Text style={styles.registerBtnText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  currentWeight: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  weightInfo: { flex: 1 },
  weightLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  weightValue: { color: COLORS.textPrimary, fontSize: 36, fontWeight: "bold" },
  progressInfo: { alignItems: "flex-end" },
  progressLabel: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 4 },
  progressValue: { color: COLORS.primary, fontSize: 24, fontWeight: "bold" },
  progressDiff: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  goalBadge: { alignItems: "center", gap: 4 },
  goalText: { color: COLORS.primary, fontSize: 12, fontWeight: "bold" },
  inputContainer: { gap: 10 },
  inputLabel: { color: COLORS.textPrimary, fontSize: 13, fontWeight: "600" },
  inputRow: { flexDirection: "row", gap: 10 },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    color: COLORS.textPrimary,
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
  },
  registerBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  registerBtnText: {
    color: COLORS.textInverse,
    fontWeight: "bold",
    fontSize: 14,
  },
});
