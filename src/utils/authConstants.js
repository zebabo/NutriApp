/**
 * 🔐 AUTH CONSTANTS
 * Constantes centralizadas para autenticação
 */

// Validação
export const MIN_PASSWORD_LENGTH = 6;
export const TOKEN_LENGTH = 8; // Supabase envia 8 dígitos
export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 50;

// Timers
export const TOKEN_EXPIRY_TIME = 600; // 10 minutos em segundos
export const RESEND_COOLDOWN = 60; // 60 segundos
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION = 300; // 5 minutos

// Regex patterns
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const MEDIUM_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;

// Password strength levels
export const PASSWORD_STRENGTH = {
  WEAK: 'weak',
  MEDIUM: 'medium',
  STRONG: 'strong',
};

export const PASSWORD_STRENGTH_CONFIG = {
  [PASSWORD_STRENGTH.WEAK]: {
    label: 'Fraca',
    color: '#E74C3C',
    icon: '🔴',
    minLength: 1,
  },
  [PASSWORD_STRENGTH.MEDIUM]: {
    label: 'Média',
    color: '#F39C12',
    icon: '🟡',
    minLength: 6,
  },
  [PASSWORD_STRENGTH.STRONG]: {
    label: 'Forte',
    color: '#32CD32',
    icon: '🟢',
    minLength: 8,
  },
};

// Error messages
export const AUTH_ERRORS = {
  INVALID_EMAIL: 'Email inválido. Verifica o formato.',
  EMAIL_REQUIRED: 'O email é obrigatório.',
  PASSWORD_TOO_SHORT: `Password deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
  PASSWORDS_DONT_MATCH: 'As passwords não coincidem.',
  NAME_REQUIRED: 'O nome é obrigatório.',
  NAME_TOO_SHORT: `Nome deve ter pelo menos ${MIN_NAME_LENGTH} caracteres.`,
  INVALID_CREDENTIALS: 'Email ou password incorretos.',
  EMAIL_IN_USE: 'Este email já está registado.',
  INVALID_TOKEN: 'Código inválido ou expirado.',
  TOKEN_REQUIRED: 'Introduz o código de 8 dígitos.',
  WEAK_PASSWORD: 'Password muito fraca. Adiciona números e símbolos.',
  TOO_MANY_ATTEMPTS: 'Demasiadas tentativas. Aguarda alguns minutos.',
};

// Success messages
export const AUTH_SUCCESS = {
  LOGIN: 'Login efetuado com sucesso!',
  SIGNUP: 'Registo efetuado! Verifica o teu email.',
  RESET_EMAIL_SENT: 'Código enviado para o teu email.',
  PASSWORD_RESET: 'Password alterada com sucesso!',
};

// Loading states
export const LOADING_STATES = {
  IDLE: 'idle',
  LOGGING_IN: 'logging_in',
  SIGNING_UP: 'signing_up',
  SENDING_RESET: 'sending_reset',
  VERIFYING_TOKEN: 'verifying_token',
  RESETTING_PASSWORD: 'resetting_password',
};

// Auth modes
export const AUTH_MODES = {
  LOGIN: 'login',
  SIGNUP: 'signup',
};

// Input types
export const INPUT_TYPES = {
  EMAIL: 'email',
  PASSWORD: 'password',
  NAME: 'name',
  CONFIRM_PASSWORD: 'confirm_password',
  TOKEN: 'token',
};