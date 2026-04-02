import * as Haptics from "expo-haptics";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { NutritionCard } from "../components/Recipes/NutritionCard";
import { PortionSelector } from "../components/Recipes/PortionSelector";
import { RecipeHeader } from "../components/Recipes/RecipeHeader";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../services/supabase";
import { RECOMMENDATION_BADGES } from "../utils/recipeConstants";
import { createMealFromRecipe, formatPortion } from "../utils/recipeHelpers";
import { COLORS } from "../utils/theme";

export default function RecipeDetailScreen({ route, navigation }) {
  const { recipe } = route.params;
  const { user } = useAuth();
  const [portion, setPortion] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingMeal, setAddingMeal] = useState(false);

  const recommendBadge = RECOMMENDATION_BADGES[recipe.type];

  const handleBack = () => navigation.goBack();

  const handleShare = () => {
    Alert.alert("Partilhar", `${recipe.title} - ${recipe.kcal} kcal`);
  };

  const handleToggleFavorite = async () => {
    setIsFavorite(!isFavorite);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddToDiary = async () => {
    Alert.alert(
      "Adicionar ao Dia",
      `Adicionar ${formatPortion(portion)} de ${recipe.title}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Adicionar",
          onPress: async () => {
            setAddingMeal(true);
            try {
              const meal = createMealFromRecipe(recipe, portion);
              const hoje = new Date().toISOString().split("T")[0];

              const { data: log } = await supabase
                .from("daily_logs")
                .select("meals")
                .eq("user_id", user.id)
                .eq("date", hoje)
                .single();

              const meals = [...(log?.meals || []), meal];

              await supabase.from("daily_logs").upsert(
                {
                  user_id: user.id,
                  date: hoje,
                  meals,
                },
                { onConflict: "user_id,date" },
              );

              await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
              Alert.alert("✅ Adicionado", "Receita adicionada ao teu dia!", [
                {
                  text: "Ver Dashboard",
                  onPress: () => navigation.navigate("Dashboard"),
                },
                { text: "OK", style: "cancel" },
              ]);
            } catch (e) {
              Alert.alert("Erro", "Não foi possível adicionar a receita.");
            } finally {
              setAddingMeal(false);
            }
          },
        },
      ],
    );
  };

  const handlePortionChange = async (newPortion) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPortion(newPortion);
  };

  return (
    <View style={styles.container}>
      <RecipeHeader
        imageUrl={recipe.image}
        onBack={handleBack}
        onShare={handleShare}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={isFavorite}
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{recipe.title}</Text>

          {recommendBadge && (
            <View
              style={[
                styles.typeBadge,
                { backgroundColor: recommendBadge.bgColor },
              ]}
            >
              <Text style={[styles.typeText, { color: recommendBadge.color }]}>
                Foco: {recipe.type} Peso
              </Text>
            </View>
          )}

          <PortionSelector
            portion={portion}
            onPortionChange={handlePortionChange}
          />

          <NutritionCard
            kcal={recipe.kcal}
            protein={recipe.protein}
            carbs={recipe.carbs}
            fats={recipe.fats}
            portion={portion}
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Ingredientes</Text>
            {recipe.ingredients.map((ing, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.bullet} />
                <Text style={styles.listText}>{ing}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👨‍🍳 Modo de Preparação</Text>
            {recipe.steps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.listText}>{step}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.addBtn, addingMeal && styles.addBtnLoading]}
            onPress={handleAddToDiary}
            disabled={addingMeal}
          >
            <Text style={styles.addBtnText}>Adicionar ao Meu Dia</Text>
            <Text style={styles.addBtnSubtext}>
              {formatPortion(portion)} • {Math.round(recipe.kcal * portion)}{" "}
              kcal
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.textInverse },
  content: { flex: 1 },
  detailsContainer: {
    backgroundColor: COLORS.textInverse,
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    lineHeight: 34,
  },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 24,
  },
  typeText: { fontSize: 13, fontWeight: "bold" },
  section: { marginBottom: 32 },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingLeft: 4,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 12,
    marginTop: 8,
  },
  listText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  stepNumberText: {
    color: COLORS.textInverse,
    fontWeight: "bold",
    fontSize: 16,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
  },
  addBtnLoading: { opacity: 0.6 },
  addBtnText: { color: COLORS.textInverse, fontWeight: "bold", fontSize: 17 },
  addBtnSubtext: {
    color: COLORS.textInverse,
    fontSize: 13,
    marginTop: 4,
    opacity: 0.7,
  },
});
