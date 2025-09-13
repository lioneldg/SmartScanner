import { Theme } from '../types/theme';

// Base spacing and typography that are the same for both themes
const baseTheme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      xxl: 32,
    },
    weights: {
      normal: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  },
};

export const lightTheme: Theme = {
  ...baseTheme,
  colors: {
    // Background colors
    background: '#FFFFFF',
    surface: '#F8F9FA',
    card: '#FFFFFF',

    // Text colors
    text: '#1A1A1A',
    textSecondary: '#666666',
    textTertiary: '#999999',
    buttonText: '#1A1A1A',

    // Primary colors
    primary: '#FF9500',
    primaryLight: '#FFB84D',
    primaryDark: '#E68500',

    // Status colors
    success: '#28A745',
    warning: '#FFC107',
    error: '#DC3545',
    info: '#17A2B8',

    // Border and divider colors
    border: '#E9ECEF',
    divider: '#DEE2E6',

    // Interactive colors
    ripple: 'rgba(255, 149, 0, 0.06)',
    overlay: 'rgba(0, 0, 0, 0.1)',

    // Modal colors
    modalBackground: '#FFFFFF',
    modalOverlay: 'rgba(0, 0, 0, 0.5)',
  },
};

export const darkTheme: Theme = {
  ...baseTheme,
  colors: {
    // Background colors
    background: '#000000',
    surface: '#1C1C1E',
    card: '#2C2C2E',

    // Text colors
    text: '#FFFFFF',
    textSecondary: '#AEAEB2',
    textTertiary: '#8E8E93',
    buttonText: '#FFFFFF',

    // Primary colors
    primary: '#007AFF',
    primaryLight: '#5AC8FA',
    primaryDark: '#0051D5',

    // Status colors
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    info: '#64D2FF',

    // Border and divider colors
    border: '#38383A',
    divider: '#48484A',

    // Interactive colors
    ripple: 'rgba(0, 122, 255, 0.06)',
    overlay: 'rgba(255, 255, 255, 0.1)',

    // Modal colors
    modalBackground: '#1C1C1E',
    modalOverlay: 'rgba(0, 0, 0, 0.7)',
  },
};
