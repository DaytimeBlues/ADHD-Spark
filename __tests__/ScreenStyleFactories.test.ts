import { Platform } from 'react-native';
import { CosmicTokens, NightAweTokens, Tokens } from '../src/theme/tokens';
import type { ThemeTokens } from '../src/theme/types';
import { getCheckInScreenStyles } from '../src/screens/CheckInScreen.styles';
import { getFogCutterScreenStyles } from '../src/screens/FogCutterScreen.styles';
import { getIgniteScreenStyles } from '../src/screens/IgniteScreen.styles';
import { getTasksScreenStyles } from '../src/screens/TasksScreen.styles';

let mockIsWeb = false;

jest.mock('../src/utils/PlatformUtils', () => ({
  get isWeb() {
    return mockIsWeb;
  },
  get isAndroid() {
    return !mockIsWeb;
  },
  get isIOS() {
    return false;
  },
}));

const mockWebPlatform = () =>
  jest
    .spyOn(Platform, 'select')
    .mockImplementation(
      <T>(config: { web?: T; default?: T; ios?: T; android?: T }) =>
        config.web ?? config.default ?? config.ios ?? config.android,
    );

describe('screen style factories', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    mockIsWeb = false;
  });

  it('returns native check-in styles for both themes', () => {
    const cosmicStyles = getCheckInScreenStyles(true);
    const linearStyles = getCheckInScreenStyles(false);

    expect(cosmicStyles.title.fontFamily).toBe('Space Grotesk');
    expect(linearStyles.title.fontFamily).toBe(Tokens.type.fontFamily.sans);
    expect(cosmicStyles.selected.borderTopWidth).toBe(2);
    expect(linearStyles.selected.borderTopWidth).toBe(1);
  });

  it('returns web check-in styles for both themes', () => {
    mockIsWeb = true;
    mockWebPlatform();

    const cosmicStyles = getCheckInScreenStyles(true);
    const linearStyles = getCheckInScreenStyles(false);

    expect(cosmicStyles.title.textShadow).toContain('rgba');
    expect(cosmicStyles.option.backdropFilter).toBe('blur(8px)');
    expect(linearStyles.option.transition).toBe('all 0.2s ease');
    expect(linearStyles.option.backdropFilter).toBeUndefined();
    expect(linearStyles.selected.boxShadow).toBe('0 0 0 0');
  });

  it('returns native fog cutter styles for both themes', () => {
    const cosmicStyles = getFogCutterScreenStyles(
      'cosmic',
      CosmicTokens as unknown as ThemeTokens,
    );
    const linearStyles = getFogCutterScreenStyles(
      'linear',
      Tokens as unknown as ThemeTokens,
    );

    expect(cosmicStyles.container.backgroundColor).toBe('transparent');
    expect(linearStyles.container.backgroundColor).toBe(
      Tokens.colors.neutral.darkest,
    );
    expect(cosmicStyles.input.borderRadius).toBe(8);
    expect(linearStyles.input.borderRadius).toBe(0);
  });

  it('returns web fog cutter styles for both themes', () => {
    mockIsWeb = true;
    mockWebPlatform();

    const cosmicStyles = getFogCutterScreenStyles(
      'cosmic',
      CosmicTokens as unknown as ThemeTokens,
    );
    const linearStyles = getFogCutterScreenStyles(
      'linear',
      Tokens as unknown as ThemeTokens,
    );
    const cosmicFocusedStyles = cosmicStyles.inputFocused as {
      boxShadow?: string;
    };
    const linearFocusedStyles = linearStyles.inputFocused as {
      boxShadow?: string;
    };

    expect(cosmicStyles.input.outlineStyle).toBe('none');
    expect(cosmicFocusedStyles.boxShadow).toContain('rgba');
    expect(cosmicStyles.taskCard.cursor).toBe('pointer');
    expect(linearStyles.input.transition).toBe('border-color 0.2s ease');
    expect(linearFocusedStyles.boxShadow).toBeUndefined();
  });

  it('returns native ignite styles for both themes', () => {
    const cosmicStyles = getIgniteScreenStyles(
      'cosmic',
      CosmicTokens as unknown as ThemeTokens,
    );
    const linearStyles = getIgniteScreenStyles(
      'linear',
      Tokens as unknown as ThemeTokens,
    );

    expect(cosmicStyles.title.fontFamily).toBe('Space Grotesk');
    expect(linearStyles.title.fontFamily).toBe(Tokens.type.fontFamily.mono);
    expect(cosmicStyles.statusText.color).toBe(
      CosmicTokens.colors.semantic.primary,
    );
    expect(linearStyles.statusText.color).toBe(Tokens.colors.brand[500]);
  });

  it('returns web ignite styles for both themes', () => {
    mockIsWeb = true;
    mockWebPlatform();

    const cosmicStyles = getIgniteScreenStyles(
      'cosmic',
      CosmicTokens as unknown as ThemeTokens,
    );
    const linearStyles = getIgniteScreenStyles(
      'linear',
      Tokens as unknown as ThemeTokens,
    );

    expect(cosmicStyles.title.textShadow).toContain('rgba');
    expect(cosmicStyles.statusBadge.backdropFilter).toBe('blur(8px)');
    expect(cosmicStyles.resetButton.cursor).toBe('pointer');
    expect(linearStyles.statusBadge.backdropFilter).toBeUndefined();
    expect(linearStyles.resetButton.transition).toBeUndefined();
  });

  it('returns shared tasks screen styles', () => {
    const styles = getTasksScreenStyles(
      'cosmic',
      CosmicTokens as unknown as ThemeTokens,
    );

    expect(styles.headerSubtitle.color).toBe(
      CosmicTokens.colors.semantic.primary,
    );
    expect(styles.addTaskButton.borderRadius).toBe(20);
    expect(styles.filterTab.flex).toBe(1);
  });

  it('returns shared tasks screen styles for night awe', () => {
    const styles = getTasksScreenStyles(
      'nightAwe',
      NightAweTokens as unknown as ThemeTokens,
    );

    expect(styles.headerSubtitle.color).toBe(
      NightAweTokens.colors.nightAwe?.feature?.tasks,
    );
    expect(styles.addTaskButtonText.color).toBe(
      NightAweTokens.colors.text?.onAccent,
    );
  });
});
