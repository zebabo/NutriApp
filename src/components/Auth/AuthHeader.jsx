/**
 * 📋 AUTH HEADER
 * Header com logo e textos
 */

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export const AuthHeader = ({ title, subtitle, icon = 'flash' }) => {
  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Ionicons name={icon} size={40} color="#32CD32" />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  title: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: '#666',
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});