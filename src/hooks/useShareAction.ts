import { useCallback } from 'react';
import { NativeModules, Share, AccessibilityInfo } from 'react-native';
import { OverlayEvent } from './useOverlayEvents';
import { LoggerService } from '../services/LoggerService';

interface UseShareActionProps {
  isOverlayEnabled: boolean;
  isOverlayPermissionRequesting: boolean;
  overlayEvents: OverlayEvent[];
  addOverlayEvent: (label: string) => void;
}

export const useShareAction = ({
  isOverlayEnabled,
  isOverlayPermissionRequesting,
  overlayEvents,
  addOverlayEvent,
}: UseShareActionProps) => {
  const handleCopyDiagnostics = useCallback(async () => {
    if (!__DEV__) {
      return;
    }

    const diagnostics = [
      `overlay_enabled=${isOverlayEnabled ? 'yes' : 'no'}`,
      `permission_requesting=${isOverlayPermissionRequesting ? 'yes' : 'no'}`,
      ...overlayEvents.map((event) => {
        return `${new Date(event.timestamp).toISOString()} ${event.label}`;
      }),
    ].join('\n');

    try {
      const clipboardModule = NativeModules.Clipboard as
        | { setString?: (value: string) => void }
        | undefined;

      if (clipboardModule?.setString) {
        clipboardModule.setString(diagnostics);
        addOverlayEvent('Diagnostics copied');
        AccessibilityInfo.announceForAccessibility(
          'Overlay diagnostics copied to clipboard',
        );
        return;
      }

      await Share.share({
        title: 'Overlay diagnostics',
        message: diagnostics,
      });
      addOverlayEvent('Diagnostics shared');
      AccessibilityInfo.announceForAccessibility('Overlay diagnostics shared');
    } catch (error) {
      LoggerService.warn({
        service: 'useShareAction',
        operation: 'handleCopyDiagnostics',
        message: 'Failed to export diagnostics',
        error,
      });
      addOverlayEvent('Diagnostics export failed');
      AccessibilityInfo.announceForAccessibility(
        'Overlay diagnostics export failed',
      );
    }
  }, [
    addOverlayEvent,
    isOverlayEnabled,
    isOverlayPermissionRequesting,
    overlayEvents,
  ]);

  return { handleCopyDiagnostics };
};
