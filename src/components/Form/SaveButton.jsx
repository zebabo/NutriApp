/**
 * 💾 SAVE BUTTON
 * Botão de guardar reutilizável com loading
 */

import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

export const SaveButton = ({ onPress, loading, disabled, text = "GUARDAR PERFIL" }) => {
  return (
    <TouchableOpacity
      style={[styles.button, (loading || disabled) && styles.buttonDisabled]}
      onPress={onPress}
      disabled={loading || disabled}
    >
      {loading ? (
        <ActivityIndicator color="#000" />
      ) : (
        <>
          <Ionicons name="save-outline" size={20} color="#000" style={styles.icon} />
          <Text style={styles.text}>{text}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#32CD32',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  icon: {
    marginRight: 10,
  },
  text: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});