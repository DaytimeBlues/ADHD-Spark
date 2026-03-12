import { ViewStyle } from 'react-native';

type ThemeStringScale = Record<string, string | undefined>;
type ThemeNumberScale = Record<string | number, number>;
type ThemeUnknownRecord = Record<string, unknown>;

interface ThemeSemanticColors {
  primary: string;
  secondary?: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  [key: string]: string | undefined;
}

interface NightAweColorCollections extends ThemeUnknownRecord {
  raw?: ThemeStringScale;
  sky?: ThemeUnknownRecord;
  horizon?: ThemeStringScale;
  stars?: ThemeStringScale;
  constellation?: ThemeStringScale;
  feature?: ThemeStringScale;
  surface?: ThemeStringScale;
}

interface ThemeTypography extends ThemeUnknownRecord {
  fontFamily?: Record<string, string>;
  mono?: {
    fontFamily?: string;
  };
  h1?: number;
  h2?: number;
  h3?: number;
  h4?: number;
  base?: number;
  sm?: number;
  xs?: number;
  lg?: number;
  xl?: number;
  timerHero?: number;
}

interface ThemeLayout extends ThemeUnknownRecord {
  maxWidth?: ThemeNumberScale;
  minTapTarget?: number;
  minTapTargetComfortable?: number;
}

interface ThemeMotion extends ThemeUnknownRecord {
  scales?: Record<string, number>;
  transitions?: Record<string, string>;
}

type ThemeColorValue =
  | ThemeStringScale
  | Record<number | string, string>
  | ThemeSemanticColors
  | NightAweColorCollections
  | undefined;

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
    semantic: ThemeSemanticColors;
    utility?: Record<string, string>;
    cosmic?: ThemeStringScale;
    nightAwe?: NightAweColorCollections;
    text?: ThemeStringScale;
    indigo?: ThemeStringScale;
    success: ThemeStringScale;
    warning: ThemeStringScale;
    error: ThemeStringScale;
    info: ThemeStringScale;
    [key: string]: ThemeColorValue;
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
  type?: ThemeTypography;
  typography?: ThemeTypography;
  fontSizes?: Record<number | string, number>;
  lineHeights?: Record<string, number>;
  layout?: ThemeLayout;
  motion?: ThemeMotion;
  [key: string]: unknown;
}
