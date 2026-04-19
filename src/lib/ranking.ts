import { AIEnrichmentOutput } from "./gemini";

interface RankingIdea {
  id: string;
  name: string;
  category: string;
  aiOutput?: AIEnrichmentOutput;
  [key: string]: any;
}

interface Weights {
  feasibility: number;
  marketPotential: number;
  innovation: number;
  effort: number;
}

export function computeRankings(ideas: RankingIdea[], weights: Weights) {
  if (ideas.length === 0) return [];

  // Total weights for normalization
  const totalWeight = weights.feasibility + weights.marketPotential + weights.innovation + weights.effort;
  const normWeights = {
    feasibility: weights.feasibility / (totalWeight || 1),
    marketPotential: weights.marketPotential / (totalWeight || 1),
    innovation: weights.innovation / (totalWeight || 1),
    effort: weights.effort / (totalWeight || 1),
  };

  // Score all ideas, but only those with valid AI output get a rankingScore
  const rankedData = ideas.map(idea => {
    if (!idea.aiOutput?.scores) {
      return { ...idea, rankingScore: 0 };
    }

    const scores = idea.aiOutput.scores;
    
    // Effort is inverse: lower effort = better score
    const feasibilityScore = scores.feasibility;
    const marketScore = scores.marketPotential;
    const innovationScore = scores.innovation;
    const effortScore = 11 - scores.effort;

    const totalScore = (
      (feasibilityScore * normWeights.feasibility) +
      (marketScore * normWeights.marketPotential) +
      (innovationScore * normWeights.innovation) +
      (effortScore * normWeights.effort)
    );

    return {
      ...idea,
      rankingScore: totalScore
    };
  });

  // Sort descending by score. Ideas without scores (score 0) go to bottom.
  return rankedData.sort((a, b) => b.rankingScore - a.rankingScore);
}
