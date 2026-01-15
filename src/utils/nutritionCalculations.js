/**
 * 🧮 NUTRITION CALCULATIONS
 * Todas as funções de cálculo nutricional
 */

import {
    CALORIES_PER_GRAM,
    DEFICIT_MULTIPLIER,
    FAT_PER_KG,
    PROTEIN_PER_KG,
    SURPLUS_MULTIPLIER,
} from './dashboardConstants';

/**
 * Calcula Taxa Metabólica Basal (TMB)
 * Fórmula: Mifflin-St Jeor
 */
export const calculateTMB = (peso, altura, idade, sexo) => {
  let tmb = (10 * peso) + (6.25 * altura) - (5 * idade);
  return sexo === 'Masculino' ? tmb + 5 : tmb - 161;
};

/**
 * Calcula Total Daily Energy Expenditure (TDEE)
 */
export const calculateTDEE = (tmb, fatorAtividade) => {
  return tmb * fatorAtividade;
};

/**
 * Calcula calorias alvo baseado no objetivo
 */
export const calculateTargetCalories = (tdee, objetivo, pesoAtual, pesoAlvo) => {
  // Se já atingiu a meta, manter
  if (
    (objetivo === 'Ganhar' && pesoAtual >= pesoAlvo) ||
    (objetivo === 'Perder' && pesoAtual <= pesoAlvo) ||
    objetivo === 'Manter'
  ) {
    return { calories: Math.round(tdee), metaAtingida: true };
  }

  // Calcular com surplus ou deficit
  const multiplier = objetivo === 'Ganhar' ? SURPLUS_MULTIPLIER : DEFICIT_MULTIPLIER;
  return { calories: Math.round(tdee * multiplier), metaAtingida: false };
};

/**
 * Calcula macronutrientes
 */
export const calculateMacros = (peso, totalCalories) => {
  const proteinaGramas = peso * PROTEIN_PER_KG;
  const gorduraGramas = peso * FAT_PER_KG;
  
  const proteinaKcal = proteinaGramas * CALORIES_PER_GRAM.protein;
  const gorduraKcal = gorduraGramas * CALORIES_PER_GRAM.fat;
  
  const hidratosKcal = totalCalories - (proteinaKcal + gorduraKcal);
  const hidratosGramas = hidratosKcal / CALORIES_PER_GRAM.carbs;

  return {
    proteina: Math.round(proteinaGramas),
    gordura: Math.round(gorduraGramas),
    hidratos: Math.max(0, Math.round(hidratosGramas))
  };
};

/**
 * Calcula IMC (Índice de Massa Corporal)
 */
export const calculateBMI = (peso, altura) => {
  const alturaMetros = altura / 100;
  return parseFloat((peso / (alturaMetros * alturaMetros)).toFixed(1));
};

/**
 * Converte peso para a unidade desejada
 */
export const convertWeight = (pesoKg, toUnit) => {
  if (toUnit === 'Imperial') {
    return parseFloat((pesoKg * 2.20462).toFixed(1));
  }
  return parseFloat(pesoKg.toFixed(1));
};

/**
 * Converte peso de qualquer unidade para kg
 */
export const convertWeightToKg = (peso, fromUnit) => {
  if (fromUnit === 'Imperial') {
    return peso / 2.20462;
  }
  return peso;
};

/**
 * Formata peso para exibição
 */
export const formatWeight = (pesoKg, unit) => {
  if (!pesoKg || isNaN(pesoKg)) return "--";
  
  const converted = convertWeight(pesoKg, unit);
  const unitLabel = unit === 'Imperial' ? 'lb' : 'kg';
  
  return `${converted}${unitLabel}`;
};

/**
 * Calcula progresso em relação à meta
 */
export const calculateProgress = (pesoAtual, pesoInicial, pesoAlvo) => {
  const totalChange = Math.abs(pesoAlvo - pesoInicial);
  const currentChange = Math.abs(pesoAtual - pesoInicial);
  
  if (totalChange === 0) return 100;
  
  const percentage = (currentChange / totalChange) * 100;
  return Math.min(100, Math.round(percentage));
};

/**
 * Calcula diferença de peso
 */
export const calculateWeightDifference = (pesoAtual, pesoAlvo) => {
  return Math.abs(pesoAtual - pesoAlvo);
};

/**
 * Determina se está perto da meta (dentro de 2kg)
 */
export const isNearGoal = (pesoAtual, pesoAlvo) => {
  return calculateWeightDifference(pesoAtual, pesoAlvo) <= 2;
};

/**
 * Calcula percentual de progresso diário de calorias
 */
export const calculateCalorieProgress = (consumed, target) => {
  if (target === 0) return 0;
  return Math.min(100, Math.round((consumed / target) * 100));
};

/**
 * Calcula percentual de progresso de água
 */
export const calculateWaterProgress = (current, goal) => {
  if (goal === 0) return 0;
  return Math.min(100, Math.round((current / goal) * 100));
};