import React from 'react';
import { act, render } from '@testing-library/react-native';
import { THEME_METADATA } from '../../../../theme/tokens';
import type { ThemeVariant } from '../../../../theme/themeVariant';
import { useThemeSwitcher } from '../useThemeSwitcher';

let mockCurrentVariant: ThemeVariant = 'linear';
const mockSetVariant = jest.fn(async (_variant: ThemeVariant) => undefined);

jest.mock('../../../../theme/useTheme', () => ({
  useTheme: () => ({
    variant: mockCurrentVariant,
    setVariant: mockSetVariant,
  }),
}));

describe('useThemeSwitcher', () => {
  let latest: ReturnType<typeof useThemeSwitcher> | null = null;

  const HookHost = () => {
    latest = useThemeSwitcher();
    return null;
  };

  const getLatest = () => {
    if (!latest) {
      throw new Error('Hook state not available');
    }
    return latest;
  };

  beforeEach(() => {
    mockCurrentVariant = 'linear';
    mockSetVariant.mockResolvedValue(undefined);
  });

  afterEach(() => {
    latest = null;
    jest.clearAllMocks();
  });

  it('returns all theme options mapped from metadata', () => {
    render(<HookHost />);

    expect(getLatest().themeOptions).toHaveLength(3);

    const linearOption = getLatest().themeOptions.find(
      (option) => option.variant === 'linear',
    );
    const cosmicOption = getLatest().themeOptions.find(
      (option) => option.variant === 'cosmic',
    );
    const nightAweOption = getLatest().themeOptions.find(
      (option) => option.variant === 'nightAwe',
    );

    expect(linearOption?.label).toBe(THEME_METADATA.linear.label);
    expect(cosmicOption?.label).toBe(THEME_METADATA.cosmic.label);
    expect(nightAweOption?.label).toBe(THEME_METADATA.nightAwe.label);
    expect(linearOption?.selected).toBe(true);
    expect(cosmicOption?.selected).toBe(false);
    expect(nightAweOption?.selected).toBe(false);
  });

  it('delegates theme selection to setVariant', async () => {
    render(<HookHost />);

    await act(async () => {
      await getLatest().selectTheme('cosmic');
    });

    expect(mockSetVariant).toHaveBeenCalledWith('cosmic');
  });

  it('updates selected state when theme variant changes', () => {
    const { rerender } = render(<HookHost />);

    mockCurrentVariant = 'cosmic';
    rerender(<HookHost />);

    const cosmicOption = getLatest().themeOptions.find(
      (option) => option.variant === 'cosmic',
    );
    expect(cosmicOption?.selected).toBe(true);
  });
});
