import { render, screen } from '@testing-library/react-native';
import React from 'react';
import CBTGuideScreen from '../src/screens/CBTGuideScreen';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

// Mock async storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock vector icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

describe('CBTGuideScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with title', () => {
    render(<CBTGuideScreen navigation={mockNavigation} />);
    expect(screen.getByText('CBT FOR ADHD')).toBeTruthy();
    expect(screen.getByText('EVIDENCE-BASED STRATEGIES')).toBeTruthy();
  });

  it('displays CADDI pillars', () => {
    render(<CBTGuideScreen navigation={mockNavigation} />);
    expect(screen.getByText('BEHAVIORAL ACTIVATION')).toBeTruthy();
    expect(screen.getByText('ORGANIZATION')).toBeTruthy();
    expect(screen.getByText('MINDFULNESS')).toBeTruthy();
  });

  it('shows feature buttons', () => {
    render(<CBTGuideScreen navigation={mockNavigation} />);
    expect(screen.getByText('IGNITE TIMER')).toBeTruthy();
    expect(screen.getByText('POMODORO')).toBeTruthy();
    expect(screen.getByText('FOG CUTTER')).toBeTruthy();
    expect(screen.getByText('BRAIN DUMP')).toBeTruthy();
    expect(screen.getByText('ANCHOR BREATHING')).toBeTruthy();
  });

  it('renders compact CADDI research section', () => {
    render(<CBTGuideScreen navigation={mockNavigation} />);
    expect(screen.getByText(/WHAT IS CADDI/i)).toBeTruthy();
    // Verify EvidenceBadge content is present
    expect(screen.getAllByText(/EVIDENCE-BASED/i).length).toBeGreaterThan(0);
    expect(screen.getByText('(RCT EVIDENCE)')).toBeTruthy();
    expect(
      screen.getAllByText('(CLINICAL BEST PRACTICE)').length,
    ).toBeGreaterThan(0);

    expect(screen.getByText(/RCT STUDY/i)).toBeTruthy();
    expect(screen.getByText(/QUALITATIVE/i)).toBeTruthy();
    expect(screen.getByText(/REGISTRY/i)).toBeTruthy();
  });
});
