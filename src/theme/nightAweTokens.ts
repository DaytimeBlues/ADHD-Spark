import { ThemeTokens } from './types';
import {
  cosmicSpacing,
  cosmicRadii,
  cosmicElevation,
  cosmicTypography,
  cosmicFontSizes,
  cosmicLineHeights,
  cosmicMotion,
} from './cosmicTokens';
import { nightAweColors } from './nightAwe/colors';
import {
  semanticColors,
  neutralScale,
  brandScale,
  surfaceColors,
  textColors,
  utilityColors,
  skyColors,
  horizonColors,
  starColors,
  constellationColors,
  featureColors,
} from './nightAwe/semantic';
import {
  backgroundStyles,
  NightAweBackgroundVariant,
} from './nightAwe/backgrounds';

export type { NightAweBackgroundVariant };
export { nightAweColors };
export {
  semanticColors as nightAweSemanticColors,
  neutralScale as nightAweNeutralScale,
  brandScale as nightAweBrandScale,
  surfaceColors as nightAweSurfaceColors,
  textColors as nightAweTextColors,
  utilityColors as nightAweUtilityColors,
  skyColors,
  horizonColors,
  starColors,
  constellationColors,
  featureColors,
  backgroundStyles as nightAweBackgroundStyles,
};

export const NightAweTokens: ThemeTokens = {
  colors: {
    neutral: neutralScale,
    brand: brandScale,
    semantic: semanticColors,
    utility: utilityColors,
    text: textColors,
    success: {
      main: semanticColors.success,
      subtle: 'rgba(143, 191, 168, 0.14)',
    },
    warning: {
      main: semanticColors.warning,
      subtle: 'rgba(232, 192, 141, 0.14)',
    },
    error: {
      main: semanticColors.error,
      subtle: 'rgba(200, 122, 104, 0.14)',
    },
    info: {
      main: semanticColors.info,
      subtle: 'rgba(175, 199, 255, 0.14)',
    },
    nightAwe: {
      raw: nightAweColors,
      sky: skyColors,
      horizon: horizonColors,
      stars: starColors,
      constellation: constellationColors,
      feature: featureColors,
      surface: surfaceColors,
    },
  },
  spacing: cosmicSpacing,
  radii: cosmicRadii,
  elevation: cosmicElevation,
  typography: cosmicTypography,
  fontSizes: cosmicFontSizes,
  lineHeights: cosmicLineHeights,
  motion: cosmicMotion,
  background: backgroundStyles,
  surface: surfaceColors,
} as const;

export type NightAweTokensType = typeof NightAweTokens;
