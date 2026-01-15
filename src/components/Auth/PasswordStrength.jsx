/**
 * 💪 PASSWORD STRENGTH
 * Indicador de força da password
 */

import { StyleSheet, Text, View } from 'react-native';
import { PASSWORD_STRENGTH, PASSWORD_STRENGTH_CONFIG } from '../../utils/authConstants';

export const PasswordStrength = ({ password, strength }) => {
  if (!password || password.length === 0) return null;

  const config = PASSWORD_STRENGTH_CONFIG[strength] || PASSWORD_STRENGTH_CONFIG[PASSWORD_STRENGTH.WEAK];

  // Calcular largura da barra
  const getBarWidth = () => {
    switch (strength) {
      case PASSWORD_STRENGTH.WEAK:
        return '33%';
      case PASSWORD_STRENGTH.MEDIUM:
        return '66%';
      case PASSWORD_STRENGTH.STRONG:
        return '100%';
      default:
        return '0%';
    }
  };

  return (
    <View style={styles.container}>
      {/* Barra de progresso */}
      <View style={styles.barContainer}>
        <View
          style={[
            styles.bar,
            { width: getBarWidth(), backgroundColor: config.color },
          ]}
        />
      </View>

      {/* Label */}
      <View style={styles.labelContainer}>
        <Text style={styles.icon}>{config.icon}</Text>
        <Text style={[styles.label, { color: config.color }]}>
          Password {config.label}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  barContainer: {
    height: 4,
    backgroundColor: '#1E1E1E',
    borderRadius: 2,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.3s ease',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  icon: {
    fontSize: 12,
    marginRight: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});