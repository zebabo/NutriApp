/**
 * 📖 RECIPE DETAIL SCREEN - REFATORADO
 * 
 * APENAS JSX + Features novas!
 * - Seletor de porções
 * - Share recipe
 * - Confirmação antes de adicionar
 * - Haptic feedback
 */

import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NutritionCard } from '../components/Recipes/NutritionCard';
import { PortionSelector } from '../components/Recipes/PortionSelector';
import { RecipeHeader } from '../components/Recipes/RecipeHeader';
import { useRecipes } from '../hooks/useRecipes';
import { DEFAULT_PORTION, RECOMMENDATION_BADGES } from '../utils/recipeConstants';
import { formatPortion } from '../utils/recipeHelpers';

export default function RecipeDetailScreen({ route, navigation }) {
  const { recipe } = route.params;
  const { 
    adicionarRefeicao, 
    toggleFavorito, 
    isRecipeFavorite,
    addingMeal,
  } = useRecipes();

  const [portion, setPortion] = useState(DEFAULT_PORTION);
  const isFavorite = isRecipeFavorite(recipe.id);
  const recommendBadge = RECOMMENDATION_BADGES[recipe.type];

  // Voltar
  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  // Toggle favorito
  const handleToggleFavorite = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await toggleFavorito(recipe.id);
  };

  // Share recipe
  const handleShare = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const message = `🍽️ ${recipe.title}

🔥 ${recipe.kcal} kcal | 💪 ${recipe.protein}g proteína
🍞 ${recipe.carbs}g HC | 🥑 ${recipe.fats}g gordura

Ideal para: ${recipe.type} peso
Categoria: ${recipe.category}

Experimenta esta receita na app Smart Nutrition! 🇵🇹`;

      await Share.share({
        message,
        title: recipe.title,
      });
    } catch (error) {
      console.error('Erro ao partilhar:', error);
    }
  };

  // Adicionar ao dia
  const handleAddToDiary = () => {
    const portionText = formatPortion(portion);
    const totalKcal = Math.round(recipe.kcal * portion);

    Alert.alert(
      'Adicionar ao Diário 📝',
      `Adicionar ${portionText} de "${recipe.title}"?\n\nTotal: ${totalKcal} kcal`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        },
        {
          text: 'Adicionar',
          onPress: async () => {
            const success = await adicionarRefeicao(recipe, portion);
            
            if (success) {
              Alert.alert(
                '✅ Sucesso!',
                'Receita adicionada ao teu dia!',
                [
                  {
                    text: 'Ver Dashboard',
                    onPress: () => navigation.navigate('Dashboard'),
                  },
                  {
                    text: 'OK',
                    style: 'cancel',
                  },
                ]
              );
            }
          },
        },
      ]
    );
  };

  // Handlers de porção
  const handlePortionChange = async (newPortion) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPortion(newPortion);
  };

  return (
    <View style={styles.container}>
      {/* Header com imagem */}
      <RecipeHeader
        imageUrl={recipe.image}
        onBack={handleBack}
        onShare={handleShare}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={isFavorite}
      />

      {/* Conteúdo */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.detailsContainer}>
          {/* Título */}
          <Text style={styles.title}>{recipe.title}</Text>

          {/* Badge de tipo */}
          {recommendBadge && (
            <View style={[styles.typeBadge, { backgroundColor: recommendBadge.bgColor }]}>
              <Text style={[styles.typeText, { color: recommendBadge.color }]}>
                Foco: {recipe.type} Peso
              </Text>
            </View>
          )}

          {/* Seletor de porções */}
          <PortionSelector
            portion={portion}
            onPortionChange={handlePortionChange}
          />

          {/* Card de nutrição */}
          <NutritionCard
            kcal={recipe.kcal}
            protein={recipe.protein}
            carbs={recipe.carbs}
            fats={recipe.fats}
            portion={portion}
          />

          {/* Ingredientes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Ingredientes</Text>
            {recipe.ingredients.map((ing, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.bullet} />
                <Text style={styles.listText}>{ing}</Text>
              </View>
            ))}
          </View>

          {/* Modo de preparação */}
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

          {/* Botão adicionar */}
          <TouchableOpacity
            style={[styles.addBtn, addingMeal && styles.addBtnLoading]}
            onPress={handleAddToDiary}
            disabled={addingMeal}
          >
            {addingMeal ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Text style={styles.addBtnText}>Adicionar ao Meu Dia</Text>
                <Text style={styles.addBtnSubtext}>
                  {formatPortion(portion)} • {Math.round(recipe.kcal * portion)} kcal
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
  },
  detailsContainer: {
    backgroundColor: '#121212',
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    lineHeight: 34,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 24,
  },
  typeText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingLeft: 4,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#32CD32',
    marginRight: 12,
    marginTop: 8,
  },
  listText: {
    color: '#CCC',
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#32CD32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addBtn: {
    backgroundColor: '#32CD32',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  addBtnLoading: {
    opacity: 0.6,
  },
  addBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 17,
  },
  addBtnSubtext: {
    color: '#000',
    fontSize: 13,
    marginTop: 4,
    opacity: 0.7,
  },
});