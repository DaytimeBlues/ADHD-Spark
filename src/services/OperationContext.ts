import { Platform } from 'react-native';

export interface OperationContext {
  correlationId: string;
  sessionId?: string;
  feature?: string;
  platform?: string;
}

type OperationContextInput = Partial<OperationContext> & {
  feature?: string;
  sessionId?: string;
};

const generateCorrelationId = (): string => {
  return `op_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

export const createOperationContext = (
  input: OperationContextInput = {},
): OperationContext => {
  return {
    correlationId: input.correlationId ?? generateCorrelationId(),
    sessionId: input.sessionId,
    feature: input.feature,
    platform: input.platform ?? Platform?.OS ?? 'unknown',
  };
};
