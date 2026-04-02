import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ACTIVITY_LEVELS } from "../../utils/formConstants";
import { COLORS } from "../../utils/theme";

export const ActivityLevelSelector = ({ value, onChange }) => (
  <View style={styles.container}>
    <Text style={styles.sectionTitle}>Nível de Atividade</Text>
    {ACTIVITY_LEVELS.map((level) => (
      <TouchableOpacity
        key={level.value}
        style={[styles.item, value === level.value && styles.itemActive]}
        onPress={() => onChange(level.value)}
      >
        <Ionicons
          name={level.icon}
          size={22}
          color={value === level.value ? COLORS.primary : COLORS.textMuted}
        />
        <View style={styles.textContainer}>
          <Text
            style={[styles.title, value === level.value && styles.titleActive]}
          >
            {level.title}
          </Text>
          <Text style={styles.description}>{level.description}</Text>
        </View>
        {value === level.value && (
          <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
        )}
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    gap: 12,
  },
  itemActive: { borderColor: COLORS.primary },
  textContainer: { flex: 1 },
  title: { color: COLORS.textSecondary, fontSize: 14, fontWeight: "600" },
  titleActive: { color: COLORS.textPrimary },
  description: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
});
