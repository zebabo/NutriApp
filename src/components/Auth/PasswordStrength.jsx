import { StyleSheet, Text, View } from "react-native";
import {
  PASSWORD_STRENGTH,
  PASSWORD_STRENGTH_CONFIG,
} from "../../utils/authConstants";
import { COLORS } from "../../utils/theme";

export const PasswordStrength = ({ password, strength }) => {
  if (!password || password.length === 0) return null;
  const config =
    PASSWORD_STRENGTH_CONFIG[strength] ||
    PASSWORD_STRENGTH_CONFIG[PASSWORD_STRENGTH.WEAK];
  const getBarWidth = () => {
    switch (strength) {
      case PASSWORD_STRENGTH.WEAK:
        return "33%";
      case PASSWORD_STRENGTH.MEDIUM:
        return "66%";
      case PASSWORD_STRENGTH.STRONG:
        return "100%";
      default:
        return "0%";
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        <View
          style={[
            styles.bar,
            { width: getBarWidth(), backgroundColor: config.color },
          ]}
        />
      </View>
      <View style={styles.labelContainer}>
        <Text style={styles.icon}>{config.icon}</Text>
        <Text style={[styles.label, { color: config.color }]}>
          Password {config.label}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 15 },
  barContainer: {
    height: 4,
    backgroundColor: COLORS.surface,
    borderRadius: 2,
    overflow: "hidden",
  },
  bar: { height: "100%", borderRadius: 2 },
  labelContainer: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  icon: { fontSize: 12, marginRight: 6 },
  label: { fontSize: 12, fontWeight: "600" },
});
