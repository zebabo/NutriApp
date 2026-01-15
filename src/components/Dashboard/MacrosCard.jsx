/**
 * 📊 MACROS CARD
 * Card de macronutrientes (Proteína, Hidratos, Gordura)
 */

import { StyleSheet, Text, View } from 'react-native';

export const MacrosCard = ({ proteina, hidratos, gordura }) => {
  const macros = [
    { label: 'Proteína', value: proteina, color: '#FF6B6B', icon: '🥩' },
    { label: 'Hidratos', value: hidratos, color: '#4ECDC4', icon: '🍞' },
    { label: 'Gordura', value: gordura, color: '#FFE66D', icon: '🥑' },
  ];

  return (
    <View style={styles.container}>
      {macros.map((macro, index) => (
        <View key={index} style={styles.macroBox}>
          <Text style={styles.icon}>{macro.icon}</Text>
          <Text style={[styles.value, { color: macro.color }]}>
            {macro.value}g
          </Text>
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
    gap: 10,
    marginBottom: 20,
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
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  label: {
    color: '#666',
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
});