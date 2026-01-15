/**
 * 🔐 USE RESET PASSWORD - SOLUÇÃO DEFINITIVA
 * Guarda flag ANTES de verifyOtp e faz signOut IMEDIATAMENTE
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../services/supabase';
import {
  AUTH_ERRORS,
  RESEND_COOLDOWN,
  TOKEN_EXPIRY_TIME,
} from '../utils/authConstants';
import {
  formatTimeRemaining,
  validateResetForm,
} from '../utils/authValidation';

export const useResetPassword = (email) => {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOKEN_EXPIRY_TIME);
  const [isExpired, setIsExpired] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);

  // Ref para prevenir cancelamento por re-render
  const isResettingRef = useRef(false);

  // Timers
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }
    const interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    if (resendTimer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleVerifyAndReset = async () => {
    // Prevenir múltiplas execuções
    if (isResettingRef.current) {
      console.log('⚠️ [RESET] Já está a executar, ignorando...');
      return false;
    }

    if (isExpired) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Código Expirado', 'Solicita um novo código.');
      return false;
    }

    const validation = validateResetForm(token, newPassword, confirmPassword);
    if (!validation.valid) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erro', validation.error);
      return false;
    }

    isResettingRef.current = true;
    setIsVerifying(true);

    try {
      console.log('🔐 [RESET] Iniciando reset de password...');

      // PASSO 0: GUARDAR FLAG ANTES DE QUALQUER COISA!
      console.log('💾 [RESET] Guardando flag ANTES de verifyOtp...');
      await AsyncStorage.setItem('is_resetting_password', 'true');
      await AsyncStorage.setItem('just_reset_password', 'true');
      console.log('✅ [RESET] Flags guardadas!');

      // PASSO 1: Verificar OTP (isto loga o user automaticamente!)
      console.log('🔐 [RESET] Verificando token...');
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: 'recovery',
      });

      if (verifyError) {
        console.error('❌ [RESET] Erro no OTP:', verifyError.message);
        await AsyncStorage.removeItem('is_resetting_password');
        await AsyncStorage.removeItem('just_reset_password');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Código Inválido', AUTH_ERRORS.INVALID_TOKEN);
        return false;
      }

      console.log('✅ [RESET] Token validado! User foi logado automaticamente.');

      // PASSO 2: Atualizar password IMEDIATAMENTE
      console.log('🔐 [RESET] Atualizando password...');
      
      let updateError = null;
      try {
        const result = await supabase.auth.updateUser({
          password: newPassword,
        });
        updateError = result.error;
        console.log('📊 [RESET] Resultado updateUser:', { error: updateError, hasData: !!result.data });
      } catch (e) {
        console.error('❌ [RESET] Exception no updateUser:', e);
        updateError = e;
      }

      if (updateError) {
        console.error('❌ [RESET] Erro ao atualizar:', updateError.message || updateError);
        await AsyncStorage.removeItem('is_resetting_password');
        await AsyncStorage.removeItem('just_reset_password');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Erro', 'Não foi possível atualizar a password.');
        return false;
      }

      console.log('✅ [RESET] Password atualizada com sucesso!');

      // PASSO 3: SIGNOUT IMEDIATAMENTE!
      console.log('🚪 [RESET] Fazendo signOut IMEDIATO...');
      console.log('📊 [RESET] Estado antes do signOut:', { isResettingRef: isResettingRef.current });
      
      try {
        const signOutResult = await supabase.auth.signOut();
        console.log('📊 [RESET] Resultado signOut:', signOutResult);
      } catch (signOutError) {
        console.error('❌ [RESET] Exception no signOut:', signOutError);
      }
      
      console.log('✅ [RESET] SignOut completo!');

      // PASSO 4: Delay para garantir que tudo propaga
      console.log('⏳ [RESET] Aguardando propagação (2s)...');
      console.log('⏳ [RESET] Iniciando delay às:', new Date().toISOString());
      
      await new Promise(resolve => setTimeout(() => {
        console.log('⏳ [RESET] Delay a terminar às:', new Date().toISOString());
        resolve();
      }, 2000));
      
      console.log('✅ [RESET] Delay completo!');

      // PASSO 5: Limpar flag de "is_resetting"
      await AsyncStorage.removeItem('is_resetting_password');
      console.log('✅ [RESET] Flag is_resetting removida!');

      console.log('🎉 [RESET] Reset de password completo com sucesso!');

      setResetSuccess(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      return true;
    } catch (error) {
      console.error('❌ [RESET] Erro:', error);
      await AsyncStorage.removeItem('is_resetting_password');
      await AsyncStorage.removeItem('just_reset_password');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erro', 'Ocorreu um erro.');
      return false;
    } finally {
      isResettingRef.current = false;
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return false;
    setIsResending(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Erro', 'Não foi possível reenviar.');
        return false;
      }

      setTimeLeft(TOKEN_EXPIRY_TIME);
      setIsExpired(false);
      setResendTimer(RESEND_COOLDOWN);
      setCanResend(false);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Código Enviado', 'Verifica o teu email.');
      return true;
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erro', 'Não foi possível reenviar.');
      return false;
    } finally {
      setIsResending(false);
    }
  };

  const handleTokenChange = (value) => {
    setToken(value.replace(/[^0-9]/g, ''));
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
    setToken('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, []);

  const getFormattedTime = () => formatTimeRemaining(timeLeft);
  const getResendText = () => canResend ? 'Reenviar código' : `Reenviar em ${resendTimer}s`;
  const canSubmit = () => token.length === 8 && newPassword.length >= 6 && confirmPassword.length >= 6 && !isVerifying && !isExpired;

  return {
    token, setToken, newPassword, setNewPassword, confirmPassword, setConfirmPassword,
    showPassword, showConfirmPassword, resetSuccess,
    isVerifying, isResending, timeLeft, isExpired, canResend, resendTimer,
    handleVerifyAndReset, handleResendCode, handleTokenChange,
    toggleShowPassword, toggleShowConfirmPassword, cleanup,
    getFormattedTime, getResendText, canSubmit,
  };
};