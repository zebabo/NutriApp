/**
 * 🏃 ACTIVITY LEVEL SELECTOR
 * Seletor de nível de atividade com descrições
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ACTIVITY_LEVELS } from '../../utils/formConstants';

export const ActivityLevelSelector = ({ value, onChange }) => {
  const handleSelect = (activityValue) => {
    onChange(activityValue);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nível de Atividade *</Text>
      <View style={styles.column}>
        {ACTIVITY_LEVELS.map((level) => (
          <TouchableOpacity
            key={level.value}
            style={[
              styles.button,
              value === level.value && styles.activeButton,
            ]}
            onPress={() => handleSelect(level.value)}
          >
            <View style={styles.content}>
              <View style={styles.titleRow}>
                <Ionicons
                  name={level.icon}
                  size={18}
                  color={value === level.value ? '#32CD32' : '#FFF'}
                  style={styles.icon}
                />
                <Text style={styles.buttonText}>{level.title}</Text>
              </View>
              <Text style={styles.description}>{level.description}</Text>
            </View>
            {value === level.value && (
              <Ionicons name="checkmark-circle" size={20} color="#32CD32" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  label: {
    color: '#32CD32',
    fontSize: 13,
    marginBottom: 8,
    fontWeight: 'bold',
    marginTop: 5,
  },
  column: {
    gap: 10,
  },
  button: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeButton: {
    borderColor: '#32CD32',
    backgroundColor: '#1A331A',
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  description: {
    color: '#888',
    fontSize: 11,
    marginTop: 4,
    marginLeft: 26, // Alinha com o texto (icon width + margin)
  },
});