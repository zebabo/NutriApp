/**
 * 📝 FORM INPUT
 * Componente reutilizável de input com validação
 */

import { StyleSheet, Text, TextInput, View } from 'react-native';

export const FormInput = ({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  touched,
  placeholder,
  keyboardType = 'default',
  maxLength,
  returnKeyType = 'next',
  onSubmitEditing,
  inputRef,
  autoFocus = false,
  style,
}) => {
  const hasError = error && touched;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={inputRef}
        style={[styles.input, hasError && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor="#666"
        keyboardType={keyboardType}
        maxLength={maxLength}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        autoFocus={autoFocus}
      />
      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 5,
  },
  label: {
    color: '#32CD32',
    fontSize: 13,
    marginBottom: 8,
    fontWeight: 'bold',
    marginTop: 5,
  },
  input: {
    backgroundColor: '#1E1E1E',
    color: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#333',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF6B6B',
    borderWidth: 2,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 11,
    marginBottom: 10,
    marginTop: 2,
  },
});