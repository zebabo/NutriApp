/**
 * ⚖️ PORTION SELECTOR
 * Seletor de porções com + e -
 */

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PORTION_MAX, PORTION_MIN, PORTION_STEP } from '../../utils/recipeConstants';
import { formatPortion } from '../../utils/recipeHelpers';

export const PortionSelector = ({ portion, onIncrease, onDecrease, onPortionChange }) => {
  const canDecrease = portion > PORTION_MIN;
  const canIncrease = portion < PORTION_MAX;

  const handleDecrease = () => {
    if (canDecrease) {
      const newPortion = Math.max(PORTION_MIN, portion - PORTION_STEP);
      onPortionChange(newPortion);
      if (onDecrease) onDecrease();
    }
  };

  const handleIncrease = () => {
    if (canIncrease) {
      const newPortion = Math.min(PORTION_MAX, portion + PORTION_STEP);
      onPortionChange(newPortion);
      if (onIncrease) onIncrease();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Porções</Text>
        <Text style={styles.hint}>
          Ajusta a quantidade para calcular as calorias
        </Text>
      </View>

      <View style={styles.selectorRow}>
        {/* Botão diminuir */}
        <TouchableOpacity
          style={[styles.button, !canDecrease && styles.buttonDisabled]}
          onPress={handleDecrease}
          disabled={!canDecrease}
        >
          <Ionicons 
            name="remove" 
            size={24} 
            color={canDecrease ? '#FFF' : '#666'} 
          />
        </TouchableOpacity>

        {/* Display */}
        <View style={styles.display}>
          <Text style={styles.portionValue}>{portion}</Text>
          <Text style={styles.portionText}>{formatPortion(portion)}</Text>
        </View>

        {/* Botão aumentar */}
        <TouchableOpacity
          style={[styles.button, !canIncrease && styles.buttonDisabled]}
          onPress={handleIncrease}
          disabled={!canIncrease}
        >
          <Ionicons 
            name="add" 
            size={24} 
            color={canIncrease ? '#FFF' : '#666'} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  labelRow: {
    marginBottom: 16,
  },
  label: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  hint: {
    color: '#666',
    fontSize: 12,
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#2A2A2A',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  display: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  portionValue: {
    color: '#32CD32',
    fontSize: 36,
    fontWeight: 'bold',
  },
  portionText: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
});