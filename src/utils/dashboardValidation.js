/**
 * ✅ DASHBOARD VALIDATION
 * Funções de validação para inputs do dashboard
 */

import {
    MAX_CALORIES_PER_MEAL,
    MAX_WEIGHT,
    MIN_CALORIES,
    MIN_WEIGHT,
    VALIDATION_MESSAGES,
} from './dashboardConstants';

/**
 * Valida peso
 */
export const validateWeight = (peso, unit = 'Metric') => {
  const pesoNum = parseFloat(peso.toString().replace(',', '.'));
  
  if (isNaN(pesoNum)) {
    return { valid: false, error: 'Peso inválido' };
  }
  
  // Converter para kg se necessário
  const pesoKg = unit === 'Imperial' ? pesoNum / 2.20462 : pesoNum;
  
  if (pesoKg < MIN_WEIGHT) {
    return { valid: false, error: VALIDATION_MESSAGES.PESO_INVALIDO };
  }
  
  if (pesoKg > MAX_WEIGHT) {
    return { valid: false, error: VALIDATION_MESSAGES.PESO_INVALIDO };
  }
  
  return { valid: true, value: pesoKg };
};

/**
 * Valida calorias
 */
export const validateCalories = (calorias) => {
  const calNum = parseInt(calorias);
  
  if (isNaN(calNum)) {
    return { valid: false, error: 'Calorias inválidas' };
  }
  
  if (calNum < MIN_CALORIES) {
    return { valid: false, error: VALIDATION_MESSAGES.CALORIAS_INVALIDAS };
  }
  
  if (calNum > MAX_CALORIES_PER_MEAL) {
    return { valid: false, error: VALIDATION_MESSAGES.CALORIAS_INVALIDAS };
  }
  
  return { valid: true, value: calNum };
};

/**
 * Valida nome de alimento
 */
export const validateFoodName = (nome) => {
  const trimmed = nome.trim();
  
  if (!trimmed) {
    return { valid: false, error: VALIDATION_MESSAGES.NOME_VAZIO };
  }
  
  if (trimmed.length < 2) {
    return { valid: false, error: 'Nome muito curto' };
  }
  
  if (trimmed.length > 50) {
    return { valid: false, error: 'Nome muito longo (máx 50 caracteres)' };
  }
  
  return { valid: true, value: trimmed };
};

/**
 * Valida quantidade de água
 */
export const validateWater = (quantidade) => {
  const qtd = parseInt(quantidade);
  
  if (isNaN(qtd) || qtd <= 0) {
    return { valid: false, error: VALIDATION_MESSAGES.AGUA_INVALIDA };
  }
  
  if (qtd > 2000) {
    return { valid: false, error: 'Quantidade muito alta (máx 2000ml de cada vez)' };
  }
  
  return { valid: true, value: qtd };
};

/**
 * Valida refeição completa
 */
export const validateMeal = (nome, calorias) => {
  const nomeValidation = validateFoodName(nome);
  if (!nomeValidation.valid) {
    return { valid: false, error: nomeValidation.error };
  }
  
  const calValidation = validateCalories(calorias);
  if (!calValidation.valid) {
    return { valid: false, error: calValidation.error };
  }
  
  return {
    valid: true,
    meal: {
      nome: nomeValidation.value,
      calorias: calValidation.value
    }
  };
};

/**
 * Valida se data é hoje
 */
export const isToday = (dateString) => {
  const today = new Date().toISOString().split('T')[0];
  return dateString === today;
};

/**
 * Gera ID único para refeição
 */
export const generateMealId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};