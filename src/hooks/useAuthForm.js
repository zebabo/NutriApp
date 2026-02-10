/**
 * 🔐 USE AUTH FORM HOOK - SEM NAVEGAÇÃO MANUAL
 *
 * Remove navigation.replace() - deixa App.js fazer automaticamente
 */

import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../services/supabase";
import {
  AUTH_ERRORS,
  AUTH_MODES,
  AUTH_SUCCESS,
  LOCKOUT_DURATION,
  MAX_LOGIN_ATTEMPTS,
} from "../utils/authConstants";
import {
  getPasswordStrength,
  sanitizeEmail,
  validateLoginForm,
  validateSignupForm,
} from "../utils/authValidation";

export const useAuthForm = (navigation) => {
  const [mode, setMode] = useState(AUTH_MODES.LOGIN);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nome, setNome] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  const handleLogin = async () => {
    if (isLockedOut) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Bloqueado",
        `Demasiadas tentativas. Aguarda ${lockoutTime} segundos.`,
      );
      return false;
    }

    const validation = validateLoginForm(email, password);
    if (!validation.valid) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", validation.error);
      return false;
    }

    setIsLoggingIn(true);

    try {
      const sanitizedEmail = sanitizeEmail(email);
      console.log("🔐 Tentando login:", sanitizedEmail);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: password,
      });

      if (error) {
        console.error("❌ Erro no login:", error.message);

        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          setIsLockedOut(true);
          setLockoutTime(LOCKOUT_DURATION);

          const interval = setInterval(() => {
            setLockoutTime((prev) => {
              if (prev <= 1) {
                setIsLockedOut(false);
                setLoginAttempts(0);
                clearInterval(interval);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error,
          );
          Alert.alert(
            "Bloqueado",
            `Demasiadas tentativas. Aguarda ${LOCKOUT_DURATION} segundos.`,
          );
        } else {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error,
          );
          Alert.alert("Erro", AUTH_ERRORS.INVALID_CREDENTIALS);
        }

        return false;
      }

      setLoginAttempts(0);
      console.log("✅ Login bem-sucedido:", data.user.id);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // ✅ NÃO fazer navigation.replace() aqui!
      // O App.js COM_NAVEGACAO_EXPLICITA faz automaticamente

      return true;
    } catch (error) {
      console.error("❌ Erro inesperado:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", "Ocorreu um erro. Tenta novamente.");
      return false;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignup = async () => {
    const validation = validateSignupForm(
      nome,
      email,
      password,
      confirmPassword,
    );
    if (!validation.valid) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", validation.error);
      return false;
    }

    setIsSigningUp(true);

    try {
      const sanitizedEmail = sanitizeEmail(email);
      console.log("📝 Tentando signup:", sanitizedEmail);

      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: password,
        options: {
          emailRedirectTo: Linking.createURL("/dashboard"),
          data: { full_name: nome.trim() },
        },
      });

      if (error) {
        console.error("❌ Erro no signup:", error.message);

        if (
          error.status === 422 ||
          error.message.includes("already registered")
        ) {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error,
          );
          Alert.alert("Email em Uso", AUTH_ERRORS.EMAIL_IN_USE);
        } else {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error,
          );
          Alert.alert("Erro", error.message);
        }

        return false;
      }

      if (data.user?.identities?.length === 0) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Email em Uso", AUTH_ERRORS.EMAIL_IN_USE);
        return false;
      }

      console.log("✅ Signup bem-sucedido:", data.user.id);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert("Sucesso!", AUTH_SUCCESS.SIGNUP, [
        {
          text: "OK",
          onPress: () => {
            setMode(AUTH_MODES.LOGIN);
            clearForm();
          },
        },
      ]);

      return true;
    } catch (error) {
      console.error("❌ Erro inesperado:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", "Ocorreu um erro. Tenta novamente.");
      return false;
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email || email.trim().length === 0) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", "Introduz o teu email primeiro.");
      return false;
    }

    const sanitizedEmail = sanitizeEmail(email);
    setIsSendingReset(true);

    try {
      console.log("📧 Enviando reset para:", sanitizedEmail);

      const { error } =
        await supabase.auth.resetPasswordForEmail(sanitizedEmail);

      if (error) {
        console.error("❌ Erro ao enviar reset:", error.message);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Erro", error.message);
        return false;
      }

      console.log("✅ Email de reset enviado");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Código Enviado", AUTH_SUCCESS.RESET_EMAIL_SENT);

      navigation.navigate("ResetPassword", { email: sanitizedEmail });
      return true;
    } catch (error) {
      console.error("❌ Erro inesperado:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", "Não foi possível enviar o código.");
      return false;
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleAuth = () => {
    if (mode === AUTH_MODES.LOGIN) {
      return handleLogin();
    } else {
      return handleSignup();
    }
  };

  const toggleMode = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMode(mode === AUTH_MODES.LOGIN ? AUTH_MODES.SIGNUP : AUTH_MODES.LOGIN);
    setConfirmPassword("");
  };

  const toggleShowPassword = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowConfirmPassword(!showConfirmPassword);
  };

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setNome("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const isLogin = mode === AUTH_MODES.LOGIN;
  const passwordStrength = getPasswordStrength(password);
  const isLoading = isLoggingIn || isSigningUp || isSendingReset;

  const canSubmit = () => {
    if (isLoading || isLockedOut) return false;

    if (isLogin) {
      return email.length > 0 && password.length >= 6;
    } else {
      return (
        nome.length >= 2 &&
        email.length > 0 &&
        password.length >= 6 &&
        confirmPassword.length >= 6
      );
    }
  };

  return {
    mode,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    nome,
    setNome,
    showPassword,
    showConfirmPassword,
    passwordStrength,
    isLoggingIn,
    isSigningUp,
    isSendingReset,
    isLoading,
    isLockedOut,
    lockoutTime,
    loginAttempts,
    handleAuth,
    handleForgotPassword,
    toggleMode,
    toggleShowPassword,
    toggleShowConfirmPassword,
    clearForm,
    isLogin,
    canSubmit,
  };
};
