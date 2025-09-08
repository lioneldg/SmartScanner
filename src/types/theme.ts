export type ThemeMode = 'light' | 'dark';

export interface Theme {
  colors: {
    // Background colors
    background: string;
    surface: string;
    card: string;

    // Text colors
    text: string;
    textSecondary: string;
    textTertiary: string;

    // Primary colors
    primary: string;
    primaryLight: string;
    primaryDark: string;

    // Status colors
    success: string;
    warning: string;
    error: string;
    info: string;

    // Border and divider colors
    border: string;
    divider: string;

    // Interactive colors
    ripple: string;
    overlay: string;

    // Modal colors
    modalBackground: string;
    modalOverlay: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    sizes: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
    weights: {
      normal: '400';
      medium: '500';
      semibold: '600';
      bold: '700';
    };
  };
}
