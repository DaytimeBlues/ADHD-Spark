import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { BrainDumpEmptyState } from '../src/components/brain-dump/BrainDumpEmptyState';
import { BrainDumpError } from '../src/components/brain-dump/BrainDumpError';

jest.mock('../src/theme/useTheme', () => ({
  useTheme: jest.fn(),
}));

const mockUseTheme = jest.requireMock('../src/theme/useTheme')
  .useTheme as jest.Mock;

describe('Brain dump feedback components', () => {
  beforeEach(() => {
    mockUseTheme.mockReturnValue({ isCosmic: false });
  });

  describe('BrainDumpEmptyState', () => {
    it('renders the awaiting message only when visible', () => {
      const { rerender } = render(<BrainDumpEmptyState isVisible />);

      expect(screen.getByText('_AWAITING_INPUT')).toBeTruthy();

      rerender(<BrainDumpEmptyState isVisible={false} />);

      expect(screen.queryByText('_AWAITING_INPUT')).toBeNull();
    });
  });

  describe('BrainDumpError', () => {
    it('renders the error message without a connect button by default', () => {
      render(<BrainDumpError error="Connection failed" />);

      expect(screen.getByText('Connection failed')).toBeTruthy();
      expect(screen.queryByText('CONNECT GOOGLE')).toBeNull();
    });

    it('renders the connect action and calls onConnect when pressed', () => {
      const onConnect = jest.fn();

      render(
        <BrainDumpError
          error="Connect Google to continue"
          showConnectButton
          onConnect={onConnect}
        />,
      );

      fireEvent.press(screen.getByText('CONNECT GOOGLE'));

      expect(onConnect).toHaveBeenCalledTimes(1);
    });

    it('shows the connecting label while a connection is in progress', () => {
      render(
        <BrainDumpError error="Connecting..." showConnectButton isConnecting />,
      );

      expect(screen.getByText('CONNECTING...')).toBeTruthy();
    });
  });
});
