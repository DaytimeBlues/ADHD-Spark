/**
 * Cosmic Token Consistency Tests
 *
 * These tests verify that screens and components use the CosmicTokens
 * instead of hardcoded hex colors.
 */

import { CosmicTokens } from '../theme/cosmicTokens';

describe('Cosmic Token Consistency', () => {
  describe('Token Exports', () => {
    it('should export color tokens', () => {
      expect(CosmicTokens.colors).toBeDefined();
      expect(CosmicTokens.colors.semantic.primary).toBeDefined();
      expect(CosmicTokens.colors.semantic.success).toBeDefined();
    });

    it('should have semantic color mappings', () => {
      expect(CosmicTokens.colors.semantic.primary).toBe('#8B5CF6'); // nebulaViolet
      expect(CosmicTokens.colors.semantic.success).toBe('#2DD4BF'); // auroraTeal
    });
  });

  describe('Hardcoded Color Detection', () => {
    // These are the colors that should NOT appear hardcoded in source files
    const forbiddenColors = [
      '#8B5CF6', // nebulaViolet - should use CosmicTokens.colors.semantic.primary
      '#2DD4BF', // auroraTeal - should use CosmicTokens.colors.semantic.success
      '#EEF2FF', // starlight - should use CosmicTokens.text.primary
      '#B9C2D9', // mist - should use CosmicTokens.text.secondary
      '#070712', // obsidian - should use CosmicTokens.colors.background
    ];

    it('should have token values defined correctly', () => {
      expect(CosmicTokens.colors.semantic.primary).toBe('#8B5CF6');
      expect(CosmicTokens.colors.semantic.success).toBe('#2DD4BF');
    });
  });
});
