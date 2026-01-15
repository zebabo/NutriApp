/**
 * 🔐 USE RESET PASSWORD HOOK
 * Toda a lógica de reset de password centralizada
 */

import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../services/supabase';
import {
  AUTH_ERRORS,
  AUTH_SUCCESS,
  RESEND_COOLDOWN,
  TOKEN_EXPIRY_TIME,
} from '../utils/authConstants';
import {
  formatTimeRemaining,
  validateResetForm,
} from '../utils/authValidation';

export const useResetPassword = (email) => {
  // Estados principais
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Estados de UI
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados de loading
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Timer de expiração
  const [timeLeft, setTimeLeft] = useState(TOKEN_EXPIRY_TIME);
  const [isExpired, setIsExpired] = useState(false);

  // Timer de reenviar
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);

  // ==========================================
  // TIMERS
  // ==========================================

  // Timer de expiração do token
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  // Timer para reenviar código
  useEffect(() => {
    if (resendTimer <= 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);

  // ==========================================
  // VERIFICAR E RESETAR PASSWORD
  // ==========================================

  const handleVerifyAndReset = async () => {
    // Verificar se token expirou
    if (isExpired) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Código Expirado', 'Por favor, solicita um novo código.');
      return false;
    }

    // Validar formulário
    const validation = validateResetForm(token, newPassword, confirmPassword);

    if (!validation.valid) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erro', validation.error);
      return false;
    }

    setIsVerifying(true);

    try {
      console.log('🔐 Verificando token para:', email);

      // PASSO 1: Verificar OTP
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: 'recovery',
      });

      if (verifyError) {
        console.error('❌ Erro no OTP:', verifyError.message);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Código Inválido', AUTH_ERRORS.INVALID_TOKEN);
        return false;
      }

      console.log('✅ Token validado! Atualizando password...');

      // PASSO 2: Atualizar password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error('❌ Erro ao atualizar:', updateError.message);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Erro', 'Não foi possível atualizar a password.');
        return false;
      }

      // Sucesso!
      setResetSuccess(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      return true;
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erro', 'Ocorreu um erro. Tenta novamente.');
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  // ==========================================
  // REENVIAR CÓDIGO
  // ==========================================

  const handleResendCode = async () => {
    if (!canResend) return false;

    setIsResending(true);

    try {
      console.log('📧 Reenviando código para:', email);

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

      if (error) {
        console.error('❌ Erro ao reenviar:', error.message);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Erro', 'Não foi possível reenviar o código.');
        return false;
      }

      // Reset timers
      setTimeLeft(TOKEN_EXPIRY_TIME);
      setIsExpired(false);
      setResendTimer(RESEND_COOLDOWN);
      setCanResend(false);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Código Enviado', AUTH_SUCCESS.RESET_EMAIL_SENT);

      return true;
    } catch (error) {
      console.error('❌ Erro ao reenviar:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erro', 'Não foi possível reenviar o código.');
      return false;
    } finally {
      setIsResending(false);
    }
  };

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleTokenChange = (value) => {
    // Apenas números
    const numericValue = value.replace(/[^0-9]/g, '');
    setToken(numericValue);
  };

  const toggleShowPassword = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowConfirmPassword(!showConfirmPassword);
  };

  // ==========================================
  // CLEANUP
  // ==========================================

  const cleanup = useCallback(() => {
    setToken('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, []);

  // ==========================================
  // UTILITÁRIOS
  // ==========================================

  const getFormattedTime = () => {
    return formatTimeRemaining(timeLeft);
  };

  const getResendText = () => {
    if (canResend) return 'Reenviar código';
    return `Reenviar em ${resendTimer}s`;
  };

  const canSubmit = () => {
    return (
      token.length === 8 &&
      newPassword.length >= 6 &&
      confirmPassword.length >= 6 &&
      !isVerifying &&
      !isExpired
    );
  };

  // ==========================================
  // RETORNO
  // ==========================================

  return {
    // Estados de input
    token,
    setToken,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,

    // Estados de UI
    showPassword,
    showConfirmPassword,
    resetSuccess,

    // Estados de loading
    isVerifying,
    isResending,

    // Timer states
    timeLeft,
    isExpired,
    canResend,
    resendTimer,

    // Funções principais
    handleVerifyAndReset,
    handleResendCode,
    handleTokenChange,
    toggleShowPassword,
    toggleShowConfirmPassword,
    cleanup,

    // Utilitários
    getFormattedTime,
    getResendText,
    canSubmit,
  };
};