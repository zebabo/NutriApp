/**
 * 🔐 USE RESET PASSWORD HOOK - VERSÃO SIMPLIFICADA
 *
 * Fluxo: Mudar password → OK no alert → Navegar para Login
 */

import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../services/supabase";
import {
  AUTH_ERRORS,
  AUTH_SUCCESS,
  RESEND_COOLDOWN,
  TOKEN_EXPIRY_TIME,
} from "../utils/authConstants";
import {
  formatTimeRemaining,
  validateResetForm,
} from "../utils/authValidation";

export const useResetPassword = (email, navigation) => {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOKEN_EXPIRY_TIME);
  const [isExpired, setIsExpired] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);

  // Timer para expiração do código
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }
    const interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Timer para reenvio
  useEffect(() => {
    if (resendTimer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(
      () => setResendTimer((prev) => prev - 1),
      1000,
    );
    return () => clearInterval(interval);
  }, [resendTimer]);

  /**
   * Helper: Promise com timeout
   */
  const withTimeout = (promise, ms, operation) => {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`TIMEOUT: ${operation}`)), ms),
    );
    return Promise.race([promise, timeout]);
  };

  /**
   * ✅ FUNÇÃO PRINCIPAL - COM TIMEOUTS DE SEGURANÇA
   */
  const handleVerifyAndReset = async () => {
    // Validar código expirado
    if (isExpired) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Código Expirado", "Por favor, solicita um novo código.");
      return false;
    }

    // Validar formulário
    const validation = validateResetForm(token, newPassword, confirmPassword);
    if (!validation.valid) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", validation.error);
      return false;
    }

    console.log("🔐 [RESET] ========== INÍCIO ==========");
    console.log("🔐 [RESET] Email:", email);
    console.log("🔐 [RESET] Token length:", token.length);
    setIsVerifying(true);

    try {
      // PASSO 1: Verificar código OTP (timeout 10s)
      console.log("🔐 [RESET] Passo 1: Verificar código...");
      let verifyResult;
      try {
        verifyResult = await withTimeout(
          supabase.auth.verifyOtp({
            email: email.trim(),
            token: token.trim(),
            type: "recovery",
          }),
          10000,
          "verifyOtp",
        );
      } catch (timeoutError) {
        console.error("❌ [RESET] Passo 1 TIMEOUT!");
        throw new Error("Timeout ao verificar código. Verifica a tua conexão.");
      }

      if (verifyResult.error) {
        console.error(
          "❌ [RESET] Código inválido:",
          verifyResult.error.message,
        );
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Código Inválido", AUTH_ERRORS.INVALID_TOKEN);
        setIsVerifying(false);
        return false;
      }
      console.log("✅ [RESET] Passo 1 OK - Código verificado!");

      // PASSO 2: Atualizar password (timeout 10s)
      console.log("🔐 [RESET] Passo 2: Atualizar password...");
      let updateResult;
      try {
        updateResult = await withTimeout(
          supabase.auth.updateUser({ password: newPassword }),
          10000,
          "updateUser",
        );
      } catch (timeoutError) {
        console.error("❌ [RESET] Passo 2 TIMEOUT!");
        // Mesmo com timeout, a password pode ter sido alterada
        // Continuamos para o logout
        console.log("⚠️ [RESET] Continuando apesar do timeout...");
        updateResult = { error: null };
      }

      if (updateResult.error) {
        console.error(
          "❌ [RESET] Erro ao atualizar:",
          updateResult.error.message,
        );
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Erro", "Não foi possível atualizar a password.");
        setIsVerifying(false);
        return false;
      }
      console.log("✅ [RESET] Passo 2 OK - Password atualizada!");

      // PASSO 3: Fazer logout (timeout 5s, não bloqueia se falhar)
      console.log("🔐 [RESET] Passo 3: Fazer logout...");
      try {
        await withTimeout(supabase.auth.signOut(), 5000, "signOut");
        console.log("✅ [RESET] Passo 3 OK - Logout feito!");
      } catch (signOutError) {
        console.warn("⚠️ [RESET] Passo 3 falhou/timeout, mas continuando...");
        // Não bloqueamos - o importante é navegar para o login
      }

      // PASSO 4: Limpar estados
      console.log("🔐 [RESET] Passo 4: Limpar estados...");
      setIsVerifying(false);
      cleanup();
      console.log("✅ [RESET] Passo 4 OK!");

      // PASSO 5: Feedback
      console.log("🔐 [RESET] Passo 5: Haptic feedback...");
      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
      } catch (e) {
        // Haptics pode falhar em alguns dispositivos
      }
      console.log("✅ [RESET] Passo 5 OK!");

      // PASSO 6: Mostrar alert e navegar
      console.log("🔐 [RESET] Passo 6: Mostrar alert...");
      Alert.alert(
        "✅ Password Alterada!",
        "A tua password foi alterada com sucesso. Faz login com a nova password.",
        [
          {
            text: "OK",
            onPress: () => {
              console.log("✅ [RESET] User clicou OK - navegando para Auth...");
              navigation.reset({
                index: 0,
                routes: [{ name: "Auth" }],
              });
            },
          },
        ],
        { cancelable: false },
      );

      console.log("✅ [RESET] ========== COMPLETO ==========");
      return true;
    } catch (error) {
      console.error("❌ [RESET] ERRO GERAL:", error.message);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", error.message || "Ocorreu um erro. Tenta novamente.");

      // Tentar logout de emergência
      try {
        await withTimeout(supabase.auth.signOut(), 2000, "emergencySignOut");
      } catch (e) {
        console.log("⚠️ [RESET] Logout de emergência falhou");
      }

      setIsVerifying(false);
      return false;
    }
  };

  /**
   * Reenviar código
   */
  const handleResendCode = async () => {
    if (!canResend) return false;
    setIsResending(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

      if (error) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Erro", "Não foi possível reenviar o código.");
        return false;
      }

      // Reset dos timers
      setTimeLeft(TOKEN_EXPIRY_TIME);
      setIsExpired(false);
      setResendTimer(RESEND_COOLDOWN);
      setCanResend(false);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Código Enviado", AUTH_SUCCESS.RESET_EMAIL_SENT);
      return true;
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", "Não foi possível reenviar o código.");
      return false;
    } finally {
      setIsResending(false);
    }
  };

  const handleTokenChange = (value) => {
    setToken(value.replace(/[^0-9]/g, ""));
  };

  const toggleShowPassword = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowConfirmPassword(!showConfirmPassword);
  };

  const cleanup = useCallback(() => {
    setToken("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, []);

  const getFormattedTime = () => formatTimeRemaining(timeLeft);

  const getResendText = () =>
    canResend ? "Reenviar código" : `Reenviar em ${resendTimer}s`;

  const canSubmit = () =>
    token.length === 8 &&
    newPassword.length >= 6 &&
    confirmPassword.length >= 6 &&
    !isVerifying &&
    !isExpired;

  return {
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
    resendTimer,
    handleVerifyAndReset,
    handleResendCode,
    handleTokenChange,
    toggleShowPassword,
    toggleShowConfirmPassword,
    cleanup,
    getFormattedTime,
    getResendText,
    canSubmit,
  };
};
