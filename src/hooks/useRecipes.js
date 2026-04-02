/**
 * 🎣 USE RECIPES HOOK - MIGRADO PARA daily_logs
 *
 * Mudança principal:
 * - adicionarRefeicao → usa dailyLogService.addMeal (daily_logs)
 * - createMealFromRecipe → agora inclui proteina, hidratos, gordura
 */

import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { receitasPortuguesas } from "../../data/receitasDB";
import { addMeal } from "../services/dailyLogService";
import { supabase } from "../services/supabase";
import {
  filterByCategory,
  filterBySearch,
  sortByGoal,
  toggleFavorite as toggleFavoriteHelper,
  validateRecipe,
} from "../utils/recipeHelpers";
import { useAuth } from "./useAuth";

export const useRecipes = () => {
  const { user } = useAuth();

  const [objetivo, setObjetivo] = useState("Perder");
  const [categoriaAtiva, setCategoriaAtiva] = useState("Pequeno-almoço");
  const [pesquisa, setPesquisa] = useState("");
  const [favoritos, setFavoritos] = useState([]);
  const [receitasFiltradas, setReceitasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addingMeal, setAddingMeal] = useState(false);

  // ── Filtrar receitas ────────────────────────────────────────────────────

  const aplicarFiltros = useCallback(() => {
    let filtradas = receitasPortuguesas;

    if (pesquisa.trim().length > 0) {
      filtradas = filterBySearch(filtradas, pesquisa);
    } else {
      filtradas = filterByCategory(filtradas, categoriaAtiva, favoritos);
    }

    filtradas = sortByGoal(filtradas, objetivo);
    setReceitasFiltradas(filtradas);
  }, [categoriaAtiva, pesquisa, favoritos, objetivo]);

  useEffect(() => {
    if (!loading) aplicarFiltros();
  }, [categoriaAtiva, pesquisa, favoritos, objetivo, loading, aplicarFiltros]);

  // ── Carregar dados do perfil ────────────────────────────────────────────

  const carregarDados = async () => {
    try {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("objetivo, receitas_favoritas")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (profile) {
        setObjetivo(profile.objetivo || "Perder");
        setFavoritos(profile.receitas_favoritas || []);
      }
    } catch (e) {
      console.error("❌ Erro ao carregar receitas:", e);
      Alert.alert("Erro", "Não foi possível carregar as receitas.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const inicializar = useCallback(async () => {
    setLoading(true);
    await carregarDados();
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregarDados();
  }, [user]);

  // ── Favoritos ──────────────────────────────────────────────────────────

  const toggleFavorito = async (recipeId) => {
    try {
      if (!user?.id) return;

      const listaAnterior = favoritos;
      const novaLista = toggleFavoriteHelper(recipeId, favoritos);
      setFavoritos(novaLista); // otimistic update

      const { error } = await supabase
        .from("profiles")
        .update({ receitas_favoritas: novaLista })
        .eq("id", user.id);

      if (error) throw error;

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("Erro ao toggle favorito:", error);
      setFavoritos(favoritos); // reverter
      Alert.alert("Erro", "Não foi possível atualizar favoritos.");
    }
  };

  // ── Adicionar receita ao diário ────────────────────────────────────────

  const adicionarRefeicao = async (recipe, portion = 1) => {
    const validation = validateRecipe(recipe);
    if (!validation.valid) {
      Alert.alert("Erro", validation.error);
      return false;
    }

    setAddingMeal(true);

    try {
      if (!user?.id) {
        Alert.alert("Erro", "É necessário estar autenticado.");
        return false;
      }

      // Criar refeição COM macros completos (as receitas já têm protein, carbs, fats)
      const novaMeal = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        nome: portion === 1 ? recipe.title : `${recipe.title} (${portion}x)`,
        kcal: Math.round(recipe.kcal * portion),
        proteina: Math.round((recipe.protein || 0) * portion),
        hidratos: Math.round((recipe.carbs || 0) * portion),
        gordura: Math.round((recipe.fats || 0) * portion),
        hora: new Date().toLocaleTimeString("pt-PT", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        receitaId: recipe.id, // referência para saber de onde veio
      };

      // ← AGORA vai para daily_logs (não para profiles)
      const { error } = await addMeal(user.id, novaMeal);
      if (error) throw error;

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return true;
    } catch (error) {
      console.error("Erro ao adicionar refeição:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", "Não foi possível adicionar a refeição.");
      return false;
    } finally {
      setAddingMeal(false);
    }
  };

  // ── Handlers ───────────────────────────────────────────────────────────

  const handleCategoriaChange = (categoria) => {
    setCategoriaAtiva(categoria);
    setPesquisa("");
  };

  const handleClearSearch = () => setPesquisa("");

  // ── Utilitários ────────────────────────────────────────────────────────

  const isRecipeFavorite = (recipeId) => favoritos.includes(recipeId);
  const getFavoritesCount = () => favoritos.length;
  const getRecipeCount = () => receitasFiltradas.length;
  const getTotalRecipes = () => receitasPortuguesas.length;

  return {
    objetivo,
    categoriaAtiva,
    pesquisa,
    favoritos,
    receitasFiltradas,
    loading,
    refreshing,
    addingMeal,
    setCategoriaAtiva: handleCategoriaChange,
    setPesquisa,
    inicializar,
    onRefresh,
    toggleFavorito,
    adicionarRefeicao,
    handleClearSearch,
    isRecipeFavorite,
    getRecipeCount,
    getTotalRecipes,
    getFavoritesCount,
  };
};
