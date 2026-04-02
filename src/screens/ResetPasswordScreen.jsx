import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthButton } from "../components/Auth/AuthButton";
import { AuthHeader } from "../components/Auth/AuthHeader";
import { AuthInput } from "../components/Auth/AuthInput";
import { TokenInput } from "../components/Auth/TokenInput";
import { useResetPassword } from "../hooks/useResetPassword";
import { COLORS } from "../utils/theme";

export default function ResetPasswordScreen({ route, navigation }) {
  const email = route.params?.email || "";
  const {
    token,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    showConfirmPassword,
    isVerifying,
    isResending,
    timeLeft,
    isExpired,
    canResend,
    handleVerifyAndReset,
    handleResendCode,
    handleTokenChange,
    toggleShowPassword,
    toggleShowConfirmPassword,
    cleanup,
    getFormattedTime,
    getResendText,
    canSubmit,
  } = useResetPassword(email, navigation);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthHeader
          title="Redefinir Password"
          subtitle={`Introduz o código enviado para ${email}`}
          icon="lock-closed"
        />

        <View style={styles.timerContainer}>
          <Ionicons
            name={isExpired ? "time-outline" : "timer-outline"}
            size={16}
            color={isExpired ? COLORS.danger : COLORS.primary}
          />
          <Text style={[styles.timerText, isExpired && styles.timerExpired]}>
            {isExpired ? "Código expirado" : `Expira em: ${getFormattedTime()}`}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Código de 8 dígitos</Text>
          <TokenInput
            value={token}
            onChange={handleTokenChange}
            length={8}
            autoFocus
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Nova Password</Text>
          <AuthInput
            icon="lock-closed-outline"
            placeholder="Nova Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showPassword}
            textContentType="newPassword"
            rightIcon={
              <TouchableOpacity onPress={toggleShowPassword}>
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Confirmar Password</Text>
          <AuthInput
            icon="checkmark-circle-outline"
            placeholder="Confirmar Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            textContentType="newPassword"
            error={
              confirmPassword.length > 0 && newPassword !== confirmPassword
                ? "As passwords não coincidem"
                : null
            }
            rightIcon={
              <TouchableOpacity onPress={toggleShowConfirmPassword}>
                <Ionicons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            }
          />
        </View>

        <AuthButton
          title="REDEFINIR PASSWORD"
          onPress={handleVerifyAndReset}
          loading={isVerifying}
          disabled={!canSubmit()}
        />

        <TouchableOpacity
          style={[styles.resendBtn, !canResend && styles.resendBtnDisabled]}
          onPress={handleResendCode}
          disabled={!canResend || isResending}
        >
          <Text
            style={[styles.resendText, !canResend && styles.resendTextDisabled]}
          >
            {getResendText()}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContainer: { flexGrow: 1, padding: 25, paddingTop: 60 },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  timerText: { color: COLORS.primary, fontSize: 14, fontWeight: "600" },
  timerExpired: { color: COLORS.danger },
  section: { marginBottom: 20 },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  resendBtn: { marginTop: 16, alignItems: "center", padding: 12 },
  resendBtnDisabled: { opacity: 0.5 },
  resendText: { color: COLORS.primary, fontSize: 14, fontWeight: "600" },
  resendTextDisabled: { color: COLORS.textMuted },
});
