/**
 * 📋 CONSTANTES DO FORMULÁRIO
 * Centralizadas para fácil manutenção
 */

export const LIMITS = {
  age: { min: 13, max: 120 },
  weight: { min: 30, max: 300 }, // kg
  height: { min: 100, max: 250 }, // cm
  weightImperial: { min: 66, max: 661 }, // lb
  heightImperial: { min: 39, max: 98 }, // inches
};

export const ACTIVITY_LEVELS = [
  { 
    value: '1.2', 
    title: 'Sedentário', 
    description: 'Pouca ou nenhuma atividade',
    icon: 'bed-outline'
  },
  { 
    value: '1.375', 
    title: 'Ligeiro', 
    description: '1-3 dias de exercício/semana',
    icon: 'walk-outline'
  },
  { 
    value: '1.5', 
    title: 'Moderado', 
    description: '3-5 dias de exercício/semana',
    icon: 'bicycle-outline'
  },
  { 
    value: '1.7', 
    title: 'Intenso', 
    description: '6-7 dias de exercício/semana',
    icon: 'fitness-outline'
  },
  { 
    value: '1.9', 
    title: 'Muito Intenso', 
    description: 'Atleta/treino 2x por dia',
    icon: 'barbell-outline'
  },
];

export const GENDER_OPTIONS = [
  { value: 'Masculino', label: 'M', icon: 'male' },
  { value: 'Feminino', label: 'F', icon: 'female' },
];