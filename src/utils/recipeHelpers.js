/**
 * 🛠️ RECIPE HELPERS - CORRIGIDO
 * Funções auxiliares para manipular receitas
 */

import { GOAL_TYPES } from './recipeConstants';

/**
 * Gera ID único para refeição
 */
export const generateMealId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Filtra receitas por categoria
 * FIX: Removido mapeamento PT→EN
 */
export const filterByCategory = (recipes, category, favorites = []) => {
  // Se for favoritos, retorna só os favoritos
  if (category === 'Favoritos') {
    return recipes.filter(recipe => favorites.includes(recipe.id));
  }
  
  // Senão filtra por categoria diretamente (sem mapeamento)
  return recipes.filter(recipe => recipe.category === category);
};

/**
 * Filtra receitas por pesquisa
 */
export const filterBySearch = (recipes, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') return recipes;
  
  const term = searchTerm.toLowerCase().trim();
  
  return recipes.filter(recipe => {
    const titleMatch = recipe.title?.toLowerCase().includes(term);
    const ingredientsMatch = recipe.ingredients?.some(ing => 
      ing.toLowerCase().includes(term)
    );
    
    return titleMatch || ingredientsMatch;
  });
};

/**
 * Ordena receitas priorizando o objetivo do usuário
 */
export const sortByGoal = (recipes, userGoal) => {
  return [...recipes].sort((a, b) => {
    // Receitas que combinam com o objetivo do usuário vêm primeiro
    if (a.type === userGoal && b.type !== userGoal) return -1;
    if (a.type !== userGoal && b.type === userGoal) return 1;
    return 0;
  });
};

/**
 * Calcula macros por porção
 */
export const calculatePortionMacros = (recipe, portion = 1) => {
  return {
    kcal: Math.round(recipe.kcal * portion),
    protein: Math.round(recipe.protein * portion),
    carbs: Math.round(recipe.carbs * portion),
    fats: Math.round(recipe.fats * portion),
  };
};

/**
 * Formata número de porção para exibição
 */
export const formatPortion = (portion) => {
  if (portion === 1) return '1 porção';
  if (portion < 1) return `${portion} porção`;
  return `${portion} porções`;
};

/**
 * Verifica se receita é favorita
 */
export const isFavorite = (recipeId, favorites = []) => {
  return favorites.includes(recipeId);
};

/**
 * Toggle favorito (adiciona ou remove)
 */
export const toggleFavorite = (recipeId, favorites = []) => {
  if (favorites.includes(recipeId)) {
    return favorites.filter(id => id !== recipeId);
  }
  return [...favorites, recipeId];
};

/**
 * Valida receita antes de adicionar
 */
export const validateRecipe = (recipe) => {
  if (!recipe) return { valid: false, error: 'Receita inválida' };
  if (!recipe.title) return { valid: false, error: 'Receita sem título' };
  if (!recipe.kcal) return { valid: false, error: 'Receita sem calorias' };
  
  return { valid: true };
};

/**
 * Formata hora atual
 */
export const getCurrentTime = () => {
  return new Date().toLocaleTimeString('pt-PT', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

/**
 * Cria objeto de refeição para adicionar ao dia
 */
export const createMealFromRecipe = (recipe, portion = 1) => {
  const macros = calculatePortionMacros(recipe, portion);
  
  return {
    id: generateMealId(),
    nome: portion === 1 ? recipe.title : `${recipe.title} (${formatPortion(portion)})`,
    kcal: macros.kcal,
    hora: getCurrentTime(),
  };
};

/**
 * Calcula score de recomendação
 */
export const calculateRecommendationScore = (recipe, userGoal) => {
  let score = 0;
  
  // Receitas que combinam com objetivo têm score maior
  if (recipe.type === userGoal) score += 10;
  
  // Proteína alta para ganhar peso
  if (userGoal === GOAL_TYPES.GAIN && recipe.protein > 20) score += 5;
  
  // Calorias moderadas para perder peso
  if (userGoal === GOAL_TYPES.LOSE && recipe.kcal < 400) score += 5;
  
  return score;
};

/**
 * Formata texto de ingredientes para exibição
 */
export const formatIngredient = (ingredient) => {
  return ingredient.charAt(0).toUpperCase() + ingredient.slice(1);
};

/**
 * Conta total de receitas por categoria
 */
export const countByCategory = (recipes, category, favorites = []) => {
  if (category === 'Favoritos') return favorites.length;
  
  return recipes.filter(r => r.category === category).length;
};