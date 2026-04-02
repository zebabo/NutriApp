/**
 * 🏆 ACHIEVEMENT SERVICE
 * Lógica centralizada de streaks e achievements
 *
 * Achievements disponíveis:
 * - first_meal       → primeira refeição registada
 * - streak_3         → 3 dias consecutivos
 * - streak_7         → 7 dias consecutivos
 * - streak_14        → 14 dias consecutivos
 * - streak_30        → 30 dias consecutivos
 * - goal_reached     → peso alvo atingido
 */

import { supabase } from "./supabase";

// ─── Definição de todos os achievements ──────────────────────────────────────

export const ACHIEVEMENT_DEFINITIONS = {
  first_meal: {
    id: "first_meal",
    title: "Primeira Refeição!",
    description:
      "Registaste a tua primeira refeição. O início é o mais difícil! 💪",
    icon: "🍽️",
    color: "#32CD32",
  },
  streak_3: {
    id: "streak_3",
    title: "3 Dias Seguidos!",
    description:
      "Registaste refeições 3 dias consecutivos. Estás a criar um hábito! 🔥",
    icon: "🔥",
    color: "#FF6B35",
  },
  streak_7: {
    id: "streak_7",
    title: "Uma Semana!",
    description: "7 dias sem falhar. Isto já é um hábito a sério! 💪",
    icon: "💪",
    color: "#FF6B35",
  },
  streak_14: {
    id: "streak_14",
    title: "Duas Semanas!",
    description: "14 dias consecutivos. Estás completamente dedicado! ⭐",
    icon: "⭐",
    color: "#FFD700",
  },
  streak_30: {
    id: "streak_30",
    title: "Um Mês Inteiro!",
    description: "30 dias seguidos. Lendário! 🏆",
    icon: "🏆",
    color: "#FFD700",
  },
  goal_reached: {
    id: "goal_reached",
    title: "Meta Atingida!",
    description: "Chegaste ao teu peso alvo. Trabalho incrível! 🎯",
    icon: "🎯",
    color: "#32CD32",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Verifica se um achievement já foi ganho
 */
export const hasAchievement = (achievements = [], id) => {
  return achievements.some((a) => a.id === id);
};

/**
 * Cria um novo achievement com timestamp
 */
const createAchievement = (id) => ({
  id,
  unlockedAt: new Date().toISOString(),
});

// ─── Verificações ─────────────────────────────────────────────────────────────

/**
 * Verifica e atribui achievements com base no estado atual
 * Retorna array de achievements NOVOS (para mostrar popup)
 *
 * @param {string} userId
 * @param {object} context - { achievements, streak, dailyLog, perfil }
 * @returns {Promise<Achievement[]>} - novos achievements ganhos
 */
export const checkAndAwardAchievements = async (userId, context) => {
  const { achievements = [], streak = 0, dailyLog = {}, perfil = {} } = context;

  const novos = [];

  // ── 1. Primeira refeição ──────────────────────────────────────────────────
  if (
    !hasAchievement(achievements, "first_meal") &&
    (dailyLog.meals?.length ?? 0) >= 1
  ) {
    novos.push(createAchievement("first_meal"));
  }

  // ── 2. Streaks ────────────────────────────────────────────────────────────
  const streakMilestones = [
    { days: 3, id: "streak_3" },
    { days: 7, id: "streak_7" },
    { days: 14, id: "streak_14" },
    { days: 30, id: "streak_30" },
  ];

  for (const milestone of streakMilestones) {
    if (
      streak >= milestone.days &&
      !hasAchievement(achievements, milestone.id) &&
      // Só atribuir se ainda não está nos novos desta sessão
      !novos.find((n) => n.id === milestone.id)
    ) {
      novos.push(createAchievement(milestone.id));
    }
  }

  // ── 4. Meta de peso ───────────────────────────────────────────────────────
  if (!hasAchievement(achievements, "goal_reached") && perfil?.metaAtingida) {
    novos.push(createAchievement("goal_reached"));
  }

  // ── Guardar no Supabase se houver novos ───────────────────────────────────
  if (novos.length > 0) {
    const listaAtualizada = [...achievements, ...novos];

    const { error } = await supabase
      .from("profiles")
      .update({ achievements: listaAtualizada })
      .eq("id", userId);

    if (error) {
      console.error(
        "❌ [achievementService] Erro ao guardar achievements:",
        error,
      );
      return []; // não mostrar popup se falhou a guardar
    }

    console.log(
      "🏆 [achievementService] Novos achievements:",
      novos.map((a) => a.id),
    );
  }

  return novos;
};

/**
 * Busca todos os achievements do utilizador
 */
export const getUserAchievements = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("achievements")
      .eq("id", userId)
      .single();

    if (error) throw error;

    return { data: data?.achievements || [], error: null };
  } catch (error) {
    console.error("❌ [getUserAchievements] Erro:", error);
    return { data: [], error };
  }
};

/**
 * Retorna os achievements enriquecidos com a definição (para mostrar na UI)
 */
export const getEnrichedAchievements = (achievements = []) => {
  return achievements
    .map((a) => ({
      ...ACHIEVEMENT_DEFINITIONS[a.id],
      unlockedAt: a.unlockedAt,
    }))
    .filter(Boolean) // remove achievements com id desconhecido
    .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt)); // mais recentes primeiro
};
