/**
 * 🔐 USE RESET PASSWORD HOOK - VERSÃO DE TESTE
 *
 * PARA TESTAR: Podes forçar modo produção mudando FORCE_PRODUCTION para true
 */

import * as Haptics from "expo-haptics";
import * as Updates from "expo-updates";
import { useCallback, useEffect, useState } from "react";
import { Alert, DevSettings } from "react-native";
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

// ✅ PARA TESTAR: Muda isto para true para simular PRODUÇÃO
const FORCE_PRODUCTION_MODE = true;

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

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }
    const interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

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

  const handleVerifyAndReset = async () => {
    if (isExpired) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Código Expirado", "Por favor, solicita um novo código.");
      return false;
    }

    const validation = validateResetForm(token, newPassword, confirmPassword);
    if (!validation.valid) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", validation.error);
      return false;
    }

    console.log("🔐 [RESET] ========== INÍCIO ==========");

    if (global.setPasswordResetFlag) {
      await global.setPasswordResetFlag(true);
      console.log("✅ [RESET] Flag ativada");
    }

    setIsVerifying(true);

    try {
      // PASSO 1: verifyOtp
      console.log("🔐 [RESET] PASSO 1: verifyOtp...");
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: "recovery",
      });

      if (verifyError) {
        console.error("❌ [RESET] PASSO 1 FALHOU");
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Código Inválido", AUTH_ERRORS.INVALID_TOKEN);
        if (global.setPasswordResetFlag)
          await global.setPasswordResetFlag(false);
        setIsVerifying(false);
        return false;
      }
      console.log("✅ [RESET] PASSO 1 OK");

      // PASSO 2: updateUser COM TIMEOUT
      console.log("🔐 [RESET] PASSO 2: updateUser (timeout 3s)...");

      const updatePromise = supabase.auth.updateUser({ password: newPassword });
      const updateTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("UPDATE_TIMEOUT")), 3000),
      );

      try {
        await Promise.race([updatePromise, updateTimeout]);
        console.log("✅ [RESET] PASSO 2 OK");
      } catch (err) {
        if (err.message === "UPDATE_TIMEOUT") {
          console.log("⚠️ [RESET] PASSO 2 TIMEOUT - continuando...");
        } else {
          throw err;
        }
      }

      // PASSO 3: signOut COM TIMEOUT
      console.log("🔐 [RESET] PASSO 3: signOut (timeout 2s)...");

      const signOutPromise = supabase.auth.signOut();
      const signOutTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("SIGNOUT_TIMEOUT")), 2000),
      );

      try {
        await Promise.race([signOutPromise, signOutTimeout]);
        console.log("✅ [RESET] PASSO 3 OK");
      } catch (err) {
        if (err.message === "SIGNOUT_TIMEOUT") {
          console.log("⚠️ [RESET] PASSO 3 TIMEOUT - continuando...");
        } else {
          throw err;
        }
      }

      // PASSO 4: Aguardar
      console.log("🔐 [RESET] PASSO 4: Aguardar 1s...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("✅ [RESET] PASSO 4 OK");

      // PASSO 5: Limpar
      console.log("🔐 [RESET] PASSO 5: Limpar estados...");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsVerifying(false);
      console.log("✅ [RESET] PASSO 5 OK");

      // PASSO 6: Desativar flag
      console.log("🔐 [RESET] PASSO 6: Desativar flag...");
      if (global.setPasswordResetFlag) {
        await global.setPasswordResetFlag(false);
        console.log("✅ [RESET] PASSO 6 OK - Flag desativada");
      }

      // PASSO 7: Mostrar alert e RECARREGAR
      console.log("🔐 [RESET] PASSO 7: Mostrar Alert e preparar reload...");

      Alert.alert(
        "✅ Password Alterada!",
        "A tua password foi alterada com sucesso. A app vai recarregar.",
        [
          {
            text: "OK",
            onPress: async () => {
              console.log("✅ [RESET] User clicou OK");
              console.log("🔄 [RESET] A RECARREGAR APP...");

              // ✅ TESTE: Verifica qual modo está ativo
              setTimeout(async () => {
                try {
                  const isDev = __DEV__ && !FORCE_PRODUCTION_MODE;

                  console.log("📊 [RESET] __DEV__:", __DEV__);
                  console.log(
                    "📊 [RESET] FORCE_PRODUCTION_MODE:",
                    FORCE_PRODUCTION_MODE,
                  );
                  console.log("📊 [RESET] isDev (final):", isDev);

                  if (isDev) {
                    // DESENVOLVIMENTO
                    console.log("🔧 [RESET] ===== MODO DEV =====");
                    console.log("🔧 [RESET] Usando DevSettings.reload()");
                    if (DevSettings && DevSettings.reload) {
                      DevSettings.reload();
                    } else {
                      console.warn("⚠️ [RESET] DevSettings não disponível");
                      navigation.navigate("Auth");
                    }
                  } else {
                    // PRODUÇÃO (real ou forçada)
                    console.log("🚀 [RESET] ===== MODO PRODUÇÃO =====");
                    console.log("🚀 [RESET] Usando Updates.reloadAsync()");

                    try {
                      await Updates.reloadAsync();
                      console.log("✅ [RESET] Updates.reloadAsync() executado");
                    } catch (updateError) {
                      console.error(
                        "❌ [RESET] Erro em Updates.reloadAsync():",
                        updateError,
                      );
                      console.log("🔄 [RESET] Fallback: navegando para Auth");
                      navigation.navigate("Auth");
                    }
                  }
                } catch (error) {
                  console.error("❌ [RESET] Erro geral ao recarregar:", error);
                  navigation.navigate("Auth");
                }
              }, 500);

              console.log("✅ [RESET] ========== COMPLETO ==========");
            },
          },
        ],
        { cancelable: false },
      );

      console.log("✅ [RESET] PASSO 7 OK - Alert mostrado");

      return true;
    } catch (error) {
      console.error("❌ [RESET] EXCEÇÃO:", error);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", "Ocorreu um erro. Tenta novamente.");

      try {
        const signOutPromise = supabase.auth.signOut();
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("TIMEOUT")), 2000),
        );
        await Promise.race([signOutPromise, timeout]);
      } catch (e) {}

      if (global.setPasswordResetFlag) await global.setPasswordResetFlag(false);
      setIsVerifying(false);
      return false;
    }
  };

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
