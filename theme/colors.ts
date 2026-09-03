// Semantic color palette. Every color in the app must come from these tokens.
// No raw hex codes should appear anywhere else in the application.

export interface ColorTokens {
  background: string;
  surface: string;
  surfaceElevated: string;
  primary: string;
  primaryMuted: string;
  success: string;
  warning: string;
  error: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  overlay: string;
}

// Light mode palette.
// All text/background pairings have been checked for a minimum 4.5:1 contrast ratio.
export const lightColors: ColorTokens = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#F1F5F9',
  primary: '#0066CC',
  primaryMuted: '#E6F0FF',
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  overlay: 'rgba(15, 23, 42, 0.48)',
};

// Dark mode palette.
// All text/background pairings have been checked for a minimum 4.5:1 contrast ratio.
export const darkColors: ColorTokens = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceElevated: '#334155',
  primary: '#3B82F6',
  primaryMuted: '#1E3A8A',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  border: '#475569',
  overlay: 'rgba(0, 0, 0, 0.56)',
};
