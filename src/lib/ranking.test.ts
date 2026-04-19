import { describe, it, expect } from 'vitest';
import { computeRankings } from './ranking';

describe('computeRankings with 200+ test cases', () => {
  const weights = {
    feasibility: 25,
    marketPotential: 25,
    innovation: 25,
    effort: 25,
  };

  const generateIdeas = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: `idea-${i}`,
      name: `Idea ${i}`,
      category: i % 2 === 0 ? 'SaaS' : 'Hardware',
      aiOutput: {
        scores: {
          feasibility: Math.floor(Math.random() * 10) + 1,
          marketPotential: Math.floor(Math.random() * 10) + 1,
          innovation: Math.floor(Math.random() * 10) + 1,
          effort: Math.floor(Math.random() * 10) + 1,
        }
      }
    }));
  };

  it('correctly ranks 200 randomly generated ideas', () => {
    const ideas = generateIdeas(200);
    const ranked = computeRankings(ideas as any, weights);

    expect(ranked).toHaveLength(200);
    
    // Check that they are sorted descending
    for (let i = 0; i < ranked.length - 1; i++) {
      expect(ranked[i].rankingScore).toBeGreaterThanOrEqual(ranked[i + 1].rankingScore);
    }
  });

  it('handles edge cases (all zeros/nulls)', () => {
    const edgeCaseIdeas = [
      { id: '1', name: 'Zero', category: 'SaaS', aiOutput: { scores: { feasibility: 0, marketPotential: 0, innovation: 0, effort: 10 } } },
      { id: '2', name: 'Max', category: 'SaaS', aiOutput: { scores: { feasibility: 10, marketPotential: 10, innovation: 10, effort: 1 } } },
      { id: '3', name: 'Missing', category: 'SaaS' },
    ];

    const ranked = computeRankings(edgeCaseIdeas as any, weights);
    expect(ranked[0].id).toBe('2'); // Max should be top
    expect(ranked[ranked.length - 1].id).toBe('3'); // Missing should be bottom
  });

  it('handles inverted effort correctly', () => {
    const ideas = [
      { 
        id: 'low-effort', 
        name: 'Low Effort', 
        category: 'SaaS', 
        aiOutput: { scores: { feasibility: 5, marketPotential: 5, innovation: 5, effort: 1 } } 
      },
      { 
        id: 'high-effort', 
        name: 'High Effort', 
        category: 'SaaS', 
        aiOutput: { scores: { feasibility: 5, marketPotential: 5, innovation: 5, effort: 10 } } 
      },
    ];

    const ranked = computeRankings(ideas as any, weights);
    expect(ranked[0].id).toBe('low-effort');
    expect(ranked[0].rankingScore).toBeGreaterThan(ranked[1].rankingScore);
  });

  it('responds dynamically to weight changes', () => {
    const ideas = [
      { 
        id: 'innovative', 
        name: 'Innovative', 
        category: 'SaaS', 
        aiOutput: { scores: { feasibility: 2, marketPotential: 2, innovation: 10, effort: 5 } } 
      },
      { 
        id: 'feasible', 
        name: 'Feasible', 
        category: 'SaaS', 
        aiOutput: { scores: { feasibility: 10, marketPotential: 2, innovation: 2, effort: 5 } } 
      },
    ];

    const innovWeights = { feasibility: 0, marketPotential: 0, innovation: 100, effort: 0 };
    const feasWeights = { feasibility: 100, marketPotential: 0, innovation: 0, effort: 0 };

    const rankedByInnovation = computeRankings(ideas as any, innovWeights);
    expect(rankedByInnovation[0].id).toBe('innovative');

    const rankedByFeasibility = computeRankings(ideas as any, feasWeights);
    expect(rankedByFeasibility[0].id).toBe('feasible');
  });

  it('verifies score calculation accuracy for specific case', () => {
    // Score = sum(weight * normValue)
    // weights all 25 => normWeights all 0.25
    // feasibility: 8, market: 6, innovation: 4, effort: 2 (inverted: 11-2 = 9)
    // 8*0.25 + 6*0.25 + 4*0.25 + 9*0.25 = 2 + 1.5 + 1 + 2.25 = 6.75
    const idea = [{
      id: 'test',
      name: 'Test',
      category: 'SaaS',
      aiOutput: {
        scores: { feasibility: 8, marketPotential: 6, innovation: 4, effort: 2 }
      }
    }];
    const ranked = computeRankings(idea as any, weights);
    expect(ranked[0].rankingScore).toBe(6.75);
  });
});
