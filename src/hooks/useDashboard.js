/**
 * 🎣 USE DASHBOARD HOOK
 * Toda a lógica do Dashboard centralizada
 * DashboardScreen fica APENAS com JSX!
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../services/supabase';
import {
    MAX_HISTORY_DAYS,
    WATER_GOAL,
} from '../utils/dashboardConstants';
import {
    generateMealId,
    isToday,
    validateMeal,
    validateWater,
    validateWeight,
} from '../utils/dashboardValidation';
import {
    calculateMacros,
    calculateTargetCalories,
    calculateTDEE,
    calculateTMB,
    convertWeight
} from '../utils/nutritionCalculations';
import { useAuth } from './useAuth';

export const useDashboard = () => {
  const { user } = useAuth();

  // Estados principais
  const [perfil, setPerfil] = useState(null);
  const [caloriasAlvo, setCaloriasAlvo] = useState(0);
  const [macros, setMacros] = useState({ proteina: 0, hidratos: 0, gordura: 0 });
  const [metaAtingida, setMetaAtingida] = useState(false);
  const [unidade, setUnidade] = useState('Metric');
  
  // Estados de loading
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados de input
  const [novoPeso, setNovoPeso] = useState('');
  const [alimentoNome, setAlimentoNome] = useState('');
  const [alimentoKcal, setAlimentoKcal] = useState('');
  
  // Estados de favoritos
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  // ==========================================
  // INICIALIZAÇÃO
  // ==========================================

  const carregarPreferencias = async () => {
    try {
      const savedUnit = await AsyncStorage.getItem('@unit_system');
      if (savedUnit) setUnidade(savedUnit);
      
      const savedFavorites = await AsyncStorage.getItem('@favorite_foods');
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    } catch (e) {
      console.error("Erro ao carregar preferências:", e);
    }
  };

  const carregarDados = async () => {
    try {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const { data: profileDB, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (profileDB) {
        const hoje = new Date().toISOString().split('T')[0];
        let dadosTratados = { ...profileDB };

        // Reset diário automático
        if (!isToday(profileDB.ultima_data)) {
          const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({
              agua_hoje: 0,
              refeicoes_hoje: [],
              ultima_data: hoje,
            })
            .eq('id', user.id)
            .select()
            .single();

          if (!updateError && updatedProfile) {
            dadosTratados = updatedProfile;
          }
        }

        // Normalizar dados
        const obj = {
          ...dadosTratados,
          pesoAtual: dadosTratados.peso_atual,
          pesoAlvo: dadosTratados.peso_alvo,
          fatorAtividade: dadosTratados.fator_atividade,
          historico: dadosTratados.historico || [
            { data: hoje, peso: dadosTratados.peso_atual }
          ],
          streak: dadosTratados.streak || 0,
        };

        setPerfil(obj);
        calcularTudo(obj);
      }
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
      Alert.alert("Erro", "Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const inicializar = useCallback(async () => {
    setLoading(true);
    await carregarPreferencias();
    await carregarDados();
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregarPreferencias();
    await carregarDados();
  }, [user]);

  // ==========================================
  // CÁLCULOS
  // ==========================================

  const calcularTudo = (dados) => {
    const peso = parseFloat(dados.pesoAtual);
    const altura = parseFloat(dados.altura);
    const idade = parseInt(dados.idade);
    const fatorAtividade = parseFloat(dados.fatorAtividade);
    const pesoAlvo = parseFloat(dados.pesoAlvo);

    // Calcular TMB e TDEE
    const tmb = calculateTMB(peso, altura, idade, dados.sexo);
    const tdee = calculateTDEE(tmb, fatorAtividade);

    // Calcular calorias alvo
    const { calories, metaAtingida: meta } = calculateTargetCalories(
      tdee,
      dados.objetivo,
      peso,
      pesoAlvo
    );

    setMetaAtingida(meta);
    setCaloriasAlvo(calories);

    // Calcular macros
    const macrosCalculados = calculateMacros(peso, calories);
    setMacros(macrosCalculados);
  };

  // ==========================================
  // ÁGUA
  // ==========================================

  const adicionarAgua = async (qtd) => {
    const validation = validateWater(qtd);
    
    if (!validation.valid) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", validation.error);
      return;
    }

    try {
      const novoTotal = (perfil.agua_hoje || 0) + validation.value;
      
      const { error } = await supabase
        .from('profiles')
        .update({ agua_hoje: novoTotal })
        .eq('id', perfil.id);

      if (error) throw error;

      setPerfil({ ...perfil, agua_hoje: novoTotal });
      
      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Notificação se atingiu a meta
      if (novoTotal >= WATER_GOAL && (perfil.agua_hoje || 0) < WATER_GOAL) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("🎉 Meta de Água!", "Atingiste a meta diária de água!");
      }
    } catch (error) {
      console.error("Erro ao adicionar água:", error);
      Alert.alert("Erro", "Não foi possível adicionar água.");
    }
  };

  const resetAgua = async () => {
    Alert.alert(
      "Resetar Água",
      "Tens a certeza que queres zerar o contador de água?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim, Resetar",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('profiles')
                .update({ agua_hoje: 0 })
                .eq('id', perfil.id);

              if (error) throw error;

              setPerfil({ ...perfil, agua_hoje: 0 });
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } catch (error) {
              console.error("Erro ao resetar água:", error);
              Alert.alert("Erro", "Não foi possível resetar a água.");
            }
          },
        },
      ]
    );
  };

  // ==========================================
  // REFEIÇÕES
  // ==========================================

  const adicionarAlimento = async () => {
    const validation = validateMeal(alimentoNome, alimentoKcal);
    
    if (!validation.valid) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", validation.error);
      return;
    }

    try {
      const novaRefeicao = {
        id: generateMealId(),
        nome: validation.meal.nome,
        kcal: validation.meal.calorias,
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const lista = [...(perfil.refeicoes_hoje || []), novaRefeicao];
      
      const { error } = await supabase
        .from('profiles')
        .update({ refeicoes_hoje: lista })
        .eq('id', perfil.id);

      if (error) throw error;

      setPerfil({ ...perfil, refeicoes_hoje: lista });
      setAlimentoNome('');
      setAlimentoKcal('');
      
      // Haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Erro ao adicionar alimento:", error);
      Alert.alert("Erro", "Não foi possível adicionar o alimento.");
    }
  };

  const removerAlimento = async (id) => {
    Alert.alert(
      "Remover Refeição",
      "Tens a certeza?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              const lista = perfil.refeicoes_hoje.filter(item => item.id !== id);
              
              const { error } = await supabase
                .from('profiles')
                .update({ refeicoes_hoje: lista })
                .eq('id', perfil.id);

              if (error) throw error;

              setPerfil({ ...perfil, refeicoes_hoje: lista });
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } catch (error) {
              console.error("Erro ao remover alimento:", error);
              Alert.alert("Erro", "Não foi possível remover o alimento.");
            }
          },
        },
      ]
    );
  };

  // ==========================================
  // FAVORITOS
  // ==========================================

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
      await AsyncStorage.setItem('@favorite_foods', JSON.stringify(novosFavoritos));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("✅ Favorito", "Alimento adicionado aos favoritos!");
    } catch (e) {
      console.error("Erro ao salvar favorito:", e);
    }
  };

  const removerFavorito = async (id) => {
    const novosFavoritos = favorites.filter(f => f.id !== id);
    setFavorites(novosFavoritos);

    try {
      await AsyncStorage.setItem('@favorite_foods', JSON.stringify(novosFavoritos));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      console.error("Erro ao remover favorito:", e);
    }
  };

  const adicionarDeFavoritos = async (favorito) => {
    setAlimentoNome(favorito.nome);
    setAlimentoKcal(favorito.kcal.toString());
    setShowFavorites(false);
  };

  // ==========================================
  // PESO
  // ==========================================

  const registarPeso = async () => {
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
      const hoje = new Date().toISOString().split('T')[0];

      // Limitar histórico a MAX_HISTORY_DAYS
      const novoHist = [
        ...(perfil.historico || []),
        { data: hoje, peso: pesoKg.toFixed(2) }
      ].slice(-MAX_HISTORY_DAYS);

      const { error } = await supabase
        .from('profiles')
        .update({
          peso_atual: pesoKg,
          historico: novoHist
        })
        .eq('id', perfil.id);

      if (error) throw error;

      const atualizado = {
        ...perfil,
        pesoAtual: pesoKg,
        historico: novoHist
      };

      setPerfil(atualizado);
      calcularTudo(atualizado);
      setNovoPeso('');

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("✅ Sucesso", "Peso atualizado!");
    } catch (error) {
      console.error("Erro ao registar peso:", error);
      Alert.alert("Erro", "Não foi possível atualizar o peso.");
    }
  };

  // ==========================================
  // UTILITÁRIOS
  // ==========================================

  const exibirPeso = (valorKg) => {
    const num = parseFloat(valorKg);
    if (isNaN(num)) return "--";
    
    const converted = convertWeight(num, unidade);
    const unitLabel = unidade === 'Imperial' ? 'lb' : 'kg';
    
    return `${converted}${unitLabel}`;
  };

  const calcularConsumidasHoje = () => {
    return perfil?.refeicoes_hoje?.reduce((total, item) => total + item.kcal, 0) || 0;
  };

  const calcularFaltam = () => {
    return caloriasAlvo - calcularConsumidasHoje();
  };

  // ==========================================
  // RETORNO
  // ==========================================

  return {
    // Estados
    perfil,
    caloriasAlvo,
    macros,
    metaAtingida,
    unidade,
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

    // Funções principais
    inicializar,
    onRefresh,
    
    // Água
    adicionarAgua,
    resetAgua,
    
    // Refeições
    adicionarAlimento,
    removerAlimento,
    
    // Favoritos
    adicionarFavorito,
    removerFavorito,
    adicionarDeFavoritos,
    
    // Peso
    registarPeso,
    
    // Utilitários
    exibirPeso,
    calcularConsumidasHoje,
    calcularFaltam,
    
    // Constantes
    metaAgua: WATER_GOAL,
  };
};