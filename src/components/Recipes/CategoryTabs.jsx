import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { CATEGORIES } from "../../utils/recipeConstants";
import { COLORS } from "../../utils/theme";

export const CategoryTabs = ({
  activeCategory,
  onCategoryChange,
  favoritesCount,
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={styles.container}
    contentContainerStyle={styles.content}
  >
    {CATEGORIES.map((cat) => {
      const isActive = activeCategory === cat.id;
      const label =
        cat.id === "favorites"
          ? `${cat.icon} Favoritos (${favoritesCount})`
          : `${cat.icon} ${cat.label}`;
      return (
        <TouchableOpacity
          key={cat.id}
          style={[styles.tab, isActive && styles.tabActive]}
          onPress={() => onCategoryChange(cat.id)}
        >
          <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
            {label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 16,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingRight: 20,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    alignSelf: "flex-start",
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  tabTextActive: {
    color: COLORS.textInverse,
  },
});
