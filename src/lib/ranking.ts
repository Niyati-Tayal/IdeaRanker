import { AIEnrichmentOutput } from "./gemini";

interface RankingIdea {
  id: string;
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

  // 1. Extract dimensions
  const scoredIdeas = ideas.filter(idea => idea.aiOutput && idea.aiOutput.scores);
  if (scoredIdeas.length === 0) return ideas;

  // Total weights for normalization
  const totalWeight = weights.feasibility + weights.marketPotential + weights.innovation + weights.effort;
  const normWeights = {
    feasibility: weights.feasibility / (totalWeight || 1),
    marketPotential: weights.marketPotential / (totalWeight || 1),
    innovation: weights.innovation / (totalWeight || 1),
    effort: weights.effort / (totalWeight || 1),
  };

  // 2. Score and Sort
  const rankedData = scoredIdeas.map(idea => {
    const scores = idea.aiOutput!.scores;
    
    // Effort is inverse: lower effort = better score
    // Innovation, Market, Feasibility: higher is better
    const feasibilityScore = scores.feasibility;
    const marketScore = scores.marketPotential;
    const innovationScore = scores.innovation;
    const effortScore = 11 - scores.effort; // Convert 1-10 where 10 is high effort to 1-10 where 10 is low effort

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

  // Sort descending by score
  return rankedData.sort((a, b) => b.rankingScore - a.rankingScore);
}
