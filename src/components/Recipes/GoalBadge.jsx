import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../utils/theme";

export const GoalBadge = ({ goal }) => {
  const getGoalColor = () => {
    switch (goal) {
      case "Perder":
        return { bg: "rgba(248, 81, 73, 0.13)", text: COLORS.danger };
      case "Ganhar":
        return { bg: COLORS.primaryMuted, text: COLORS.primary };
      case "Manter":
        return { bg: "rgba(88, 166, 255, 0.13)", text: COLORS.info };
      default:
        return { bg: "rgba(139, 148, 158, 0.13)", text: COLORS.textSecondary };
    }
  };
  const colors = getGoalColor();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.bg, borderColor: colors.text },
      ]}
    >
      <Text style={[styles.text, { color: colors.text }]}>
        FOCO: {goal?.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  text: { fontSize: 10, fontWeight: "bold" },
});
