/**
 * ⚖️ WEIGHT PROGRESS
 * Progresso de peso com input para registar novo peso
 */

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export const WeightProgress = ({
  pesoAtual,
  pesoAlvo,
  metaAtingida,
  unidade,
  novoPeso,
  setNovoPeso,
  onRegister,
}) => {
  const diferenca = Math.abs(pesoAtual - pesoAlvo);
  const faltam = pesoAtual > pesoAlvo ? 'perder' : 'ganhar';

  return (
    <View style={styles.container}>
      {/* Current Weight Display */}
      <View style={styles.currentWeight}>
        <View style={styles.weightInfo}>
          <Text style={styles.weightLabel}>Peso Atual</Text>
          <Text style={styles.weightValue}>{pesoAtual}</Text>
        </View>

        {metaAtingida ? (
          <View style={styles.goalBadge}>
            <Ionicons name="checkmark-circle" size={32} color="#32CD32" />
            <Text style={styles.goalText}>Meta Atingida!</Text>
          </View>
        ) : (
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>Meta</Text>
            <Text style={styles.progressValue}>{pesoAlvo}</Text>
            <Text style={styles.progressDiff}>
              ({diferenca.toFixed(1)}{unidade === 'Metric' ? 'kg' : 'lb'} a {faltam})
            </Text>
          </View>
        )}
      </View>

      {/* Input Row */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Registar novo peso:</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={novoPeso}
            onChangeText={setNovoPeso}
            placeholder={`Ex: ${pesoAtual}`}
            placeholderTextColor="#666"
          />
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={onRegister}
          >
            <Ionicons name="checkmark" size={20} color="#000" />
            <Text style={styles.registerBtnText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  currentWeight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  weightInfo: {
    flex: 1,
  },
  weightLabel: {
    color: '#666',
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  weightValue: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  progressInfo: {
    alignItems: 'flex-end',
  },
  progressLabel: {
    color: '#666',
    fontSize: 12,
    marginBottom: 4,
  },
  progressValue: {
    color: '#32CD32',
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressDiff: {
    color: '#888',
    fontSize: 11,
    marginTop: 2,
  },
  goalBadge: {
    alignItems: 'center',
    gap: 4,
  },
  goalText: {
    color: '#32CD32',
    fontSize: 12,
    fontWeight: 'bold',
  },
  inputContainer: {
    gap: 10,
  },
  inputLabel: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#121212',
    color: '#FFF',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
  },
  registerBtn: {
    backgroundColor: '#32CD32',
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  registerBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
});