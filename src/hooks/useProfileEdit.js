/**
 * 🎣 USE PROFILE EDIT HOOK
 * Lógica completa de edição de perfil — todos os campos
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../services/supabase";
import { ACTIVITY_LEVELS, GENDER_OPTIONS } from "../utils/formConstants";
import { convertFromMetric, convertToMetric } from "../utils/formValidation";
import { useAuth } from "./useAuth";

const OBJETIVOS = ["Perder", "Manter", "Ganhar"];

export const useProfileEdit = () => {
  const { user, signOut, refreshProfile } = useAuth();

  // ── Campos ────────────────────────────────────────────────────────────────
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [sexo, setSexo] = useState("Masculino");
  const [altura, setAltura] = useState("");
  const [pesoAtual, setPesoAtual] = useState("");
  const [pesoAlvo, setPesoAlvo] = useState("");
  const [objetivo, setObjetivo] = useState("Perder");
  const [atividade, setAtividade] = useState("1.375");
  const [unidade, setUnidade] = useState("Metric");

  // ── UI ────────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [original, setOriginal] = useState(null);

  // ── Carregar ──────────────────────────────────────────────────────────────

  useEffect(() => {
    carregarPerfil();
  }, [user?.id]);

  const carregarPerfil = async () => {
    if (!user?.id) return;
    try {
      const savedUnit = await AsyncStorage.getItem("@unit_system");
      const unitAtual = savedUnit || "Metric";
      setUnidade(unitAtual);

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "nome, idade, sexo, altura, peso_atual, peso_alvo, objetivo, fator_atividade",
        )
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        const pAtual =
          convertFromMetric(data.peso_atual, "weight", unitAtual)?.toFixed(1) ||
          "";
        const pAlvo =
          convertFromMetric(data.peso_alvo, "weight", unitAtual)?.toFixed(1) ||
          "";
        const alt =
          convertFromMetric(data.altura, "height", unitAtual)?.toFixed(1) || "";

        const snap = {
          nome: data.nome || "",
          idade: data.idade?.toString() || "",
          sexo: data.sexo || "Masculino",
          altura: alt,
          pesoAtual: pAtual,
          pesoAlvo: pAlvo,
          objetivo: data.objetivo || "Perder",
          atividade: data.fator_atividade?.toString() || "1.375",
          unidade: unitAtual,
        };

        setNome(snap.nome);
        setIdade(snap.idade);
        setSexo(snap.sexo);
        setAltura(snap.altura);
        setPesoAtual(snap.pesoAtual);
        setPesoAlvo(snap.pesoAlvo);
        setObjetivo(snap.objetivo);
        setAtividade(snap.atividade);
        setOriginal(snap);
      }
    } catch (e) {
      console.error("❌ [useProfileEdit] carregar:", e);
    } finally {
      setLoading(false);
    }
  };

  // ── Detetar mudanças ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!original) return;
    setHasChanges(
      nome !== original.nome ||
        idade !== original.idade ||
        sexo !== original.sexo ||
        altura !== original.altura ||
        pesoAtual !== original.pesoAtual ||
        pesoAlvo !== original.pesoAlvo ||
        objetivo !== original.objetivo ||
        atividade !== original.atividade ||
        unidade !== original.unidade,
    );
  }, [
    nome,
    idade,
    sexo,
    altura,
    pesoAtual,
    pesoAlvo,
    objetivo,
    atividade,
    unidade,
    original,
  ]);

  // ── Guardar ───────────────────────────────────────────────────────────────

  const guardar = async () => {
    // Validações
    if (!nome.trim())
      return Alert.alert("Erro", "O nome não pode estar vazio.");

    const idadeNum = parseInt(idade);
    if (isNaN(idadeNum) || idadeNum < 13 || idadeNum > 120)
      return Alert.alert("Erro", "Idade inválida (13-120 anos).");

    const alturaNum = parseFloat(altura.replace(",", "."));
    const pesoAtualNum = parseFloat(pesoAtual.replace(",", "."));
    const pesoAlvoNum = parseFloat(pesoAlvo.replace(",", "."));

    if (isNaN(alturaNum) || alturaNum < 50)
      return Alert.alert("Erro", "Altura inválida.");
    if (isNaN(pesoAtualNum) || pesoAtualNum < 10)
      return Alert.alert("Erro", "Peso atual inválido.");
    if (isNaN(pesoAlvoNum) || pesoAlvoNum < 10)
      return Alert.alert("Erro", "Peso alvo inválido.");

    setSaving(true);
    try {
      const updates = {
        nome: nome.trim(),
        idade: idadeNum,
        sexo,
        altura: parseFloat(
          convertToMetric(alturaNum, "height", unidade).toFixed(1),
        ),
        peso_atual: parseFloat(
          convertToMetric(pesoAtualNum, "weight", unidade).toFixed(2),
        ),
        peso_alvo: parseFloat(
          convertToMetric(pesoAlvoNum, "weight", unidade).toFixed(2),
        ),
        objetivo,
        fator_atividade: parseFloat(atividade),
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      await AsyncStorage.setItem("@unit_system", unidade);
      await refreshProfile?.();

      // Atualizar snapshot
      setOriginal({
        nome: nome.trim(),
        idade,
        sexo,
        altura,
        pesoAtual,
        pesoAlvo,
        objetivo,
        atividade,
        unidade,
      });
      setHasChanges(false);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("✅ Guardado", "Perfil atualizado com sucesso!");
    } catch (e) {
      console.error("❌ [guardar]:", e);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", "Não foi possível guardar as alterações.");
    } finally {
      setSaving(false);
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────

  const handleLogout = () => {
    Alert.alert("Terminar Sessão", "Tens a certeza que queres sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await signOut();
        },
      },
    ]);
  };

  return {
    // Campos
    nome,
    setNome,
    idade,
    setIdade,
    sexo,
    setSexo,
    altura,
    setAltura,
    pesoAtual,
    setPesoAtual,
    pesoAlvo,
    setPesoAlvo,
    objetivo,
    setObjetivo,
    atividade,
    setAtividade,
    unidade,
    setUnidade,
    // UI
    loading,
    saving,
    hasChanges,
    // Constantes
    ACTIVITY_LEVELS,
    GENDER_OPTIONS,
    OBJETIVOS,
    // Ações
    guardar,
    handleLogout,
  };
};
