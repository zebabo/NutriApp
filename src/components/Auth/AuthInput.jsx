/**
 * 📝 AUTH INPUT
 * Input customizado para auth com ícones e validação
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export const AuthInput = React.forwardRef((
  {
    icon,
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'none',
    autoComplete,
    textContentType,
    returnKeyType = 'done',
    onSubmitEditing,
    error = false,
    helperText,
    rightIcon,
    ...props
  },
  ref
) => {
  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {/* Ícone esquerdo */}
        {icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color="#666" 
            style={styles.leftIcon} 
          />
        )}

        {/* Input */}
        <TextInput
          ref={ref}
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          textContentType={textContentType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          placeholderTextColor="#666"
          {...props}
        />

        {/* Ícone direita (opcional) */}
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {/* Mensagem de erro/helper */}
      {(error || helperText) && (
        <Text style={[styles.helperText, error && styles.errorText]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
});

AuthInput.displayName = 'AuthInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 60,
    borderWidth: 1,
    borderColor: '#333',
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  leftIcon: {
    marginRight: 10,
  },
  rightIcon: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
  },
  helperText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  errorText: {
    color: '#E74C3C',
  },
});