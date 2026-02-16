/**
 * 🔐 RESET PASSWORD SCREEN - VERSÃO SIMPLIFICADA
 * Sem flags globais, sem complexidade desnecessária
 */

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

export default function ResetPasswordScreen({ route, navigation }) {
  const email = route.params?.email || "";

  const {
    token,
    setToken,
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

  // Cleanup ao desmontar
  useEffect(() => {
    console.log("🟢 [ResetPasswordScreen] Montado");
    return () => {
      console.log("🔴 [ResetPasswordScreen] Desmontando");
      cleanup();
    };
  }, [cleanup]);

  // Voltar para a página anterior
  const handleGoBack = () => {
    console.log("🔙 [ResetPasswordScreen] Voltar");
    navigation.goBack();
  };

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

        {/* Timer */}
        <View style={styles.timerContainer}>
          <Ionicons
            name={isExpired ? "time-outline" : "timer-outline"}
            size={16}
            color={isExpired ? "#FF6B6B" : "#32CD32"}
          />
          <Text style={[styles.timerText, isExpired && styles.timerExpired]}>
            {isExpired ? "Código expirado" : `Expira em: ${getFormattedTime()}`}
          </Text>
        </View>

        {/* Código de 8 dígitos */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Código de 8 dígitos</Text>
          <TokenInput
            value={token}
            onChange={handleTokenChange}
            length={8}
            autoFocus
          />
        </View>

        {/* Nova Password */}
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
                  color="#666"
                />
              </TouchableOpacity>
            }
          />
        </View>

        {/* Confirmar Password */}
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
                  color="#666"
                />
              </TouchableOpacity>
            }
          />
        </View>

        {/* Botão Confirmar */}
        <AuthButton
          title="CONFIRMAR ALTERAÇÃO"
          onPress={handleVerifyAndReset}
          loading={isVerifying}
          disabled={!canSubmit()}
          style={styles.mainButton}
        />

        {/* Botão Reenviar */}
        <AuthButton
          title={getResendText()}
          onPress={handleResendCode}
          loading={isResending}
          disabled={!canResend}
          variant="secondary"
          style={styles.resendButton}
        />

        {/* Botão Voltar */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          disabled={isVerifying || isResending}
        >
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>

        {/* Ajuda */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>📧 Não recebeste o código?</Text>
          <Text style={styles.helpSubtext}>
            Verifica a pasta de spam ou tenta reenviar.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 25,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(50, 205, 50, 0.1)",
    padding: 12,
    borderRadius: 10,
    marginBottom: 24,
    gap: 8,
  },
  timerText: {
    color: "#32CD32",
    fontSize: 13,
    fontWeight: "600",
  },
  timerExpired: {
    color: "#FF6B6B",
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  mainButton: {
    marginTop: 10,
  },
  resendButton: {
    marginTop: 12,
  },
  backButton: {
    marginTop: 20,
    alignItems: "center",
    padding: 10,
  },
  backText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  helpContainer: {
    marginTop: 30,
    alignItems: "center",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
  },
  helpText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  helpSubtext: {
    color: "#666",
    fontSize: 12,
    textAlign: "center",
  },
});
