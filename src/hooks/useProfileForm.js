/**
 * 🎣 USE PROFILE FORM HOOK
 * Extrai TODA a lógica do formulário
 * FormScreen fica apenas com UI!
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Alert, Keyboard } from 'react-native';
import { supabase } from '../services/supabase';
import {
    calculateBMI,
    convertFromMetric,
    convertToMetric,
    getBMICategory,
    getHealthyWeightRange,
    validateField,
} from '../utils/formValidation';
import { useAuth } from './useAuth';

export const useProfileForm = (navigation) => {
  const { user, refreshProfile } = useAuth();

  // Estados do formulário
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [gender, setGender] = useState('Masculino');
  const [activity, setActivity] = useState('1.375');
  const [unidade, setUnidade] = useState('Metric');

  // Estados de controle
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const canGoBack = navigation.canGoBack();

  // ==========================================
  // INICIALIZAÇÃO
  // ==========================================

  useEffect(() => {
    const inicializar = async () => {
      const savedUnit = await AsyncStorage.getItem('@unit_system');
      const unitValue = savedUnit || 'Metric';
      setUnidade(unitValue);
      await carregarPerfilExistente(unitValue);
    };
    inicializar();
  }, []);

  // ==========================================
  // CARREGAR PERFIL
  // ==========================================

  const carregarPerfilExistente = async (unidadeAtual) => {
    try {
      if (!user?.id) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        const pesoAtual = convertFromMetric(data.peso_atual, 'weight', unidadeAtual);
        const pesoAlvo = convertFromMetric(data.peso_alvo, 'weight', unidadeAtual);
        const alturaValue = convertFromMetric(data.altura, 'height', unidadeAtual);

        setWeight(pesoAtual?.toFixed(1) || '');
        setTargetWeight(pesoAlvo?.toFixed(1) || '');
        setHeight(alturaValue?.toFixed(1) || '');
        setAge(data.idade?.toString() || '');
        setGender(data.sexo || 'Masculino');
        setActivity(data.fator_atividade?.toString() || '1.375');
      }
    } catch (e) {
      console.error("Erro ao carregar perfil:", e);
    } finally {
      setFetching(false);
    }
  };

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleFieldChange = (field, value, setter) => {
    setter(value);
    setTouched({ ...touched, [field]: true });

    if (value) {
      const validation = validateField(field, value, unidade);
      setErrors({ ...errors, [field]: validation.valid ? null : validation.error });
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  // ==========================================
  // VALIDAÇÃO
  // ==========================================

  const validateAllFields = () => {
    const newErrors = {};

    const ageValid = validateField('age', age, unidade);
    const weightValid = validateField('weight', weight, unidade);
    const heightValid = validateField('height', height, unidade);
    const targetWeightValid = validateField('targetWeight', targetWeight, unidade);

    if (!age) newErrors.age = 'Campo obrigatório';
    else if (!ageValid.valid) newErrors.age = ageValid.error;

    if (!weight) newErrors.weight = 'Campo obrigatório';
    else if (!weightValid.valid) newErrors.weight = weightValid.error;

    if (!height) newErrors.height = 'Campo obrigatório';
    else if (!heightValid.valid) newErrors.height = heightValid.error;

    if (!targetWeight) newErrors.targetWeight = 'Campo obrigatório';
    else if (!targetWeightValid.valid) newErrors.targetWeight = targetWeightValid.error;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==========================================
  // CÁLCULOS
  // ==========================================

  const weightMetric = convertToMetric(parseFloat(weight), 'weight', unidade);
  const heightMetric = convertToMetric(parseFloat(height), 'height', unidade);

  const currentBMI = calculateBMI(weightMetric, heightMetric);
  const bmiCategory = getBMICategory(currentBMI);
  const healthyRange = getHealthyWeightRange(heightMetric, gender);

  // ==========================================
  // SALVAR
  // ==========================================

  const salvarDados = async () => {
    Keyboard.dismiss();

    if (!validateAllFields()) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("⚠️ Campos Inválidos", "Verifica os campos marcados a vermelho.");
      return;
    }

    setLoading(true);

    try {
      const pAtual = convertToMetric(parseFloat(weight.replace(',', '.')), 'weight', unidade);
      const pAlvo = convertToMetric(parseFloat(targetWeight.replace(',', '.')), 'weight', unidade);
      const vAlt = convertToMetric(parseFloat(height.replace(',', '.')), 'height', unidade);

      const goal = pAlvo < pAtual ? 'Perder' : (pAlvo > pAtual ? 'Ganhar' : 'Manter');

      const updates = {
        id: user.id,
        nome: user.user_metadata?.full_name || 'Utilizador',
        idade: parseInt(age),
        peso_atual: parseFloat(pAtual.toFixed(2)),
        peso_alvo: parseFloat(pAlvo.toFixed(2)),
        altura: parseFloat(vAlt.toFixed(1)),
        sexo: gender,
        objetivo: goal,
        fator_atividade: parseFloat(activity),
        ultima_data: new Date().toISOString().split('T')[0],
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await refreshProfile();
      await new Promise(resolve => setTimeout(resolve, 300));

      Alert.alert("✅ Sucesso", "Perfil guardado com sucesso!");

      if (canGoBack) navigation.goBack();

    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("❌ Erro", error.message || "Não foi possível guardar o perfil.");
      console.error("Erro ao guardar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RETORNO
  // ==========================================

  return {
    // Estados
    weight,
    setWeight,
    height,
    setHeight,
    age,
    setAge,
    targetWeight,
    setTargetWeight,
    gender,
    setGender,
    activity,
    setActivity,
    unidade,
    loading,
    fetching,
    errors,
    touched,
    canGoBack,

    // Handlers
    handleFieldChange,
    handleBlur,
    salvarDados,

    // Cálculos
    currentBMI,
    bmiCategory,
    healthyRange,
  };
};