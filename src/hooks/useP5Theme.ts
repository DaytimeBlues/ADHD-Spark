/**
 * useP5Theme Hook
 * 
 * React hook for accessing Persona 5 design tokens.
 * Provides theme context and utility functions for styling.
 * 
 * @example
 * const theme = useP5Theme();
 * <View style={{ backgroundColor: theme.colors.background }} />
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AccessibilityInfo } from 'react-native';
import {
  P5Theme,
  P5Colors,
  P5Spacing,
  P5FontSizes,
  P5Motion,
  P5Geometry,
} from '../theme/p5Tokens';

export type P5ThemeVariant = 'default' | 'reduced-motion';

export interface UseP5ThemeReturn {
  // Core tokens
  colors: typeof P5Colors;
  spacing: typeof P5Spacing;
  fontSizes: typeof P5FontSizes;
  motion: typeof P5Motion;
  geometry: typeof P5Geometry;
  
  // Utility functions
  getClipDepth: (height: number) => number;
  createPolygonPoints: (width: number, height: number, angle?: number) => string;
  
  // Style helpers
  textStyle: (size: keyof typeof P5FontSizes, weight?: 'display' | 'heading' | 'body') => object;
  buttonStyle: (variant?: 'primary' | 'secondary' | 'ghost') => object;
  
  // Accessibility
  reducedMotion: boolean;
}

/**
 * Generate SVG polygon points for a clipped rectangle
 * Creates the trailing-edge diagonal clip characteristic of P5
 */
function generatePolygonPoints(
  width: number,
  height: number,
  angle: number = P5Geometry.clipAngle
): string {
  const angleRad = angle * (Math.PI / 180);
  const clipDepth = height * Math.tan(angleRad);
  
  // Points: top-left, top-right, bottom-right-offset, bottom-left
  const points = [
    `0,0`,
    `${width},0`,
    `${width - clipDepth},${height}`,
    `0,${height}`,
  ];
  
  return points.join(' ');
}

// Helper hook for checking reduced motion
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);
  
  useEffect(() => {
    let isMounted = true;
    
    const checkReducedMotion = async () => {
      try {
        const isReduced = await AccessibilityInfo.isReduceMotionEnabled();
        if (isMounted) {
          setReducedMotion(isReduced);
        }
      } catch {
        setReducedMotion(false);
      }
    };
    
    checkReducedMotion();
    
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (isReduced) => {
        if (isMounted) {
          setReducedMotion(isReduced);
        }
      }
    );
    
    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, []);
  
  return reducedMotion;
}

export function useP5Theme(): UseP5ThemeReturn {
  const reducedMotion = useReducedMotion();
  
  // Calculate clip depth for a given height
  const getClipDepth = useCallback((height: number): number => {
    const angleRad = P5Geometry.clipAngle * (Math.PI / 180);
    return height * Math.tan(angleRad);
  }, []);
  
  // Memoized style generators
  const textStyle = useCallback((
    size: keyof typeof P5FontSizes,
    weight: 'display' | 'heading' | 'body' = 'body'
  ) => {
    const sizeValue = P5FontSizes[size];
    
    return {
      fontSize: sizeValue,
      color: P5Colors.text,
      fontWeight: weight === 'display' ? '900' : weight === 'heading' ? '700' : '500',
      letterSpacing: sizeValue > 32 ? -0.02 : sizeValue < 14 ? 0.03 : 0.02,
      lineHeight: sizeValue > 32 ? 1.0 : sizeValue > 20 ? 1.2 : 1.5,
    };
  }, []);
  
  const buttonStyle = useCallback((variant: 'primary' | 'secondary' | 'ghost' = 'primary') => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: P5Colors.primary,
          borderColor: P5Colors.primary,
          borderWidth: 2,
        };
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          borderColor: P5Colors.primary,
          borderWidth: 2,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
        };
    }
  }, []);
  
  return useMemo(() => ({
    colors: P5Colors,
    spacing: P5Spacing,
    fontSizes: P5FontSizes,
    motion: P5Motion,
    geometry: P5Geometry,
    getClipDepth,
    createPolygonPoints: generatePolygonPoints,
    textStyle,
    buttonStyle,
    reducedMotion,
  }), [getClipDepth, textStyle, buttonStyle, reducedMotion]);
}

export default useP5Theme;
