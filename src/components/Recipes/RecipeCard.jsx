import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../utils/theme";

export const RecipeCard = ({
  recipe,
  isFavorite,
  isRecommended,
  onPress,
  onToggleFavorite,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: recipe.image }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.overlay} />

      {isRecommended && (
        <View
          style={[styles.recommendBadge, { backgroundColor: COLORS.primary }]}
        >
          <Text style={styles.recommendText}>RECOMENDADO</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={onToggleFavorite}
      >
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={24}
          color={isFavorite ? "#FF4444" : COLORS.textPrimary}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.categoryTag}>
          {recipe.category} • {recipe.type}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>
        <View style={styles.macrosRow}>
          <View style={styles.macroItem}>
            <Text style={styles.macroIcon}>🔥</Text>
            <Text style={styles.macroText}>{recipe.kcal} kcal</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroIcon}>💪</Text>
            <Text style={styles.macroText}>{recipe.protein}g</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
  },
  image: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  recommendBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    zIndex: 10,
  },
  recommendText: { color: COLORS.textInverse, fontSize: 9, fontWeight: "bold" },
  favoriteButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 25,
  },
  content: { flex: 1, justifyContent: "flex-end", padding: 16 },
  categoryTag: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    lineHeight: 24,
  },
  macrosRow: { flexDirection: "row", gap: 16 },
  macroItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  macroIcon: { fontSize: 14 },
  macroText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: "600" },
});
