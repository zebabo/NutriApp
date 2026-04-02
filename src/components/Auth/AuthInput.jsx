import { Ionicons } from "@expo/vector-icons";
import { forwardRef } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { COLORS } from "../../utils/theme";

const AuthInputComponent = ({ icon, error, rightIcon, ...props }, ref) => (
  <View style={styles.wrapper}>
    <View style={[styles.container, error && styles.containerError]}>
      {icon && (
        <Ionicons
          name={icon}
          size={20}
          color={COLORS.textMuted}
          style={styles.icon}
        />
      )}
      <TextInput
        ref={ref}
        style={styles.input}
        placeholderTextColor={COLORS.textMuted}
        {...props}
      />
      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </View>
    {error && <Text style={styles.error}>{error}</Text>}
  </View>
);

AuthInputComponent.displayName = "AuthInput";
export const AuthInput = forwardRef(AuthInputComponent);

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  containerError: { borderColor: COLORS.danger },
  icon: { marginRight: 12 },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    paddingVertical: 16,
    fontSize: 15,
  },
  rightIcon: { marginLeft: 8 },
  error: { color: COLORS.danger, fontSize: 12, marginTop: 4, marginLeft: 4 },
});
