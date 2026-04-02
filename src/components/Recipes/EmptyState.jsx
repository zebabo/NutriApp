import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../utils/theme";

export const EmptyState = ({ icon, title, message }) => (
  <View style={styles.container}>
    {icon && (
      <Ionicons
        name={icon}
        size={48}
        color={COLORS.textMuted}
        style={styles.icon}
      />
    )}
    <Text style={styles.title}>{title}</Text>
    {message && <Text style={styles.message}>{message}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  icon: { marginBottom: 16 },
  title: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
