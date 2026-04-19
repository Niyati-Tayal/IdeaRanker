import { describe, it, expect } from 'vitest';
import { computeRankings } from './ranking';

describe('Exhaustive Score Calculation Test (200 Variations)', () => {
  const idea = {
    id: 'test-idea',
    name: 'Test Idea',
    category: 'SaaS',
    aiOutput: {
      scores: { feasibility: 8, marketPotential: 6, innovation: 4, effort: 2 }
    }
  };

  // Generate 200 combinations of weights
  const weightCombinations = Array.from({ length: 200 }, (_, i) => {
    const f = (i * 7) % 51;
    const m = (i * 13) % 51;
    const n = (i * 17) % 51;
    const e = Math.max(0, 100 - (f + m + n));
    return {
      feasibility: f,
      marketPotential: m,
      innovation: n,
      effort: e
    };
  });

  weightCombinations.forEach((weights, index) => {
    it(`calculates score correctly for case ${index + 1}: ${JSON.stringify(weights)}`, () => {
      const ranked = computeRankings([idea] as any, weights);
      const score = ranked[0].rankingScore;

      // Inverted effort for score calculation: 11 - 2 = 9
      const totalWeight = weights.feasibility + weights.marketPotential + weights.innovation + weights.effort;
      const expected = (
        (weights.feasibility * 8) +
        (weights.marketPotential * 6) +
        (weights.innovation * 4) +
        (weights.effort * 9)
      ) / (totalWeight || 1);

      // Use a small epsilon for float comparison
      expect(Math.abs(score - expected)).toBeLessThan(0.000001);
    });
  });
});
