/**
 * 🎣 USE RECIPES HOOK - CORRIGIDO
 * Toda a lógica de receitas centralizada
 * 
 * FIX: Melhorada lógica de filtros para funcionar corretamente
 */

import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { receitasPortuguesas } from '../../data/receitasDB';
import { supabase } from '../services/supabase';
import {
    createMealFromRecipe,
    filterByCategory,
    filterBySearch,
    sortByGoal,
    toggleFavorite as toggleFavoriteHelper,
    validateRecipe,
} from '../utils/recipeHelpers';
import { useAuth } from './useAuth';

export const useRecipes = () => {
  const { user } = useAuth();

  // Estados principais
  const [objetivo, setObjetivo] = useState('Perder');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Pequeno-almoço');
  const [pesquisa, setPesquisa] = useState('');
  const [favoritos, setFavoritos] = useState([]);
  const [receitasFiltradas, setReceitasFiltradas] = useState([]);
  
  // Estados de loading
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addingMeal, setAddingMeal] = useState(false);

  // ==========================================
  // FILTRAR RECEITAS (CORRIGIDO)
  // ==========================================

  const aplicarFiltros = useCallback(() => {
    console.log('🔍 Aplicando filtros:', { categoriaAtiva, pesquisa, objetivo });
    
    let filtradas = receitasPortuguesas;
    console.log('📚 Total de receitas:', filtradas.length);

    // 1. Aplicar pesquisa (se houver)
    if (pesquisa.trim().length > 0) {
      filtradas = filterBySearch(filtradas, pesquisa);
      console.log('🔎 Após pesquisa:', filtradas.length);
    } else {
      // 2. Aplicar filtro de categoria (se não houver pesquisa)
      filtradas = filterByCategory(filtradas, categoriaAtiva, favoritos);
      console.log(`📁 Após filtro categoria "${categoriaAtiva}":`, filtradas.length);
    }

    // 3. Ordenar por objetivo do usuário
    filtradas = sortByGoal(filtradas, objetivo);
    console.log('✅ Receitas finais:', filtradas.length);

    setReceitasFiltradas(filtradas);
  }, [categoriaAtiva, pesquisa, favoritos, objetivo]);

  // ==========================================
  // CARREGAR DADOS
  // ==========================================

  const carregarDados = async () => {
    try {
      console.log('📥 Carregando dados do Supabase...');
      
      if (!user?.id) {
        console.log('⚠️ Sem user.id');
        setLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('objetivo, receitas_favoritas')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (profile) {
        console.log('✅ Profile carregado:', profile);
        
        setObjetivo(profile.objetivo || 'Perder');
        const listaFavs = profile.receitas_favoritas || [];
        setFavoritos(listaFavs);
        
        console.log('🎯 Objetivo:', profile.objetivo);
        console.log('❤️ Favoritos:', listaFavs.length);
      }
    } catch (e) {
      console.error('❌ Erro ao carregar dados:', e);
      Alert.alert('Erro', 'Não foi possível carregar as receitas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==========================================
  // APLICAR FILTROS QUANDO MUDAR ESTADOS
  // ==========================================

  useEffect(() => {
    if (!loading) {
      console.log('🔄 Estados mudaram, reaplicando filtros...');
      aplicarFiltros();
    }
  }, [categoriaAtiva, pesquisa, favoritos, objetivo, loading, aplicarFiltros]);

  // ==========================================
  // INICIALIZAÇÃO
  // ==========================================

  const inicializar = useCallback(async () => {
    console.log('🚀 Inicializando useRecipes...');
    setLoading(true);
    await carregarDados();
  }, [user]);

  const onRefresh = useCallback(async () => {
    console.log('🔄 Refresh...');
    setRefreshing(true);
    await carregarDados();
  }, [user]);

  // ==========================================
  // FAVORITOS
  // ==========================================

  const toggleFavorito = async (recipeId) => {
    try {
      if (!user?.id) {
        Alert.alert('Erro', 'É necessário estar autenticado.');
        return;
      }

      const novaLista = toggleFavoriteHelper(recipeId, favoritos);
      setFavoritos(novaLista);

      const { error } = await supabase
        .from('profiles')
        .update({ receitas_favoritas: novaLista })
        .eq('id', user.id);

      if (error) throw error;

      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Erro ao toggle favorito:', error);
      Alert.alert('Erro', 'Não foi possível atualizar favoritos.');
      // Reverter estado
      setFavoritos(favoritos);
    }
  };

  // ==========================================
  // ADICIONAR REFEIÇÃO
  // ==========================================

  const adicionarRefeicao = async (recipe, portion = 1) => {
    // Validar receita
    const validation = validateRecipe(recipe);
    if (!validation.valid) {
      Alert.alert('Erro', validation.error);
      return false;
    }

    setAddingMeal(true);

    try {
      if (!user?.id) {
        Alert.alert('Erro', 'É necessário estar autenticado.');
        return false;
      }

      // Buscar refeições atuais
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('refeicoes_hoje')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      // Criar objeto de refeição
      const novaMeal = createMealFromRecipe(recipe, portion);

      // Adicionar à lista
      const novaLista = [...(profile.refeicoes_hoje || []), novaMeal];

      // Atualizar no Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ refeicoes_hoje: novaLista })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Haptic feedback de sucesso
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      return true;
    } catch (error) {
      console.error('Erro ao adicionar refeição:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erro', 'Não foi possível adicionar a refeição.');
      return false;
    } finally {
      setAddingMeal(false);
    }
  };

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleCategoriaChange = (categoria) => {
    console.log('📂 Mudando categoria para:', categoria);
    setCategoriaAtiva(categoria);
    setPesquisa(''); // Limpar pesquisa ao mudar categoria
  };

  const handlePesquisaChange = (texto) => {
    console.log('🔎 Pesquisando:', texto);
    setPesquisa(texto);
  };

  const handleClearSearch = () => {
    console.log('🧹 Limpando pesquisa');
    setPesquisa('');
  };

  // ==========================================
  // UTILITÁRIOS
  // ==========================================

  const isRecipeFavorite = (recipeId) => {
    return favoritos.includes(recipeId);
  };

  const getRecipeCount = () => {
    return receitasFiltradas.length;
  };

  const getTotalRecipes = () => {
    return receitasPortuguesas.length;
  };

  const getFavoritesCount = () => {
    return favoritos.length;
  };

  // ==========================================
  // RETORNO
  // ==========================================

  return {
    // Estados
    objetivo,
    categoriaAtiva,
    pesquisa,
    favoritos,
    receitasFiltradas,
    loading,
    refreshing,
    addingMeal,

    // Setters
    setCategoriaAtiva: handleCategoriaChange,
    setPesquisa: handlePesquisaChange,

    // Funções principais
    inicializar,
    onRefresh,
    toggleFavorito,
    adicionarRefeicao,
    handleClearSearch,

    // Utilitários
    isRecipeFavorite,
    getRecipeCount,
    getTotalRecipes,
    getFavoritesCount,
  };
};