module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  detectOpenHandles: true,
  forceExit: true,
  testMatch: ['**/__tests__/**/*.(test|spec).{ts,tsx,js,jsx}'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/detox/',
    'android\\.e2e\\.test\\.ts$',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^react-native-reanimated$':
      '<rootDir>/__tests__/__mocks__/react-native-reanimated.js',
    '^@op-engineering/op-sqlite$': '<rootDir>/__tests__/__mocks__/op-sqlite.ts',
    '^expo-notifications$':
      '<rootDir>/__tests__/__mocks__/expo-notifications.ts',
    '\\.(png|jpg|jpeg|gif|webp|svg)$':
      '<rootDir>/__tests__/__mocks__/fileMock.js',
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  coverageThreshold: {
    global: {
      branches: 35,
      functions: 40,
      lines: 45,
      statements: 45,
    },
  },
};
