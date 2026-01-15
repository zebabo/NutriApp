/**
 * 🔍 VALIDAÇÃO E CÁLCULOS
 * Funções puras e reutilizáveis
 */

import { LIMITS } from './formConstants';

/**
 * Valida um número contra limites min/max
 */
export const validateNumber = (value, min, max) => {
  const num = parseFloat(value.replace(',', '.'));
  
  if (isNaN(num)) {
    return { valid: false, error: 'Valor inválido', value: null };
  }
  
  if (num < min) {
    return { valid: false, error: `Mínimo: ${min}`, value: null };
  }
  
  if (num > max) {
    return { valid: false, error: `Máximo: ${max}`, value: null };
  }
  
  return { valid: true, error: null, value: num };
};

/**
 * Valida campo específico do formulário
 */
export const validateField = (field, value, unidade = 'Metric') => {
  const limits = unidade === 'Metric' ? LIMITS : {
    ...LIMITS,
    weight: LIMITS.weightImperial,
    height: LIMITS.heightImperial,
  };

  switch (field) {
    case 'age':
      return validateNumber(value, limits.age.min, limits.age.max);
    case 'weight':
    case 'targetWeight':
      return validateNumber(value, limits.weight.min, limits.weight.max);
    case 'height':
      return validateNumber(value, limits.height.min, limits.height.max);
    default:
      return { valid: true, error: null };
  }
};

/**
 * Calcula IMC (Índice de Massa Corporal)
 */
export const calculateBMI = (weight, height) => {
  if (!weight || !height) return null;
  
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  
  return parseFloat(bmi.toFixed(1));
};

/**
 * Retorna categoria do IMC com cor
 */
export const getBMICategory = (bmi) => {
  if (!bmi) return null;
  
  if (bmi < 18.5) {
    return { text: 'Abaixo do peso', color: '#FFA500' };
  }
  
  if (bmi < 25) {
    return { text: 'Peso normal', color: '#32CD32' };
  }
  
  if (bmi < 30) {
    return { text: 'Sobrepeso', color: '#FFA500' };
  }
  
  return { text: 'Obesidade', color: '#FF6B6B' };
};

/**
 * Calcula range de peso saudável
 */
export const getHealthyWeightRange = (height, gender) => {
  if (!height) return null;
  
  const heightM = height / 100;
  const minBMI = gender === 'Feminino' ? 18.5 : 19;
  const maxBMI = 24.9;
  
  return {
    min: parseFloat((minBMI * heightM * heightM).toFixed(1)),
    max: parseFloat((maxBMI * heightM * heightM).toFixed(1)),
  };
};

/**
 * Converte peso/altura para métrico
 */
export const convertToMetric = (value, type, fromUnit) => {
  if (fromUnit === 'Metric') return value;
  
  if (type === 'weight') {
    return value / 2.20462; // lb to kg
  }
  
  if (type === 'height') {
    return value / 0.3937; // inches to cm
  }
  
  return value;
};

/**
 * Converte peso/altura de métrico
 */
export const convertFromMetric = (value, type, toUnit) => {
  if (toUnit === 'Metric') return value;
  
  if (type === 'weight') {
    return value * 2.20462; // kg to lb
  }
  
  if (type === 'height') {
    return value * 0.3937; // cm to inches
  }
  
  return value;
};