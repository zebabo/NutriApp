/**
 * 🎣 USE DASHBOARD HOOK - COM REFRESH DE SESSÃO
 *
 * SOLUÇÃO: Forçar refresh da sessão do Supabase antes de carregar dados
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../services/supabase";
import { MAX_HISTORY_DAYS, WATER_GOAL } from "../utils/dashboardConstants";
import {
  generateMealId,
  isToday,
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

export const useDashboard = () => {
  const { user } = useAuth();

  // Estados principais
  const [perfil, setPerfil] = useState(null);
  const [caloriasAlvo, setCaloriasAlvo] = useState(0);
  const [macros, setMacros] = useState({
    proteina: 0,
    hidratos: 0,
    gordura: 0,
  });
  const [metaAtingida, setMetaAtingida] = useState(false);
  const [unidade, setUnidade] = useState("Metric");

  // Estados de loading
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados de input
  const [novoPeso, setNovoPeso] = useState("");
  const [alimentoNome, setAlimentoNome] = useState("");
  const [alimentoKcal, setAlimentoKcal] = useState("");

  // Estados de favoritos
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  // Flags para controlar carregamento
  const isFirstLoad = useRef(true);
  const isLoadingRef = useRef(false);

  // ==========================================
  // CARREGAMENTO
  // ==========================================

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
    // Evitar chamadas simultâneas
    if (isLoadingRef.current) {
      console.log("⚠️ [carregarDados] Já está a carregar - ignorando");
      return;
    }

    console.log("🚀 [carregarDados] INÍCIO");
    isLoadingRef.current = true;

    try {
      console.log("🔍 [carregarDados] user.id:", user?.id);

      if (!user?.id) {
        console.log("⚠️ [carregarDados] Sem user - abortando");
        return;
      }

      // ✅ SOLUÇÃO DEFINITIVA: Simplesmente aguardar 1 segundo para estabilizar
      console.log(
        "⏳ [carregarDados] Aguardando 1 segundo para estabilizar...",
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("✅ [carregarDados] Aguarda completada");

      console.log("📞 [carregarDados] Buscando profile...");

      const { data: profileDB, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      console.log(
        "📊 [carregarDados] Resposta - data:",
        !!profileDB,
        "error:",
        !!error,
      );

      if (error) {
        console.error("❌ [carregarDados] ERRO Supabase:", error);
        throw error;
      }

      if (profileDB) {
        console.log("✅ [carregarDados] Profile encontrado:", profileDB.nome);

        const hoje = new Date().toISOString().split("T")[0];
        let dadosTratados = { ...profileDB };

        // Reset diário automático
        if (!isToday(profileDB.ultima_data)) {
          console.log("🔄 [carregarDados] Fazendo reset diário...");

          const { data: updatedProfile, error: updateError } = await supabase
            .from("profiles")
            .update({
              agua_hoje: 0,
              refeicoes_hoje: [],
              ultima_data: hoje,
            })
            .eq("id", user.id)
            .select()
            .single();

          if (!updateError && updatedProfile) {
            dadosTratados = updatedProfile;
            console.log("✅ [carregarDados] Reset diário OK");
          }
        }

        // Normalizar dados
        const obj = {
          ...dadosTratados,
          pesoAtual: dadosTratados.peso_atual,
          pesoAlvo: dadosTratados.peso_alvo,
          fatorAtividade: dadosTratados.fator_atividade,
          historico: dadosTratados.historico || [
            { data: hoje, peso: dadosTratados.peso_atual },
          ],
          streak: dadosTratados.streak || 0,
        };

        console.log("📊 [carregarDados] setPerfil...");
        setPerfil(obj);

        console.log("🔢 [carregarDados] calcularTudo...");
        calcularTudo(obj);

        console.log("✅ [carregarDados] COMPLETO - perfil definido");
      } else {
        console.log("⚠️ [carregarDados] Nenhum profile encontrado");
      }
    } catch (e) {
      console.error("❌ [carregarDados] EXCEÇÃO:", e);
      Alert.alert("Erro", "Não foi possível carregar os dados.");
    } finally {
      console.log("🏁 [carregarDados] FINALLY - setLoading(false)");
      setLoading(false);
      setRefreshing(false);
      isLoadingRef.current = false;
    }
  };

  // CARREGAMENTO AUTOMÁTICO NO MOUNT - COM PROTEÇÃO
  useEffect(() => {
    console.log(
      "🚀 [useEffect] MOUNT - user:",
      !!user?.id,
      "isFirstLoad:",
      isFirstLoad.current,
    );

    if (!user?.id) {
      console.log("⚠️ [useEffect] Sem user, aguardando...");
      setLoading(false);
      return;
    }

    // Só carregar se for a primeira vez
    if (!isFirstLoad.current) {
      console.log("⚠️ [useEffect] Não é primeira vez - ignorando");
      return;
    }

    console.log("📞 [useEffect] Iniciando carregamento...");
    isFirstLoad.current = false;

    const carregar = async () => {
      setLoading(true);
      await carregarPreferencias();
      await carregarDados();
    };

    carregar();
  }, [user?.id]);

  const inicializar = useCallback(async () => {
    console.log("🔄 [inicializar] Forçando reload...");
    isFirstLoad.current = false;
    setLoading(true);
    await carregarPreferencias();
    await carregarDados();
  }, [user]);

  const onRefresh = useCallback(async () => {
    console.log("🔄 [onRefresh] Pull to refresh...");
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

    const macrosCalculados = calculateMacros(peso, calories);
    setMacros(macrosCalculados);
  };

  // ==========================================
  // ÁGUA
  // ==========================================

  const adicionarAgua = async (qtd) => {
    if (!perfil) {
      console.error("❌ [adicionarAgua] perfil é null!");
      Alert.alert("Erro", "Perfil não carregado. Tenta fazer refresh.");
      return;
    }

    const validation = validateWater(qtd);

    if (!validation.valid) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", validation.error);
      return;
    }

    try {
      const novoTotal = (perfil.agua_hoje || 0) + validation.value;

      const { error } = await supabase
        .from("profiles")
        .update({ agua_hoje: novoTotal })
        .eq("id", perfil.id);

      if (error) throw error;

      setPerfil({ ...perfil, agua_hoje: novoTotal });

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (novoTotal >= WATER_GOAL && (perfil.agua_hoje || 0) < WATER_GOAL) {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
        Alert.alert("🎉 Meta de Água!", "Atingiste a meta diária de água!");
      }
    } catch (error) {
      console.error("Erro ao adicionar água:", error);
      Alert.alert("Erro", "Não foi possível adicionar água.");
    }
  };

  const resetAgua = async () => {
    if (!perfil) return;

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
                .from("profiles")
                .update({ agua_hoje: 0 })
                .eq("id", perfil.id);

              if (error) throw error;

              setPerfil({ ...perfil, agua_hoje: 0 });
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } catch (error) {
              console.error("Erro ao resetar água:", error);
              Alert.alert("Erro", "Não foi possível resetar a água.");
            }
          },
        },
      ],
    );
  };

  // ==========================================
  // REFEIÇÕES
  // ==========================================

  const adicionarAlimento = async () => {
    if (!perfil) {
      Alert.alert("Erro", "Perfil não carregado.");
      return;
    }

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
        hora: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      const lista = [...(perfil.refeicoes_hoje || []), novaRefeicao];

      const { error } = await supabase
        .from("profiles")
        .update({ refeicoes_hoje: lista })
        .eq("id", perfil.id);

      if (error) throw error;

      setPerfil({ ...perfil, refeicoes_hoje: lista });
      setAlimentoNome("");
      setAlimentoKcal("");

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Erro ao adicionar alimento:", error);
      Alert.alert("Erro", "Não foi possível adicionar o alimento.");
    }
  };

  const removerAlimento = async (id) => {
    if (!perfil) return;

    Alert.alert("Remover Refeição", "Tens a certeza?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            const lista = perfil.refeicoes_hoje.filter(
              (item) => item.id !== id,
            );

            const { error } = await supabase
              .from("profiles")
              .update({ refeicoes_hoje: lista })
              .eq("id", perfil.id);

            if (error) throw error;

            setPerfil({ ...perfil, refeicoes_hoje: lista });
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } catch (error) {
            console.error("Erro ao remover alimento:", error);
            Alert.alert("Erro", "Não foi possível remover o alimento.");
          }
        },
      },
    ]);
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

  const adicionarDeFavoritos = async (favorito) => {
    setAlimentoNome(favorito.nome);
    setAlimentoKcal(favorito.kcal.toString());
    setShowFavorites(false);
  };

  // ==========================================
  // PESO
  // ==========================================

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
      const hoje = new Date().toISOString().split("T")[0];

      const novoHist = [
        ...(perfil.historico || []),
        { data: hoje, peso: pesoKg.toFixed(2) },
      ].slice(-MAX_HISTORY_DAYS);

      const { error } = await supabase
        .from("profiles")
        .update({
          peso_atual: pesoKg,
          historico: novoHist,
        })
        .eq("id", perfil.id);

      if (error) throw error;

      const atualizado = {
        ...perfil,
        pesoAtual: pesoKg,
        historico: novoHist,
      };

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

  // ==========================================
  // UTILITÁRIOS
  // ==========================================

  const exibirPeso = (valorKg) => {
    const num = parseFloat(valorKg);
    if (isNaN(num)) return "--";

    const converted = convertWeight(num, unidade);
    const unitLabel = unidade === "Imperial" ? "lb" : "kg";

    return `${converted}${unitLabel}`;
  };

  const calcularConsumidasHoje = () => {
    return (
      perfil?.refeicoes_hoje?.reduce((total, item) => total + item.kcal, 0) || 0
    );
  };

  const calcularFaltam = () => {
    return caloriasAlvo - calcularConsumidasHoje();
  };

  // ==========================================
  // RETORNO
  // ==========================================

  return {
    perfil,
    caloriasAlvo,
    macros,
    metaAtingida,
    unidade,
    loading,
    refreshing,
    novoPeso,
    setNovoPeso,
    alimentoNome,
    setAlimentoNome,
    alimentoKcal,
    setAlimentoKcal,
    favorites,
    showFavorites,
    setShowFavorites,
    inicializar,
    onRefresh,
    adicionarAgua,
    resetAgua,
    adicionarAlimento,
    removerAlimento,
    adicionarFavorito,
    removerFavorito,
    adicionarDeFavoritos,
    registarPeso,
    exibirPeso,
    calcularConsumidasHoje,
    calcularFaltam,
    metaAgua: WATER_GOAL,
  };
};
