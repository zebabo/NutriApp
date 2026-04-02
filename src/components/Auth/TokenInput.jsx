import { useRef } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { COLORS } from "../../utils/theme";

export const TokenInput = ({
  value,
  onChange,
  length = 8,
  autoFocus = false,
}) => {
  const inputRef = useRef(null);
  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={onChange}
        maxLength={length}
        keyboardType="number-pad"
        autoFocus={autoFocus}
        textAlign="center"
        placeholderTextColor={COLORS.textMuted}
        placeholder={"─".repeat(length)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    letterSpacing: 8,
  },
});
