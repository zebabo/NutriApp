/**
 * 📊 DASHBOARD CONSTANTS
 * Todas as constantes centralizadas
 */

// Metas
export const WATER_GOAL = 2500; // ml
export const MIN_WEIGHT = 30; // kg
export const MAX_WEIGHT = 300; // kg
export const MIN_CALORIES = 0;
export const MAX_CALORIES_PER_MEAL = 3000;

// Quick Add Water
export const QUICK_WATER_AMOUNTS = [100, 250, 500];

// Multiplicadores de calorias
export const SURPLUS_MULTIPLIER = 1.15; // +15% para ganhar peso
export const DEFICIT_MULTIPLIER = 0.85; // -15% para perder peso

// Macros (por kg de peso corporal)
export const PROTEIN_PER_KG = 2.0;
export const FAT_PER_KG = 0.8;

// Calorias por grama
export const CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
};

// Limites de histórico
export const MAX_HISTORY_DAYS = 365;
export const CHART_DAYS_SHOWN = 7;

// Dicas IA por objetivo
export const AI_TIPS = {
  Ganhar: {
    manha: "Panquecas de aveia com banana! 🥞",
    almoco: "150g+ de proteína com arroz. 💪",
    tarde: "Snack: Frutos secos e iogurte. 🥜",
    noite: "Refeição completa antes de dormir. 🍽️",
    foco: "Não saltar refeições! Surplus consistente. 📈"
  },
  Perder: {
    manha: "Ovos mexidos com vegetais. 🍳",
    almoco: "Metade do prato com salada. 🥗",
    tarde: "Fruta ou iogurte proteico. 🍎",
    noite: "Proteína leve com vegetais. 🥦",
    foco: "Foco no défice calórico! Consistência. 📉"
  },
  Manter: {
    manha: "Equilíbrio: Fruta, proteína e fibra. 🍏",
    almoco: "Porções equilibradas. ⚖️",
    tarde: "Snack leve se necessário. 🥄",
    noite: "Refeição moderada. 🍲",
    foco: "Consistência é o segredo. Mantém o ritmo! ✨"
  }
};

// Streaks
export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 90, 180, 365];
export const STREAK_EMOJIS = {
  3: "🔥",
  7: "💪",
  14: "⭐",
  30: "🏆",
  60: "👑",
  90: "💎",
  180: "🚀",
  365: "🌟"
};

// Validation messages
export const VALIDATION_MESSAGES = {
  PESO_INVALIDO: "Peso deve estar entre 30kg e 300kg",
  PESO_VAZIO: "Introduz um peso válido",
  CALORIAS_INVALIDAS: "Calorias devem estar entre 0 e 3000",
  NOME_VAZIO: "Introduz o nome do alimento",
  AGUA_INVALIDA: "Quantidade de água inválida"
};

// Achievement badges
export const ACHIEVEMENTS = {
  FIRST_MEAL: {
    id: 'first_meal',
    title: 'Primeira Refeição!',
    icon: '🍽️',
    description: 'Registaste a tua primeira refeição'
  },
  WATER_GOAL: {
    id: 'water_goal',
    title: 'Hidratado!',
    icon: '💧',
    description: 'Atingiste a meta de água'
  },
  STREAK_7: {
    id: 'streak_7',
    title: 'Uma Semana!',
    icon: '🔥',
    description: '7 dias consecutivos a registar'
  },
  GOAL_REACHED: {
    id: 'goal_reached',
    title: 'Meta Atingida!',
    icon: '🏆',
    description: 'Atingiste o teu peso alvo'
  }
};