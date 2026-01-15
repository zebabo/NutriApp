/**
 * 📊 BMI CARD
 * Exibe IMC e peso saudável calculados
 */

import { StyleSheet, Text, View } from 'react-native';

export const BMICard = ({ bmi, bmiCategory, healthyRange, unitSystem }) => {
  if (!bmi || !bmiCategory) return null;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>IMC Atual:</Text>
        <Text style={[styles.value, { color: bmiCategory.color }]}>
          {bmi} - {bmiCategory.text}
        </Text>
      </View>

      {healthyRange && (
        <View style={styles.row}>
          <Text style={styles.label}>Peso Saudável:</Text>
          <Text style={styles.value}>
            {unitSystem === 'Metric'
              ? `${healthyRange.min} - ${healthyRange.max} kg`
              : `${(healthyRange.min * 2.20462).toFixed(1)} - ${(healthyRange.max * 2.20462).toFixed(1)} lb`
            }
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },
  value: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});