import { NightAweTokens } from '../theme/nightAweTokens';
import {
  THEME_METADATA,
  isValidThemeVariant,
  migrateThemeVariant,
} from '../theme/themeVariant';

describe('Night Awe theme support', () => {
  it('migrates and validates the nightAwe variant', () => {
    expect(migrateThemeVariant('nightAwe')).toBe('nightAwe');
    expect(isValidThemeVariant('nightAwe')).toBe(true);
  });

  it('exposes Night Awe metadata for the theme switcher', () => {
    expect(THEME_METADATA.nightAwe.label).toBe('Night Awe');
    expect(THEME_METADATA.nightAwe.preview.background).toBeDefined();
    expect(THEME_METADATA.nightAwe.preview.accent).toBeDefined();
  });

  it('defines semantic time-of-day and constellation tokens', () => {
    expect(NightAweTokens.colors.semantic.primary).toBe('#AFC7FF');
    expect(NightAweTokens.colors.nightAwe?.sky?.night).toBeDefined();
    expect(NightAweTokens.colors.nightAwe?.sky?.sunrise).toBeDefined();
    expect(NightAweTokens.colors.nightAwe?.constellation?.line).toBeDefined();
    expect(NightAweTokens.colors.nightAwe?.feature?.home).toBeDefined();
  });
});
