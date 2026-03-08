import { ViewStyle } from 'react-native';

export interface ThemeTokens {
  colors: {
    neutral: {
      lightest?: string;
      lighter?: string;
      light?: string;
      medium?: string;
      dark: string;
      darker: string;
      darkest: string;
      border?: string;
      borderSubtle?: string;
      [key: string]: string | undefined;
    };
    brand: Record<number | string, string>;
    semantic: {
      primary: string;
      secondary?: string;
      success: string;
      warning: string;
      error: string;
      info: string;
    };
    utility?: Record<string, string>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  spacing: Record<number | string, number>;
  radii: {
    none: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    pill: number;
    [key: string]: number;
  };
  elevation: Record<string, ViewStyle>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typography?: any;
  fontSizes?: Record<number | string, number>;
  lineHeights?: Record<string, number>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  motion?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
