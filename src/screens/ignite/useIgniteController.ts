import { useEffect, useRef, useState } from 'react';
import SoundService from '../../services/SoundService';
import StorageService from '../../services/StorageService';
import UXMetricsService from '../../services/UXMetricsService';
import ActivationService from '../../services/ActivationService';
import { LoggerService } from '../../services/LoggerService';
import useTimer from '../../hooks/useTimer';
import { useTimerStore } from '../../store/useTimerStore';

export const IGNITE_DURATION_SECONDS = 5 * 60;

export const useIgniteController = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const sessionIdRef = useRef<string | null>(null);

  const { timeLeft, isRunning, formattedTime, start, pause, reset } = useTimer({
    id: 'ignite',
    initialTime: IGNITE_DURATION_SECONDS,
    onComplete: () => {
      SoundService.playCompletionSound();
      UXMetricsService.track('ignite_timer_completed');
      const sessionId = sessionIdRef.current;
      if (sessionId) {
        ActivationService.updateSessionStatus(sessionId, 'completed').catch(
          (error) => {
            LoggerService.error({
              service: 'IgniteScreen',
              operation: 'onComplete',
              message: 'Failed to mark session completed',
              error,
              context: { sessionId },
            });
          },
        );
        sessionIdRef.current = null;
      }
    },
  });

  useEffect(() => {
    SoundService.initBrownNoise();

    const loadState = async () => {
      try {
        const pendingStart = await ActivationService.consumePendingStart();
        const storedState = await StorageService.getJSON<{
          isPlaying: boolean;
          activeSessionId?: string;
        }>(StorageService.STORAGE_KEYS.igniteState);

        if (storedState) {
          UXMetricsService.track('ignite_session_restored');

          if (storedState.isPlaying) {
            setIsPlaying(true);
            SoundService.playBrownNoise();
          }

          if (storedState.activeSessionId) {
            sessionIdRef.current = storedState.activeSessionId;

            if (!useTimerStore.getState().isRunning) {
              ActivationService.updateSessionStatus(
                storedState.activeSessionId,
                'resumed',
              ).catch((error) => {
                LoggerService.error({
                  service: 'IgniteScreen',
                  operation: 'loadState',
                  message: 'Failed to mark session resumed',
                  error,
                  context: { sessionId: storedState.activeSessionId },
                });
              });
            }
          }
        }

        if (!sessionIdRef.current) {
          const lastActive = await StorageService.getJSON<{
            id: string;
            status: string;
          }>(StorageService.STORAGE_KEYS.lastActiveSession);

          if (lastActive && lastActive.status === 'started') {
            sessionIdRef.current = lastActive.id;
            ActivationService.updateSessionStatus(
              lastActive.id,
              'resumed',
            ).catch((error) => {
              LoggerService.error({
                service: 'IgniteScreen',
                operation: 'loadState',
                message: 'Failed to resume last session',
                error,
                context: { sessionId: lastActive.id },
              });
            });
          }
        }

        if (pendingStart) {
          const newSessionId = await ActivationService.startSession(
            pendingStart.source,
          );
          sessionIdRef.current = newSessionId;
          start();
          UXMetricsService.track('ignite_timer_started_from_pending_handoff');
        }
      } catch (error) {
        LoggerService.error({
          service: 'IgniteScreen',
          operation: 'loadState',
          message: 'Failed to load ignite state',
          error,
        });
      } finally {
        setIsRestoring(false);
      }
    };

    loadState();

    return () => {
      SoundService.stopBrownNoise();
      SoundService.releaseBrownNoise();
    };
  }, [start]);

  useEffect(() => {
    StorageService.setJSON(StorageService.STORAGE_KEYS.igniteState, {
      isPlaying,
      activeSessionId: sessionIdRef.current,
    });
  }, [isPlaying]);

  const startTimer = () => {
    if (!sessionIdRef.current) {
      ActivationService.startSession('ignite')
        .then((sessionId) => {
          sessionIdRef.current = sessionId;
        })
        .catch((error) => {
          LoggerService.error({
            service: 'IgniteScreen',
            operation: 'startTimer',
            message: 'Failed to start session',
            error,
          });
        });
    }

    start();
    UXMetricsService.track('ignite_timer_started');
  };

  const pauseTimer = () => {
    pause();
    const sessionId = sessionIdRef.current;
    if (sessionId) {
      ActivationService.updateSessionStatus(sessionId, 'abandoned').catch(
        (error) => {
          LoggerService.error({
            service: 'IgniteScreen',
            operation: 'pauseTimer',
            message: 'Failed to mark session abandoned',
            error,
            context: { sessionId },
          });
        },
      );
      sessionIdRef.current = null;
    }
  };

  const resetTimer = () => {
    reset();
    setIsPlaying(false);
    SoundService.pauseBrownNoise();
    const sessionId = sessionIdRef.current;
    if (sessionId) {
      ActivationService.updateSessionStatus(sessionId, 'abandoned').catch(
        (error) => {
          LoggerService.error({
            service: 'IgniteScreen',
            operation: 'resetTimer',
            message: 'Failed to mark session abandoned',
            error,
            context: { sessionId },
          });
        },
      );
      sessionIdRef.current = null;
    }
  };

  const toggleSound = () => {
    setIsPlaying((prev) => {
      if (prev) {
        SoundService.pauseBrownNoise();
        return false;
      }

      return SoundService.playBrownNoise();
    });
  };

  return {
    formattedTime,
    isPlaying,
    isRestoring,
    isRunning,
    timeLeft,
    pauseTimer,
    resetTimer,
    startTimer,
    toggleSound,
  };
};
