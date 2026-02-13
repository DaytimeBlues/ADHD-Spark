import { Platform } from 'react-native';

export const Motion = {
  durations: {
    fast: 100,
    base: 150,
    slow: 200,
  },
  easings: {
    default: 'linear',
    out: 'ease-out',
    in: 'ease-in',
    inOut: 'ease-in-out',
  },
  // Web-specific transition strings (Fast & Linear)
  transitions: {
    fast: Platform.select({ web: 'all 0.1s linear', default: undefined }),
    base: Platform.select({ web: 'all 0.15s linear', default: undefined }),
    slow: Platform.select({ web: 'all 0.2s linear', default: undefined }),
    transform: Platform.select({ web: 'transform 0.15s cubic-bezier(0, 0, 0.2, 1)', default: undefined }),
  },
  // Interactive scales
  scales: {
    press: 0.98,
    hover: 1.00,
  },
} as const;
