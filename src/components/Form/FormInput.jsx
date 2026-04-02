import { forwardRef } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { COLORS } from "../../utils/theme";

const FormInputComponent = (
  { label, error, touched, inputRef, style, ...props },
  ref,
) => (
  <View style={[styles.wrapper, style]}>
    {label && <Text style={styles.label}>{label}</Text>}
    <TextInput
      ref={inputRef || ref}
      style={[styles.input, touched && error && styles.inputError]}
      placeholderTextColor={COLORS.textMuted}
      {...props}
    />
    {touched && error && <Text style={styles.error}>{error}</Text>}
  </View>
);

FormInputComponent.displayName = "FormInput";
export const FormInput = forwardRef(FormInputComponent);

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  inputError: { borderColor: COLORS.danger },
  error: { color: COLORS.danger, fontSize: 12, marginTop: 4 },
});
