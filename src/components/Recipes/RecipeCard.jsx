/**
 * 🍽️ RECIPE CARD
 * Card individual de receita
 */

import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RECOMMENDATION_BADGES } from '../../utils/recipeConstants';

export const RecipeCard = ({ 
  recipe, 
  isFavorite, 
  isRecommended,
  onPress, 
  onToggleFavorite 
}) => {
  const recommendBadge = RECOMMENDATION_BADGES[recipe.type];

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Imagem de fundo */}
      <Image 
        source={{ uri: recipe.image }} 
        style={styles.image}
        resizeMode="cover"
      />
      
      {/* Overlay escuro */}
      <View style={styles.overlay} />

      {/* Badge de recomendação */}
      {isRecommended && recommendBadge && (
        <View style={[styles.recommendBadge, { backgroundColor: recommendBadge.color }]}>
          <Text style={styles.recommendText}>
            {recommendBadge.text}
          </Text>
        </View>
      )}

      {/* Botão de favorito */}
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={onToggleFavorite}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={24}
          color={isFavorite ? '#FF4444' : '#FFF'}
        />
      </TouchableOpacity>

      {/* Conteúdo */}
      <View style={styles.content}>
        {/* Categoria e tipo */}
        <Text style={styles.categoryTag}>
          {recipe.category} • {recipe.type}
        </Text>

        {/* Título */}
        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>

        {/* Macros */}
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
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  recommendBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    zIndex: 10,
  },
  recommendText: {
    color: '#000',
    fontSize: 9,
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
    borderRadius: 25,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  categoryTag: {
    color: '#32CD32',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 24,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 16,
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  macroIcon: {
    fontSize: 14,
  },
  macroText: {
    color: '#DDD',
    fontSize: 13,
    fontWeight: '600',
  },
});