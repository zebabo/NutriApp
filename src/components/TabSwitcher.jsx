/**
 * 🔀 TAB SWITCHER
 * Switcher Dashboard | Receitas — aparece em ambos os ecrãs
 */

import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../utils/theme";

/**
 * @param {'Dashboard' | 'Recipes'} activeTab - qual está ativo
 * @param {Function} onDashboard - callback ao carregar Dashboard
 * @param {Function} onRecipes   - callback ao carregar Receitas
 */
export const TabSwitcher = ({ activeTab, onDashboard, onRecipes }) => {
  const isDashboard = activeTab === "Dashboard";

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.tab,
          isDashboard ? styles.tabActive : styles.tabInactive,
        ]}
        onPress={onDashboard}
        activeOpacity={isDashboard ? 1 : 0.7}
      >
        <Text style={isDashboard ? styles.textActive : styles.textInactive}>
          Dashboard
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          !isDashboard ? styles.tabActive : styles.tabInactive,
        ]}
        onPress={onRecipes}
        activeOpacity={!isDashboard ? 1 : 0.7}
      >
        <Text style={!isDashboard ? styles.textActive : styles.textInactive}>
          Receitas 📖
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabInactive: {
    backgroundColor: COLORS.surface,
  },
  textActive: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },
  textInactive: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
