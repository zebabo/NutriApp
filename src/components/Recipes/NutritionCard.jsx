/**
 * 📊 NUTRITION CARD
 * Card com informações nutricionais
 */

import { StyleSheet, Text, View } from 'react-native';
import { MACRO_ICONS } from '../../utils/recipeConstants';

export const NutritionCard = ({ kcal, protein, carbs, fats, portion = 1 }) => {
  const macros = [
    { label: 'Calorias', value: Math.round(kcal * portion), icon: MACRO_ICONS.calories, unit: 'kcal' },
    { label: 'Proteína', value: Math.round(protein * portion), icon: MACRO_ICONS.protein, unit: 'g' },
    { label: 'Hidratos', value: Math.round(carbs * portion), icon: MACRO_ICONS.carbs, unit: 'g' },
    { label: 'Gordura', value: Math.round(fats * portion), icon: MACRO_ICONS.fats, unit: 'g' },
  ];

  return (
    <View style={styles.container}>
      {macros.map((macro, index) => (
        <View key={index} style={styles.macroBox}>
          <Text style={styles.icon}>{macro.icon}</Text>
          <Text style={styles.value}>{macro.value}</Text>
          <Text style={styles.unit}>{macro.unit}</Text>
          <Text style={styles.label}>{macro.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  macroBox: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  icon: {
    fontSize: 24,
    marginBottom: 8,
  },
  value: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  unit: {
    color: '#32CD32',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  label: {
    color: '#666',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
});