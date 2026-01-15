/**
 * 🔥 CALORIES CARD
 * Card de calorias com fórmula visual
 */

import { StyleSheet, Text, View } from 'react-native';

export const CaloriesCard = ({ meta, consumidas, faltam }) => {
  const isOver = faltam < 0;
  const progress = Math.min(100, (consumidas / meta) * 100);

  return (
    <View style={styles.container}>
      {/* Fórmula visual */}
      <View style={styles.formula}>
        <View style={styles.valueBox}>
          <Text style={styles.value}>{meta}</Text>
          <Text style={styles.label}>Meta</Text>
        </View>

        <Text style={styles.operator}>-</Text>

        <View style={styles.valueBox}>
          <Text style={styles.value}>{consumidas}</Text>
          <Text style={styles.label}>Comido</Text>
        </View>

        <Text style={styles.operator}>=</Text>

        <View style={styles.valueBox}>
          <Text style={[styles.mainValue, isOver ? styles.valueOver : styles.valueUnder]}>
            {Math.abs(faltam)}
          </Text>
          <Text style={styles.label}>{isOver ? 'Excesso' : 'Restantes'}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${progress}%` },
              isOver && styles.progressBarOver
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{progress.toFixed(0)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  formula: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  valueBox: {
    alignItems: 'center',
    flex: 1,
  },
  value: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mainValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  valueUnder: {
    color: '#32CD32',
  },
  valueOver: {
    color: '#FF4500',
  },
  label: {
    color: '#666',
    fontSize: 10,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  operator: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#32CD32',
    borderRadius: 4,
  },
  progressBarOver: {
    backgroundColor: '#FF4500',
  },
  progressText: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'right',
  },
});