/**
 * ⚥ GENDER SELECTOR
 * Seletor de género com haptic feedback
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GENDER_OPTIONS } from '../../utils/formConstants';

export const GenderSelector = ({ value, onChange }) => {
  const handleSelect = (gender) => {
    onChange(gender);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sexo *</Text>
      <View style={styles.row}>
        {GENDER_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.button,
              value === option.value && styles.activeButton,
            ]}
            onPress={() => handleSelect(option.value)}
          >
            <Ionicons
              name={option.icon}
              size={20}
              color={value === option.value ? '#32CD32' : '#FFF'}
            />
            <Text style={styles.buttonText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    color: '#32CD32',
    fontSize: 13,
    marginBottom: 8,
    fontWeight: 'bold',
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  activeButton: {
    borderColor: '#32CD32',
    backgroundColor: '#1A331A',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});