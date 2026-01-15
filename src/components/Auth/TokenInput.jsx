/**
 * 🔢 TOKEN INPUT
 * Input de código com 6 campos separados
 */

import { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

export const TokenInput = ({ value, onChange, length = 6, autoFocus = false }) => {
  const [focusedIndex, setFocusedIndex] = useState(autoFocus ? 0 : -1);
  const inputRefs = useRef([]);

  // Dividir valor em array de caracteres
  const digits = value.split('').slice(0, length);
  while (digits.length < length) {
    digits.push('');
  }

  const handleChange = (text, index) => {
    // Apenas números
    const numericText = text.replace(/[^0-9]/g, '');

    if (numericText.length === 0) {
      // Backspace - remover dígito atual e focar anterior
      const newValue = digits.map((d, i) => (i === index ? '' : d)).join('');
      onChange(newValue);

      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }

    // Pegar apenas o último caractere digitado
    const digit = numericText[numericText.length - 1];

    // Atualizar o valor
    const newDigits = [...digits];
    newDigits[index] = digit;
    const newValue = newDigits.join('');
    onChange(newValue);

    // Focar próximo campo
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    } else {
      // Último campo - remover foco do teclado
      inputRefs.current[index]?.blur();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && digits[index] === '') {
      // Backspace em campo vazio - voltar para anterior
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleFocus = (index) => {
    setFocusedIndex(index);
  };

  const handleBlur = () => {
    setFocusedIndex(-1);
  };

  return (
    <View style={styles.container}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          style={[
            styles.input,
            focusedIndex === index && styles.inputFocused,
            digit !== '' && styles.inputFilled,
          ]}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onFocus={() => handleFocus(index)}
          onBlur={handleBlur}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
          autoFocus={autoFocus && index === 0}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  input: {
    flex: 1,
    height: 60,
    marginHorizontal: 4,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333',
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputFocused: {
    borderColor: '#32CD32',
    backgroundColor: '#1A331A',
  },
  inputFilled: {
    borderColor: '#32CD32',
  },
});