/**
 * 🎣 USE DASHBOARD HOOK - MIGRADO PARA daily_logs
 *
 * Mudanças principais:
 * - refeicoes_hoje e agua_hoje saíram de profiles → daily_logs
 * - Reset diário automático eliminado (cada dia é uma linha nova)
 * - Streak calculado a partir dos logs reais
 * - macros reais calculados a partir das refeições (não só do peso)
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import {
  ACHIEVEMENT_DEFINITIONS,
  checkAndAwardAchievements,
} from "../services/achievementService";
import {
  addMeal,
  addWater,
  calculateStreak,
  getDailyLog,
  getRecentLogs,
  getTodayDate,
  getTotalCalories,
  getTotalMacros,
  removeMeal,
  resetWater,
} from "../services/dailyLogService";
import { supabase } from "../services/supabase";
import { MAX_HISTORY_DAYS, WATER_GOAL } from "../utils/dashboardConstants";
import {
  generateMealId,
  validateMeal,
  validateWater,
  validateWeight,
} from "../utils/dashboardValidation";
import {
  calculateMacros,
  calculateTargetCalories,
  calculateTDEE,
  calculateTMB,
  convertWeight,
} from "../utils/nutritionCalculations";
import { useAuth } from "./useAuth";

// Helper: Promise com timeout
const withTimeout = (promise, ms, operation) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`TIMEOUT: ${operation}`)), ms),
  );
  return Promise.race([promise, timeout]);
};

export const useDashboard = () => {
  const { user } = useAuth();

  // ── Perfil biométrico (vem de profiles) ──────────────────────────────────
  const [perfil, setPerfil] = useState(null);

  // ── Log do dia atual (vem de daily_logs) ─────────────────────────────────
  const [dailyLog, setDailyLog] = useState({ meals: [], water_ml: 0 });

  // ── Cálculos nutricionais ─────────────────────────────────────────────────
  const [caloriasAlvo, setCaloriasAlvo] = useState(0);
  const [macrosAlvo, setMacrosAlvo] = useState({
    proteina: 0,
    hidratos: 0,
    gordura: 0,
  });
  const [metaAtingida, setMetaAtingida] = useState(false);

  // ── Streak ────────────────────────────────────────────────────────────────
  const [streak, setStreak] = useState(0);

  // ── Achievements ──────────────────────────────────────────────────────────
  const [achievements, setAchievements] = useState([]);
  const [newAchievement, setNewAchievement] = useState(null); // para o modal

  // ── Preferências ──────────────────────────────────────────────────────────
  const [unidade, setUnidade] = useState("Metric");

  // ── Loading ───────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Inputs ────────────────────────────────────────────────────────────────
  const [novoPeso, setNovoPeso] = useState("");
  const [alimentoNome, setAlimentoNome] = useState("");
  const [alimentoKcal, setAlimentoKcal] = useState("");

  // ── Favoritos locais ──────────────────────────────────────────────────────
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  // ── Controlo de carregamento ──────────────────────────────────────────────
  const isFirstLoad = useRef(true);
  const isLoadingRef = useRef(false);

  // ==========================================================================
  // CARREGAMENTO
  // ==========================================================================

  const carregarPreferencias = async () => {
    try {
      const savedUnit = await AsyncStorage.getItem("@unit_system");
      if (savedUnit) setUnidade(savedUnit);

      const savedFavorites = await AsyncStorage.getItem("@favorite_foods");
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    } catch (e) {
      console.error("Erro ao carregar preferências:", e);
    }
  };

  const carregarDados = async () => {
    if (isLoadingRef.current) {
      console.log("⚠️ [carregarDados] Já está a carregar - ignorando");
      return;
    }

    console.log("🚀 [carregarDados] INÍCIO");
    isLoadingRef.current = true;

    try {
      if (!user?.id) return;

      // ── 1. Buscar perfil biométrico ──────────────────────────────────────
      const { data: profileDB, error: profileError } = await withTimeout(
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        10000,
        "fetch_profile",
      );

      if (profileError) throw profileError;

      if (!profileDB) {
        console.warn("⚠️ Perfil não encontrado");
        return;
      }

      // ── 2. Buscar log de hoje ────────────────────────────────────────────
      const { data: logHoje, error: logError } = await withTimeout(
        getDailyLog(user.id, getTodayDate()),
        8000,
        "fetch_daily_log",
      );

      if (logError) throw logError;

      // ── 3. Buscar logs recentes para streak ──────────────────────────────
      const { data: logsRecentes } = await getRecentLogs(user.id, 30);
      const streakAtual = calculateStreak(logsRecentes);

      // ── 4. Normalizar perfil ─────────────────────────────────────────────
      const hoje = getTodayDate();

      // ── 5. Atualizar estado ──────────────────────────────────────────────
      const perfilNormalizado = {
        ...profileDB,
        pesoAtual: profileDB.peso_atual,
        pesoAlvo: profileDB.peso_alvo,
        fatorAtividade: profileDB.fator_atividade,
        historico: profileDB.historico || [
          { data: hoje, peso: profileDB.peso_atual },
        ],
      };

      setPerfil(perfilNormalizado);
      setDailyLog(logHoje || { meals: [], water_ml: 0 });
      setStreak(streakAtual);
      setAchievements(profileDB.achievements || []);
      calcularTudo(perfilNormalizado);

      console.log("✅ [carregarDados] COMPLETO");
    } catch (e) {
      console.error("❌ [carregarDados] EXCEÇÃO:", e.message);
      Alert.alert("Erro", e.message || "Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
      setRefreshing(false);
      isLoadingRef.current = false;
    }
  };

  // Carregamento automático no mount
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    if (!isFirstLoad.current) return;

    isFirstLoad.current = false;
    const carregar = async () => {
      setLoading(true);
      await carregarPreferencias();
      await carregarDados();
    };
    carregar();
  }, [user?.id]);

  const inicializar = useCallback(async () => {
    isFirstLoad.current = false;
    setLoading(true);
    await carregarPreferencias();
    await carregarDados();
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregarPreferencias();
    await carregarDados();
  }, [user]);

  // ==========================================================================
  // ACHIEVEMENTS
  // ==========================================================================

  const verificarAchievements = async (
    logAtualizado,
    streakAtual,
    perfilAtualizado,
  ) => {
    if (!user?.id) return;

    try {
      const novos = await checkAndAwardAchievements(user.id, {
        achievements,
        streak: streakAtual ?? streak,
        dailyLog: logAtualizado ?? dailyLog,
        perfil: perfilAtualizado ?? { metaAtingida },
      });

      if (novos.length > 0) {
        // Atualizar lista local
        setAchievements((prev) => [...prev, ...novos]);

        // Mostrar modal para o primeiro novo achievement
        // Os restantes serão visíveis no banner
        const def = ACHIEVEMENT_DEFINITIONS[novos[0].id];
        if (def) setNewAchievement(def);
      }
    } catch (e) {
      console.warn(
        "⚠️ verificarAchievements falhou silenciosamente:",
        e.message,
      );
    }
  };

  // ==========================================================================
  // CÁLCULOS NUTRICIONAIS
  // ==========================================================================

  const calcularTudo = (dados) => {
    const peso = parseFloat(dados.pesoAtual);
    const altura = parseFloat(dados.altura);
    const idade = parseInt(dados.idade);
    const fatorAtividade = parseFloat(dados.fatorAtividade);
    const pesoAlvo = parseFloat(dados.pesoAlvo);

    if (!peso || !altura || !idade || !fatorAtividade) return;

    const tmb = calculateTMB(peso, altura, idade, dados.sexo);
    const tdee = calculateTDEE(tmb, fatorAtividade);
    const { calories, metaAtingida: meta } = calculateTargetCalories(
      tdee,
      dados.objetivo,
      peso,
      pesoAlvo,
    );

    setMetaAtingida(meta);
    setCaloriasAlvo(calories);
    setMacrosAlvo(calculateMacros(peso, calories));
  };

  // Calorias consumidas hoje (calculadas a partir do dailyLog)
  const calcularConsumidasHoje = () => getTotalCalories(dailyLog);

  // Calorias que faltam
  const calcularFaltam = () => caloriasAlvo - calcularConsumidasHoje();

  // Macros reais consumidos hoje
  const calcularMacrosHoje = () => getTotalMacros(dailyLog);

  // ==========================================================================
  // ÁGUA
  // ==========================================================================

  const adicionarAgua = async (qtd) => {
    if (!user?.id) return;

    const validation = validateWater(qtd);
    if (!validation.valid) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", validation.error);
      return;
    }

    // Otimistic update — atualiza UI imediatamente
    const novoTotal = (dailyLog.water_ml || 0) + validation.value;
    setDailyLog((prev) => ({ ...prev, water_ml: novoTotal }));

    try {
      const { error } = await addWater(user.id, validation.value);
      if (error) throw error;

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (novoTotal >= WATER_GOAL && (dailyLog.water_ml || 0) < WATER_GOAL) {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
        Alert.alert("🎉 Meta de Água!", "Atingiste a meta diária de água!");
      }
    } catch (error) {
      // Reverter em caso de erro
      setDailyLog((prev) => ({ ...prev, water_ml: dailyLog.water_ml }));
      console.error("Erro ao adicionar água:", error);
      Alert.alert("Erro", "Não foi possível adicionar água.");
    }
  };

  const adicionarAguaManual = async (qtd) => {
    await adicionarAgua(qtd);
  };

  const resetarAgua = async () => {
    if (!user?.id) return;

    Alert.alert("Resetar Água", "Tens a certeza?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sim, Resetar",
        style: "destructive",
        onPress: async () => {
          // Otimistic update
          setDailyLog((prev) => ({ ...prev, water_ml: 0 }));

          try {
            const { error } = await resetWater(user.id);
            if (error) throw error;
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } catch (error) {
            setDailyLog((prev) => ({ ...prev, water_ml: dailyLog.water_ml }));
            Alert.alert("Erro", "Não foi possível resetar a água.");
          }
        },
      },
    ]);
  };

  // ==========================================================================
  // REFEIÇÕES
  // ==========================================================================

  const adicionarAlimento = async () => {
    if (!user?.id) return;

    const validation = validateMeal(alimentoNome, alimentoKcal);
    if (!validation.valid) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", validation.error);
      return;
    }

    const novaRefeicao = {
      id: generateMealId(),
      nome: validation.meal.nome,
      kcal: validation.meal.calorias,
      // Campos de macros — por agora 0 até integrares pesquisa de alimentos
      proteina: 0,
      hidratos: 0,
      gordura: 0,
      hora: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Otimistic update
    const novaLista = [...(dailyLog.meals || []), novaRefeicao];
    setDailyLog((prev) => ({ ...prev, meals: novaLista }));
    setAlimentoNome("");
    setAlimentoKcal("");

    try {
      const { error } = await addMeal(user.id, novaRefeicao);
      if (error) throw error;
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Verificar achievements após nova refeição
      await verificarAchievements({ ...dailyLog, meals: novaLista });
    } catch (error) {
      // Reverter
      setDailyLog((prev) => ({ ...prev, meals: dailyLog.meals }));
      setAlimentoNome(alimentoNome);
      setAlimentoKcal(alimentoKcal);
      console.error("Erro ao adicionar alimento:", error);
      Alert.alert("Erro", "Não foi possível adicionar o alimento.");
    }
  };

  const removerAlimento = async (id) => {
    if (!user?.id) return;

    Alert.alert("Remover Refeição", "Tens a certeza?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          // Otimistic update
          const listaAnterior = dailyLog.meals;
          const novaLista = (dailyLog.meals || []).filter((m) => m.id !== id);
          setDailyLog((prev) => ({ ...prev, meals: novaLista }));

          try {
            const { error } = await removeMeal(user.id, id);
            if (error) throw error;
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } catch (error) {
            setDailyLog((prev) => ({ ...prev, meals: listaAnterior }));
            Alert.alert("Erro", "Não foi possível remover o alimento.");
          }
        },
      },
    ]);
  };

  // ==========================================================================
  // FAVORITOS (AsyncStorage local — não muda)
  // ==========================================================================

  const adicionarFavorito = async () => {
    if (!alimentoNome || !alimentoKcal) {
      Alert.alert("Erro", "Preenche o nome e calorias primeiro");
      return;
    }

    const validation = validateMeal(alimentoNome, alimentoKcal);
    if (!validation.valid) {
      Alert.alert("Erro", validation.error);
      return;
    }

    const novoFavorito = {
      id: generateMealId(),
      nome: validation.meal.nome,
      kcal: validation.meal.calorias,
    };

    const novosFavoritos = [...favorites, novoFavorito];
    setFavorites(novosFavoritos);

    try {
      await AsyncStorage.setItem(
        "@favorite_foods",
        JSON.stringify(novosFavoritos),
      );
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("✅ Favorito", "Alimento adicionado aos favoritos!");
    } catch (e) {
      console.error("Erro ao salvar favorito:", e);
    }
  };

  const removerFavorito = async (id) => {
    const novosFavoritos = favorites.filter((f) => f.id !== id);
    setFavorites(novosFavoritos);
    try {
      await AsyncStorage.setItem(
        "@favorite_foods",
        JSON.stringify(novosFavoritos),
      );
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      console.error("Erro ao remover favorito:", e);
    }
  };

  const adicionarDeFavoritos = (favorito) => {
    setAlimentoNome(favorito.nome);
    setAlimentoKcal(favorito.kcal.toString());
    setShowFavorites(false);
  };

  // ==========================================================================
  // PESO
  // ==========================================================================

  const registarPeso = async () => {
    if (!perfil) {
      Alert.alert("Erro", "Perfil não carregado.");
      return;
    }

    if (!novoPeso) {
      Alert.alert("Erro", "Introduz um peso válido");
      return;
    }

    const validation = validateWeight(novoPeso, unidade);
    if (!validation.valid) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", validation.error);
      return;
    }

    try {
      const pesoKg = validation.value;
      const hoje = getTodayDate();

      const novoHist = [
        ...(perfil.historico || []),
        { data: hoje, peso: pesoKg.toFixed(2) },
      ].slice(-MAX_HISTORY_DAYS);

      const { error } = await supabase
        .from("profiles")
        .update({ peso_atual: pesoKg, historico: novoHist })
        .eq("id", perfil.id);

      if (error) throw error;

      const atualizado = { ...perfil, pesoAtual: pesoKg, historico: novoHist };
      setPerfil(atualizado);
      calcularTudo(atualizado);
      setNovoPeso("");

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("✅ Sucesso", "Peso atualizado!");
    } catch (error) {
      console.error("Erro ao registar peso:", error);
      Alert.alert("Erro", "Não foi possível atualizar o peso.");
    }
  };

  // ==========================================================================
  // UTILITÁRIOS
  // ==========================================================================

  const exibirPeso = (valorKg) => {
    const num = parseFloat(valorKg);
    if (isNaN(num)) return "--";
    const converted = convertWeight(num, unidade);
    const unitLabel = unidade === "Imperial" ? "lb" : "kg";
    return `${converted}${unitLabel}`;
  };

  // ==========================================================================
  // RETORNO
  // ==========================================================================

  return {
    // Dados
    perfil,
    dailyLog,
    streak,
    achievements,
    newAchievement,
    setNewAchievement,
    caloriasAlvo,
    macrosAlvo, // macros ALVO (baseados no peso)
    metaAtingida,
    unidade,

    // Loading
    loading,
    refreshing,

    // Inputs
    novoPeso,
    setNovoPeso,
    alimentoNome,
    setAlimentoNome,
    alimentoKcal,
    setAlimentoKcal,

    // Favoritos
    favorites,
    showFavorites,
    setShowFavorites,

    // Funções
    inicializar,
    onRefresh,
    adicionarAgua,
    adicionarAguaManual,
    resetAgua: resetarAgua,
    adicionarAlimento,
    removerAlimento,
    adicionarFavorito,
    removerFavorito,
    adicionarDeFavoritos,
    registarPeso,
    exibirPeso,

    // Cálculos
    calcularConsumidasHoje,
    calcularFaltam,
    calcularMacrosHoje, // ← NOVO: macros reais do dia

    // Constantes
    metaAgua: WATER_GOAL,
  };
};
