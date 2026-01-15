/**
 * 🍽️ RECIPE CONSTANTS
 * Constantes centralizadas para receitas
 */

// Categorias de refeições
export const CATEGORIES = [
  { id: 'favorites', label: 'Favoritos', icon: '❤️' },
  { id: 'breakfast', label: 'Pequeno-almoço', icon: '🌅' },
  { id: 'lunch', label: 'Almoço', icon: '🍽️' },
  { id: 'snack', label: 'Lanche', icon: '🥤' },
  { id: 'dinner', label: 'Jantar', icon: '🌙' },
];

// Mapeamento para DB (português)
export const CATEGORY_MAP = {
  'Pequeno-almoço': 'breakfast',
  'Almoço': 'lunch',
  'Lanche': 'snack',
  'Jantar': 'dinner',
};

export const CATEGORY_MAP_REVERSE = {
  'breakfast': 'Pequeno-almoço',
  'lunch': 'Almoço',
  'snack': 'Lanche',
  'dinner': 'Jantar',
};

// Tipos de objetivo
export const GOAL_TYPES = {
  LOSE: 'Perder',
  GAIN: 'Ganhar',
  MAINTAIN: 'Manter',
};

// Badges de recomendação
export const RECOMMENDATION_BADGES = {
  [GOAL_TYPES.LOSE]: {
    text: 'IDEAL PARA PERDER',
    color: '#E74C3C',
    bgColor: '#E74C3C22',
  },
  [GOAL_TYPES.GAIN]: {
    text: 'IDEAL PARA GANHAR',
    color: '#32CD32',
    bgColor: '#32CD3222',
  },
  [GOAL_TYPES.MAINTAIN]: {
    text: 'IDEAL PARA MANTER',
    color: '#3498DB',
    bgColor: '#3498DB22',
  },
};

// Limites e configurações
export const PORTION_MIN = 0.5;
export const PORTION_MAX = 5;
export const PORTION_STEP = 0.5;
export const DEFAULT_PORTION = 1;

// Textos
export const EMPTY_STATES = {
  NO_FAVORITES: 'Ainda não tens receitas favoritas.\nToca no ❤️ para adicionar!',
  NO_RECIPES: 'Nenhuma receita encontrada.',
  NO_SEARCH_RESULTS: 'Nenhum resultado para esta pesquisa.',
  LOADING: 'A carregar receitas...',
};

// Mensagens de sucesso
export const SUCCESS_MESSAGES = {
  RECIPE_ADDED: '✅ Receita adicionada ao teu dia!',
  FAVORITE_ADDED: '❤️ Adicionado aos favoritos!',
  FAVORITE_REMOVED: '💔 Removido dos favoritos.',
};

// Ícones de macros
export const MACRO_ICONS = {
  calories: '🔥',
  protein: '💪',
  carbs: '🍞',
  fats: '🥑',
};

// Cache config
export const IMAGE_CACHE_DURATION = 86400000; // 24 horas em ms