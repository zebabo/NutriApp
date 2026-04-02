import { supabase } from "./supabase";

/**
 * 📅 DAILY LOG SERVICE
 * Todas as operações na tabela daily_logs
 *
 * Estrutura de um log:
 * {
 *   id: uuid,
 *   user_id: uuid,
 *   date: '2025-01-15',
 *   meals: [{ id, nome, kcal, proteina, hidratos, gordura, hora }],
 *   water_ml: 1500,
 *   created_at, updated_at
 * }
 */

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Retorna a data de hoje no formato YYYY-MM-DD (sem hora, sem timezone issues)
 */
export const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Formata uma data Date() para YYYY-MM-DD
 */
export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ─── Obter log ───────────────────────────────────────────────────────────────

/**
 * Obtém o log de um dia específico (ou cria um vazio se não existir)
 * @param {string} userId
 * @param {string} date - formato YYYY-MM-DD (default: hoje)
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export const getDailyLog = async (userId, date = getTodayDate()) => {
  try {
    const { data, error } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .single();

    // PGRST116 = não encontrou registo (é normal, ainda não existe)
    if (error?.code === "PGRST116") {
      return {
        data: { user_id: userId, date, meals: [], water_ml: 0 },
        error: null,
      };
    }

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error("❌ [getDailyLog] Erro:", error);
    return { data: null, error };
  }
};

/**
 * Obtém os logs dos últimos N dias
 * Útil para histórico, gráficos, etc.
 * @param {string} userId
 * @param {number} days - quantos dias para trás (default: 30)
 * @returns {Promise<{ data: array, error: object|null }>}
 */
export const getRecentLogs = async (userId, days = 30) => {
  try {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    const fromDateStr = formatDate(fromDate);

    const { data, error } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("date", fromDateStr)
      .order("date", { ascending: false });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error("❌ [getRecentLogs] Erro:", error);
    return { data: [], error };
  }
};

/**
 * Obtém logs entre duas datas
 * @param {string} userId
 * @param {string} fromDate - YYYY-MM-DD
 * @param {string} toDate - YYYY-MM-DD
 */
export const getLogsBetweenDates = async (userId, fromDate, toDate) => {
  try {
    const { data, error } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("date", fromDate)
      .lte("date", toDate)
      .order("date", { ascending: true });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error("❌ [getLogsBetweenDates] Erro:", error);
    return { data: [], error };
  }
};

// ─── Upsert log (criar ou atualizar) ─────────────────────────────────────────

/**
 * Cria ou atualiza o log de um dia
 * Usa upsert com UNIQUE(user_id, date) — nunca duplica
 * @param {string} userId
 * @param {string} date
 * @param {object} updates - { meals?, water_ml? }
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export const upsertDailyLog = async (
  userId,
  date = getTodayDate(),
  updates = {},
) => {
  try {
    const { data, error } = await supabase
      .from("daily_logs")
      .upsert(
        {
          user_id: userId,
          date,
          ...updates,
        },
        {
          onConflict: "user_id,date", // usa o UNIQUE constraint
          ignoreDuplicates: false, // faz update se já existir
        },
      )
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error("❌ [upsertDailyLog] Erro:", error);
    return { data: null, error };
  }
};

// ─── Refeições ────────────────────────────────────────────────────────────────

/**
 * Adiciona uma refeição ao log de hoje
 * @param {string} userId
 * @param {object} meal - { id, nome, kcal, proteina, hidratos, gordura, hora }
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export const addMeal = async (userId, meal) => {
  try {
    const today = getTodayDate();

    // 1. Buscar log atual (ou criar vazio)
    const { data: log, error: fetchError } = await getDailyLog(userId, today);
    if (fetchError) throw fetchError;

    // 2. Adicionar refeição à lista
    const updatedMeals = [...(log.meals || []), meal];

    // 3. Guardar
    const { data, error } = await upsertDailyLog(userId, today, {
      meals: updatedMeals,
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error("❌ [addMeal] Erro:", error);
    return { data: null, error };
  }
};

/**
 * Remove uma refeição do log de hoje pelo id
 * @param {string} userId
 * @param {string} mealId
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export const removeMeal = async (userId, mealId) => {
  try {
    const today = getTodayDate();

    const { data: log, error: fetchError } = await getDailyLog(userId, today);
    if (fetchError) throw fetchError;

    const updatedMeals = (log.meals || []).filter((m) => m.id !== mealId);

    const { data, error } = await upsertDailyLog(userId, today, {
      meals: updatedMeals,
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error("❌ [removeMeal] Erro:", error);
    return { data: null, error };
  }
};

// ─── Água ─────────────────────────────────────────────────────────────────────

/**
 * Adiciona água ao log de hoje
 * @param {string} userId
 * @param {number} ml - quantidade a adicionar (ex: 250)
 * @returns {Promise<{ data: object|null, newTotal: number, error: object|null }>}
 */
export const addWater = async (userId, ml) => {
  try {
    const today = getTodayDate();

    const { data: log, error: fetchError } = await getDailyLog(userId, today);
    if (fetchError) throw fetchError;

    const newTotal = (log.water_ml || 0) + ml;

    const { data, error } = await upsertDailyLog(userId, today, {
      water_ml: newTotal,
    });

    if (error) throw error;

    return { data, newTotal, error: null };
  } catch (error) {
    console.error("❌ [addWater] Erro:", error);
    return { data: null, newTotal: 0, error };
  }
};

/**
 * Reset da água do dia para 0
 * @param {string} userId
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export const resetWater = async (userId) => {
  try {
    const today = getTodayDate();

    const { data, error } = await upsertDailyLog(userId, today, {
      water_ml: 0,
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error("❌ [resetWater] Erro:", error);
    return { data: null, error };
  }
};

// ─── Estatísticas ─────────────────────────────────────────────────────────────

/**
 * Calcula total de calorias de um log
 * @param {object} log
 * @returns {number}
 */
export const getTotalCalories = (log) => {
  if (!log?.meals?.length) return 0;
  return log.meals.reduce((total, meal) => total + (meal.kcal || 0), 0);
};

/**
 * Calcula macros totais de um log
 * @param {object} log
 * @returns {{ proteina: number, hidratos: number, gordura: number }}
 */
export const getTotalMacros = (log) => {
  if (!log?.meals?.length) return { proteina: 0, hidratos: 0, gordura: 0 };

  return log.meals.reduce(
    (totais, meal) => ({
      proteina: totais.proteina + (meal.proteina || 0),
      hidratos: totais.hidratos + (meal.hidratos || 0),
      gordura: totais.gordura + (meal.gordura || 0),
    }),
    { proteina: 0, hidratos: 0, gordura: 0 },
  );
};

/**
 * Calcula streak de dias consecutivos com pelo menos 1 refeição registada
 * @param {array} logs - array de logs ordenados por data DESC
 * @returns {number}
 */
export const calculateStreak = (logs) => {
  if (!logs?.length) return 0;

  const today = getTodayDate();
  let streak = 0;
  let checkDate = new Date();

  // Ordenar por data DESC para garantir
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));

  for (const log of sorted) {
    const expectedDate = formatDate(checkDate);

    // Se o log é do dia esperado e tem refeições
    if (log.date === expectedDate && log.meals?.length > 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1); // vai para o dia anterior
    } else if (log.date === expectedDate && log.meals?.length === 0) {
      // Dia sem refeições — quebra o streak (exceto hoje)
      if (log.date !== today) break;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // Gap nos dias — streak acabou
      break;
    }
  }

  return streak;
};
