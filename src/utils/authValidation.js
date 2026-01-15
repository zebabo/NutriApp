/**
 * ✅ AUTH VALIDATION
 * Funções de validação para autenticação
 */

import {
    AUTH_ERRORS,
    EMAIL_REGEX,
    MAX_NAME_LENGTH,
    MEDIUM_PASSWORD_REGEX,
    MIN_NAME_LENGTH,
    MIN_PASSWORD_LENGTH,
    PASSWORD_STRENGTH,
    STRONG_PASSWORD_REGEX,
    TOKEN_LENGTH,
} from './authConstants';

/**
 * Valida formato de email
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return { valid: false, error: AUTH_ERRORS.EMAIL_REQUIRED };
  }

  const trimmedEmail = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { valid: false, error: AUTH_ERRORS.INVALID_EMAIL };
  }

  return { valid: true, value: trimmedEmail };
};

/**
 * Valida password
 */
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, error: AUTH_ERRORS.PASSWORD_TOO_SHORT };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { valid: false, error: AUTH_ERRORS.PASSWORD_TOO_SHORT };
  }

  return { valid: true };
};

/**
 * Valida confirmação de password
 */
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return { valid: false, error: AUTH_ERRORS.PASSWORDS_DONT_MATCH };
  }

  return { valid: true };
};

/**
 * Valida nome
 */
export const validateName = (name) => {
  if (!name || name.trim() === '') {
    return { valid: false, error: AUTH_ERRORS.NAME_REQUIRED };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < MIN_NAME_LENGTH) {
    return { valid: false, error: AUTH_ERRORS.NAME_TOO_SHORT };
  }

  if (trimmedName.length > MAX_NAME_LENGTH) {
    return { valid: false, error: `Nome muito longo (máx ${MAX_NAME_LENGTH} caracteres)` };
  }

  return { valid: true, value: trimmedName };
};

/**
 * Valida token de reset
 */
export const validateToken = (token) => {
  if (!token || token.trim() === '') {
    return { valid: false, error: AUTH_ERRORS.TOKEN_REQUIRED };
  }

  const trimmedToken = token.trim();

  if (trimmedToken.length !== TOKEN_LENGTH) {
    return { valid: false, error: AUTH_ERRORS.TOKEN_REQUIRED };
  }

  // Verificar se é numérico
  if (!/^\d+$/.test(trimmedToken)) {
    return { valid: false, error: 'O código deve conter apenas números' };
  }

  return { valid: true, value: trimmedToken };
};

/**
 * Calcula força da password
 */
export const getPasswordStrength = (password) => {
  if (!password) return null;

  if (STRONG_PASSWORD_REGEX.test(password)) {
    return PASSWORD_STRENGTH.STRONG;
  }

  if (MEDIUM_PASSWORD_REGEX.test(password)) {
    return PASSWORD_STRENGTH.MEDIUM;
  }

  return PASSWORD_STRENGTH.WEAK;
};

/**
 * Valida todos os campos de login
 */
export const validateLoginForm = (email, password) => {
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return emailValidation;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return passwordValidation;
  }

  return { valid: true };
};

/**
 * Valida todos os campos de signup
 */
export const validateSignupForm = (name, email, password, confirmPassword) => {
  const nameValidation = validateName(name);
  if (!nameValidation.valid) {
    return nameValidation;
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return emailValidation;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return passwordValidation;
  }

  const confirmValidation = validatePasswordConfirmation(password, confirmPassword);
  if (!confirmValidation.valid) {
    return confirmValidation;
  }

  return { valid: true };
};

/**
 * Valida formulário de reset
 */
export const validateResetForm = (token, newPassword, confirmPassword) => {
  const tokenValidation = validateToken(token);
  if (!tokenValidation.valid) {
    return tokenValidation;
  }

  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
    return passwordValidation;
  }

  const confirmValidation = validatePasswordConfirmation(newPassword, confirmPassword);
  if (!confirmValidation.valid) {
    return confirmValidation;
  }

  return { valid: true };
};

/**
 * Sanitiza email para uso
 */
export const sanitizeEmail = (email) => {
  return email.trim().toLowerCase();
};

/**
 * Formata tempo restante
 */
export const formatTimeRemaining = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};