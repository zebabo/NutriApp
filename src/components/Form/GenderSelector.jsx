import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GENDER_OPTIONS } from "../../utils/formConstants";
import { COLORS } from "../../utils/theme";

export const GenderSelector = ({ value, onChange }) => (
  <View style={styles.container}>
    <Text style={styles.label}>Sexo</Text>
    <View style={styles.row}>
      {GENDER_OPTIONS.map((g) => (
        <TouchableOpacity
          key={g.value}
          style={[styles.btn, value === g.value && styles.btnActive]}
          onPress={() => onChange(g.value)}
        >
          <Ionicons
            name={g.icon}
            size={18}
            color={
              value === g.value ? COLORS.textInverse : COLORS.textSecondary
            }
          />
          <Text
            style={[styles.btnText, value === g.value && styles.btnTextActive]}
          >
            {g.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  row: { flexDirection: "row", gap: 8 },
  btn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    gap: 6,
  },
  btnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  btnText: { color: COLORS.textSecondary, fontWeight: "600", fontSize: 14 },
  btnTextActive: { color: COLORS.textInverse },
});
