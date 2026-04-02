/**
 * 🎨 VITALIX THEME
 * Paleta de cores e tokens de design centralizados
 * Importar em qualquer ficheiro: import { COLORS, FONTS, RADII } from '../utils/theme'
 */

export const COLORS = {
  // ── Cor principal ──────────────────────────────────────────────────────────
  primary: "#00C896", // Verde Vitalix
  primaryLight: "#00F5B4", // Verde claro (highlights, badges)
  primaryDark: "#009E78", // Verde escuro (pressed state)
  primaryMuted: "rgba(0, 200, 150, 0.12)", // Verde transparente (backgrounds)

  // ── Fundos ─────────────────────────────────────────────────────────────────
  background: "#111418", // Fundo principal
  surface: "#1C2128", // Cards, modais
  surfaceHigh: "#242B34", // Cards elevados, inputs
  surfaceBorder: "#2D3440", // Bordas subtis

  // ── Texto ──────────────────────────────────────────────────────────────────
  textPrimary: "#E6EDF3", // Texto principal
  textSecondary: "#8B949E", // Texto secundário
  textMuted: "#555E68", // Texto muted / placeholders
  textInverse: "#111418", // Texto sobre cor primária

  // ── Semânticas ─────────────────────────────────────────────────────────────
  success: "#00C896",
  warning: "#F0A500",
  danger: "#F85149",
  info: "#58A6FF",
  water: "#4FC3F7",

  // ── Gradiente (para usar com LinearGradient se necessário) ─────────────────
  gradientStart: "#00C896",
  gradientEnd: "#009E78",
};

export const FONTS = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
};

export const RADII = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

// ── Estilos reutilizáveis ─────────────────────────────────────────────────────

export const CARD_STYLE = {
  backgroundColor: COLORS.surface,
  borderRadius: RADII.lg,
  padding: SPACING.lg,
  marginBottom: SPACING.md,
  borderWidth: 1,
  borderColor: COLORS.surfaceBorder,
};

export const SECTION_TITLE_STYLE = {
  color: COLORS.textMuted,
  fontSize: 11,
  fontWeight: FONTS.bold,
  letterSpacing: 1.5,
  textTransform: "uppercase",
  marginBottom: SPACING.sm,
  marginTop: SPACING.xl,
};
